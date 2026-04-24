import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';

function getAuthUser(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7);
  return verifyAccessToken(token);
}

export async function GET(request: Request) {
  const user = getAuthUser(request);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [
      totalUsers,
      activeUsers, // Mock for now, maybe count users with recent sessions
      totalVideos,
      totalViews,
      totalReports,
    ] = await Promise.all([
      db.user.count(),
      db.session.count({ where: { expiresAt: { gt: new Date() } } }),
      db.video.count(),
      db.video.aggregate({ _sum: { views: true } }),
      db.report.count({ where: { status: 'pending' } }),
    ]);

    // Mock analytics data for charts
    const viewsOverview = [
      { month: 'Jan', views: 400 },
      { month: 'Feb', views: 600 },
      { month: 'Mar', views: 500 },
      { month: 'Apr', views: 900 },
      { month: 'May', views: 700 },
      { month: 'Jun', views: 1200 },
    ];

    const uploadOverview = [
       { name: 'Mon', count: 12 },
       { name: 'Tue', count: 18 },
       { name: 'Wed', count: 15 },
       { name: 'Thu', count: 22 },
       { name: 'Fri', count: 30 },
       { name: 'Sat', count: 25 },
       { name: 'Sun', count: 20 },
    ];

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          activeUsers,
          totalVideos,
          totalViews: totalViews._sum.views || 0,
          pendingReports: totalReports,
          storageUsed: '1.2 TB', // Mock
        },
        charts: {
          viewsOverview,
          uploadOverview,
        }
      }
    });
  } catch (error) {
    console.error('Admin Dashboard API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
