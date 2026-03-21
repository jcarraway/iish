import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/session';
import { generateSequencingRecommendation } from '@/lib/sequencing-recommendation';
import type { PatientProfile } from '@iish/shared';

export async function POST() {
  try {
    const session = await requireSession();

    const patient = await prisma.patient.findUnique({
      where: { userId: session.userId },
      select: { id: true, profile: true },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 });
    }

    const profile = patient.profile as PatientProfile;
    const recommendation = await generateSequencingRecommendation(profile, patient.id);

    return NextResponse.json({ recommendation });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('Sequencing recommendation error:', err);
    return NextResponse.json({ error: 'Failed to generate recommendation' }, { status: 500 });
  }
}
