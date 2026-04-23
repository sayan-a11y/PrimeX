import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';

function getAuthUser(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7);
  return verifyAccessToken(token);
}

// GET /api/playlists/[id] - Get playlist with videos
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = getAuthUser(request);

    const playlist = await db.playlist.findUnique({
      where: { id },
      include: {
        videos: {
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
          orderBy: { addedAt: 'desc' },
        },
      },
    });

    if (!playlist) {
      return NextResponse.json(
        { success: false, message: 'Playlist not found' },
        { status: 404 }
      );
    }

    // Check access: private playlists only visible to owner
    if (!playlist.isPublic && (!user || user.userId !== playlist.userId)) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: playlist,
    });
  } catch (error) {
    console.error('Get playlist error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch playlist' },
      { status: 500 }
    );
  }
}

// PUT /api/playlists/[id] - Update playlist (rename, change privacy)
export async function PUT(
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
    const { name, description, isPublic } = body;

    const updated = await db.playlist.update({
      where: { id },
      data: {
        name: name?.trim() || undefined,
        description: description !== undefined ? (description?.trim() || null) : undefined,
        isPublic: isPublic !== undefined ? isPublic : undefined,
      },
      include: {
        videos: {
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
          orderBy: { addedAt: 'desc' },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error('Update playlist error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update playlist' },
      { status: 500 }
    );
  }
}

// DELETE /api/playlists/[id] - Delete playlist
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

    await db.playlist.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: 'Playlist deleted',
    });
  } catch (error) {
    console.error('Delete playlist error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete playlist' },
      { status: 500 }
    );
  }
}
