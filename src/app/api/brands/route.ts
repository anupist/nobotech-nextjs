import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const brands = await db.brand.findMany({
      where: { isActive: true },
      include: {
        _count: { select: { products: { where: { status: 'active' } } } },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: brands,
    });
  } catch (error) {
    console.error('Brands fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch brands' },
      { status: 500 }
    );
  }
}
