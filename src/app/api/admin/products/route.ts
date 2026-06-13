import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const id = searchParams.get('id') || '';
    const skip = (page - 1) * limit;

    // Single product fetch by ID
    if (id) {
      const product = await db.product.findUnique({
        where: { id },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          brand: { select: { id: true, name: true, slug: true } },
          inventory: { select: { quantity: true, lowStockAlert: true } },
          variants: {
            select: {
              id: true,
              name: true,
              sku: true,
              price: true,
              discountPrice: true,
              thumbnail: true,
              isActive: true,
            },
          },
          images: { orderBy: { sortOrder: 'asc' } },
        },
      });
      if (!product) {
        return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: product });
    }

    const where: Prisma.ProductWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
      ];
    }

    if (category) {
      where.categoryId = category;
    }

    if (status) {
      where.status = status;
    }

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          category: { select: { id: true, name: true } },
          brand: { select: { id: true, name: true } },
          inventory: { select: { quantity: true, lowStockAlert: true } },
        },
      }),
      db.product.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: products,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Admin products fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name,
      slug,
      sku,
      barcode,
      description,
      specifications,
      features,
      costPrice,
      sellingPrice,
      discountPrice,
      thumbnail,
      gallery,
      videos,
      metaTitle,
      metaDescription,
      metaKeywords,
      status,
      isFeatured,
      isNewArrival,
      isBestSeller,
      categoryId,
      brandId,
      variants,
      images,
      inventory,
    } = body;

    if (!name || !slug || !sku) {
      return NextResponse.json(
        { success: false, error: 'Name, slug, and SKU are required' },
        { status: 400 }
      );
    }

    // Check for unique slug and sku
    const existingSlug = await db.product.findUnique({ where: { slug } });
    if (existingSlug) {
      return NextResponse.json(
        { success: false, error: 'Product slug already exists' },
        { status: 409 }
      );
    }

    const existingSku = await db.product.findUnique({ where: { sku } });
    if (existingSku) {
      return NextResponse.json(
        { success: false, error: 'Product SKU already exists' },
        { status: 409 }
      );
    }

    const product = await db.product.create({
      data: {
        name,
        slug,
        sku,
        barcode: barcode || null,
        description: description || null,
        specifications: specifications || null,
        features: features || null,
        costPrice: costPrice || 0,
        sellingPrice: sellingPrice || 0,
        discountPrice: discountPrice || null,
        thumbnail: thumbnail || null,
        gallery: gallery || null,
        videos: videos || null,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        metaKeywords: metaKeywords || null,
        status: status || 'draft',
        isFeatured: isFeatured || false,
        isNewArrival: isNewArrival || false,
        isBestSeller: isBestSeller || false,
        categoryId: categoryId || null,
        brandId: brandId || null,
        variants: variants
          ? {
              create: variants.map((v: Record<string, unknown>) => ({
                sku: v.sku as string,
                name: v.name as string,
                price: (v.price as number) || 0,
                discountPrice: (v.discountPrice as number) || null,
                thumbnail: (v.thumbnail as string) || null,
                isActive: (v.isActive as boolean) !== false,
              })),
            }
          : undefined,
        images: images
          ? {
              create: images.map((img: Record<string, unknown>, index: number) => ({
                url: img.url as string,
                alt: (img.alt as string) || null,
                sortOrder: (img.sortOrder as number) ?? index,
              })),
            }
          : undefined,
        inventory: inventory
          ? {
              create: {
                quantity: inventory.quantity || 0,
                lowStockAlert: inventory.lowStockAlert || 10,
              },
            }
          : {
              create: { quantity: 0, lowStockAlert: 10 },
            },
      },
      include: {
        variants: true,
        images: true,
        inventory: true,
      },
    });

    return NextResponse.json(
      { success: true, data: product },
      { status: 201 }
    );
  } catch (error) {
    console.error('Product creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
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
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Build update data (exclude relations)
    const allowedFields = [
      'name', 'slug', 'sku', 'barcode', 'description', 'specifications',
      'features', 'costPrice', 'sellingPrice', 'discountPrice', 'thumbnail',
      'gallery', 'videos', 'metaTitle', 'metaDescription', 'metaKeywords',
      'status', 'isFeatured', 'isNewArrival', 'isBestSeller', 'categoryId', 'brandId',
    ];

    const data: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        data[field] = updateData[field];
      }
    }

    const product = await db.product.update({
      where: { id },
      data,
      include: {
        variants: true,
        images: true,
        inventory: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Product update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 }
    );
  }
}
