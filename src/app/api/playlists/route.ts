import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';

// Force dynamic to ensure fresh Prisma client
export const dynamic = 'force-dynamic';

function getAuthUser(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7);
  return verifyAccessToken(token);
}

// GET /api/playlists - Get user's playlists
export async function GET(request: Request) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const playlists = await db.playlist.findMany({
      where: { userId: user.userId },
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
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: { playlists },
    });
  } catch (error) {
    console.error('Get playlists error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch playlists' },
      { status: 500 }
    );
  }
}

// POST /api/playlists - Create a new playlist
export async function POST(request: Request) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description, isPublic } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: 'Playlist name is required' },
        { status: 400 }
      );
    }

    const playlist = await db.playlist.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        isPublic: isPublic || false,
        userId: user.userId,
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
        },
      },
    });

    return NextResponse.json(
      { success: true, data: playlist },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create playlist error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create playlist' },
      { status: 500 }
    );
  }
}
