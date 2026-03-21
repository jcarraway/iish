import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/session';
import { checkSequencingCoverage } from '@/lib/coverage';
import { generateSequencingBrief } from '@/lib/sequencing-brief';
import type { PatientProfile, SequencingProviderDetails } from '@iish/shared';

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();

    const patient = await prisma.patient.findUnique({
      where: { userId: session.userId },
      select: { id: true, profile: true },
    });

    if (!patient?.profile) {
      return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 });
    }

    const body = await req.json();
    const { testType, providerIds, insurer } = body as {
      testType: string;
      providerIds: string[];
      insurer?: string;
    };

    if (!testType || !providerIds?.length) {
      return NextResponse.json({ error: 'testType and providerIds are required' }, { status: 400 });
    }

    const profile = patient.profile as PatientProfile;

    // Fetch providers
    const providers = await prisma.sequencingProvider.findMany({
      where: { id: { in: providerIds } },
    });

    const recommendedTests = providers.map(p => {
      const details = p.details as unknown as SequencingProviderDetails;
      return {
        testType,
        providerName: p.name,
        geneCount: details.geneCount,
      };
    });

    const coverageResult = await checkSequencingCoverage(patient.id, testType, insurer);

    const brief = await generateSequencingBrief({
      profile,
      recommendedTests,
      coverageResult,
    });

    return NextResponse.json({ brief });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('Sequencing brief error:', err);
    return NextResponse.json({ error: 'Failed to generate brief' }, { status: 500 });
  }
}
