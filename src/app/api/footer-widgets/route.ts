import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const widgets = await db.footerWidget.findMany({
      where: { isActive: true },
      include: {
        links: { orderBy: { sortOrder: 'asc' } },
      },
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json({ success: true, data: widgets });
  } catch (error) {
    console.error('Footer widgets fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch footer widgets' },
      { status: 500 }
    );
  }
}
