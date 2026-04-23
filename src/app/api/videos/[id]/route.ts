import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken, type JWTPayload } from '@/lib/auth';

function getAuthUser(request: Request): JWTPayload | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7);
  return verifyAccessToken(token);
}

// GET /api/videos/[id] - Get single video with user info, increment view count
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const video = await db.video.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profilePic: true,
            isCreator: true,
            bio: true,
          },
        },
      },
    });

    if (!video) {
      return NextResponse.json(
        { success: false, message: 'Video not found' },
        { status: 404 }
      );
    }

    // Increment view count (fire and forget)
    db.video.update({
      where: { id },
      data: { views: { increment: 1 } },
    }).catch((err) => console.error('View increment error:', err));

    return NextResponse.json({
      success: true,
      data: { ...video, views: video.views + 1 },
    });
  } catch (error) {
    console.error('Get video error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch video' },
      { status: 500 }
    );
  }
}

// DELETE /api/videos/[id] - Delete video (auth required, owner only)
export async function DELETE(
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
      select: { userId: true },
    });

    if (!video) {
      return NextResponse.json(
        { success: false, message: 'Video not found' },
        { status: 404 }
      );
    }

    if (video.userId !== user.userId) {
      return NextResponse.json(
        { success: false, message: 'You can only delete your own videos' },
        { status: 403 }
      );
    }

    await db.video.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: 'Video deleted successfully',
    });
  } catch (error) {
    console.error('Delete video error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete video' },
      { status: 500 }
    );
  }
}
