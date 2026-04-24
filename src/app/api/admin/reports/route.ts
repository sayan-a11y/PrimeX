import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';

function getAuthUser(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7);
  return verifyAccessToken(token);
}

// GET /api/admin/reports?page=1&limit=20&status=pending
export async function GET(request: Request) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (user.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const status = searchParams.get('status') || '';
    const skip = (page - 1) * limit;

    const where = status ? { status } : {};

    const [reports, total] = await Promise.all([
      db.report.findMany({
        where,
        include: {
          reporter: { select: { id: true, username: true, profilePic: true } },
          reportedUser: { select: { id: true, username: true, profilePic: true } },
          reportedVideo: { select: { id: true, title: true, videoUrl: true } },
          reportedReel: { select: { id: true, caption: true, videoUrl: true } },
          reportedPrivate: { select: { id: true, title: true, videoUrl: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.report.count({ where }),
    ]);

    return NextResponse.json({ success: true,
      data: reports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Admin Reports GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}

// PUT /api/admin/reports — Update report status
export async function PUT(request: Request) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (user.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { reportId, status } = body;

    if (!reportId || !status) {
      return NextResponse.json({ error: 'reportId and status are required' }, { status: 400 });
    }

    if (!['pending', 'reviewed', 'resolved'].includes(status)) {
      return NextResponse.json({ error: 'status must be pending, reviewed, or resolved' }, { status: 400 });
    }

    const report = await db.report.findUnique({ where: { id: reportId } });
    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    const updated = await db.report.update({
      where: { id: reportId },
      data: { status },
      include: {
        reporter: { select: { id: true, username: true } },
        reportedUser: { select: { id: true, username: true } },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Admin Reports PUT error:', error);
    return NextResponse.json({ error: 'Failed to update report' }, { status: 500 });
  }
}
