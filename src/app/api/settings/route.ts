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
      general: ['site_name', 'site_tagline', 'site_slogan', 'site_description', 'site_logo', 'admin_logo', 'site_favicon', 'currency', 'currency_symbol',
        'newsletter_popup_active', 'newsletter_popup_discount_code', 'newsletter_popup_discount_text', 'newsletter_popup_delay_ms',
        'cookie_consent_active',
        'download_app_ios_url', 'download_app_android_url'],
      contact: ['contact_phone', 'contact_email', 'contact_address', 'business_hours'],
      social: ['social_facebook', 'social_instagram', 'social_youtube', 'social_twitter', 'social_linkedin'],
      payment: ['payment_cod', 'payment_stripe', 'stripe_public_key'],
      shipping: ['shipping_cost', 'free_shipping_above', 'shipping_free', 'shipping_standard_cost', 'shipping_express_cost'],
      tax: ['tax_enabled', 'tax_rate'],
      smtp: ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass', 'smtp_from_email', 'smtp_from_name'],
      seo: ['seo_meta_title', 'seo_meta_description', 'seo_meta_keywords',
        'meta_products_title', 'meta_products_description',
        'meta_cart_title', 'meta_cart_description',
        'meta_checkout_title', 'meta_checkout_description',
        'meta_auth_title', 'meta_auth_description',
        'meta_account_title', 'meta_account_description',
        'meta_wishlist_title', 'meta_wishlist_description',
        'meta_compare_title', 'meta_compare_description',
        'meta_search_title', 'meta_search_description',
        'meta_blog_title', 'meta_blog_description',
        'meta_contact_title', 'meta_contact_description',
        'meta_faq_title', 'meta_faq_description',
        'meta_about_title', 'meta_about_description',
        'meta_shipping_title', 'meta_shipping_description',
        'meta_deals_title', 'meta_deals_description',
        'meta_gift_cards_title', 'meta_gift_cards_description',
        'meta_return_request_title', 'meta_return_request_description',
        'meta_order_detail_title', 'meta_order_detail_description',
        'meta_order_tracking_title', 'meta_order_tracking_description',
        'meta_category_title', 'meta_category_description',
        'meta_brand_title', 'meta_brand_description'],
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
