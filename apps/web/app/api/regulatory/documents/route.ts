import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/session';

export async function GET(req: NextRequest) {
  try {
    const session = await requireSession();
    const url = new URL(req.url);
    const assessmentId = url.searchParams.get('assessmentId');

    const patient = await prisma.patient.findUnique({
      where: { userId: session.userId },
      select: { id: true },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 });
    }

    const where: Record<string, unknown> = {
      assessment: { patientId: patient.id },
    };

    if (assessmentId) {
      where.assessmentId = assessmentId;
    }

    const documents = await prisma.regulatoryDocument.findMany({
      where,
      include: {
        assessment: {
          select: {
            id: true,
            recommendedPathway: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ documents, count: documents.length });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('Documents list error:', err);
    return NextResponse.json({ error: 'Failed to load documents' }, { status: 500 });
  }
}
