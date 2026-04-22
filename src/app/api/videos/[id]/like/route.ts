import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';

function getAuthUser(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7);
  return verifyAccessToken(token);
}

// POST /api/videos/[id]/like - Like a video (auth required)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const video = await db.video.findUnique({
      where: { id },
      select: { id: true, likes: true },
    });

    if (!video) {
      return NextResponse.json(
        { success: false, message: 'Video not found' },
        { status: 404 }
      );
    }

    const updated = await db.video.update({
      where: { id },
      data: { likes: { increment: 1 } },
    });

    return NextResponse.json({
      success: true,
      data: { likes: updated.likes },
    });
  } catch (error) {
    console.error('Like video error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to like video' },
      { status: 500 }
    );
  }
}
