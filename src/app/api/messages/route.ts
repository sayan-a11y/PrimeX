import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';

function getAuthUser(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7);
  return verifyAccessToken(token);
}

// GET /api/messages?userId=xxx&page=1&limit=50
export async function GET(request: Request) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const otherUserId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    if (!otherUserId) {
      return NextResponse.json({ error: 'userId query parameter is required' }, { status: 400 });
    }

    // Check if users are friends
    const friendship = await db.friend.findFirst({
      where: {
        OR: [
          { senderId: user.userId, receiverId: otherUserId, status: 'accepted' },
          { senderId: otherUserId, receiverId: user.userId, status: 'accepted' },
        ],
      },
    });

    if (!friendship) {
      return NextResponse.json({ error: 'You can only message friends' }, { status: 403 });
    }

    const skip = (page - 1) * limit;

    const messages = await db.message.findMany({
      where: {
        OR: [
          { senderId: user.userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: user.userId },
        ],
      },
      include: {
        sender: { select: { id: true, username: true, profilePic: true } },
        receiver: { select: { id: true, username: true, profilePic: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    // Mark unseen messages as seen (messages from other user to current user)
    await db.message.updateMany({
      where: {
        senderId: otherUserId,
        receiverId: user.userId,
        seen: false,
      },
      data: { seen: true },
    });

    const total = await db.message.count({
      where: {
        OR: [
          { senderId: user.userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: user.userId },
        ],
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        messages: messages.reverse(),
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Messages GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

// POST /api/messages — Send message
export async function POST(request: Request) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { receiverId, message, mediaUrl } = body;

    if (!receiverId || !message) {
      return NextResponse.json({ error: 'receiverId and message are required' }, { status: 400 });
    }

    if (receiverId === user.userId) {
      return NextResponse.json({ error: 'Cannot send message to yourself' }, { status: 400 });
    }

    // Check if users are friends
    const friendship = await db.friend.findFirst({
      where: {
        OR: [
          { senderId: user.userId, receiverId, status: 'accepted' },
          { senderId: receiverId, receiverId: user.userId, status: 'accepted' },
        ],
      },
    });

    if (!friendship) {
      return NextResponse.json({ error: 'You can only message friends' }, { status: 403 });
    }

    const newMessage = await db.message.create({
      data: {
        senderId: user.userId,
        receiverId,
        message,
        mediaUrl: mediaUrl || null,
      },
      include: {
        sender: { select: { id: true, username: true, profilePic: true } },
        receiver: { select: { id: true, username: true, profilePic: true } },
      },
    });

    return NextResponse.json({ success: true, data: { message: newMessage } }, { status: 201 });
  } catch (error) {
    console.error('Messages POST error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
