import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/session';
import { trackEvent } from '@/lib/events';
import { generateRegulatoryDocument } from '@/lib/regulatory-documents';
import type { RegulatoryDocumentType } from '@iish/shared';

const VALID_TYPES: RegulatoryDocumentType[] = [
  'fda_form_3926',
  'right_to_try_checklist',
  'informed_consent',
  'physician_letter',
  'ind_application',
  'irb_protocol',
  'manufacturer_request',
  'physician_discussion_guide',
];

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    const { assessmentId, documentType } = await req.json();

    if (!assessmentId || !documentType) {
      return NextResponse.json({ error: 'assessmentId and documentType are required' }, { status: 400 });
    }

    if (!VALID_TYPES.includes(documentType)) {
      return NextResponse.json({ error: `Invalid document type. Must be one of: ${VALID_TYPES.join(', ')}` }, { status: 400 });
    }

    // Verify patient owns this assessment
    const patient = await prisma.patient.findUnique({
      where: { userId: session.userId },
      select: { id: true },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 });
    }

    const assessment = await prisma.regulatoryPathwayAssessment.findFirst({
      where: { id: assessmentId, patientId: patient.id },
      select: { id: true },
    });

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    const result = await generateRegulatoryDocument(assessmentId, documentType);

    await trackEvent(session.userId, 'regulatory_document_generated', {
      assessmentId,
      documentType,
      documentId: result.id,
    });

    return NextResponse.json({
      document: {
        id: result.id,
        content: result.content,
        type: documentType,
        status: 'draft',
      },
    });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('Document generation error:', err);
    return NextResponse.json({ error: 'Failed to generate document' }, { status: 500 });
  }
}
