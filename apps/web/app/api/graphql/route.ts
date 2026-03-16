import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { NextRequest } from 'next/server';
import { typeDefs, resolvers } from '@oncovax/api';
import type { GraphQLContext } from '@oncovax/api';
import { prisma } from '@/lib/db';
import { redis } from '@/lib/redis';
import { getSession } from '@/lib/session';

// Lib function imports
import { generateMatchesForPatient } from '@/lib/matcher';
import { generateTranslation } from '@/lib/translator';
import { matchFinancialPrograms as _matchFinancialPrograms } from '@/lib/financial-matcher';
import { checkSequencingCoverage } from '@/lib/coverage';
import { extractGenomicReport as _extractGenomicReport } from '@/lib/genomic-extraction';
import { generateGenomicInterpretation } from '@/lib/genomic-interpreter';
import { publishEvent } from '@/lib/nats';
import { generatePatientReport, generateClinicianReport, generateManufacturerBlueprint } from '@/lib/report-generator';
import { assessPathway as _assessPathway } from '@/lib/pathway-advisor';
import { generateRegulatoryDocument } from '@/lib/regulatory-documents';
import { filterByDistance } from '@/lib/providers';
import { checkAdverseEventEscalation } from '@/lib/monitoring';
import { generatePresignedUploadUrl as _generatePresignedUploadUrl } from '@/lib/s3';
import { runExtractionPipeline } from '@/lib/extraction';

// ============================================================================
// Adapter functions — bridge resolver signatures to actual lib functions
// ============================================================================

async function generateMatches(patientId: string) {
  await generateMatchesForPatient(patientId);
  return prisma.match.findMany({
    where: { patientId },
    include: { trial: true },
    orderBy: { matchScore: 'desc' },
  });
}

async function translateTreatment(matchId: string) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { patient: true },
  });
  if (!match) throw new Error('Match not found');
  return generateTranslation(match.patient.profile as any, match.patientId);
}

async function matchFinancialPrograms(patientId: string, _profile: any) {
  // matchFinancialPrograms already looks up the patient internally
  return _matchFinancialPrograms(patientId);
}

async function checkCoverage(patientId: string, insurer: string, testType: string) {
  return checkSequencingCoverage(patientId, testType, insurer);
}

async function extractGenomicReport(documentId: string) {
  // Look up the document's image URLs from the database
  const doc = await prisma.documentUpload.findUnique({ where: { id: documentId } });
  if (!doc) throw new Error('Document not found');
  const imageUrls = doc.storagePaths.length > 0 ? doc.storagePaths : (doc.s3Key ? [doc.s3Key] : []);
  const result = await _extractGenomicReport(imageUrls);
  return result.extraction;
}

async function interpretGenomics(patientId: string) {
  const patient = await prisma.patient.findUnique({ where: { id: patientId } });
  if (!patient) throw new Error('Patient not found');
  const profile = patient.profile as any;
  if (!profile?.genomicData) throw new Error('No genomic data found');
  return generateGenomicInterpretation(profile, profile.genomicData, patientId);
}

async function submitPipelineJob(params: any) {
  await publishEvent('pipeline.job.submit', params);
  return prisma.pipelineJob.create({
    data: {
      patientId: params.patientId,
      tumorDataPath: params.tumorDataPath,
      normalDataPath: params.normalDataPath,
      rnaDataPath: params.rnaDataPath || null,
      inputFormat: params.inputFormat,
      referenceGenome: params.referenceGenome,
      status: 'pending',
      stepsCompleted: [],
    },
  });
}

async function generateReport(pipelineJobId: string, reportType: string) {
  if (reportType === 'patient') return generatePatientReport(pipelineJobId);
  if (reportType === 'clinician') return generateClinicianReport(pipelineJobId);
  if (reportType === 'manufacturer') return generateManufacturerBlueprint(pipelineJobId);
  throw new Error(`Unknown report type: ${reportType}`);
}

async function createOrder(patientId: string, partnerId: string, pipelineJobId: string) {
  return prisma.manufacturingOrder.create({
    data: { patientId, partnerId, pipelineJobId, status: 'inquiry_sent' },
  });
}

async function updateOrderStatus(orderId: string, status: string, notes?: string) {
  return prisma.manufacturingOrder.update({
    where: { id: orderId },
    data: { status, ...(notes ? { notes } : {}) },
  });
}

async function assessPathway(patientId: string, input: any) {
  // assessPathway is sync, takes PathwayAssessmentInput directly
  const result = _assessPathway(input);
  // Save assessment to DB
  return prisma.regulatoryPathwayAssessment.create({
    data: {
      patientId,
      cancerType: input.cancerType,
      cancerStage: input.cancerStage,
      priorTreatmentsFailed: input.priorTreatmentsFailed,
      hasPhysician: input.hasPhysician,
      physicianName: input.physicianName,
      physicianEmail: input.physicianEmail,
      physicianInstitution: input.physicianInstitution,
      isLifeThreatening: input.isLifeThreatening,
      hasExhaustedOptions: input.hasExhaustedOptions,
      stateOfResidence: input.stateOfResidence,
      recommendedPathway: result.recommended,
      pathwayRationale: result.rationale,
      alternativePathways: result.alternatives as any,
      estimatedCostMin: result.estimatedCostMin,
      estimatedCostMax: result.estimatedCostMax,
      estimatedTimelineWeeks: result.estimatedTimelineWeeks,
    },
  });
}

async function generateDocument(assessmentId: string, documentType: string) {
  return generateRegulatoryDocument(assessmentId, documentType as any);
}

async function searchSites(params: { lat?: number; lng?: number; radiusMiles?: number }) {
  const sites = await prisma.administrationSite.findMany({ where: { verified: true } });
  if (params.lat != null && params.lng != null) {
    return filterByDistance(sites, { lat: params.lat, lng: params.lng }, params.radiusMiles || 50);
  }
  return sites;
}

async function submitMonitoringReport(input: any) {
  const { adverseEvents, ...reportData } = input;
  const hasAdverseEvents = adverseEvents?.length > 0;
  const report = await prisma.postAdministrationReport.create({
    data: { ...reportData, adverseEvents, hasAdverseEvents },
  });
  if (hasAdverseEvents) {
    checkAdverseEventEscalation(adverseEvents);
  }
  return report;
}

async function getPresignedUploadUrl(filename: string, contentType: string) {
  const s3Key = `documents/${Date.now()}-${filename}`;
  return _generatePresignedUploadUrl(s3Key, contentType);
}

async function extractDocument(documentId: string) {
  const doc = await prisma.documentUpload.findUnique({ where: { id: documentId } });
  if (!doc) throw new Error('Document not found');
  const s3Keys = Array.isArray(doc.s3Key) ? doc.s3Key as string[] : [doc.s3Key as string];
  const mimeTypes = s3Keys.map(() => doc.mimeType || 'image/jpeg');
  return runExtractionPipeline(documentId, s3Keys, mimeTypes);
}

async function requestMagicLink(_email: string) {
  // Magic link is handled by the existing /api/auth/magic-link REST endpoint
  throw new Error('Use /api/auth/magic-link REST endpoint');
}

// ============================================================================
// Apollo Server setup
// ============================================================================

const server = new ApolloServer<GraphQLContext>({
  typeDefs,
  resolvers,
  introspection: true,
});

const handler = startServerAndCreateNextHandler<NextRequest, GraphQLContext>(server, {
  context: async (req) => {
    const session = await getSession();
    return {
      prisma,
      redis,
      session: session ? { userId: session.userId, email: session.email } : null,
      lib: {
        generateMatches,
        translateTreatment,
        matchFinancialPrograms,
        checkCoverage,
        extractGenomicReport,
        interpretGenomics,
        submitPipelineJob,
        generateReport,
        createOrder,
        updateOrderStatus,
        assessPathway,
        generateDocument,
        searchSites,
        submitMonitoringReport,
        getPresignedUploadUrl,
        extractDocument,
        requestMagicLink,
      },
    };
  },
});

export async function GET(req: NextRequest) {
  return handler(req);
}

export async function POST(req: NextRequest) {
  return handler(req);
}
