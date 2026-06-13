import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const categories = await db.category.findMany({
      where: { isActive: true, parentId: null },
      include: {
        children: {
          where: { isActive: true },
          include: {
            children: {
              where: { isActive: true },
              include: {
                _count: { select: { products: { where: { status: 'active' } } } },
              },
            },
            _count: { select: { products: { where: { status: 'active' } } } },
          },
          orderBy: { sortOrder: 'asc' },
        },
        _count: { select: { products: { where: { status: 'active' } } } },
      },
      orderBy: { sortOrder: 'asc' },
    });

    // Calculate total product count including child categories
    const categoriesWithTotal = categories.map((cat) => {
      const directCount = cat._count.products;
      const childCount = cat.children.reduce(
        (sum, child) => sum + child._count.products + child.children.reduce(
          (s, grandchild) => s + grandchild._count.products, 0
        ),
        0
      );
      return {
        ...cat,
        _count: {
          products: directCount + childCount,
        },
      };
    });

    return NextResponse.json({
      success: true,
      data: categoriesWithTotal,
    });
  } catch (error) {
    console.error('Categories fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
