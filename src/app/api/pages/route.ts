import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (slug) {
      const page = await db.page.findFirst({
        where: { slug, isActive: true },
      });
      if (!page) {
        return NextResponse.json(
          { success: false, error: 'Page not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: page });
    }

    const pages = await db.page.findMany({
      where: { isActive: true },
      select: { id: true, title: true, slug: true, createdAt: true, updatedAt: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: pages });
  } catch (error) {
    console.error('Pages fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pages' },
      { status: 500 }
    );
  }
}
