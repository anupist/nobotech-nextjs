import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { writeFile, unlink, mkdir } from 'fs/promises';
import path from 'path';
import { Prisma } from '@prisma/client';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
];

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function getUniqueFilename(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase();
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${random}${ext}`;
}

function isValidImageExtension(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return ALLOWED_EXTENSIONS.includes(ext);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder') || '';
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const where: Prisma.MediaWhereInput = {};

    if (folder) {
      where.folder = folder;
    }

    if (search) {
      where.OR = [
        { originalName: { contains: search } },
        { alt: { contains: search } },
        { filename: { contains: search } },
      ];
    }

    const [media, total] = await Promise.all([
      db.media.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      db.media.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: media,
      meta: {
        limit,
        offset,
        total,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Media fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch media' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files');
    const folder = (formData.get('folder') as string) || 'general';
    const alt = (formData.get('alt') as string) || null;

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files provided' },
        { status: 400 }
      );
    }

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    const createdMedia = [];

    for (const fileEntry of files) {
      if (!(fileEntry instanceof File)) {
        continue;
      }

      const file = fileEntry as File;
      const originalName = file.name;

      // Validate extension
      if (!isValidImageExtension(originalName)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid file type: ${originalName}. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`,
          },
          { status: 400 }
        );
      }

      // Validate MIME type
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid MIME type: ${file.type}. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
          },
          { status: 400 }
        );
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            success: false,
            error: `File too large: ${originalName}. Maximum size is 5MB.`,
          },
          { status: 400 }
        );
      }

      // Generate unique filename
      const filename = getUniqueFilename(originalName);
      const url = `/uploads/${filename}`;
      const filePath = path.join(uploadsDir, filename);

      // Write file to disk
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);

      // Create media record in database
      const media = await db.media.create({
        data: {
          filename,
          originalName,
          mimeType: file.type,
          size: file.size,
          url,
          alt,
          folder,
          width: null,
          height: null,
        },
      });

      createdMedia.push(media);
    }

    return NextResponse.json(
      { success: true, data: createdMedia },
      { status: 201 }
    );
  } catch (error) {
    console.error('Media upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload media' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Media ID is required' },
        { status: 400 }
      );
    }

    const existing = await db.media.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Media not found' },
        { status: 404 }
      );
    }

    // Delete file from filesystem
    const filePath = path.join(process.cwd(), 'public', existing.url);
    try {
      await unlink(filePath);
    } catch (fileError) {
      console.error('File deletion error (non-fatal):', fileError);
      // Continue even if file doesn't exist on disk
    }

    // Delete database record
    await db.media.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      data: { message: 'Media deleted successfully' },
    });
  } catch (error) {
    console.error('Media delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete media' },
      { status: 500 }
    );
  }
}
