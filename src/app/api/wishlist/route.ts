import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/wishlist?userId=xxx - Fetch user's wishlist
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    // Find the customer by userId
    const customer = await db.customer.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!customer) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    const wishlistItems = await db.wishlist.findMany({
      where: { customerId: customer.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            thumbnail: true,
            sellingPrice: true,
            discountPrice: true,
            status: true,
            inventory: { select: { quantity: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: wishlistItems.map((item) => ({
        id: item.id,
        productId: item.productId,
        createdAt: item.createdAt,
        product: item.product,
      })),
    });
  } catch (error) {
    console.error('Wishlist fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch wishlist' },
      { status: 500 }
    );
  }
}

// POST /api/wishlist - Add item to wishlist
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, productId } = body;

    if (!userId || !productId) {
      return NextResponse.json(
        { success: false, error: 'userId and productId are required' },
        { status: 400 }
      );
    }

    // Find the customer by userId
    const customer = await db.customer.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Check if already in wishlist
    const existing = await db.wishlist.findUnique({
      where: {
        customerId_productId: {
          customerId: customer.id,
          productId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        data: { id: existing.id, productId: existing.productId },
        message: 'Already in wishlist',
      });
    }

    const wishlistItem = await db.wishlist.create({
      data: {
        customerId: customer.id,
        productId,
      },
    });

    return NextResponse.json({
      success: true,
      data: { id: wishlistItem.id, productId: wishlistItem.productId },
    });
  } catch (error) {
    console.error('Wishlist add error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add to wishlist' },
      { status: 500 }
    );
  }
}

// DELETE /api/wishlist - Remove item from wishlist
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, productId } = body;

    if (!userId || !productId) {
      return NextResponse.json(
        { success: false, error: 'userId and productId are required' },
        { status: 400 }
      );
    }

    // Find the customer by userId
    const customer = await db.customer.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }

    await db.wishlist.deleteMany({
      where: {
        customerId: customer.id,
        productId,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Removed from wishlist',
    });
  } catch (error) {
    console.error('Wishlist remove error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove from wishlist' },
      { status: 500 }
    );
  }
}
