import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/session';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    await requireSession();

    const query = req.nextUrl.searchParams.get('q') ?? '';

    const healthSystems = await prisma.healthSystem.findMany({
      where: query
        ? {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { city: { contains: query, mode: 'insensitive' } },
              { state: { contains: query, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: [{ isCancerCenter: 'desc' }, { name: 'asc' }],
      take: 50,
    });

    return NextResponse.json({ healthSystems });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Health systems search error:', err);
    return NextResponse.json({ error: 'Failed to search health systems' }, { status: 500 });
  }
}
