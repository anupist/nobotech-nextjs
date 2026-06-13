import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const brand = searchParams.get('brand') || '';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sort = searchParams.get('sort') || 'newest';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const featured = searchParams.get('featured');
    const newArrival = searchParams.get('newArrival');
    const bestSeller = searchParams.get('bestSeller');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.ProductWhereInput = {
      status: 'active',
    };

    // Full-text search on name and description
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { sku: { contains: search } },
      ];
    }

    // Category filter with subcategory support
    if (category) {
      const categoryRecord = await db.category.findUnique({
        where: { slug: category },
        include: { children: true },
      });

      if (categoryRecord) {
        const categoryIds = [
          categoryRecord.id,
          ...categoryRecord.children.map((c) => c.id),
        ];
        where.categoryId = { in: categoryIds };
      } else {
        const catById = await db.category.findUnique({
          where: { id: category },
          include: { children: true },
        });
        if (catById) {
          const categoryIds = [catById.id, ...catById.children.map((c) => c.id)];
          where.categoryId = { in: categoryIds };
        }
      }
    }

    // Brand filter
    if (brand) {
      const brandRecord = await db.brand.findUnique({
        where: { slug: brand },
      });
      if (brandRecord) {
        where.brandId = brandRecord.id;
      } else {
        const brandById = await db.brand.findUnique({ where: { id: brand } });
        if (brandById) {
          where.brandId = brandById.id;
        }
      }
    }

    // Price range filter
    if (minPrice || maxPrice) {
      where.sellingPrice = {};
      if (minPrice) {
        (where.sellingPrice as Prisma.FloatFilter)['gte'] = parseFloat(minPrice);
      }
      if (maxPrice) {
        (where.sellingPrice as Prisma.FloatFilter)['lte'] = parseFloat(maxPrice);
      }
    }

    if (featured === 'true') {
      where.isFeatured = true;
    }

    if (newArrival === 'true') {
      where.isNewArrival = true;
    }

    if (bestSeller === 'true') {
      where.isBestSeller = true;
    }

    // Build order by
    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    switch (sort) {
      case 'price_asc':
        orderBy = { sellingPrice: 'asc' };
        break;
      case 'price_desc':
        orderBy = { sellingPrice: 'desc' };
        break;
      case 'popularity':
        orderBy = { totalSold: 'desc' };
        break;
      case 'rating':
        orderBy = { averageRating: 'desc' };
        break;
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          brand: { select: { id: true, name: true, slug: true } },
          inventory: { select: { quantity: true, lowStockAlert: true } },
          variants: {
            where: { isActive: true },
            select: {
              id: true,
              name: true,
              sku: true,
              price: true,
              discountPrice: true,
              thumbnail: true,
              inventory: { select: { quantity: true } },
              attributeValues: {
                select: {
                  attributeValueId: true,
                  attributeValue: {
                    select: {
                      id: true,
                      value: true,
                      attribute: { select: { slug: true, name: true } },
                    },
                  },
                },
              },
            },
          },
          images: {
            orderBy: { sortOrder: 'asc' },
            select: { id: true, url: true, alt: true, sortOrder: true, variantId: true },
          },
          _count: { select: { reviews: true } },
        },
      }),
      db.product.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: products,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Products fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
