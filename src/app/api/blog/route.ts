import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const category = searchParams.get('category');

    if (slug) {
      // Fetch single blog post by slug
      const post = await db.blog.findUnique({
        where: { slug },
      });

      if (!post) {
        return NextResponse.json(
          { success: false, error: 'Blog post not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: post });
    }

    // Fetch all published blog posts
    const where: Record<string, unknown> = { isPublished: true };
    if (category) {
      where.category = category;
    }

    const posts = await db.blog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: posts,
    });
  } catch (error) {
    console.error('Blog fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}
