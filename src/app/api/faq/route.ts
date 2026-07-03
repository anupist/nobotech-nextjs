import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const categories = await db.fAQCategory.findMany({
      where: {
        faqs: { some: { isActive: true } },
      },
      include: {
        faqs: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          select: { id: true, question: true, answer: true },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error('FAQ fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch FAQs' },
      { status: 500 }
    );
  }
}
