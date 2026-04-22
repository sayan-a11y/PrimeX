import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';

function getAuthUser(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7);
  return verifyAccessToken(token);
}

// GET /api/private - List private content from friends (auth required)
export async function GET(request: Request) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Find all accepted friend connections for this user
    const friends = await db.friend.findMany({
      where: {
        status: 'accepted',
        OR: [
          { senderId: user.userId },
          { receiverId: user.userId },
        ],
      },
      select: {
        senderId: true,
        receiverId: true,
      },
    });

    // Extract friend user IDs
    const friendIds = friends.map((f) =>
      f.senderId === user.userId ? f.receiverId : f.senderId
    );

    // Also include the user's own private content
    const userIds = [...friendIds, user.userId];

    const privateContent = await db.privateContent.findMany({
      where: {
        userId: { in: userIds },
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
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: privateContent,
    });
  } catch (error) {
    console.error('Get private content error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch private content' },
      { status: 500 }
    );
  }
}

// POST /api/private - Upload private content (auth required)
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
    const { videoUrl, thumbnail, title, accessType } = body;

    if (!videoUrl) {
      return NextResponse.json(
        { success: false, message: 'videoUrl is required' },
        { status: 400 }
      );
    }

    const privateContent = await db.privateContent.create({
      data: {
        userId: user.userId,
        videoUrl,
        thumbnail: thumbnail || null,
        title: title || null,
        accessType: accessType || 'friends_only',
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
      { success: true, data: privateContent },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create private content error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create private content' },
      { status: 500 }
    );
  }
}
