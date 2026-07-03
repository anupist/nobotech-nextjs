import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const sections = await db.aboutSection.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json({ success: true, data: sections });
  } catch (error) {
    console.error('About sections fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch about sections' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, title, description, items, sortOrder, isActive } = body;

    if (!type) {
      return NextResponse.json(
        { success: false, error: 'Type is required' },
        { status: 400 }
      );
    }

    const section = await db.aboutSection.create({
      data: {
        type,
        title: title || null,
        description: description || null,
        items: items ? JSON.stringify(items) : null,
        sortOrder: sortOrder || 0,
        isActive: isActive !== false,
      },
    });

    return NextResponse.json({ success: true, data: section }, { status: 201 });
  } catch (error) {
    console.error('About section creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create about section' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, items, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'About section ID is required' },
        { status: 400 }
      );
    }

    const existing = await db.aboutSection.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'About section not found' },
        { status: 404 }
      );
    }

    const allowedFields = ['type', 'title', 'description', 'sortOrder', 'isActive'];
    const data: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        data[field] = updateData[field];
      }
    }

    if (items !== undefined) {
      data.items = JSON.stringify(items);
    }

    const section = await db.aboutSection.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, data: section });
  } catch (error) {
    console.error('About section update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update about section' },
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
        { success: false, error: 'About section ID is required' },
        { status: 400 }
      );
    }

    const existing = await db.aboutSection.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'About section not found' },
        { status: 404 }
      );
    }

    await db.aboutSection.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      data: { message: 'About section deleted successfully' },
    });
  } catch (error) {
    console.error('About section delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete about section' },
      { status: 500 }
    );
  }
}
