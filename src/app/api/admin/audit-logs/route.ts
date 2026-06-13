import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const moduleFilter = searchParams.get('module') || '';
    const actionFilter = searchParams.get('action') || '';
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const where: Prisma.AuditLogWhereInput = {};

    if (moduleFilter) {
      where.module = moduleFilter;
    }

    if (actionFilter) {
      where.action = actionFilter;
    }

    const logs = await db.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: logs,
    });
  } catch (error) {
    console.error('Audit logs fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}
