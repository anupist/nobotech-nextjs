import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const countries = await db.country.findMany({
      where: { status: 1, deletedAt: null },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        code: true,
        name: true,
        states: {
          where: { status: 1, deletedAt: null },
          orderBy: { name: 'asc' },
          select: {
            id: true,
            name: true,
            cities: {
              where: { status: 1, deletedAt: null },
              orderBy: { name: 'asc' },
              select: {
                id: true,
                name: true,
                cost: true,
                areas: {
                  where: { status: 1, deletedAt: null },
                  orderBy: { name: 'asc' },
                  select: { id: true, name: true, cost: true },
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: countries,
    });
  } catch (error) {
    console.error('Countries fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch countries' },
      { status: 500 }
    );
  }
}
