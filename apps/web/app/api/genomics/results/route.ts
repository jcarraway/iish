import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await requireSession();

    const patient = await prisma.patient.findUnique({
      where: { userId: session.userId },
      select: { id: true },
    });
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    const results = await prisma.genomicResult.findMany({
      where: { patientId: patient.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        source: true,
        provider: true,
        testName: true,
        reportDate: true,
        patientConfirmed: true,
        extractionConfidence: true,
        interpretationAt: true,
        rematchedAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ results });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Genomic results list error:', err);
    return NextResponse.json({ error: 'Failed to load genomic results' }, { status: 500 });
  }
}
