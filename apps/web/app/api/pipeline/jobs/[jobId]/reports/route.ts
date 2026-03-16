import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/session';
import { generatePatientReport, generateClinicianReport, generateManufacturerBlueprint } from '@/lib/report-generator';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const session = await requireSession();
    const { jobId } = await params;
    const type = req.nextUrl.searchParams.get('type');

    if (!type || !['patient', 'clinician', 'manufacturer'].includes(type)) {
      return NextResponse.json({ error: 'Invalid report type. Must be patient, clinician, or manufacturer.' }, { status: 400 });
    }

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

    let report;
    switch (type) {
      case 'patient':
        report = await generatePatientReport(jobId);
        break;
      case 'clinician':
        report = await generateClinicianReport(jobId);
        break;
      case 'manufacturer':
        report = await generateManufacturerBlueprint(jobId);
        break;
    }

    return NextResponse.json({ type, report });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Report generation error:', err);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}
