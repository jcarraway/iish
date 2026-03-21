import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/session';
import { checkSequencingCoverage, generateLetterOfMedicalNecessity } from '@/lib/coverage';
import type { PatientProfile } from '@iish/shared';

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();

    const patient = await prisma.patient.findUnique({
      where: { userId: session.userId },
      include: { user: { select: { name: true } } },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 });
    }

    const body = await req.json();
    const { testType, providerName, insurer } = body as {
      testType: string;
      providerName: string;
      insurer?: string;
    };

    if (!testType || !providerName) {
      return NextResponse.json({ error: 'testType and providerName are required' }, { status: 400 });
    }

    const profile = patient.profile as PatientProfile;
    if (!profile) {
      return NextResponse.json({ error: 'Patient profile incomplete' }, { status: 400 });
    }

    const coverageResult = await checkSequencingCoverage(patient.id, testType, insurer);

    const lomn = await generateLetterOfMedicalNecessity(
      { name: patient.user.name ?? undefined, profile },
      providerName,
      testType,
      coverageResult,
    );

    return NextResponse.json({ lomn });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('LOMN generation error:', err);
    return NextResponse.json({ error: 'Failed to generate letter' }, { status: 500 });
  }
}
