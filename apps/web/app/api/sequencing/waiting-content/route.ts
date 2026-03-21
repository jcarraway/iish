import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/session';
import { generateWaitingContent } from '@/lib/waiting-content';
import type { PatientProfile } from '@iish/shared';

export async function POST() {
  try {
    const session = await requireSession();

    const patient = await prisma.patient.findUnique({
      where: { userId: session.userId },
      select: { profile: true },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 });
    }

    const profile = patient.profile as PatientProfile;
    const cancerType = profile.cancerType ?? profile.cancerTypeNormalized;

    if (!cancerType) {
      return NextResponse.json({ error: 'Cancer type not found in profile' }, { status: 400 });
    }

    const content = await generateWaitingContent(cancerType);

    return NextResponse.json({ content });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('Waiting content error:', err);
    return NextResponse.json({ error: 'Failed to generate waiting content' }, { status: 500 });
  }
}
