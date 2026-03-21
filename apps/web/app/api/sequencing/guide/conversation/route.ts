import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/session';
import { generateConversationGuide } from '@/lib/conversation-guide';
import { generateTestRecommendation } from '@/lib/test-recommendation';
import type { PatientProfile, TestRecommendation } from '@iish/shared';

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
    let { testRecommendation } = body as { testRecommendation?: TestRecommendation };

    const profile = patient.profile as PatientProfile;

    // Generate test recommendation if not provided
    if (!testRecommendation) {
      testRecommendation = await generateTestRecommendation({
        profile,
        patientId: patient.id,
      });
    }

    const guide = await generateConversationGuide(profile, patient.id, testRecommendation);

    return NextResponse.json({ guide });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('Conversation guide error:', err);
    return NextResponse.json({ error: 'Failed to generate conversation guide' }, { status: 500 });
  }
}
