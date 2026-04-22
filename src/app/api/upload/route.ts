import { NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

function getAuthUser(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7);
  return verifyAccessToken(token);
}

const TYPE_DIR_MAP: Record<string, string> = {
  video: 'long-videos',
  reel: 'reels',
  private: 'private-content',
  thumbnail: 'thumbnails',
  profile: 'profiles',
};

const VIDEO_TYPES = ['video', 'reel', 'private'];
const IMAGE_TYPES = ['thumbnail', 'profile'];

const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

const ALLOWED_VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov', '.avi', '.mkv'];
const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

export async function POST(request: Request) {
  try {
    // Auth required
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'video';

    if (!TYPE_DIR_MAP[type]) {
      return NextResponse.json(
        { success: false, message: `Invalid upload type: ${type}. Must be one of: video, reel, private, thumbnail, profile` },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided. Use "file" field in multipart/form-data.' },
        { status: 400 }
      );
    }

    // Validate file size
    const isVideo = VIDEO_TYPES.includes(type);
    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    if (file.size > maxSize) {
      const maxLabel = isVideo ? '500MB' : '5MB';
      return NextResponse.json(
        { success: false, message: `File too large. Maximum size for ${type} is ${maxLabel}.` },
        { status: 400 }
      );
    }

    // Validate file extension
    const originalName = file.name.toLowerCase();
    const allowedExtensions = isVideo ? ALLOWED_VIDEO_EXTENSIONS : ALLOWED_IMAGE_EXTENSIONS;
    const ext = path.extname(originalName).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      return NextResponse.json(
        { success: false, message: `Invalid file extension: ${ext}. Allowed: ${allowedExtensions.join(', ')}` },
        { status: 400 }
      );
    }

    // Generate unique filename
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
    const subDir = TYPE_DIR_MAP[type];
    const dirPath = path.join('/home/z/my-project/download', subDir);

    // Ensure directory exists
    if (!existsSync(dirPath)) {
      await mkdir(dirPath, { recursive: true });
    }

    const filePath = path.join(dirPath, filename);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    const url = `/download/${subDir}/${filename}`;

    return NextResponse.json({
      success: true,
      data: {
        url,
        filename,
        size: file.size,
        type,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, message: 'Upload failed. Please try again.' },
      { status: 500 }
    );
  }
}
