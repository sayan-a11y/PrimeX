import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';

function getAuthUser(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7);
  return verifyAccessToken(token);
}

// GET /api/videos - List all public videos with pagination, search, tag filter
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12')));
    const search = searchParams.get('search') || '';
    const tag = searchParams.get('tag') || '';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (tag) {
      where.tags = { contains: tag };
    }

    const [videos, total] = await Promise.all([
      db.video.findMany({
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
        skip,
        take: limit,
      }),
      db.video.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        videos,
        total,
        page,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Get videos error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}

// POST /api/videos - Create new video entry (auth required)
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
    const { title, description, videoUrl, thumbnail, tags, duration } = body;

    if (!title || !videoUrl) {
      return NextResponse.json(
        { success: false, message: 'Title and videoUrl are required' },
        { status: 400 }
      );
    }

    const video = await db.video.create({
      data: {
        userId: user.userId,
        title,
        description: description || null,
        videoUrl,
        thumbnail: thumbnail || null,
        tags: tags || null,
        duration: duration || 0,
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
      { success: true, data: video },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create video error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create video' },
      { status: 500 }
    );
  }
}
