import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const features = await db.featureItem.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json({ success: true, data: features });
  } catch (error) {
    console.error('Features fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch features' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { icon, title, description, isActive, sortOrder } = body;

    if (!title || !description) {
      return NextResponse.json(
        { success: false, error: 'Title and description are required' },
        { status: 400 }
      );
    }

    const feature = await db.featureItem.create({
      data: {
        icon: icon || null,
        title,
        description,
        isActive: isActive !== false,
        sortOrder: sortOrder || 0,
      },
    });

    return NextResponse.json({ success: true, data: feature }, { status: 201 });
  } catch (error) {
    console.error('Feature creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create feature' },
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
        { success: false, error: 'Feature ID is required' },
        { status: 400 }
      );
    }

    const existing = await db.featureItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Feature not found' },
        { status: 404 }
      );
    }

    const allowedFields = ['icon', 'title', 'description', 'isActive', 'sortOrder'];
    const data: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        data[field] = updateData[field];
      }
    }

    const feature = await db.featureItem.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, data: feature });
  } catch (error) {
    console.error('Feature update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update feature' },
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
        { success: false, error: 'Feature ID is required' },
        { status: 400 }
      );
    }

    const existing = await db.featureItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Feature not found' },
        { status: 404 }
      );
    }

    await db.featureItem.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      data: { message: 'Feature deleted successfully' },
    });
  } catch (error) {
    console.error('Feature delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete feature' },
      { status: 500 }
    );
  }
}
