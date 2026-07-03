import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT() {
  try {
    await db.notification.updateMany({
      where: { read: false },
      data: { read: true },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Notification mark all read error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to mark all notifications as read' },
      { status: 500 }
    );
  }
}
