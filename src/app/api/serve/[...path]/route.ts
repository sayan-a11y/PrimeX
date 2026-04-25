import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const DOWNLOAD_DIR = join(process.cwd(), 'download');

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    const filePath = join(DOWNLOAD_DIR, ...pathSegments);

    // Security: prevent path traversal
    if (!filePath.startsWith(DOWNLOAD_DIR)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    if (!existsSync(filePath)) {
      return NextResponse.json({ success: false, error: 'File not found' }, { status: 404 });
    }

    const fileStat = await stat(filePath);
    const data = await readFile(filePath);

    // Determine content type from extension
    const ext = filePath.split('.').pop()?.toLowerCase() || '';
    const contentTypes: Record<string, string> = {
      mp4: 'video/mp4',
      webm: 'video/webm',
      mov: 'video/quicktime',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      m3u8: 'application/vnd.apple.mpegurl',
      mpd: 'application/dash+xml',
      ts: 'video/mp2t',
    };
    const contentType = contentTypes[ext] || 'application/octet-stream';

    return new NextResponse(data, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileStat.size.toString(),
        'Cache-Control': 'public, max-age=86400',
        'Accept-Ranges': 'bytes',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to serve file' },
      { status: 500 }
    );
  }
}
