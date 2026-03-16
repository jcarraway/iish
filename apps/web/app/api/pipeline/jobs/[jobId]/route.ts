import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/session';

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
      include: {
        neoantigens: {
          orderBy: { rank: 'asc' },
          take: 20,
        },
      },
    });

    if (!job || job.patientId !== patient.id) {
      return NextResponse.json({ error: 'Pipeline job not found' }, { status: 404 });
    }

    return NextResponse.json({ job });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Pipeline job detail error:', err);
    return NextResponse.json({ error: 'Failed to get pipeline job' }, { status: 500 });
  }
}

export async function DELETE(
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

    if (job.status !== 'queued' && job.status !== 'running') {
      return NextResponse.json(
        { error: 'Can only cancel jobs that are queued or running' },
        { status: 400 }
      );
    }

    await prisma.pipelineJob.update({
      where: { id: jobId },
      data: { status: 'cancelled' },
    });

    return NextResponse.json({ jobId, status: 'cancelled' });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Pipeline job cancel error:', err);
    return NextResponse.json({ error: 'Failed to cancel pipeline job' }, { status: 500 });
  }
}
