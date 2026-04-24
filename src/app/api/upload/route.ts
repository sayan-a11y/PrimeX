import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { verifyAccessToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Auth Check
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.substring(7);
    const user = verifyAccessToken(token);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'video';
    
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const ext = file.name.split('.').pop();
    const fileName = `${type}-${uuidv4()}.${ext}`;
    
    // Path: project_root/uploads/
    const uploadDir = join(process.cwd(), 'uploads');
    
    // Ensure directory exists
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    // Return the serving URL
    // The serve API is at /api/serve/[...path]
    const url = `/api/serve/${fileName}`;

    return NextResponse.json({
      success: true,
      data: {
        url,
        fileName,
        size: file.size,
        type: file.type
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error during upload' },
      { status: 500 }
    );
  }
}
