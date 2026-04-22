import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';

function getAuthUser(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7);
  return verifyAccessToken(token);
}

// POST /api/report — Report content
export async function POST(request: Request) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { reportedUserId, reportedVideoId, reportedReelId, reportedPrivateId, reason } = body;

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json({ error: 'reason is required' }, { status: 400 });
    }

    // At least one reported entity must be specified
    if (!reportedUserId && !reportedVideoId && !reportedReelId && !reportedPrivateId) {
      return NextResponse.json(
        { error: 'At least one of reportedUserId, reportedVideoId, reportedReelId, or reportedPrivateId is required' },
        { status: 400 }
      );
    }

    // Validate that the reported entities exist
    if (reportedUserId) {
      const reportedUser = await db.user.findUnique({ where: { id: reportedUserId } });
      if (!reportedUser) {
        return NextResponse.json({ error: 'Reported user not found' }, { status: 404 });
      }
    }
    if (reportedVideoId) {
      const reportedVideo = await db.video.findUnique({ where: { id: reportedVideoId } });
      if (!reportedVideo) {
        return NextResponse.json({ error: 'Reported video not found' }, { status: 404 });
      }
    }
    if (reportedReelId) {
      const reportedReel = await db.reel.findUnique({ where: { id: reportedReelId } });
      if (!reportedReel) {
        return NextResponse.json({ error: 'Reported reel not found' }, { status: 404 });
      }
    }
    if (reportedPrivateId) {
      const reportedPrivate = await db.privateContent.findUnique({ where: { id: reportedPrivateId } });
      if (!reportedPrivate) {
        return NextResponse.json({ error: 'Reported private content not found' }, { status: 404 });
      }
    }

    const report = await db.report.create({
      data: {
        reporterId: user.userId,
        reportedUserId: reportedUserId || null,
        reportedVideoId: reportedVideoId || null,
        reportedReelId: reportedReelId || null,
        reportedPrivateId: reportedPrivateId || null,
        reason,
        status: 'pending',
      },
    });

    return NextResponse.json({ data: report }, { status: 201 });
  } catch (error) {
    console.error('Report POST error:', error);
    return NextResponse.json({ error: 'Failed to create report' }, { status: 500 });
  }
}
