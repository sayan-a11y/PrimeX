import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';

function getAuthUser(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7);
  return verifyAccessToken(token);
}

// GET /api/messages/conversations
export async function GET(request: Request) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get all messages where the user is sender or receiver
    const messages = await db.message.findMany({
      where: {
        OR: [
          { senderId: user.userId },
          { receiverId: user.userId },
        ],
      },
      include: {
        sender: { select: { id: true, username: true, profilePic: true } },
        receiver: { select: { id: true, username: true, profilePic: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Group by conversation partner
    const conversationMap = new Map<string, {
      partner: { id: string; username: string; profilePic: string | null };
      lastMessage: typeof messages[number];
      unreadCount: number;
    }>();

    for (const msg of messages) {
      const partnerId = msg.senderId === user.userId ? msg.receiverId : msg.senderId;
      const partner = msg.senderId === user.userId ? msg.receiver : msg.sender;

      if (!conversationMap.has(partnerId)) {
        const unreadCount = await db.message.count({
          where: {
            senderId: partnerId,
            receiverId: user.userId,
            seen: false,
          },
        });

        conversationMap.set(partnerId, {
          partner: { id: partner.id, username: partner.username, profilePic: partner.profilePic },
          lastMessage: msg,
          unreadCount,
        });
      }
    }

    const conversations = Array.from(conversationMap.values()).sort(
      (a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
    );

    return NextResponse.json({ success: true, data: conversations });
  } catch (error) {
    console.error('Conversations GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}
