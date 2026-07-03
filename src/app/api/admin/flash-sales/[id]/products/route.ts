import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { productId, salePrice, quantity } = body;

    if (!productId || !salePrice) {
      return NextResponse.json(
        { success: false, error: 'Product ID and sale price are required' },
        { status: 400 }
      );
    }

    const flashSale = await db.flashSale.findUnique({ where: { id } });
    if (!flashSale) {
      return NextResponse.json(
        { success: false, error: 'Flash sale not found' },
        { status: 404 }
      );
    }

    const existing = await db.flashSaleProduct.findFirst({
      where: { flashSaleId: id, productId },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Product already added to this flash sale' },
        { status: 409 }
      );
    }

    const flashSaleProduct = await db.flashSaleProduct.create({
      data: {
        flashSaleId: id,
        productId,
        salePrice,
        quantity: quantity || 0,
      },
      include: {
        product: {
          select: { id: true, name: true, thumbnail: true, sellingPrice: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: flashSaleProduct }, { status: 201 });
  } catch (error) {
    console.error('Flash sale product add error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add product to flash sale' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const existing = await db.flashSaleProduct.findFirst({
      where: { flashSaleId: id, productId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Product not found in this flash sale' },
        { status: 404 }
      );
    }

    await db.flashSaleProduct.delete({ where: { id: existing.id } });

    return NextResponse.json({
      success: true,
      data: { message: 'Product removed from flash sale' },
    });
  } catch (error) {
    console.error('Flash sale product remove error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove product from flash sale' },
      { status: 500 }
    );
  }
}
