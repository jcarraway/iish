import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const search = searchParams.get('search') ?? '';
  const status = searchParams.get('status');
  const phase = searchParams.get('phase');
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20')));
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { nctId: { contains: search, mode: 'insensitive' } },
      { interventionName: { contains: search, mode: 'insensitive' } },
      { sponsor: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (status) {
    where.status = status;
  }

  if (phase) {
    where.phase = { contains: phase, mode: 'insensitive' };
  }

  const [trials, total] = await Promise.all([
    prisma.trial.findMany({
      where,
      skip,
      take: limit,
      orderBy: { updatedAt: 'desc' },
      include: { sites: true },
    }),
    prisma.trial.count({ where }),
  ]);

  return NextResponse.json({
    trials,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
