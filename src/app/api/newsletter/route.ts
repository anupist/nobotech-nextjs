import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Check if already subscribed
    const existing = await db.newsletter.findUnique({ where: { email } });
    if (existing) {
      if (!existing.isActive) {
        await db.newsletter.update({
          where: { email },
          data: { isActive: true },
        });
        return NextResponse.json({
          success: true,
          data: { message: 'Re-subscribed successfully' },
        });
      }
      return NextResponse.json(
        { success: false, error: 'Email already subscribed' },
        { status: 409 }
      );
    }

    await db.newsletter.create({
      data: { email },
    });

    return NextResponse.json(
      {
        success: true,
        data: { message: 'Subscribed successfully' },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to subscribe' },
      { status: 500 }
    );
  }
}
