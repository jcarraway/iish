import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await requireSession();

    const patient = await prisma.patient.findUnique({
      where: { userId: session.userId },
      select: { id: true },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 });
    }

    const matches = await prisma.match.findMany({
      where: { patientId: patient.id },
      orderBy: { matchScore: 'desc' },
      include: {
        trial: {
          select: {
            id: true,
            nctId: true,
            title: true,
            sponsor: true,
            phase: true,
            status: true,
            briefSummary: true,
            interventionName: true,
            interventionType: true,
          },
        },
      },
    });

    return NextResponse.json({
      matches: matches.map((m) => ({
        id: m.id,
        trialId: m.trialId,
        matchScore: m.matchScore,
        matchBreakdown: m.matchBreakdown,
        potentialBlockers: m.potentialBlockers,
        status: m.status,
        trial: m.trial,
        createdAt: m.createdAt,
      })),
    });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('Get matches error:', err);
    return NextResponse.json({ error: 'Failed to load matches' }, { status: 500 });
  }
}
