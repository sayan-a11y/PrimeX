import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';

function getAuthUser(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7);
  return verifyAccessToken(token);
}

// GET /api/friends?type=friends|pending|sent
export async function GET(request: Request) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'friends';

  try {
    let friends;

    if (type === 'friends') {
      // Accepted friends where user is sender or receiver
      const sent = await db.friend.findMany({
        where: { senderId: user.userId, status: 'accepted' },
        include: { receiver: { select: { id: true, username: true, profilePic: true, bio: true, isCreator: true } } },
        orderBy: { updatedAt: 'desc' },
      });
      const received = await db.friend.findMany({
        where: { receiverId: user.userId, status: 'accepted' },
        include: { sender: { select: { id: true, username: true, profilePic: true, bio: true, isCreator: true } } },
        orderBy: { updatedAt: 'desc' },
      });
      friends = [
        ...sent.map((f) => ({ id: f.id, status: f.status, createdAt: f.createdAt, friend: f.receiver })),
        ...received.map((f) => ({ id: f.id, status: f.status, createdAt: f.createdAt, friend: f.sender })),
      ];
    } else if (type === 'pending') {
      // Pending requests received by the user
      friends = await db.friend.findMany({
        where: { receiverId: user.userId, status: 'pending' },
        include: { sender: { select: { id: true, username: true, profilePic: true, bio: true, isCreator: true } } },
        orderBy: { createdAt: 'desc' },
      });
      friends = friends.map((f) => ({ id: f.id, status: f.status, createdAt: f.createdAt, friend: f.sender }));
    } else if (type === 'sent') {
      // Pending requests sent by the user
      friends = await db.friend.findMany({
        where: { senderId: user.userId, status: 'pending' },
        include: { receiver: { select: { id: true, username: true, profilePic: true, bio: true, isCreator: true } } },
        orderBy: { createdAt: 'desc' },
      });
      friends = friends.map((f) => ({ id: f.id, status: f.status, createdAt: f.createdAt, friend: f.receiver }));
    } else {
      return NextResponse.json({ error: 'Invalid type parameter. Use friends, pending, or sent.' }, { status: 400 });
    }

    return NextResponse.json({ data: friends });
  } catch (error) {
    console.error('Friends GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch friends' }, { status: 500 });
  }
}

// POST /api/friends — Send friend request
export async function POST(request: Request) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { receiverId } = body;

    if (!receiverId) {
      return NextResponse.json({ error: 'receiverId is required' }, { status: 400 });
    }

    if (receiverId === user.userId) {
      return NextResponse.json({ error: 'Cannot send friend request to yourself' }, { status: 400 });
    }

    // Check if receiver exists
    const receiver = await db.user.findUnique({ where: { id: receiverId } });
    if (!receiver) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if already friends or pending
    const existing = await db.friend.findFirst({
      where: {
        OR: [
          { senderId: user.userId, receiverId },
          { senderId: receiverId, receiverId: user.userId },
        ],
      },
    });

    if (existing) {
      if (existing.status === 'accepted') {
        return NextResponse.json({ error: 'Already friends' }, { status: 409 });
      }
      if (existing.status === 'pending') {
        return NextResponse.json({ error: 'Friend request already pending' }, { status: 409 });
      }
      // If rejected, allow re-sending by deleting old record
      await db.friend.delete({ where: { id: existing.id } });
    }

    const friendRequest = await db.friend.create({
      data: {
        senderId: user.userId,
        receiverId,
        status: 'pending',
      },
      include: {
        receiver: { select: { id: true, username: true, profilePic: true } },
      },
    });

    // Create notification for receiver
    await db.notification.create({
      data: {
        userId: receiverId,
        type: 'friend_request',
        title: 'New Friend Request',
        message: `${user.username} sent you a friend request`,
        fromUserId: user.userId,
      },
    });

    return NextResponse.json({ data: friendRequest }, { status: 201 });
  } catch (error) {
    console.error('Friends POST error:', error);
    return NextResponse.json({ error: 'Failed to send friend request' }, { status: 500 });
  }
}
