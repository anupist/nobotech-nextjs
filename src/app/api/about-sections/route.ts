import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const sections = await db.aboutSection.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    const parsed = sections.map((s) => ({
      ...s,
      items: s.items ? JSON.parse(s.items) : null,
    }));

    return NextResponse.json({ success: true, data: parsed });
  } catch (error) {
    console.error('About sections fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch about sections' },
      { status: 500 }
    );
  }
}
