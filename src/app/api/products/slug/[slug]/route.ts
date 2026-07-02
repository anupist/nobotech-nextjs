import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const product = await db.product.findUnique({
      where: { slug },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true } },
        inventory: { select: { quantity: true, lowStockAlert: true } },
        variants: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            sku: true,
            price: true,
            discountPrice: true,
            thumbnail: true,
            inventory: { select: { quantity: true } },
            attributeValues: {
              select: {
                attributeValueId: true,
                attributeValue: {
                  select: {
                    id: true,
                    value: true,
                    attribute: { select: { slug: true, name: true } },
                  },
                },
              },
            },
          },
        },
        images: {
          orderBy: { sortOrder: 'asc' },
          select: { id: true, url: true, alt: true, sortOrder: true, variantId: true },
        },
        reviews: {
          where: { status: 'approved' },
          select: {
            id: true,
            rating: true,
            title: true,
            comment: true,
            createdAt: true,
            customer: {
              select: { user: { select: { name: true, avatar: true } } },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { reviews: true } },
      },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Product slug fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}
