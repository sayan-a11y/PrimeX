import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';

function getAuthUser(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7);
  return verifyAccessToken(token);
}

// GET /api/analytics/[userId]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { userId } = await params;

    // Only allow viewing own analytics unless admin
    if (userId !== user.userId && user.role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized to view this analytics' }, { status: 403 });
    }

    // Check user exists
    const targetUser = await db.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Aggregate analytics
    const analytics = await db.analytics.findMany({
      where: { userId },
    });

    const totalViews = analytics.reduce((sum, a) => sum + a.views, 0);
    const totalLikes = analytics.reduce((sum, a) => sum + a.likes, 0);
    const totalWatchTime = analytics.reduce((sum, a) => sum + a.watchTime, 0);
    const avgWatchTime = analytics.length > 0 ? Math.round(totalWatchTime / analytics.length) : 0;

    // Content counts
    const videoCount = await db.video.count({ where: { userId } });
    const reelCount = await db.reel.count({ where: { userId } });
    const privateCount = await db.privateContent.count({ where: { userId } });

    // Total views from videos + reels
    const videoViews = await db.video.aggregate({
      where: { userId },
      _sum: { views: true, likes: true },
    });
    const reelLikes = await db.reel.aggregate({
      where: { userId },
      _sum: { likes: true, shares: true },
    });

    // Friend count
    const friendCount = await db.friend.count({
      where: {
        OR: [
          { senderId: userId, status: 'accepted' },
          { receiverId: userId, status: 'accepted' },
        ],
      },
    });

    return NextResponse.json({
      data: {
        userId,
        analytics: {
          totalViews,
          totalLikes,
          totalWatchTime,
          avgWatchTime,
          analyticsRecords: analytics.length,
        },
        content: {
          videoCount,
          reelCount,
          privateCount,
          totalVideoViews: videoViews._sum.views || 0,
          totalVideoLikes: videoViews._sum.likes || 0,
          totalReelLikes: reelLikes._sum.likes || 0,
          totalReelShares: reelLikes._sum.shares || 0,
        },
        friendCount,
      },
    });
  } catch (error) {
    console.error('Analytics GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
