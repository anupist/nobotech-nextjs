import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const now = new Date();
    const featured = await db.flashSale.findFirst({
      where: {
        isActive: true,
        isFeatured: true,
        startsAt: { lte: now },
        endsAt: { gte: now },
      },
      include: {
        products: {
          include: {
            product: {
              select: {
                id: true, name: true, slug: true, thumbnail: true,
                sellingPrice: true, discountPrice: true,
                averageRating: true, reviewCount: true,
                categoryId: true,
              },
            },
          },
        },
      },
    });

    if (!featured) {
      return NextResponse.json({ success: true, data: null });
    }

    return NextResponse.json({ success: true, data: featured });
  } catch (error) {
    console.error('Featured flash sale fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch featured flash sale' },
      { status: 500 }
    );
  }
}
