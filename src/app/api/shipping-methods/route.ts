import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const methods = await db.shippingMethod.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json({ success: true, data: methods });
  } catch (error) {
    console.error('Shipping methods fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch shipping methods' },
      { status: 500 }
    );
  }
}
