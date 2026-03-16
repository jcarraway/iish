import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/session';
import { trackEvent } from '@/lib/events';
import { assessPathway } from '@/lib/pathway-advisor';
import type { PathwayAssessmentInput } from '@oncovax/shared';

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    const body: PathwayAssessmentInput = await req.json();

    const patient = await prisma.patient.findUnique({
      where: { userId: session.userId },
      select: { id: true },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 });
    }

    // Validate pipeline job if provided
    if (body.pipelineJobId) {
      const job = await prisma.pipelineJob.findFirst({
        where: { id: body.pipelineJobId, patientId: patient.id },
        select: { id: true },
      });
      if (!job) {
        return NextResponse.json({ error: 'Pipeline job not found' }, { status: 404 });
      }
    }

    // Run pathway assessment
    const recommendation = assessPathway(body);

    // Store assessment
    const assessment = await prisma.regulatoryPathwayAssessment.create({
      data: {
        patientId: patient.id,
        pipelineJobId: body.pipelineJobId ?? null,
        cancerType: body.cancerType,
        cancerStage: body.cancerStage,
        priorTreatmentsFailed: body.priorTreatmentsFailed,
        hasPhysician: body.hasPhysician,
        physicianName: body.physicianName ?? null,
        physicianEmail: body.physicianEmail ?? null,
        physicianInstitution: body.physicianInstitution ?? null,
        isLifeThreatening: body.isLifeThreatening,
        hasExhaustedOptions: body.hasExhaustedOptions,
        stateOfResidence: body.stateOfResidence,
        recommendedPathway: recommendation.recommended,
        pathwayRationale: recommendation.rationale,
        alternativePathways: recommendation.alternatives,
        estimatedCostMin: recommendation.estimatedCostMin,
        estimatedCostMax: recommendation.estimatedCostMax,
        estimatedTimelineWeeks: recommendation.estimatedTimelineWeeks,
      },
    });

    await trackEvent(session.userId, 'regulatory_assessment_completed', {
      assessmentId: assessment.id,
      recommendedPathway: recommendation.recommended,
    });

    return NextResponse.json({
      assessment: {
        id: assessment.id,
        ...recommendation,
      },
    });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('Regulatory assess error:', err);
    return NextResponse.json({ error: 'Failed to run pathway assessment' }, { status: 500 });
  }
}
