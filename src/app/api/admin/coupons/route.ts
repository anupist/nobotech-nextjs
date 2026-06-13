import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const isActive = searchParams.get('isActive');

    const skip = (page - 1) * limit;

    const where: Prisma.CouponWhereInput = {};

    if (isActive !== null && isActive !== undefined && isActive !== '') {
      where.isActive = isActive === 'true';
    }

    const [coupons, total] = await Promise.all([
      db.coupon.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.coupon.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: coupons,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Coupons fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch coupons' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      code,
      type,
      value,
      minPurchase,
      maxDiscount,
      usageLimit,
      startsAt,
      expiresAt,
      isActive,
    } = body;

    if (!code || !type || value === undefined || !startsAt || !expiresAt) {
      return NextResponse.json(
        { success: false, error: 'Code, type, value, startsAt, and expiresAt are required' },
        { status: 400 }
      );
    }

    if (!['fixed', 'percentage'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Type must be "fixed" or "percentage"' },
        { status: 400 }
      );
    }

    const existing = await db.coupon.findUnique({ where: { code } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Coupon code already exists' },
        { status: 409 }
      );
    }

    const coupon = await db.coupon.create({
      data: {
        code,
        type,
        value: parseFloat(String(value)),
        minPurchase: minPurchase ? parseFloat(String(minPurchase)) : 0,
        maxDiscount: maxDiscount ? parseFloat(String(maxDiscount)) : null,
        usageLimit: usageLimit || null,
        startsAt: new Date(startsAt),
        expiresAt: new Date(expiresAt),
        isActive: isActive !== false,
      },
    });

    return NextResponse.json(
      { success: true, data: coupon },
      { status: 201 }
    );
  } catch (error) {
    console.error('Coupon creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create coupon' },
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
        { success: false, error: 'Coupon ID is required' },
        { status: 400 }
      );
    }

    const existing = await db.coupon.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Coupon not found' },
        { status: 404 }
      );
    }

    const allowedFields = ['code', 'type', 'value', 'minPurchase', 'maxDiscount', 'usageLimit', 'startsAt', 'expiresAt', 'isActive'];
    const data: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        if (field === 'value' || field === 'minPurchase' || field === 'maxDiscount') {
          data[field] = parseFloat(String(updateData[field]));
        } else if (field === 'startsAt' || field === 'expiresAt') {
          data[field] = new Date(updateData[field]);
        } else {
          data[field] = updateData[field];
        }
      }
    }

    const coupon = await db.coupon.update({
      where: { id },
      data,
    });

    return NextResponse.json({
      success: true,
      data: coupon,
    });
  } catch (error) {
    console.error('Coupon update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update coupon' },
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
        { success: false, error: 'Coupon ID is required' },
        { status: 400 }
      );
    }

    const existing = await db.coupon.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Coupon not found' },
        { status: 404 }
      );
    }

    await db.coupon.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      data: { message: 'Coupon deleted successfully' },
    });
  } catch (error) {
    console.error('Coupon delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete coupon' },
      { status: 500 }
    );
  }
}
