import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/search - Search users and videos
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'all'; // users | videos | all

    if (!q.trim()) {
      return NextResponse.json({
        success: true,
        data: { users: [], videos: [] },
      });
    }

    const results: { users: unknown[]; videos: unknown[] } = {
      users: [],
      videos: [],
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
          createdAt: true,
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
