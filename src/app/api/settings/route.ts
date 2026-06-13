import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const settings = await db.setting.findMany();

    // Convert to key-value object
    const data: Record<string, string> = {};
    for (const setting of settings) {
      data[setting.key] = setting.value;
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Settings fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { group, settings } = body;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Settings object is required' },
        { status: 400 }
      );
    }

    // Determine which keys belong to the group
    const groupPrefixMap: Record<string, string[]> = {
      general: ['site_name', 'site_logo', 'site_favicon', 'currency', 'currency_symbol'],
      contact: ['contact_phone', 'contact_email', 'contact_address'],
      social: ['social_facebook', 'social_instagram', 'social_youtube', 'social_twitter'],
      payment: ['payment_cod', 'payment_stripe', 'stripe_public_key'],
      shipping: ['shipping_cost', 'free_shipping_above', 'shipping_free'],
    };

    const keysToUpdate = group && groupPrefixMap[group]
      ? groupPrefixMap[group].filter((key) => settings[key] !== undefined)
      : Object.keys(settings);

    for (const key of keysToUpdate) {
      if (settings[key] !== undefined) {
        await db.setting.upsert({
          where: { key },
          update: { value: String(settings[key]), group: group || 'general' },
          create: { key, value: String(settings[key]), group: group || 'general' },
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: { message: 'Settings saved successfully' },
    });
  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
