import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/session';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ resultId: string }> }
) {
  try {
    const session = await requireSession();
    const { resultId } = await params;

    const patient = await prisma.patient.findUnique({
      where: { userId: session.userId },
      select: { id: true },
    });
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    const result = await prisma.genomicResult.findUnique({
      where: { id: resultId },
    });

    if (!result || result.patientId !== patient.id) {
      return NextResponse.json({ error: 'Genomic result not found' }, { status: 404 });
    }

    return NextResponse.json({ result });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Genomic result detail error:', err);
    return NextResponse.json({ error: 'Failed to load genomic result' }, { status: 500 });
  }
}
