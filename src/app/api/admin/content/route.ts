import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';

function getAuthUser(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7);
  return verifyAccessToken(token);
}

// GET /api/admin/content?type=video|reel|private&page=1&limit=20
export async function GET(request: Request) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (user.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'video';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    let data;
    let total;

    if (type === 'video') {
      [data, total] = await Promise.all([
        db.video.findMany({
          include: { user: { select: { id: true, username: true, profilePic: true } } },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        db.video.count(),
      ]);
    } else if (type === 'reel') {
      [data, total] = await Promise.all([
        db.reel.findMany({
          include: { user: { select: { id: true, username: true, profilePic: true } } },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        db.reel.count(),
      ]);
    } else if (type === 'private') {
      [data, total] = await Promise.all([
        db.privateContent.findMany({
          include: { user: { select: { id: true, username: true, profilePic: true } } },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        db.privateContent.count(),
      ]);
    } else {
      return NextResponse.json(
        { error: 'Invalid type. Use video, reel, or private.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Admin Content GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
  }
}

// DELETE /api/admin/content — Remove content
export async function DELETE(request: Request) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (user.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { type, id } = body;

    if (!type || !id) {
      return NextResponse.json({ error: 'type and id are required' }, { status: 400 });
    }

    if (!['video', 'reel', 'private'].includes(type)) {
      return NextResponse.json({ error: 'type must be video, reel, or private' }, { status: 400 });
    }

    if (type === 'video') {
      const video = await db.video.findUnique({ where: { id } });
      if (!video) {
        return NextResponse.json({ error: 'Video not found' }, { status: 404 });
      }
      await db.video.delete({ where: { id } });
    } else if (type === 'reel') {
      const reel = await db.reel.findUnique({ where: { id } });
      if (!reel) {
        return NextResponse.json({ error: 'Reel not found' }, { status: 404 });
      }
      await db.reel.delete({ where: { id } });
    } else if (type === 'private') {
      const privateContent = await db.privateContent.findUnique({ where: { id } });
      if (!privateContent) {
        return NextResponse.json({ error: 'Private content not found' }, { status: 404 });
      }
      await db.privateContent.delete({ where: { id } });
    }

    return NextResponse.json({ success: true, message: `${type} content deleted successfully` });
  } catch (error) {
    console.error('Admin Content DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete content' }, { status: 500 });
  }
}
