import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/session';
import { generateMatchesForPatient } from '@/lib/matcher';

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

    if (!patient.profile) {
      return NextResponse.json({ error: 'Patient profile incomplete' }, { status: 400 });
    }

    const matchCount = await generateMatchesForPatient(patient.id);

    return NextResponse.json({ matchCount });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('Generate matches error:', err);
    return NextResponse.json({ error: 'Failed to generate matches' }, { status: 500 });
  }
}
