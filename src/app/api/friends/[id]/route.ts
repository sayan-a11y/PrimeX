import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';

function getAuthUser(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7);
  return verifyAccessToken(token);
}

// PUT /api/friends/[id] — Accept or reject friend request
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    if (!action || !['accept', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'action must be "accept" or "reject"' }, { status: 400 });
    }

    const friendRequest = await db.friend.findUnique({ where: { id } });
    if (!friendRequest) {
      return NextResponse.json({ error: 'Friend request not found' }, { status: 404 });
    }

    // Only the receiver can accept/reject
    if (friendRequest.receiverId !== user.userId) {
      return NextResponse.json({ error: 'Not authorized to action this request' }, { status: 403 });
    }

    if (friendRequest.status !== 'pending') {
      return NextResponse.json({ error: `Request already ${friendRequest.status}` }, { status: 400 });
    }

    const updated = await db.friend.update({
      where: { id },
      data: { status: action === 'accept' ? 'accepted' : 'rejected' },
      include: {
        sender: { select: { id: true, username: true, profilePic: true } },
        receiver: { select: { id: true, username: true, profilePic: true } },
      },
    });

    // Create notification for sender on accept
    if (action === 'accept') {
      await db.notification.create({
        data: {
          userId: friendRequest.senderId,
          type: 'friend_accept',
          title: 'Friend Request Accepted',
          message: `${user.username} accepted your friend request`,
          fromUserId: user.userId,
        },
      });
    }

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error('Friend action PUT error:', error);
    return NextResponse.json({ error: 'Failed to update friend request' }, { status: 500 });
  }
}

// DELETE /api/friends/[id] — Remove friend
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    const friendRecord = await db.friend.findUnique({ where: { id } });
    if (!friendRecord) {
      return NextResponse.json({ error: 'Friend record not found' }, { status: 404 });
    }

    // Either the sender or receiver can remove
    if (friendRecord.senderId !== user.userId && friendRecord.receiverId !== user.userId) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    await db.friend.delete({ where: { id } });

    return NextResponse.json({ message: 'Friend removed successfully' });
  } catch (error) {
    console.error('Friend DELETE error:', error);
    return NextResponse.json({ error: 'Failed to remove friend' }, { status: 500 });
  }
}
