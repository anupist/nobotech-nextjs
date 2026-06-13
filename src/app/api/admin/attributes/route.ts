import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const attributes = await db.attribute.findMany({
      include: {
        values: {
          select: { id: true, value: true, meta: true },
          orderBy: { value: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ success: true, data: attributes })
  } catch (error) {
    console.error('Admin attributes fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch attributes' },
      { status: 500 }
    )
  }
}
