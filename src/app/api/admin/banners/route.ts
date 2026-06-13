import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const position = searchParams.get('position') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const skip = (page - 1) * limit;

    const where: Prisma.BannerWhereInput = {};
    if (position) {
      where.position = position;
    }

    const [banners, total] = await Promise.all([
      db.banner.findMany({
        where,
        orderBy: { sortOrder: 'asc' },
        skip,
        take: limit,
      }),
      db.banner.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: banners,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Banners fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch banners' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, image, link, position, sortOrder, isActive } = body;

    if (!title || !image) {
      return NextResponse.json(
        { success: false, error: 'Title and image are required' },
        { status: 400 }
      );
    }

    const banner = await db.banner.create({
      data: {
        title,
        image,
        link: link || null,
        position: position || 'hero',
        sortOrder: sortOrder || 0,
        isActive: isActive !== false,
      },
    });

    return NextResponse.json(
      { success: true, data: banner },
      { status: 201 }
    );
  } catch (error) {
    console.error('Banner creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create banner' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Banner ID is required' },
        { status: 400 }
      );
    }

    const existing = await db.banner.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Banner not found' },
        { status: 404 }
      );
    }

    const allowedFields = ['title', 'image', 'link', 'position', 'sortOrder', 'isActive'];
    const data: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        data[field] = updateData[field];
      }
    }

    const banner = await db.banner.update({
      where: { id },
      data,
    });

    return NextResponse.json({
      success: true,
      data: banner,
    });
  } catch (error) {
    console.error('Banner update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update banner' },
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
        { success: false, error: 'Banner ID is required' },
        { status: 400 }
      );
    }

    const existing = await db.banner.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Banner not found' },
        { status: 404 }
      );
    }

    await db.banner.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      data: { message: 'Banner deleted successfully' },
    });
  } catch (error) {
    console.error('Banner delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete banner' },
      { status: 500 }
    );
  }
}
