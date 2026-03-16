import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/session';
import { trackEvent } from '@/lib/events';

const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  draft: ['physician_reviewed'],
  physician_reviewed: ['patient_signed'],
  patient_signed: ['submitted'],
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireSession();
    const { id } = await params;

    const patient = await prisma.patient.findUnique({
      where: { userId: session.userId },
      select: { id: true },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 });
    }

    const document = await prisma.regulatoryDocument.findFirst({
      where: {
        id,
        assessment: { patientId: patient.id },
      },
      include: {
        assessment: {
          select: {
            id: true,
            recommendedPathway: true,
            cancerType: true,
            physicianName: true,
          },
        },
      },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    return NextResponse.json({ document });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('Document detail error:', err);
    return NextResponse.json({ error: 'Failed to load document' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireSession();
    const { id } = await params;
    const { status, reviewNotes, reviewedBy } = await req.json();

    const patient = await prisma.patient.findUnique({
      where: { userId: session.userId },
      select: { id: true },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 });
    }

    const document = await prisma.regulatoryDocument.findFirst({
      where: {
        id,
        assessment: { patientId: patient.id },
      },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Validate status transition
    if (status) {
      const allowedNext = VALID_STATUS_TRANSITIONS[document.status];
      if (!allowedNext?.includes(status)) {
        return NextResponse.json({
          error: `Cannot transition from "${document.status}" to "${status}". Allowed: ${allowedNext?.join(', ') ?? 'none'}`,
        }, { status: 400 });
      }
    }

    const updated = await prisma.regulatoryDocument.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(reviewNotes !== undefined && { reviewNotes }),
        ...(reviewedBy && { reviewedBy }),
        ...(status === 'physician_reviewed' && { reviewedAt: new Date() }),
      },
    });

    if (status) {
      await trackEvent(session.userId, 'regulatory_document_status_updated', {
        documentId: id,
        oldStatus: document.status,
        newStatus: status,
      });
    }

    return NextResponse.json({ document: updated });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('Document update error:', err);
    return NextResponse.json({ error: 'Failed to update document' }, { status: 500 });
  }
}
