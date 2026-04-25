import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';

function getAuthUser(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7);
  return verifyAccessToken(token);
}

// DELETE /api/comments/[id] - Delete a comment (only by author or admin)
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

    const comment = await db.comment.findUnique({
      where: { id },
      include: { replies: true },
    });

    if (!comment) {
      return NextResponse.json(
        { success: false, message: 'Comment not found' },
        { status: 404 }
      );
    }

    // Only the comment author or an admin can delete the comment
    if (comment.userId !== user.userId && user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'You can only delete your own comments' },
        { status: 403 }
      );
    }

    // Delete all replies first (cascade is set on schema, but let's be explicit)
    if (comment.replies.length > 0) {
      await db.comment.deleteMany({
        where: { parentId: id },
      });
    }

    // Delete the comment itself
    await db.comment.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete comment' },
      { status: 500 }
    );
  }
}

// PUT /api/comments/[id] - Update a comment (only by author)
export async function PUT(
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
    const body = await request.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { success: false, message: 'Comment content is required' },
        { status: 400 }
      );
    }

    const comment = await db.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      return NextResponse.json(
        { success: false, message: 'Comment not found' },
        { status: 404 }
      );
    }

    // Only the comment author can update it
    if (comment.userId !== user.userId) {
      return NextResponse.json(
        { success: false, message: 'You can only edit your own comments' },
        { status: 403 }
      );
    }

    const updated = await db.comment.update({
      where: { id },
      data: { content: content.trim() },
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

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error('Update comment error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update comment' },
      { status: 500 }
    );
  }
}
