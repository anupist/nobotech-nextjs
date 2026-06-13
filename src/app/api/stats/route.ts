import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const [
      totalProducts,
      activeProducts,
      totalOrders,
      totalCustomers,
      totalRevenue,
      pendingOrders,
      recentOrders,
      topProducts,
      totalCategories,
      totalBrands,
    ] = await Promise.all([
      db.product.count(),
      db.product.count({ where: { status: 'active' } }),
      db.order.count(),
      db.customer.count(),
      db.order.aggregate({
        where: { paymentStatus: 'paid' },
        _sum: { totalAmount: true },
      }),
      db.order.count({ where: { status: 'pending' } }),
      db.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          customer: {
            include: { user: { select: { name: true, email: true } } },
          },
          items: { select: { productName: true, quantity: true, total: true } },
        },
      }),
      db.product.findMany({
        where: { status: 'active' },
        orderBy: { totalSold: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          thumbnail: true,
          sellingPrice: true,
          totalSold: true,
          averageRating: true,
        },
      }),
      db.category.count({ where: { isActive: true } }),
      db.brand.count({ where: { isActive: true } }),
    ]);

    // Monthly revenue (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const ordersLast6Months = await db.order.findMany({
      where: {
        paymentStatus: 'paid',
        createdAt: { gte: sixMonthsAgo },
      },
      select: {
        totalAmount: true,
        createdAt: true,
      },
    });

    const monthlyRevenue: Record<string, number> = {};
    for (const order of ordersLast6Months) {
      const monthKey = order.createdAt.toISOString().slice(0, 7); // YYYY-MM
      monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + order.totalAmount;
    }

    return NextResponse.json({
      success: true,
      data: {
        totalProducts,
        activeProducts,
        totalOrders,
        totalCustomers,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        pendingOrders,
        totalCategories,
        totalBrands,
        recentOrders,
        topProducts,
        monthlyRevenue,
      },
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
