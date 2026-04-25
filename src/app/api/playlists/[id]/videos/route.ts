import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';

function getAuthUser(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7);
  return verifyAccessToken(token);
}

// POST /api/playlists/[id]/videos - Add video to playlist
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const playlist = await db.playlist.findUnique({ where: { id } });
    if (!playlist) {
      return NextResponse.json(
        { success: false, message: 'Playlist not found' },
        { status: 404 }
      );
    }

    if (playlist.userId !== user.userId) {
      return NextResponse.json(
        { success: false, message: 'Not your playlist' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { videoId } = body;

    if (!videoId) {
      return NextResponse.json(
        { success: false, message: 'videoId is required' },
        { status: 400 }
      );
    }

    // Verify video exists
    const video = await db.video.findUnique({ where: { id: videoId } });
    if (!video) {
      return NextResponse.json(
        { success: false, message: 'Video not found' },
        { status: 404 }
      );
    }

    // Check if already in playlist
    const existing = await db.playlistVideo.findUnique({
      where: {
        playlistId_videoId: { playlistId: id, videoId },
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Video already in playlist' },
        { status: 409 }
      );
    }

    const playlistVideo = await db.playlistVideo.create({
      data: { playlistId: id, videoId },
      include: {
        video: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                profilePic: true,
                isCreator: true,
              },
            },
          },
        },
      },
    });

    // Update playlist's updatedAt
    await db.playlist.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(
      { success: true, data: playlistVideo },
      { status: 201 }
    );
  } catch (error) {
    console.error('Add video to playlist error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to add video to playlist' },
      { status: 500 }
    );
  }
}

// DELETE /api/playlists/[id]/videos - Remove video from playlist
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const playlist = await db.playlist.findUnique({ where: { id } });
    if (!playlist) {
      return NextResponse.json(
        { success: false, message: 'Playlist not found' },
        { status: 404 }
      );
    }

    if (playlist.userId !== user.userId) {
      return NextResponse.json(
        { success: false, message: 'Not your playlist' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');

    if (!videoId) {
      return NextResponse.json(
        { success: false, message: 'videoId query parameter is required' },
        { status: 400 }
      );
    }

    await db.playlistVideo.deleteMany({
      where: { playlistId: id, videoId },
    });

    // Update playlist's updatedAt
    await db.playlist.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      message: 'Video removed from playlist',
    });
  } catch (error) {
    console.error('Remove video from playlist error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to remove video from playlist' },
      { status: 500 }
    );
  }
}
