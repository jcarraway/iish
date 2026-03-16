import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/session';
import { crossReferenceTrials } from '@/lib/neoantigen-trials';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const session = await requireSession();
    const { jobId } = await params;

    const patient = await prisma.patient.findUnique({
      where: { userId: session.userId },
      select: { id: true },
    });
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    const job = await prisma.pipelineJob.findUnique({
      where: { id: jobId },
      select: { id: true, patientId: true, status: true },
    });

    if (!job || job.patientId !== patient.id) {
      return NextResponse.json({ error: 'Pipeline job not found' }, { status: 404 });
    }

    if (job.status !== 'complete') {
      return NextResponse.json({ error: 'Job is not yet complete' }, { status: 400 });
    }

    const matches = await crossReferenceTrials(jobId);

    return NextResponse.json({ matches });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Trial cross-reference error:', err);
    return NextResponse.json({ error: 'Failed to cross-reference trials' }, { status: 500 });
  }
}
