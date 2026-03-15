import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { role: true },
  });

  if (user?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = req.nextUrl;
  const filter = searchParams.get('filter'); // 'unparsed' | 'low_confidence'
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '50')));
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (filter === 'unparsed') {
    where.parsedEligibility = null;
  } else if (filter === 'low_confidence') {
    where.parsedEligibility = { not: null };
    // We filter by confidence in-memory since it's a JSON field
  }

  const [trials, total] = await Promise.all([
    prisma.trial.findMany({
      where,
      skip,
      take: limit,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        nctId: true,
        title: true,
        phase: true,
        status: true,
        interventionName: true,
        parsedEligibility: true,
        rawEligibilityText: true,
        lastSyncedAt: true,
        _count: { select: { sites: true } },
      },
    }),
    prisma.trial.count({ where }),
  ]);

  // Post-filter for low confidence
  let filteredTrials = trials;
  if (filter === 'low_confidence') {
    filteredTrials = trials.filter((t) => {
      const pe = t.parsedEligibility as { confidenceScore?: number } | null;
      return pe && typeof pe.confidenceScore === 'number' && pe.confidenceScore < 0.8;
    });
  }

  return NextResponse.json({
    trials: filteredTrials,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}
