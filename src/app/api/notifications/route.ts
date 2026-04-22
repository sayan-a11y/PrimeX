import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';

function getAuthUser(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7);
  return verifyAccessToken(token);
}

// GET /api/notifications?page=1&limit=20
export async function GET(request: Request) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    const notifications = await db.notification.findMany({
      where: { userId: user.userId },
      include: {
        // fromUserId is a string, need to manually fetch
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    // Enrich with fromUser data
    const fromUserIds = notifications
      .map((n) => n.fromUserId)
      .filter((id): id is string => id !== null);

    const fromUsers = await db.user.findMany({
      where: { id: { in: fromUserIds } },
      select: { id: true, username: true, profilePic: true },
    });

    const fromUserMap = new Map(fromUsers.map((u) => [u.id, u]));

    const enriched = notifications.map((n) => ({
      ...n,
      fromUser: n.fromUserId ? fromUserMap.get(n.fromUserId) || null : null,
    }));

    const total = await db.notification.count({
      where: { userId: user.userId },
    });

    const unreadCount = await db.notification.count({
      where: { userId: user.userId, read: false },
    });

    return NextResponse.json({
      success: true,
      data: {
        notifications: enriched,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
        unreadCount,
      },
    });
  } catch (error) {
    console.error('Notifications GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

// PUT /api/notifications — Mark notification(s) as read
export async function PUT(request: Request) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { ids, all } = body;

    if (all) {
      // Mark all as read
      await db.notification.updateMany({
        where: { userId: user.userId, read: false },
        data: { read: true },
      });
      return NextResponse.json({ success: true, message: 'All notifications marked as read' });
    }

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'ids array or { all: true } is required' }, { status: 400 });
    }

    // Only mark notifications belonging to this user
    await db.notification.updateMany({
      where: {
        id: { in: ids },
        userId: user.userId,
      },
      data: { read: true },
    });

    return NextResponse.json({ success: true, message: `${ids.length} notification(s) marked as read` });
  } catch (error) {
    console.error('Notifications PUT error:', error);
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
  }
}
