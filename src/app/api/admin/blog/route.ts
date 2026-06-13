import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const posts = await db.blog.findMany({
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, slug, content, excerpt, category, tags, thumbnail, isPublished } = body;

    if (!title || !slug) {
      return NextResponse.json(
        { success: false, error: 'Title and slug are required' },
        { status: 400 }
      );
    }

    const existing = await db.blog.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Blog slug already exists' },
        { status: 409 }
      );
    }

    const post = await db.blog.create({
      data: {
        title,
        slug,
        content: content || '',
        excerpt: excerpt || null,
        category: category || null,
        tags: tags || null,
        thumbnail: thumbnail || null,
        isPublished: isPublished || false,
      },
    });

    return NextResponse.json({ success: true, data: post }, { status: 201 });
  } catch (error) {
    console.error('Blog creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create blog post' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Blog post ID is required' },
        { status: 400 }
      );
    }

    const existing = await db.blog.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      );
    }

    const allowedFields = ['title', 'slug', 'content', 'excerpt', 'category', 'tags', 'thumbnail', 'isPublished'];
    const data: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        data[field] = updateData[field];
      }
    }

    const post = await db.blog.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, data: post });
  } catch (error) {
    console.error('Blog update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update blog post' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Blog post ID is required' },
        { status: 400 }
      );
    }

    const existing = await db.blog.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      );
    }

    await db.blog.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      data: { message: 'Blog post deleted successfully' },
    });
  } catch (error) {
    console.error('Blog delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete blog post' },
      { status: 500 }
    );
  }
}
