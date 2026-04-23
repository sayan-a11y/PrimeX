import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/search - Search users, videos, and reels
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'all'; // users | videos | reels | all

    if (!q.trim()) {
      // For empty query, return featured creators if type is users/all
      const results: { users: unknown[]; videos: unknown[]; reels: unknown[] } = {
        users: [],
        videos: [],
        reels: [],
      };
      if (type === 'users' || type === 'all') {
        results.users = await db.user.findMany({
          where: { isCreator: true },
          select: {
            id: true,
            username: true,
            profilePic: true,
            bio: true,
            isCreator: true,
            role: true,
            createdAt: true,
            _count: {
              select: {
                videos: true,
                reels: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        });
      }
      if (type === 'videos' || type === 'all') {
        results.videos = await db.video.findMany({
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
          orderBy: { views: 'desc' },
          take: 20,
        });
      }
      if (type === 'reels' || type === 'all') {
        results.reels = await db.reel.findMany({
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
          orderBy: { likes: 'desc' },
          take: 20,
        });
      }
      return NextResponse.json({
        success: true,
        data: results,
      });
    }

    const results: { users: unknown[]; videos: unknown[]; reels: unknown[] } = {
      users: [],
      videos: [],
      reels: [],
    };

    if (type === 'users' || type === 'all') {
      results.users = await db.user.findMany({
        where: {
          OR: [
            { username: { contains: q } },
            { email: { contains: q } },
            { bio: { contains: q } },
          ],
        },
        select: {
          id: true,
          username: true,
          profilePic: true,
          bio: true,
          isCreator: true,
          role: true,
          createdAt: true,
          _count: {
            select: {
              videos: true,
              reels: true,
            },
          },
        },
        take: 20,
      });
    }

    if (type === 'videos' || type === 'all') {
      results.videos = await db.video.findMany({
        where: {
          OR: [
            { title: { contains: q } },
            { description: { contains: q } },
            { tags: { contains: q } },
          ],
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
        take: 20,
      });
    }

    if (type === 'reels' || type === 'all') {
      results.reels = await db.reel.findMany({
        where: {
          OR: [
            { caption: { contains: q } },
          ],
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
        take: 20,
      });
    }

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { success: false, message: 'Search failed' },
      { status: 500 }
    );
  }
}
