import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const productId = searchParams.get('productId') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const rating = searchParams.get('rating');

    const skip = (page - 1) * limit;

    const where: Prisma.ReviewWhereInput = {};

    if (productId) {
      where.productId = productId;
    }

    if (rating) {
      where.rating = parseInt(rating);
    }

    // Only show approved reviews by default
    where.status = 'approved';

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
        },
      }),
      db.review.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: reviews,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Reviews fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, productId, rating, title, comment, images } = body;

    if (!customerId || !productId || !rating) {
      return NextResponse.json(
        { success: false, error: 'Customer ID, product ID, and rating are required' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if customer already reviewed this product
    const existingReview = await db.review.findFirst({
      where: { customerId, productId },
    });

    if (existingReview) {
      return NextResponse.json(
        { success: false, error: 'You have already reviewed this product' },
        { status: 409 }
      );
    }

    const review = await db.review.create({
      data: {
        customerId,
        productId,
        rating,
        title: title || null,
        comment: comment || null,
        images: images ? JSON.stringify(images) : null,
        status: 'pending',
      },
      include: {
        customer: {
          include: { user: { select: { name: true, avatar: true } } },
        },
      },
    });

    // Update product average rating and review count
    const productReviews = await db.review.findMany({
      where: { productId, status: 'approved' },
      select: { rating: true },
    });

    if (productReviews.length > 0) {
      const avgRating =
        productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
      await db.product.update({
        where: { id: productId },
        data: {
          averageRating: Math.round(avgRating * 10) / 10,
          reviewCount: productReviews.length,
        },
      });
    }

    return NextResponse.json(
      { success: true, data: review },
      { status: 201 }
    );
  } catch (error) {
    console.error('Review creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create review' },
      { status: 500 }
    );
  }
}
