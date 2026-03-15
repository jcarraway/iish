import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    const { programId } = await req.json();

    if (!programId || typeof programId !== 'string') {
      return NextResponse.json({ error: 'programId is required' }, { status: 400 });
    }

    const patient = await prisma.patient.findUnique({
      where: { userId: session.userId },
      select: { id: true },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 });
    }

    const match = await prisma.financialMatch.findUnique({
      where: {
        patientId_programId: { patientId: patient.id, programId },
      },
    });

    if (!match) {
      return NextResponse.json({ error: 'No match found for this program' }, { status: 404 });
    }

    await prisma.financialMatch.update({
      where: { id: match.id },
      data: { notifyOnReopen: true },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('Subscribe error:', err);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}
