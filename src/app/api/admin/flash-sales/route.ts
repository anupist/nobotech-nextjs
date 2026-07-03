import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const flashSales = await db.flashSale.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        products: {
          include: {
            product: {
              select: {
                id: true, name: true, slug: true, thumbnail: true,
                sellingPrice: true, discountPrice: true,
              },
            },
          },
        },
      },
    });
    return NextResponse.json({ success: true, data: flashSales });
  } catch (error) {
    console.error('Flash sales fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch flash sales' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, startsAt, endsAt, isActive, isFeatured } = body;

    if (!name || !slug || !startsAt || !endsAt) {
      return NextResponse.json(
        { success: false, error: 'Name, slug, start and end dates are required' },
        { status: 400 }
      );
    }

    const existing = await db.flashSale.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Flash sale slug already exists' },
        { status: 409 }
      );
    }

    if (isFeatured) {
      await db.flashSale.updateMany({
        where: { isFeatured: true },
        data: { isFeatured: false },
      });
    }

    const flashSale = await db.flashSale.create({
      data: {
        name,
        slug,
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt),
        isActive: isActive !== false,
        isFeatured: isFeatured === true,
      },
    });

    return NextResponse.json({ success: true, data: flashSale }, { status: 201 });
  } catch (error) {
    console.error('Flash sale creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create flash sale' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, products, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Flash sale ID is required' },
        { status: 400 }
      );
    }

    const existing = await db.flashSale.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Flash sale not found' },
        { status: 404 }
      );
    }

    const allowedFields = ['name', 'slug', 'startsAt', 'endsAt', 'isActive', 'isFeatured'];
    const data: Record<string, unknown> = {};

    if (updateData.isFeatured) {
      await db.flashSale.updateMany({
        where: { isFeatured: true, id: { not: id } },
        data: { isFeatured: false },
      });
    }

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        data[field] = field === 'startsAt' || field === 'endsAt'
          ? new Date(updateData[field])
          : updateData[field];
      }
    }

    if (products) {
      await db.flashSaleProduct.deleteMany({ where: { flashSaleId: id } });
      if (products.length > 0) {
        await db.flashSaleProduct.createMany({
          data: products.map((p: { productId: string; salePrice: number; quantity: number }) => ({
            flashSaleId: id,
            productId: p.productId,
            salePrice: p.salePrice,
            quantity: p.quantity || 0,
          })),
        });
      }
    }

    const flashSale = await db.flashSale.update({
      where: { id },
      data,
      include: {
        products: {
          include: {
            product: {
              select: {
                id: true, name: true, slug: true, thumbnail: true,
                sellingPrice: true, discountPrice: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: flashSale });
  } catch (error) {
    console.error('Flash sale update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update flash sale' },
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
        { success: false, error: 'Flash sale ID is required' },
        { status: 400 }
      );
    }

    const existing = await db.flashSale.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Flash sale not found' },
        { status: 404 }
      );
    }

    await db.flashSale.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      data: { message: 'Flash sale deleted successfully' },
    });
  } catch (error) {
    console.error('Flash sale delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete flash sale' },
      { status: 500 }
    );
  }
}
