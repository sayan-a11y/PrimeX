import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';

function getAuthUser(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7);
  return verifyAccessToken(token);
}

// GET /api/profile/[username]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    const profileUser = await db.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        profilePic: true,
        bio: true,
        isCreator: true,
        createdAt: true,
      },
    });

    if (!profileUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Counts
    const [videoCount, reelCount, friendCount] = await Promise.all([
      db.video.count({ where: { userId: profileUser.id } }),
      db.reel.count({ where: { userId: profileUser.id } }),
      db.friend.count({
        where: {
          OR: [
            { senderId: profileUser.id, status: 'accepted' },
            { receiverId: profileUser.id, status: 'accepted' },
          ],
        },
      }),
    ]);

    // Check if requesting user is friends with this profile
    let isFriend = false;
    let friendStatus: string | null = null;

    const user = getAuthUser(request);
    if (user && user.userId !== profileUser.id) {
      const friendship = await db.friend.findFirst({
        where: {
          OR: [
            { senderId: user.userId, receiverId: profileUser.id },
            { senderId: profileUser.id, receiverId: user.userId },
          ],
        },
      });
      if (friendship) {
        friendStatus = friendship.status;
        isFriend = friendship.status === 'accepted';
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...profileUser,
        videoCount,
        reelCount,
        friendCount,
        isFriend,
        friendStatus,
        isOwnProfile: user ? user.userId === profileUser.id : false,
      },
    });
  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}
