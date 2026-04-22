import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';

function getAuthUser(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7);
  return verifyAccessToken(token);
}

// GET /api/admin — Platform stats
export async function GET(request: Request) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (user.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    const [
      totalUsers,
      totalVideos,
      totalReels,
      totalReports,
      pendingReports,
      totalPrivateContent,
      totalMessages,
      bannedUsers,
    ] = await Promise.all([
      db.user.count(),
      db.video.count(),
      db.reel.count(),
      db.report.count(),
      db.report.count({ where: { status: 'pending' } }),
      db.privateContent.count(),
      db.message.count(),
      db.user.count({ where: { isBanned: true } }),
    ]);

    return NextResponse.json({ success: true,
      data: {
        totalUsers,
        totalVideos,
        totalReels,
        totalReports,
        pendingReports,
        totalPrivateContent,
        totalMessages,
        bannedUsers,
      },
    });
  } catch (error) {
    console.error('Admin GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch platform stats' }, { status: 500 });
  }
}
