import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/session';
import { generateTestRecommendation } from '@/lib/test-recommendation';
import type { PatientProfile } from '@oncovax/shared';

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();

    const patient = await prisma.patient.findUnique({
      where: { userId: session.userId },
      select: { id: true, profile: true },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const { tissueAvailable, preferComprehensive } = body as {
      tissueAvailable?: boolean;
      preferComprehensive?: boolean;
    };

    const profile = patient.profile as PatientProfile;
    const recommendation = await generateTestRecommendation({
      profile,
      patientId: patient.id,
      tissueAvailable,
      preferComprehensive,
    });

    return NextResponse.json({ recommendation });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('Test recommendation error:', err);
    return NextResponse.json({ error: 'Failed to generate test recommendation' }, { status: 500 });
  }
}
