import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/session';
import { objectExists } from '@iish/pipeline-storage';
import { pipelineSubmitJobSchema } from '@iish/shared';
import { publishEvent } from '@/lib/nats';

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    const body = await req.json();
    const { tumorDataPath, normalDataPath, rnaDataPath, inputFormat, sequencingOrderId } =
      pipelineSubmitJobSchema.parse(body);

    const patient = await prisma.patient.findUnique({
      where: { userId: session.userId },
      select: { id: true },
    });
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Verify S3 objects exist
    const [tumorExists, normalExists] = await Promise.all([
      objectExists(tumorDataPath),
      objectExists(normalDataPath),
    ]);
    if (!tumorExists) {
      return NextResponse.json({ error: 'Tumor data file not found in S3' }, { status: 400 });
    }
    if (!normalExists) {
      return NextResponse.json({ error: 'Normal data file not found in S3' }, { status: 400 });
    }
    if (rnaDataPath) {
      const rnaExists = await objectExists(rnaDataPath);
      if (!rnaExists) {
        return NextResponse.json({ error: 'RNA data file not found in S3' }, { status: 400 });
      }
    }

    // Verify sequencing order belongs to patient if provided
    if (sequencingOrderId) {
      const order = await prisma.sequencingOrder.findUnique({
        where: { id: sequencingOrderId },
        select: { patientId: true },
      });
      if (!order || order.patientId !== patient.id) {
        return NextResponse.json({ error: 'Sequencing order not found' }, { status: 404 });
      }
    }

    const job = await prisma.pipelineJob.create({
      data: {
        patientId: patient.id,
        sequencingOrderId: sequencingOrderId ?? null,
        tumorDataPath,
        normalDataPath,
        rnaDataPath: rnaDataPath ?? null,
        inputFormat,
        status: 'queued',
      },
    });

    // Publish job submitted event
    await publishEvent('PIPELINE.job.submitted', {
      jobId: job.id,
      patientId: patient.id,
      tumorDataPath,
      normalDataPath,
      rnaDataPath,
      inputFormat,
      referenceGenome: job.referenceGenome,
    });

    return NextResponse.json({ jobId: job.id, status: job.status });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (err && typeof err === 'object' && 'issues' in err) {
      return NextResponse.json({ error: 'Invalid request', details: err }, { status: 400 });
    }
    console.error('Pipeline submit error:', err);
    return NextResponse.json({ error: 'Failed to submit pipeline job' }, { status: 500 });
  }
}
