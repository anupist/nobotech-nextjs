import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const methods = await db.shippingMethod.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json({ success: true, data: methods });
  } catch (error) {
    console.error('Shipping methods fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch shipping methods' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, cost, freeAbove, isActive, sortOrder } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      );
    }

    const method = await db.shippingMethod.create({
      data: {
        name,
        cost: typeof cost === 'number' ? cost : parseFloat(cost) || 0,
        freeAbove:
          freeAbove === null || freeAbove === undefined || freeAbove === ''
            ? null
            : typeof freeAbove === 'number'
            ? freeAbove
            : parseFloat(freeAbove) || 0,
        isActive: isActive !== false,
        sortOrder: sortOrder || 0,
      },
    });

    return NextResponse.json({ success: true, data: method }, { status: 201 });
  } catch (error) {
    console.error('Shipping method creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create shipping method' },
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
        { success: false, error: 'Shipping method ID is required' },
        { status: 400 }
      );
    }

    const existing = await db.shippingMethod.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Shipping method not found' },
        { status: 404 }
      );
    }

    const allowedFields = ['name', 'cost', 'freeAbove', 'isActive', 'sortOrder'];
    const data: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        if (field === 'cost') {
          data[field] =
            typeof updateData[field] === 'number'
              ? updateData[field]
              : parseFloat(updateData[field]) || 0;
        } else if (field === 'freeAbove') {
          data[field] =
            updateData[field] === null ||
            updateData[field] === undefined ||
            updateData[field] === ''
              ? null
              : typeof updateData[field] === 'number'
              ? updateData[field]
              : parseFloat(updateData[field]) || 0;
        } else {
          data[field] = updateData[field];
        }
      }
    }

    const method = await db.shippingMethod.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, data: method });
  } catch (error) {
    console.error('Shipping method update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update shipping method' },
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
        { success: false, error: 'Shipping method ID is required' },
        { status: 400 }
      );
    }

    const existing = await db.shippingMethod.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Shipping method not found' },
        { status: 404 }
      );
    }

    await db.shippingMethod.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      data: { message: 'Shipping method deleted successfully' },
    });
  } catch (error) {
    console.error('Shipping method delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete shipping method' },
      { status: 500 }
    );
  }
}
