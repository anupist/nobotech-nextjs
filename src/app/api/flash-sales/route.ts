import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const now = new Date();
    const flashSales = await db.flashSale.findMany({
      where: {
        isActive: true,
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
              },
            },
          },
        },
      },
      orderBy: { endsAt: 'asc' },
    });

    return NextResponse.json({ success: true, data: flashSales });
  } catch (error) {
    console.error('Flash sales fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch flash sales' },
      { status: 500 }
    );
  }
}
