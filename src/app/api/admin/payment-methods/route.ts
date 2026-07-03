import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const methods = await db.paymentMethod.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json({ success: true, data: methods });
  } catch (error) {
    console.error('Payment methods fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payment methods' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, image, isActive, sortOrder } = body;

    if (!name || !image) {
      return NextResponse.json(
        { success: false, error: 'Name and image are required' },
        { status: 400 }
      );
    }

    const method = await db.paymentMethod.create({
      data: {
        name,
        image,
        isActive: isActive !== false,
        sortOrder: sortOrder || 0,
      },
    });

    return NextResponse.json({ success: true, data: method }, { status: 201 });
  } catch (error) {
    console.error('Payment method creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create payment method' },
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
        { success: false, error: 'Payment method ID is required' },
        { status: 400 }
      );
    }

    const existing = await db.paymentMethod.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Payment method not found' },
        { status: 404 }
      );
    }

    const allowedFields = ['name', 'image', 'isActive', 'sortOrder'];
    const data: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        data[field] = updateData[field];
      }
    }

    const method = await db.paymentMethod.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, data: method });
  } catch (error) {
    console.error('Payment method update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update payment method' },
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
        { success: false, error: 'Payment method ID is required' },
        { status: 400 }
      );
    }

    const existing = await db.paymentMethod.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Payment method not found' },
        { status: 404 }
      );
    }

    await db.paymentMethod.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      data: { message: 'Payment method deleted successfully' },
    });
  } catch (error) {
    console.error('Payment method delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete payment method' },
      { status: 500 }
    );
  }
}
