import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';

function getAuthUser(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7);
  return verifyAccessToken(token);
}

// GET /api/comments - List comments for a video or reel
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');
    const reelId = searchParams.get('reelId');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));

    if (!videoId && !reelId) {
      return NextResponse.json(
        { success: false, message: 'videoId or reelId is required' },
        { status: 400 }
      );
    }

    const skip = (page - 1) * limit;

    // Build where clause: only top-level comments (no parentId)
    const where: Record<string, unknown> = {
      parentId: null,
    };

    if (videoId) {
      where.videoId = videoId;
    }
    if (reelId) {
      where.reelId = reelId;
    }

    const userSelect = {
      select: {
        id: true,
        username: true,
        profilePic: true,
        isCreator: true,
      },
    };

    const [comments, total] = await Promise.all([
      db.comment.findMany({
        where,
        include: {
          user: userSelect,
          replies: {
            include: {
              user: userSelect,
            },
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.comment.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        comments,
        total,
        page,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Get comments error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

// POST /api/comments - Create a new comment
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
    const { content, videoId, reelId, parentId } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { success: false, message: 'Comment content is required' },
        { status: 400 }
      );
    }

    if (!videoId && !reelId) {
      return NextResponse.json(
        { success: false, message: 'videoId or reelId is required' },
        { status: 400 }
      );
    }

    // If parentId is provided, validate the parent comment exists
    if (parentId) {
      const parentComment = await db.comment.findUnique({
        where: { id: parentId },
      });

      if (!parentComment) {
        return NextResponse.json(
          { success: false, message: 'Parent comment not found' },
          { status: 404 }
        );
      }

      // Only allow one level of nesting (reply to a top-level comment)
      if (parentComment.parentId) {
        return NextResponse.json(
          { success: false, message: 'Cannot reply to a reply. Only one level of nesting is allowed.' },
          { status: 400 }
        );
      }
    }

    // Validate that the video or reel exists
    if (videoId) {
      const video = await db.video.findUnique({ where: { id: videoId } });
      if (!video) {
        return NextResponse.json(
          { success: false, message: 'Video not found' },
          { status: 404 }
        );
      }
    }

    if (reelId) {
      const reel = await db.reel.findUnique({ where: { id: reelId } });
      if (!reel) {
        return NextResponse.json(
          { success: false, message: 'Reel not found' },
          { status: 404 }
        );
      }
    }

    const comment = await db.comment.create({
      data: {
        content: content.trim(),
        userId: user.userId,
        videoId: videoId || null,
        reelId: reelId || null,
        parentId: parentId || null,
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
        replies: {
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
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return NextResponse.json(
      { success: true, data: comment },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create comment error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create comment' },
      { status: 500 }
    );
  }
}
