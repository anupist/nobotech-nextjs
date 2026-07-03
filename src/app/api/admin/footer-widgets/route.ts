import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const widgets = await db.footerWidget.findMany({
      include: {
        links: { orderBy: { sortOrder: 'asc' } },
      },
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json({ success: true, data: widgets });
  } catch (error) {
    console.error('Footer widgets fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch footer widgets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, location, links, sortOrder, isActive } = body;

    if (!title || !location) {
      return NextResponse.json(
        { success: false, error: 'Title and location are required' },
        { status: 400 }
      );
    }

    const widget = await db.footerWidget.create({
      data: {
        title,
        location,
        sortOrder: sortOrder || 0,
        isActive: isActive !== false,
        links: links?.length
          ? {
              create: links.map((link: { label: string; url: string; sortOrder?: number }) => ({
                label: link.label,
                url: link.url,
                sortOrder: link.sortOrder || 0,
              })),
            }
          : undefined,
      },
      include: {
        links: { orderBy: { sortOrder: 'asc' } },
      },
    });

    return NextResponse.json({ success: true, data: widget }, { status: 201 });
  } catch (error) {
    console.error('Footer widget creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create footer widget' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, links, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Footer widget ID is required' },
        { status: 400 }
      );
    }

    const existing = await db.footerWidget.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Footer widget not found' },
        { status: 404 }
      );
    }

    const allowedFields = ['title', 'location', 'sortOrder', 'isActive'];
    const data: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        data[field] = updateData[field];
      }
    }

    if (links) {
      await db.footerWidgetLink.deleteMany({ where: { widgetId: id } });
      await db.footerWidgetLink.createMany({
        data: links.map((link: { label: string; url: string; sortOrder?: number }) => ({
          widgetId: id,
          label: link.label,
          url: link.url,
          sortOrder: link.sortOrder || 0,
        })),
      });
    }

    const widget = await db.footerWidget.update({
      where: { id },
      data,
      include: {
        links: { orderBy: { sortOrder: 'asc' } },
      },
    });

    return NextResponse.json({ success: true, data: widget });
  } catch (error) {
    console.error('Footer widget update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update footer widget' },
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
        { success: false, error: 'Footer widget ID is required' },
        { status: 400 }
      );
    }

    const existing = await db.footerWidget.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Footer widget not found' },
        { status: 404 }
      );
    }

    await db.footerWidget.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      data: { message: 'Footer widget deleted successfully' },
    });
  } catch (error) {
    console.error('Footer widget delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete footer widget' },
      { status: 500 }
    );
  }
}
