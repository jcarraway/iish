import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/session';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await requireSession();

    const patient = await prisma.patient.findFirst({
      where: { userId: session.userId },
    });

    if (!patient) {
      return NextResponse.json({ connections: [] });
    }

    const connections = await prisma.fhirConnection.findMany({
      where: { patientId: patient.id },
      select: {
        id: true,
        healthSystemName: true,
        syncStatus: true,
        lastSyncedAt: true,
        consentAt: true,
        scopesGranted: true,
        resourcesPulled: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ connections });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('FHIR connections error:', err);
    return NextResponse.json({ error: 'Failed to load connections' }, { status: 500 });
  }
}
