import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';

function getAuthUser(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  return verifyAccessToken(token);
}

// GET /api/livestreams/[id] — Get a single live stream
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const stream = await db.liveStream.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, username: true, profilePic: true, isCreator: true },
        },
      },
    });

    if (!stream) {
      return NextResponse.json({ success: false, error: 'Stream not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { stream } });
  } catch (error) {
    console.error('Get livestream error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch stream' }, { status: 500 });
  }
}

// PUT /api/livestreams/[id] — Update stream (increment viewers, change title, etc.)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { action, title, category } = body;

    const stream = await db.liveStream.findUnique({ where: { id } });
    if (!stream) {
      return NextResponse.json({ success: false, error: 'Stream not found' }, { status: 404 });
    }

    // Increment viewers (anyone can do this)
    if (action === 'view') {
      const updated = await db.liveStream.update({
        where: { id },
        data: { viewers: { increment: 1 } },
        include: {
          user: { select: { id: true, username: true, profilePic: true, isCreator: true } },
        },
      });
      return NextResponse.json({ success: true, data: { stream: updated } });
    }

    // Only stream owner can update title/category
    if (stream.userId !== user.id) {
      return NextResponse.json({ success: false, error: 'Only the streamer can update this' }, { status: 403 });
    }

    const updateData: Record<string, unknown> = {};
    if (title) updateData.title = title.trim();
    if (category) updateData.category = category;

    const updated = await db.liveStream.update({
      where: { id },
      data: updateData,
      include: {
        user: { select: { id: true, username: true, profilePic: true, isCreator: true } },
      },
    });

    return NextResponse.json({ success: true, data: { stream: updated } });
  } catch (error) {
    console.error('Update livestream error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update stream' }, { status: 500 });
  }
}

// DELETE /api/livestreams/[id] — End a live stream
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const stream = await db.liveStream.findUnique({ where: { id } });

    if (!stream) {
      return NextResponse.json({ success: false, error: 'Stream not found' }, { status: 404 });
    }

    if (stream.userId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Not authorized to end this stream' }, { status: 403 });
    }

    const updated = await db.liveStream.update({
      where: { id },
      data: { isLive: false, endedAt: new Date() },
      include: {
        user: { select: { id: true, username: true, profilePic: true, isCreator: true } },
      },
    });

    return NextResponse.json({ success: true, data: { stream: updated } });
  } catch (error) {
    console.error('End livestream error:', error);
    return NextResponse.json({ success: false, error: 'Failed to end stream' }, { status: 500 });
  }
}
