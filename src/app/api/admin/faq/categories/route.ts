import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const categories = await db.fAQCategory.findMany({
      include: {
        _count: { select: { faqs: true } },
      },
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error('FAQ categories fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch FAQ categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, icon, sortOrder } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Category name is required' },
        { status: 400 }
      );
    }

    const category = await db.fAQCategory.create({
      data: {
        name,
        icon: icon || null,
        sortOrder: sortOrder || 0,
      },
    });

    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error) {
    console.error('FAQ category creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create FAQ category' },
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
        { success: false, error: 'FAQ category ID is required' },
        { status: 400 }
      );
    }

    const existing = await db.fAQCategory.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'FAQ category not found' },
        { status: 404 }
      );
    }

    const allowedFields = ['name', 'icon', 'sortOrder'];
    const data: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        data[field] = updateData[field];
      }
    }

    const category = await db.fAQCategory.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    console.error('FAQ category update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update FAQ category' },
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
        { success: false, error: 'FAQ category ID is required' },
        { status: 400 }
      );
    }

    const existing = await db.fAQCategory.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'FAQ category not found' },
        { status: 404 }
      );
    }

    await db.fAQCategory.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      data: { message: 'FAQ category deleted successfully' },
    });
  } catch (error) {
    console.error('FAQ category delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete FAQ category' },
      { status: 500 }
    );
  }
}
