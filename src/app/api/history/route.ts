import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';

function getAuthUser(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7);
  return verifyAccessToken(token);
}

// GET /api/history - Get user's watch history (paginated)
export async function GET(request: Request) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const filter = searchParams.get('filter') || 'all'; // all | in_progress | completed

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      userId: user.userId,
    };

    if (filter === 'in_progress') {
      where.completed = false;
    } else if (filter === 'completed') {
      where.completed = true;
    }

    const [history, total] = await Promise.all([
      db.watchHistory.findMany({
        where,
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
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.watchHistory.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        history,
        total,
        page,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Get watch history error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch watch history' },
      { status: 500 }
    );
  }
}

// POST /api/history - Record a video view
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
    const { videoId, watchTime, completed } = body;

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

    // Upsert: update if already exists (unique on userId+videoId)
    const entry = await db.watchHistory.upsert({
      where: {
        userId_videoId: {
          userId: user.userId,
          videoId,
        },
      },
      create: {
        userId: user.userId,
        videoId,
        watchTime: watchTime || 0,
        completed: completed || false,
      },
      update: {
        watchTime: watchTime !== undefined ? watchTime : undefined,
        completed: completed !== undefined ? completed : undefined,
        createdAt: new Date(), // Update timestamp so it shows as recently watched
      },
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

    return NextResponse.json({
      success: true,
      data: entry,
    });
  } catch (error) {
    console.error('Record watch history error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to record watch history' },
      { status: 500 }
    );
  }
}

// DELETE /api/history - Clear all watch history
export async function DELETE(request: Request) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');

    if (videoId) {
      // Delete specific history entry
      await db.watchHistory.deleteMany({
        where: {
          userId: user.userId,
          videoId,
        },
      });
    } else {
      // Clear all history
      await db.watchHistory.deleteMany({
        where: {
          userId: user.userId,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: videoId ? 'History entry deleted' : 'Watch history cleared',
    });
  } catch (error) {
    console.error('Clear watch history error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to clear watch history' },
      { status: 500 }
    );
  }
}
