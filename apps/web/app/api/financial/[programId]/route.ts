import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/session';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ programId: string }> },
) {
  try {
    const session = await requireSession();
    const { programId } = await params;

    const patient = await prisma.patient.findUnique({
      where: { userId: session.userId },
      select: { id: true },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 });
    }

    const program = await prisma.financialProgram.findUnique({
      where: { id: programId },
    });

    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    // Get patient-specific match data if it exists
    const match = await prisma.financialMatch.findUnique({
      where: {
        patientId_programId: { patientId: patient.id, programId },
      },
    });

    return NextResponse.json({
      program: {
        id: program.id,
        name: program.name,
        organization: program.organization,
        type: program.type,
        assistanceCategories: program.assistanceCategories,
        description: program.description,
        maxBenefitAmount: program.maxBenefitAmount,
        benefitDescription: program.benefitDescription,
        eligibility: program.eligibility,
        status: program.status,
        applicationProcess: program.applicationProcess,
        applicationUrl: program.applicationUrl,
        applicationPhone: program.applicationPhone,
        requiredDocuments: program.requiredDocuments,
        turnaroundTime: program.turnaroundTime,
        phone: program.phone,
        website: program.website,
        email: program.email,
        hours: program.hours,
      },
      match: match ? {
        matchStatus: match.matchStatus,
        estimatedBenefit: match.estimatedBenefit,
        matchReasoning: match.matchReasoning,
        missingInfo: match.missingInfo,
        applicationStatus: match.status,
        notifyOnReopen: match.notifyOnReopen,
      } : null,
    });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('Get program detail error:', err);
    return NextResponse.json({ error: 'Failed to load program details' }, { status: 500 });
  }
}
