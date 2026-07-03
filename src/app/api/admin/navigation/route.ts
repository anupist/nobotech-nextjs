import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const items = await db.navigationItem.findMany({
      where: { parentId: null },
      include: {
        children: {
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    console.error('Navigation fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch navigation items' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { label, url, parentId, location, sortOrder, isActive } = body;

    if (!label || !url) {
      return NextResponse.json(
        { success: false, error: 'Label and URL are required' },
        { status: 400 }
      );
    }

    const item = await db.navigationItem.create({
      data: {
        label,
        url,
        parentId: parentId || null,
        location: location || 'header',
        sortOrder: sortOrder || 0,
        isActive: isActive !== false,
      },
      include: {
        children: { orderBy: { sortOrder: 'asc' } },
      },
    });

    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (error) {
    console.error('Navigation item creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create navigation item' },
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
        { success: false, error: 'Navigation item ID is required' },
        { status: 400 }
      );
    }

    const existing = await db.navigationItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Navigation item not found' },
        { status: 404 }
      );
    }

    const allowedFields = ['label', 'url', 'parentId', 'location', 'sortOrder', 'isActive'];
    const data: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        data[field] = updateData[field];
      }
    }

    const item = await db.navigationItem.update({
      where: { id },
      data,
      include: {
        children: { orderBy: { sortOrder: 'asc' } },
      },
    });

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error('Navigation item update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update navigation item' },
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
        { success: false, error: 'Navigation item ID is required' },
        { status: 400 }
      );
    }

    const existing = await db.navigationItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Navigation item not found' },
        { status: 404 }
      );
    }

    await db.navigationItem.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      data: { message: 'Navigation item deleted successfully' },
    });
  } catch (error) {
    console.error('Navigation item delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete navigation item' },
      { status: 500 }
    );
  }
}
