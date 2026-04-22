import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';

function getAuthUser(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7);
  return verifyAccessToken(token);
}

// GET /api/recommendations - Get personalized recommendations
// Accepts ?limit=10&type=video|reel query params
// Auth optional - returns popular content if not authed
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    const type = searchParams.get('type') || 'video'; // video | reel
    const user = getAuthUser(request);

    let recommendations: unknown[] = [];

    if (user) {
      // Authenticated: Get user's liked videos/tags → find videos with similar tags → prioritize unseen
      recommendations = await getPersonalizedRecommendations(user.userId, limit, type);
    } else {
      // Not authenticated: Return most popular videos (ordered by views + likes)
      recommendations = await getPopularRecommendations(limit, type);
    }

    // Mix in some random "discovery" content (10-20% of results)
    const discoveryCount = Math.max(1, Math.floor(limit * 0.15));
    const mainCount = Math.max(1, limit - discoveryCount);
    const mainResults = recommendations.slice(0, mainCount);
    const excludedIds = new Set(mainResults.map((r: Record<string, unknown>) => String(r.id)));

    const discoveryResults = await getDiscoveryContent(discoveryCount, type, excludedIds);

    // Interleave discovery content
    const finalResults = [...mainResults];
    discoveryResults.forEach((item: Record<string, unknown>, i: number) => {
      const insertIndex = Math.min(Math.floor((i + 1) * (finalResults.length / (discoveryResults.length + 1))), finalResults.length);
      finalResults.splice(insertIndex, 0, item);
    });

    return NextResponse.json({
      success: true,
      data: {
        recommendations: finalResults,
      },
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}

async function getPersonalizedRecommendations(
  userId: string,
  limit: number,
  type: string
): Promise<unknown[]> {
  // Get user's liked videos to find tags they enjoy
  const likedVideos = await db.video.findMany({
    where: {
      likes: { gt: 0 },
    },
    select: { tags: true, id: true },
    take: 50,
    orderBy: { likes: 'desc' },
  });

  // Extract tags from liked videos
  const tagSet = new Set<string>();
  likedVideos.forEach(v => {
    if (v.tags) {
      v.tags.split(',').forEach(t => {
        const trimmed = t.trim().toLowerCase();
        if (trimmed) tagSet.add(trimmed);
      });
    }
  });
  const userTags = Array.from(tagSet);

  // Get videos user has already watched
  const watchedVideos = await db.watchHistory.findMany({
    where: { userId },
    select: { videoId: true },
  });
  const watchedIds = new Set(watchedVideos.map(w => w.videoId));

  if (type === 'reel') {
    // For reels, find based on caption similarity or just popular reels
    const reels = await db.reel.findMany({
      where: {
        likes: { gt: 0 },
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
      orderBy: [
        { likes: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
    });
    return reels;
  }

  // For videos - prioritize unseen videos with matching tags
  if (userTags.length > 0) {
    // Build OR conditions for tag matching
    const tagConditions = userTags.map(tag => ({ tags: { contains: tag } }));

    const taggedVideos = await db.video.findMany({
      where: {
        OR: tagConditions,
        id: { notIn: Array.from(watchedIds) },
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
      orderBy: [
        { views: 'desc' },
        { likes: 'desc' },
      ],
      take: limit,
    });

    if (taggedVideos.length >= limit) return taggedVideos;

    // Fill remaining with popular unseen videos
    const taggedIds = new Set(taggedVideos.map(v => v.id));
    const remaining = await db.video.findMany({
      where: {
        id: { notIn: [...watchedIds, ...taggedIds] },
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
      orderBy: [
        { views: 'desc' },
        { likes: 'desc' },
      ],
      take: limit - taggedVideos.length,
    });

    return [...taggedVideos, ...remaining];
  }

  // No tags found - just return popular unseen videos
  const popularUnseen = await db.video.findMany({
    where: {
      id: { notIn: Array.from(watchedIds) },
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
    orderBy: [
      { views: 'desc' },
      { likes: 'desc' },
    ],
    take: limit,
  });

  return popularUnseen;
}

async function getPopularRecommendations(
  limit: number,
  type: string
): Promise<unknown[]> {
  if (type === 'reel') {
    return db.reel.findMany({
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
      orderBy: [
        { likes: 'desc' },
        { shares: 'desc' },
      ],
      take: limit,
    });
  }

  return db.video.findMany({
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
    orderBy: [
      { views: 'desc' },
      { likes: 'desc' },
    ],
    take: limit,
  });
}

async function getDiscoveryContent(
  count: number,
  type: string,
  excludedIds: Set<string>
): Promise<unknown[]> {
  if (type === 'reel') {
    // Get some random-ish reels by ordering by recent instead of popular
    const reels = await db.reel.findMany({
      where: {
        id: { notIn: Array.from(excludedIds) },
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
      take: count,
    });
    return reels;
  }

  // Get some random-ish videos by ordering by recent instead of popular
  const videos = await db.video.findMany({
    where: {
      id: { notIn: Array.from(excludedIds) },
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
    take: count,
  });
  return videos;
}
