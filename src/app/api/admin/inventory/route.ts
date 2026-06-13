import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, quantity, type, adjustmentQty, reason } = body;

    if (!id || quantity === undefined) {
      return NextResponse.json(
        { success: false, error: 'Inventory ID and quantity are required' },
        { status: 400 }
      );
    }

    const existing = await db.inventory.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Inventory item not found' },
        { status: 404 }
      );
    }

    const inventory = await db.inventory.update({
      where: { id },
      data: { quantity },
    });

    // Create inventory log
    if (adjustmentQty) {
      await db.inventoryLog.create({
        data: {
          inventoryId: id,
          type: type || 'adjustment',
          quantity: adjustmentQty,
          note: reason || `Stock adjusted to ${quantity}`,
        },
      });
    }

    return NextResponse.json({ success: true, data: inventory });
  } catch (error) {
    console.error('Inventory update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update inventory' },
      { status: 500 }
    );
  }
}
