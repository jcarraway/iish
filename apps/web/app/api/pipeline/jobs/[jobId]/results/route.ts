import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/session';
import { generatePresignedDownloadUrl } from '@oncovax/pipeline-storage';

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
      select: {
        id: true,
        patientId: true,
        status: true,
        neoantigenReportPath: true,
        vaccineBlueprintPath: true,
        fullReportPdfPath: true,
        patientSummaryPath: true,
      },
    });

    if (!job || job.patientId !== patient.id) {
      return NextResponse.json({ error: 'Pipeline job not found' }, { status: 404 });
    }

    if (job.status !== 'complete') {
      return NextResponse.json({ error: 'Job is not yet complete' }, { status: 400 });
    }

    const downloads: Record<string, string> = {};

    const filePaths = [
      { key: 'neoantigenReport', path: job.neoantigenReportPath },
      { key: 'vaccineBlueprint', path: job.vaccineBlueprintPath },
      { key: 'fullReportPdf', path: job.fullReportPdfPath },
      { key: 'patientSummary', path: job.patientSummaryPath },
    ];

    await Promise.all(
      filePaths
        .filter((f) => f.path)
        .map(async (f) => {
          downloads[f.key] = await generatePresignedDownloadUrl(f.path!);
        })
    );

    return NextResponse.json({ jobId, downloads });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Pipeline results error:', err);
    return NextResponse.json({ error: 'Failed to get pipeline results' }, { status: 500 });
  }
}
