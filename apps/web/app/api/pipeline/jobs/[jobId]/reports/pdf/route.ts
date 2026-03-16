import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/session';
import { generatePatientReport, generateClinicianReport, generateManufacturerBlueprint } from '@/lib/report-generator';
import { renderPatientPdf, renderClinicianPdf, renderManufacturerPdf } from '@/lib/report-pdf';
import { generatePresignedDownloadUrl, multipartUpload, resultsPath } from '@oncovax/pipeline-storage';

const TYPE_TO_FIELD: Record<string, 'patientSummaryPath' | 'fullReportPdfPath' | 'vaccineBlueprintPath'> = {
  patient: 'patientSummaryPath',
  clinician: 'fullReportPdfPath',
  manufacturer: 'vaccineBlueprintPath',
};

const TYPE_TO_FILENAME: Record<string, string> = {
  patient: 'patient-summary.pdf',
  clinician: 'clinical-report.pdf',
  manufacturer: 'manufacturer-blueprint.pdf',
};

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

    const pathField = TYPE_TO_FIELD[type];

    const job = await prisma.pipelineJob.findUnique({
      where: { id: jobId },
      select: {
        id: true,
        patientId: true,
        status: true,
        patientSummaryPath: true,
        fullReportPdfPath: true,
        vaccineBlueprintPath: true,
      },
    });

    if (!job || job.patientId !== patient.id) {
      return NextResponse.json({ error: 'Pipeline job not found' }, { status: 404 });
    }

    if (job.status !== 'complete') {
      return NextResponse.json({ error: 'Job is not yet complete' }, { status: 400 });
    }

    // If PDF already exists, return presigned URL
    const existingPath = job[pathField];
    if (existingPath) {
      const url = await generatePresignedDownloadUrl(existingPath);
      return NextResponse.json({ url, cached: true });
    }

    // Generate report data
    let pdfBuffer: Buffer;
    switch (type) {
      case 'patient': {
        const data = await generatePatientReport(jobId);
        pdfBuffer = await renderPatientPdf(data);
        break;
      }
      case 'clinician': {
        const data = await generateClinicianReport(jobId);
        pdfBuffer = await renderClinicianPdf(data);
        break;
      }
      case 'manufacturer': {
        const data = await generateManufacturerBlueprint(jobId);
        pdfBuffer = await renderManufacturerPdf(data);
        break;
      }
      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    // Upload to S3
    const s3Key = resultsPath(jobId, TYPE_TO_FILENAME[type]);
    await multipartUpload(s3Key, pdfBuffer, 'application/pdf');

    // Update job record with path
    await prisma.pipelineJob.update({
      where: { id: jobId },
      data: { [pathField]: s3Key },
    });

    const url = await generatePresignedDownloadUrl(s3Key);
    return NextResponse.json({ url, cached: false });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('PDF generation error:', err);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
