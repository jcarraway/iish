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

    const jobs = await prisma.pipelineJob.findMany({
      where: { patientId: patient.id },
      select: {
        id: true,
        status: true,
        currentStep: true,
        stepsCompleted: true,
        inputFormat: true,
        referenceGenome: true,
        startedAt: true,
        completedAt: true,
        estimatedCompletion: true,
        createdAt: true,
        neoantigenCount: true,
        variantCount: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ jobs });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Pipeline jobs list error:', err);
    return NextResponse.json({ error: 'Failed to list pipeline jobs' }, { status: 500 });
  }
}
