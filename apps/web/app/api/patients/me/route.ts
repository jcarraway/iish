import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await requireSession();

    const patient = await prisma.patient.findUnique({
      where: { userId: session.userId },
      include: { documents: { orderBy: { createdAt: 'desc' } } },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: patient.id,
      intakePath: patient.intakePath,
      profile: patient.profile,
      fieldSources: patient.fieldSources,
      fieldConfidence: patient.fieldConfidence,
      zipCode: patient.zipCode,
      documents: patient.documents.map((d) => ({
        id: d.id,
        documentType: d.documentType,
        extractionStatus: d.extractionStatus,
        mimeType: d.mimeType,
        fileCount: d.fileCount,
        createdAt: d.createdAt,
      })),
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,
    });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('Get patient error:', err);
    return NextResponse.json({ error: 'Failed to fetch patient' }, { status: 500 });
  }
}
