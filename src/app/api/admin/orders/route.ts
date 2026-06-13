import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status') || '';
    const paymentStatus = searchParams.get('paymentStatus') || '';
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';

    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { guestEmail: { contains: search } },
        { customer: { user: { name: { contains: search } } } },
        { customer: { user: { email: { contains: search } } } },
      ];
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        (where.createdAt as Prisma.DateTimeFilter)['gte'] = new Date(startDate);
      }
      if (endDate) {
        (where.createdAt as Prisma.DateTimeFilter)['lte'] = new Date(endDate);
      }
    }

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          customer: {
            include: { user: { select: { name: true, email: true, phone: true } } },
          },
          items: {
            include: {
              product: { select: { id: true, name: true, thumbnail: true } },
            },
          },
          coupon: { select: { code: true, type: true, value: true } },
          payments: true,
          timeline: { orderBy: { createdAt: 'desc' } },
        },
      }),
      db.order.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: orders,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Admin orders fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
