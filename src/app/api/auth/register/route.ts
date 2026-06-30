import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, phone } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Find or create the customer role
    let customerRole = await db.role.findUnique({ where: { slug: 'customer' } });
    if (!customerRole) {
      customerRole = await db.role.create({
        data: {
          name: 'Customer',
          slug: 'customer',
          description: 'Default customer role',
        },
      });
    }

    // Create user with customer role
    const user = await db.user.create({
      data: {
        name,
        email,
        password, // Demo: plain text. In production, hash with bcrypt
        phone: phone || null,
        roles: {
          create: {
            roleId: customerRole.id,
          },
        },
        customer: {
          create: {},
        },
      },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
        customer: true,
      },
    });

    const roles = user.roles.map((ur) => ur.role.slug);
    const permissions = user.roles.flatMap((ur) =>
      ur.role.permissions.map((rp) => rp.permission.slug)
    );

    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      avatar: user.avatar,
      emailVerified: user.emailVerified,
      roles,
      permissions: [...new Set(permissions)],
      customer: user.customer
        ? {
            id: user.customer.id,
            loyaltyPoints: user.customer.loyaltyPoints,
          }
        : null,
    };

    return NextResponse.json(
      {
        success: true,
        data: { user: userData, token: `demo-token-${user.id}` },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Registration failed' },
      { status: 500 }
    );
  }
}
