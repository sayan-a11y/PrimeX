import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';

function getAuthUser(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7);
  return verifyAccessToken(token);
}

// GET /api/private/[id] - Get single private content (auth + friend check)
export async function GET(
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

    const content = await db.privateContent.findUnique({
      where: { id },
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

    if (!content) {
      return NextResponse.json(
        { success: false, message: 'Private content not found' },
        { status: 404 }
      );
    }

    // Owner can always view their own content
    if (content.userId === user.userId) {
      return NextResponse.json({
        success: true,
        data: content,
      });
    }

    // For friends_only access, check if user is a friend of the content owner
    if (content.accessType === 'friends_only') {
      const friendship = await db.friend.findFirst({
        where: {
          status: 'accepted',
          OR: [
            { senderId: user.userId, receiverId: content.userId },
            { senderId: content.userId, receiverId: user.userId },
          ],
        },
      });

      if (!friendship) {
        return NextResponse.json(
          { success: false, message: 'You do not have access to this content. Only friends can view it.' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: content,
    });
  } catch (error) {
    console.error('Get private content error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch private content' },
      { status: 500 }
    );
  }
}
