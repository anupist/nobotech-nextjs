import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const faqs = await db.fAQ.findMany({
      include: {
        category: true,
      },
      orderBy: [{ categoryId: 'asc' }, { sortOrder: 'asc' }],
    });
    return NextResponse.json({ success: true, data: faqs });
  } catch (error) {
    console.error('FAQ fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch FAQs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { categoryId, question, answer, sortOrder, isActive } = body;

    if (!categoryId || !question || !answer) {
      return NextResponse.json(
        { success: false, error: 'Category, question and answer are required' },
        { status: 400 }
      );
    }

    const faq = await db.fAQ.create({
      data: {
        categoryId,
        question,
        answer,
        sortOrder: sortOrder || 0,
        isActive: isActive !== false,
      },
      include: { category: true },
    });

    return NextResponse.json({ success: true, data: faq }, { status: 201 });
  } catch (error) {
    console.error('FAQ creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create FAQ' },
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
        { success: false, error: 'FAQ ID is required' },
        { status: 400 }
      );
    }

    const existing = await db.fAQ.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'FAQ not found' },
        { status: 404 }
      );
    }

    const allowedFields = ['categoryId', 'question', 'answer', 'sortOrder', 'isActive'];
    const data: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        data[field] = updateData[field];
      }
    }

    const faq = await db.fAQ.update({
      where: { id },
      data,
      include: { category: true },
    });

    return NextResponse.json({ success: true, data: faq });
  } catch (error) {
    console.error('FAQ update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update FAQ' },
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
        { success: false, error: 'FAQ ID is required' },
        { status: 400 }
      );
    }

    const existing = await db.fAQ.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'FAQ not found' },
        { status: 404 }
      );
    }

    await db.fAQ.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      data: { message: 'FAQ deleted successfully' },
    });
  } catch (error) {
    console.error('FAQ delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete FAQ' },
      { status: 500 }
    );
  }
}
