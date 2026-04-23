import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';

function getAuthUser(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  return verifyAccessToken(token);
}

// GET /api/livestreams — Get all live streams (optionally filter by isLive, category)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const isLive = searchParams.get('isLive');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');

    const where: Record<string, unknown> = {};
    if (isLive === 'true') where.isLive = true;
    if (isLive === 'false') where.isLive = false;
    if (category && category !== 'all') where.category = category;

    const streams = await db.liveStream.findMany({
      where,
      include: {
        user: {
          select: { id: true, username: true, profilePic: true, isCreator: true },
        },
      },
      orderBy: { viewers: 'desc' },
      take: limit,
      skip: (page - 1) * limit,
    });

    const total = await db.liveStream.count({ where });

    return NextResponse.json({
      success: true,
      data: {
        streams,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get livestreams error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch streams' }, { status: 500 });
  }
}

// POST /api/livestreams — Start a new live stream
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, category } = body;

    if (!title || title.trim().length < 2) {
      return NextResponse.json({ success: false, error: 'Title must be at least 2 characters' }, { status: 400 });
    }

    // End any existing live stream by this user
    await db.liveStream.updateMany({
      where: { userId: user.id, isLive: true },
      data: { isLive: false, endedAt: new Date() },
    });

    const stream = await db.liveStream.create({
      data: {
        userId: user.id,
        title: title.trim(),
        category: category || 'talk',
        isLive: true,
        viewers: 0,
      },
      include: {
        user: {
          select: { id: true, username: true, profilePic: true, isCreator: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: { stream } }, { status: 201 });
  } catch (error) {
    console.error('Create livestream error:', error);
    return NextResponse.json({ success: false, error: 'Failed to start stream' }, { status: 500 });
  }
}
