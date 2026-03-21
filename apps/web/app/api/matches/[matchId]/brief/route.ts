import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/session';
import { generateOncologistBrief } from '@/lib/oncologist-brief';
import type { PatientProfile, MatchBreakdownItem, LLMAssessment } from '@iish/shared';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ matchId: string }> },
) {
  try {
    const session = await requireSession();
    const { matchId } = await params;

    const patient = await prisma.patient.findUnique({
      where: { userId: session.userId },
      select: { id: true, profile: true },
    });

    if (!patient?.profile) {
      return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 });
    }

    const match = await prisma.match.findFirst({
      where: { id: matchId, patientId: patient.id },
      include: {
        trial: {
          include: {
            sites: {
              select: { facility: true, city: true, state: true },
              take: 5,
            },
          },
        },
      },
    });

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    const breakdown = match.matchBreakdown as { items?: MatchBreakdownItem[]; llmAssessment?: LLMAssessment } | null;

    const brief = await generateOncologistBrief({
      trialTitle: match.trial.title,
      nctId: match.trial.nctId,
      phase: match.trial.phase,
      sponsor: match.trial.sponsor,
      interventionName: match.trial.interventionName,
      interventionType: match.trial.interventionType,
      briefSummary: match.trial.briefSummary,
      rawEligibilityText: match.trial.rawEligibilityText,
      matchScore: match.matchScore,
      matchBreakdown: breakdown?.items ?? [],
      llmAssessment: breakdown?.llmAssessment,
      potentialBlockers: (match.potentialBlockers as string[]) ?? [],
      profile: patient.profile as unknown as PatientProfile,
      sites: match.trial.sites,
    });

    return NextResponse.json({ brief });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('Generate brief error:', err);
    return NextResponse.json({ error: 'Failed to generate brief' }, { status: 500 });
  }
}
