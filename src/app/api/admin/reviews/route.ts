import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    const where: Prisma.ReviewWhereInput = {};

    if (status) {
      where.status = status;
    }

    const [reviews, total] = await Promise.all([
      db.review.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          customer: {
            include: { user: { select: { name: true, avatar: true } } },
          },
          product: { select: { id: true, name: true } },
        },
      }),
      db.review.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: reviews,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Admin reviews fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: 'Review ID and status are required' },
        { status: 400 }
      );
    }

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Status must be pending, approved, or rejected' },
        { status: 400 }
      );
    }

    const existing = await db.review.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    const review = await db.review.update({
      where: { id },
      data: { status },
      include: {
        customer: {
          include: { user: { select: { name: true, avatar: true } } },
        },
        product: { select: { id: true, name: true } },
      },
    });

    // Update product average rating
    const productReviews = await db.review.findMany({
      where: { productId: existing.productId, status: 'approved' },
      select: { rating: true },
    });

    if (productReviews.length > 0) {
      const avgRating =
        productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
      await db.product.update({
        where: { id: existing.productId },
        data: {
          averageRating: Math.round(avgRating * 10) / 10,
          reviewCount: productReviews.length,
        },
      });
    }

    return NextResponse.json({ success: true, data: review });
  } catch (error) {
    console.error('Review update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update review' },
      { status: 500 }
    );
  }
}
