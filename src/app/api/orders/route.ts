import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status') || '';
    const customerId = searchParams.get('customerId') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { guestEmail: { contains: search } },
      ];
    }

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          customer: {
            include: { user: { select: { name: true, email: true } } },
          },
          items: {
            include: {
              product: { select: { id: true, name: true, thumbnail: true } },
            },
          },
          coupon: { select: { id: true, code: true, type: true, value: true } },
        },
      }),
      db.order.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: orders,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Orders fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerId,
      guestEmail,
      items,
      shippingAddress,
      billingAddress,
      shippingMethod,
      paymentMethod,
      shippingCost = 0,
      taxAmount = 0,
      couponId,
      notes,
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Order must have at least one item' },
        { status: 400 }
      );
    }

    // Validate items and calculate subtotal
    let subtotal = 0;
    const orderItemsData = [];

    for (const item of items) {
      const product = await db.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return NextResponse.json(
          { success: false, error: `Product ${item.productId} not found` },
          { status: 404 }
        );
      }

      let price = product.sellingPrice;
      let variantName = null;
      let sku = product.sku;

      if (item.variantId) {
        const variant = await db.productVariant.findUnique({
          where: { id: item.variantId },
        });
        if (variant) {
          price = variant.price || product.sellingPrice;
          variantName = variant.name;
          sku = variant.sku;
        }
      }

      const total = price * item.quantity;
      subtotal += total;

      orderItemsData.push({
        productId: item.productId,
        variantId: item.variantId || null,
        productName: product.name,
        variantName,
        sku,
        price,
        quantity: item.quantity,
        total,
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (couponId) {
      const coupon = await db.coupon.findUnique({ where: { id: couponId } });
      if (coupon && coupon.isActive) {
        const now = new Date();
        if (now >= coupon.startsAt && now <= coupon.expiresAt) {
          if (coupon.minPurchase <= subtotal) {
            if (coupon.type === 'percentage') {
              discountAmount = subtotal * (coupon.value / 100);
              if (coupon.maxDiscount) {
                discountAmount = Math.min(discountAmount, coupon.maxDiscount);
              }
            } else {
              discountAmount = coupon.value;
            }
          }
        }
      }
    }

    const totalAmount = subtotal + shippingCost + taxAmount - discountAmount;

    // Generate order number
    const orderCount = await db.order.count();
    const orderNumber = `ORD-${String(orderCount + 1).padStart(6, '0')}-${Date.now().toString(36).toUpperCase()}`;

    const order = await db.order.create({
      data: {
        orderNumber,
        customerId: customerId || null,
        guestEmail: guestEmail || null,
        status: 'pending',
        subtotal,
        shippingCost,
        discountAmount,
        taxAmount,
        totalAmount,
        couponId: couponId || null,
        shippingAddress: shippingAddress ? JSON.stringify(shippingAddress) : null,
        billingAddress: billingAddress ? JSON.stringify(billingAddress) : null,
        shippingMethod,
        paymentMethod,
        paymentStatus: 'pending',
        notes: notes || null,
        items: {
          create: orderItemsData,
        },
        timeline: {
          create: {
            status: 'pending',
            note: 'Order placed',
          },
        },
      },
      include: {
        items: true,
        timeline: true,
      },
    });

    // Update coupon used count
    if (couponId && discountAmount > 0) {
      await db.coupon.update({
        where: { id: couponId },
        data: { usedCount: { increment: 1 } },
      });
    }

    // Update product total sold
    for (const item of items) {
      await db.product.update({
        where: { id: item.productId },
        data: { totalSold: { increment: item.quantity } },
      });
    }

    return NextResponse.json(
      {
        success: true,
        data: order,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
