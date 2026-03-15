import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/session';
import { redis } from '@/lib/redis';
import { generateTranslation } from '@/lib/translator';
import type { PatientProfile } from '@oncovax/shared';

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

    const cached = await redis.get(`translation:${patient.id}`);
    if (cached) {
      return NextResponse.json({ translation: JSON.parse(cached), cached: true });
    }

    return NextResponse.json({ translation: null, cached: false });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('Get translation error:', err);
    return NextResponse.json({ error: 'Failed to get translation' }, { status: 500 });
  }
}

export async function POST(_req: NextRequest) {
  try {
    const session = await requireSession();

    const patient = await prisma.patient.findUnique({
      where: { userId: session.userId },
      select: { id: true, profile: true },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 });
    }

    const profile = patient.profile as PatientProfile | null;
    if (!profile || !profile.cancerType) {
      return NextResponse.json({ error: 'Patient profile is incomplete — cancer type is required' }, { status: 400 });
    }

    const translation = await generateTranslation(profile, patient.id);

    return NextResponse.json({ translation });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('Generate translation error:', err);
    return NextResponse.json({ error: 'Failed to generate translation' }, { status: 500 });
  }
}
