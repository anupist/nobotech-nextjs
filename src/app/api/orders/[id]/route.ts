import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const order = await db.order.findUnique({
      where: { id },
      include: {
        customer: {
          include: {
            user: { select: { name: true, email: true, phone: true, avatar: true } },
            addresses: true,
          },
        },
        items: {
          include: {
            product: { select: { id: true, name: true, thumbnail: true, slug: true } },
            variant: { select: { id: true, name: true, thumbnail: true } },
          },
        },
        coupon: { select: { id: true, code: true, type: true, value: true } },
        payments: true,
        timeline: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Order fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, paymentStatus, notes } = body;

    const existing = await db.order.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (status !== undefined) updateData.status = status;
    if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;
    if (notes !== undefined) updateData.notes = notes;

    // Add timeline entry if status changed
    if (status && status !== existing.status) {
      updateData.timeline = {
        create: {
          status,
          note: `Status changed from ${existing.status} to ${status}`,
        },
      };
    }

    const order = await db.order.update({
      where: { id },
      data: updateData,
      include: {
        items: true,
        timeline: { orderBy: { createdAt: 'desc' } },
      },
    });

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Order update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
