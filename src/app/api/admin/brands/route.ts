import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const brands = await db.brand.findMany({
      include: {
        _count: { select: { products: true } },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ success: true, data: brands });
  } catch (error) {
    console.error('Admin brands fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch brands' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, logo, description, isActive } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { success: false, error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    const existingSlug = await db.brand.findUnique({ where: { slug } });
    if (existingSlug) {
      return NextResponse.json(
        { success: false, error: 'Brand slug already exists' },
        { status: 409 }
      );
    }

    const brand = await db.brand.create({
      data: {
        name,
        slug,
        logo: logo || null,
        description: description || null,
        isActive: isActive !== false,
      },
    });

    return NextResponse.json(
      { success: true, data: brand },
      { status: 201 }
    );
  } catch (error) {
    console.error('Brand creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create brand' },
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
        { success: false, error: 'Brand ID is required' },
        { status: 400 }
      );
    }

    const existing = await db.brand.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Brand not found' },
        { status: 404 }
      );
    }

    const allowedFields = ['name', 'slug', 'logo', 'description', 'isActive'];
    const data: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        data[field] = updateData[field];
      }
    }

    const brand = await db.brand.update({
      where: { id },
      data,
    });

    return NextResponse.json({
      success: true,
      data: brand,
    });
  } catch (error) {
    console.error('Brand update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update brand' },
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
        { success: false, error: 'Brand ID is required' },
        { status: 400 }
      );
    }

    const existing = await db.brand.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Brand not found' },
        { status: 404 }
      );
    }

    await db.brand.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      data: { message: 'Brand deleted successfully' },
    });
  } catch (error) {
    console.error('Brand delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete brand' },
      { status: 500 }
    );
  }
}
