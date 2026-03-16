import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/session';
import { computeMatchDelta } from '@/lib/matcher';

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    const body = await req.json();
    const { genomicResultId } = body as { genomicResultId?: string };

    const patient = await prisma.patient.findUnique({
      where: { userId: session.userId },
      select: { id: true, profile: true },
    });
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Find the genomic result
    const genomicResult = genomicResultId
      ? await prisma.genomicResult.findUnique({ where: { id: genomicResultId } })
      : await prisma.genomicResult.findFirst({
          where: { patientId: patient.id, patientConfirmed: true },
          orderBy: { createdAt: 'desc' },
        });

    if (!genomicResult || genomicResult.patientId !== patient.id) {
      return NextResponse.json({ error: 'No confirmed genomic results found' }, { status: 404 });
    }

    if (!genomicResult.patientConfirmed) {
      return NextResponse.json({ error: 'Please confirm your genomic results first' }, { status: 400 });
    }

    // Compute match delta
    const delta = await computeMatchDelta(patient.id);

    // Store delta in GenomicResult
    await prisma.genomicResult.update({
      where: { id: genomicResult.id },
      data: {
        matchDelta: JSON.parse(JSON.stringify(delta)),
        rematchedAt: new Date(),
      },
    });

    return NextResponse.json({ delta });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Genomic rematch error:', err);
    return NextResponse.json({ error: 'Failed to rematch trials' }, { status: 500 });
  }
}
