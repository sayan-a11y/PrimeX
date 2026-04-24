import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';

function getAuthUser(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7);
  return verifyAccessToken(token);
}

// GET /api/reels - List reels for infinite scroll feed (cursor-based pagination)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor') || '';
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')));

    const where: Record<string, unknown> = {};
    if (cursor) {
      where.createdAt = { lt: new Date(cursor) };
    }

    const reels = await db.reel.findMany({
      where,
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
      orderBy: { createdAt: 'desc' },
      take: limit + 1, // Take one extra to determine if there's a next page
    });

    const hasMore = reels.length > limit;
    const items = hasMore ? reels.slice(0, limit) : reels;
    const nextCursor = hasMore && items.length > 0
      ? items[items.length - 1].createdAt.toISOString()
      : null;

    return NextResponse.json({
      success: true,
      data: {
        reels: items,
        nextCursor,
        hasMore,
      },
    });
  } catch (error) {
    console.error('Get reels error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch reels' },
      { status: 500 }
    );
  }
}

// POST /api/reels - Create new reel (auth required)
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
    const { videoUrl, thumbnail, caption } = body;

    if (!videoUrl) {
      return NextResponse.json(
        { success: false, message: 'videoUrl is required' },
        { status: 400 }
      );
    }

    const reel = await db.reel.create({
      data: {
        userId: user.userId,
        videoUrl,
        thumbnail: thumbnail || null,
        caption: caption || null,
      },
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
    });

    return NextResponse.json(
      { success: true, data: reel },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create reel error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create reel' },
      { status: 500 }
    );
  }
}
