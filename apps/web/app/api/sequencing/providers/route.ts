import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const type = searchParams.get('type');
    const testType = searchParams.get('testType');

    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    if (testType) where.testTypes = { has: testType };

    const providers = await prisma.sequencingProvider.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ providers });
  } catch (err) {
    console.error('List providers error:', err);
    return NextResponse.json({ error: 'Failed to load providers' }, { status: 500 });
  }
}
