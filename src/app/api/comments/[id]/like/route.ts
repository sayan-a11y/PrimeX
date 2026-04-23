import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';

function getAuthUser(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7);
  return verifyAccessToken(token);
}

// POST /api/comments/[id]/like - Like/unlike a comment (toggle)
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

    // Check the comment exists
    const comment = await db.comment.findUnique({
      where: { id },
      select: { id: true, likes: true },
    });

    if (!comment) {
      return NextResponse.json(
        { success: false, message: 'Comment not found' },
        { status: 404 }
      );
    }

    // Check if the user already liked this comment
    const existingLike = await db.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId: user.userId,
          commentId: id,
        },
      },
    });

    if (existingLike) {
      // Unlike: remove the like and decrement counter
      await db.commentLike.delete({
        where: { id: existingLike.id },
      });

      const updated = await db.comment.update({
        where: { id },
        data: { likes: { decrement: 1 } },
      });

      return NextResponse.json({
        success: true,
        data: {
          liked: false,
          likes: Math.max(0, updated.likes),
        },
      });
    } else {
      // Like: create the like and increment counter
      await db.commentLike.create({
        data: {
          userId: user.userId,
          commentId: id,
        },
      });

      const updated = await db.comment.update({
        where: { id },
        data: { likes: { increment: 1 } },
      });

      return NextResponse.json({
        success: true,
        data: {
          liked: true,
          likes: updated.likes,
        },
      });
    }
  } catch (error) {
    console.error('Like comment error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to like/unlike comment' },
      { status: 500 }
    );
  }
}
