import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { NextRequest } from 'next/server';
import { typeDefs, resolvers } from '@iish/api';
import type { GraphQLContext } from '@iish/api';
import { prisma } from '@/lib/db';
import { redis } from '@/lib/redis';
import { getSession } from '@/lib/session';
import { createMagicLinkToken } from '@iish/shared';
import { Resend } from 'resend';

// Lib function imports — existing
import { generateMatchesForPatient, computeMatchDelta as _computeMatchDelta } from '@/lib/matcher';
import { generateTranslation } from '@/lib/translator';
import { matchFinancialPrograms as _matchFinancialPrograms } from '@/lib/financial-matcher';
import { checkSequencingCoverage, generateLetterOfMedicalNecessity } from '@/lib/coverage';
import { extractGenomicReport as _extractGenomicReport } from '@/lib/genomic-extraction';
import { generateGenomicInterpretation } from '@/lib/genomic-interpreter';
import { publishEvent } from '@/lib/nats';
import { generatePatientReport, generateClinicianReport, generateManufacturerBlueprint } from '@/lib/report-generator';
import { assessPathway as _assessPathway } from '@/lib/pathway-advisor';
import { generateRegulatoryDocument } from '@/lib/regulatory-documents';
import { filterByDistance } from '@/lib/providers';
import { checkAdverseEventEscalation, getMonitoringSchedule as _getMonSchedule } from '@/lib/monitoring';
import { generatePresignedUploadUrl as _generatePresignedUploadUrl } from '@/lib/s3';
import { runExtractionPipeline } from '@/lib/extraction';

// Lib function imports — new in D2
import { generateOncologistBrief as _genOncBrief } from '@/lib/oncologist-brief';
import {
  generateSequencingRecommendation as _genSeqRec,
  generateSequencingExplanation as _genSeqExpl,
} from '@/lib/sequencing-recommendation';
import { generateTestRecommendation as _genTestRec } from '@/lib/test-recommendation';
import { generateConversationGuide as _genConvGuide } from '@/lib/conversation-guide';
import { generateWaitingContent as _genWaiting } from '@/lib/waiting-content';
import { generateSequencingBrief as _genSeqBrief } from '@/lib/sequencing-brief';
import { crossReferenceTrials as _crossRefTrials } from '@/lib/neoantigen-trials';
import { discoverEndpoints, buildAuthorizeUrl, decryptToken } from '@/lib/fhir/smart-auth';
import { FhirClient } from '@/lib/fhir/client';
import { extractFhirResources } from '@/lib/fhir/extract-resources';
import { isValidTransition } from '@/lib/manufacturing-orders';
import { generateSCP as _generateSCP, refreshSCP as _refreshSCP } from '@/lib/scp-generator';
import {
  markEventComplete as _markEventComplete,
  skipEvent as _skipEvent,
  rescheduleEvent as _rescheduleEvent,
  uploadEventResult as _uploadEventResult,
} from '@/lib/surveillance-manager';
import {
  submitJournalEntry as _submitJournalEntry,
  deleteJournalEntry as _deleteJournalEntry,
  getJournalTrends as _getJournalTrends,
} from '@/lib/journal-manager';
import {
  getLifestyleRecommendations as _getLifestyleRecs,
  generateLifestyleRecommendations as _genLifestyleRecs,
} from '@/lib/lifestyle-generator';
import {
  getCareTeam as _getCareTeam,
  addCareTeamMember as _addCareTeamMember,
  updateCareTeamMember as _updateCareTeamMember,
  removeCareTeamMember as _removeCareTeamMember,
  routeSymptom as _routeSymptom,
  generateAppointmentPrep as _generateAppointmentPrep,
} from '@/lib/care-team-manager';
import {
  getCtdnaHistory as _getCtdnaHistory,
  addCtdnaResult as _addCtdnaResult,
} from '@/lib/ctdna-manager';
import {
  getNotificationPreferences as _getNotifPrefs,
  updateNotificationPreferences as _updateNotifPrefs,
  getNotificationHistory as _getNotifHistory,
  submitFeedback as _submitFeedback,
  getFeedback as _getFeedback,
  annualRefreshSCP as _annualRefreshSCP,
} from '@/lib/notification-manager';
import {
  reportRecurrence as _reportRecurrence,
  acknowledgeRecurrence as _acknowledgeRecurrence,
  updateCascadeStep as _updateCascadeStep,
  regenerateTranslator as _regenerateTranslator,
  archiveSurvivorshipPlan as _archiveSurvivorshipPlan,
  getRecurrenceEvent as _getRecurrenceEvent,
  getRecurrenceEvents as _getRecurrenceEvents,
  generateGenomicComparison as _generateGenomicComparison,
  getSecondOpinionResources as _getSecondOpinionResources,
} from '@/lib/recurrence-manager';
import { refreshAccessToken, encryptToken } from '@/lib/fhir/smart-auth';
import { mapFhirToPatientProfile } from '@/lib/fhir/mapper';
import type { PatientProfile } from '@iish/shared';
import {
  assessFertilityRisk as _assessFertilityRisk,
  getFertilityAssessment as _getFertilityAssessment,
  getPreservationOptions as _getPreservationOptions,
  getFertilityProviders as _getFertilityProviders,
  getFertilityFinancialPrograms as _getFertilityFinancialPrograms,
  generateDiscussionGuide as _generateDiscussionGuide,
  requestFertilityReferral as _requestFertilityReferral,
  updateFertilityOutcome as _updateFertilityOutcome,
} from '@/lib/fertility-manager';
import {
  createDenial as _createDenial,
  getDenials as _getDenials,
  getDenial as _getDenial,
  updateDenialStatus as _updateDenialStatus,
  generateAppealLetter as _generateAppealLetter,
  getAppealLetter as _getAppealLetter,
  updateAppealOutcome as _updateAppealOutcome,
  getAppealStrategy as _getAppealStrategy,
  getAppealRights as _getAppealRights,
  generatePeerReviewPrep as _generatePeerReviewPrep,
} from '@/lib/insurance-advocate';
import {
  assessTrialLogistics as _assessTrialLogistics,
  getLogisticsAssessment as _getLogisticsAssessment,
  getLogisticsAssessments as _getLogisticsAssessments,
  getAssistancePrograms as _getAssistancePrograms,
  generateLogisticsPlan as _generateLogisticsPlan,
  updateAssistanceApplication as _updateAssistanceApplication,
  getAssistanceApplications as _getAssistanceApplications,
} from '@/lib/logistics-manager';
import {
  evaluateSecondOpinionTriggers as _evaluateSecondOpinionTriggers,
  createSecondOpinionRequest as _createSecondOpinionRequest,
  getSecondOpinionRequest as _getSecondOpinionRequest,
  getSecondOpinionCenters as _getSecondOpinionCenters,
  generateRecordPacket as _generateRecordPacket,
  generateCommunicationGuide as _generateCommunicationGuide,
  selectCenter as _selectCenter,
  recordSecondOpinionOutcome as _recordSecondOpinionOutcome,
} from '@/lib/second-opinion-manager';
import {
  getArticle as _getArticle,
  getArticles as _getArticles,
  getArticlesByCategory as _getArticlesByCategory,
  searchArticles as _searchArticles,
  getGlossaryTerms as _getGlossaryTerms,
  getGlossaryTerm as _getGlossaryTerm,
  generateArticle as _generateArticle,
  publishArticle as _publishArticle,
  generatePersonalizedContext as _generatePersonalizedContext,
  generateReadingPlan as _generateReadingPlan,
  getArticleForSeo as _getArticleForSeo,
  getAllPublishedSlugs as _getAllPublishedSlugs,
  generateArticleBatch as _generateArticleBatch,
  getRelatedArticles as _getRelatedArticles,
} from '@/lib/learn-manager';
import {
  checkArticleQuality as _checkArticleQuality,
  runArticleQualityChecks as _runArticleQualityChecks,
  updateArticleStatus as _updateArticleStatus,
  getArticlesAdmin as _getArticlesAdmin,
  insertPlatformLinks as _insertPlatformLinks,
} from '@/lib/learn-quality';
import {
  getRelatedResearch as _getRelatedResearch,
  getArticlesForResearchItem as _getArticlesForResearchItem,
  getArticleRefreshStatus as _getArticleRefreshStatus,
  getArticleEngagement as _getArticleEngagement,
  generateRefreshSuggestion as _generateRefreshSuggestion,
  runRefreshCheckCycle as _runRefreshCheckCycle,
} from '@/lib/learn-intel-bridge';
import {
  getLandscapeOverview as _getLandscapeOverview,
  getSubtypeLandscape as _getSubtypeLandscape,
  getTreatmentPipeline as _getTreatmentPipeline,
  getRecentDevelopments as _getRecentDevelopments,
  generateStandardOfCareSummary as _generateStandardOfCareSummary,
  checkTranslatorUpdates as _checkTranslatorUpdates,
  checkFinancialUpdates as _checkFinancialUpdates,
  checkSurvivorshipUpdates as _checkSurvivorshipUpdates,
} from '@/lib/landscape-manager';
import {
  getResearchItems as _getResearchItems,
  getResearchItem as _getResearchItem,
  searchResearchItems as _searchResearchItems,
  getSyncStates as _getSyncStates,
  triggerIngestion as _triggerIngestion,
  reclassifyItem as _reclassifyItem,
  processQCQueue as _processQCQueue,
  migrateOldTaxonomy as _migrateOldTaxonomy,
} from '@/lib/intel-manager';
import {
  getPersonalizedFeed as _getPersonalizedFeed,
  generatePersonalizedNote as _generatePersonalizedNote,
  getUserFeedConfig as _getUserFeedConfig,
  markItemViewed as _markItemViewed,
  markItemSaved as _markItemSaved,
  markItemDismissed as _markItemDismissed,
  updateUserFeedConfig as _updateUserFeedConfig,
  computeRelevanceScores as _computeRelevanceScores,
} from '@/lib/feed-personalization';
import {
  submitCommunityReport as _submitCommunityReport,
  getCommunityReports as _getCommunityReports,
  getDrugInsights as _getDrugInsights,
  getCommunityInsightsForItem as _getCommunityInsightsForItem,
  compileDigest as _compileDigest,
  moderateReport as _moderateReport,
  updateDigestPreferences as _updateDigestPreferences,
} from '@/lib/community-manager';
import {
  submitSymptomAssessment as _submitSymptomAssessment,
  getSymptomAssessments as _getSymptomAssessments,
  getLatestAssessment as _getLatestAssessment,
  getPalliativeCareProviders as _getPalliativeCareProviders,
  getAdvanceCarePlan as _getAdvanceCarePlan,
  updateAdvanceCarePlan as _updateAdvanceCarePlan,
  generateGoalsOfCareGuide as _generateGoalsOfCareGuide,
  generateReferralLetter as _generateReferralLetter,
  shouldRecommendPalliative as _shouldRecommendPalliative,
} from '@/lib/palliative-manager';
import {
  getPreventiveTrials as _getPreventiveTrials,
  runPreventivePrescreen as _runPreventivePrescreen,
  getPreventiveTrialsForFamily as _getPreventiveTrialsForFamily,
  getRecurrencePreventionTrials as _getRecurrencePreventionTrials,
  generateReferralLink as _generateReferralLink,
  redeemReferralCode as _redeemReferralCode,
  getReferralStats as _getReferralStats,
} from '@/lib/preventive-matcher';
import {
  enrollAsMentor as _enrollAsMentor,
  getMentorProfile as _getMentorProfile,
  updateMentorProfile as _updateMentorProfile,
  findMatches as _findMatches,
  proposeConnection as _proposeConnection,
  respondToConnection as _respondToConnection,
  getConnections as _getConnections,
  getConnection as _getConnection,
  getTrainingModules as _getTrainingModules,
  completeTrainingModule as _completeTrainingModule,
  sendMessage as _sendMessage,
  getMessages as _getMessages,
  markMessagesRead as _markMessagesRead,
  updateConnectionStatus as _updateConnectionStatus,
  reportConcern as _reportConcern,
  submitConnectionFeedback as _submitConnectionFeedback,
  getMentorStats as _getMentorStats,
} from '@/lib/peer-manager';
import {
  createPreventProfile as _createPreventProfile,
  getPreventProfile as _getPreventProfile,
  updatePreventProfile as _updatePreventProfile,
  getRiskAssessments as _getRiskAssessments,
  getLatestRisk as _getLatestRisk,
  saveLocationHistory as _saveLocationHistory,
  getLocationHistory as _getLocationHistory,
  getDataConsent as _getDataConsent,
  updateDataConsent as _updateDataConsent,
} from '@/lib/prevent-manager';
import {
  generateScreeningSchedule as _generateScreeningSchedule,
  getScreeningSchedule as _getScreeningSchedule,
  getChemopreventionEligibility as _getChemopreventionEligibility,
  getChemopreventionGuide as _getChemopreventionGuide,
  generateChemopreventionGuide as _generateChemopreventionGuide,
} from '@/lib/prevent-screening';
import {
  getPreventionLifestyle as _getPreventionLifestyle,
  generatePreventionLifestyle as _generatePreventionLifestyle,
  getTestingRecommendations as _getTestingRecommendations,
  getPreventGenomicProfile as _getPreventGenomicProfile,
  updateFamilyHistory as _updateFamilyHistory,
} from '@/lib/prevent-lifestyle';

// ============================================================================
// Adapter functions — bridge resolver signatures to actual lib functions
// ============================================================================

// --- Auth ---

let _resend: Resend;
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY!);
  return _resend;
}

async function sendMagicLinkAdapter(email: string, redirect?: string) {
  const normalizedEmail = email.toLowerCase().trim();
  const token = await createMagicLinkToken(normalizedEmail);
  let link = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify?token=${token}`;
  if (redirect) {
    link += `&redirect=${encodeURIComponent(redirect)}`;
  }
  await getResend().emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: normalizedEmail,
    subject: 'Your sign-in link',
    html: `<p><a href="${link}">Click here to sign in</a></p><p>Expires in 15 minutes.</p>`,
  });
}

// --- Matches ---

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

async function generateOncologistBriefAdapter(matchId: string) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      trial: { include: { sites: true } },
      patient: true,
    },
  });
  if (!match) throw new Error('Match not found');
  const trial = match.trial;
  const content = await _genOncBrief({
    trialTitle: trial.title,
    nctId: trial.nctId,
    phase: trial.phase,
    sponsor: trial.sponsor,
    interventionName: trial.interventionName,
    interventionType: trial.interventionType,
    briefSummary: trial.briefSummary,
    rawEligibilityText: trial.rawEligibilityText,
    matchScore: match.matchScore,
    matchBreakdown: (match.matchBreakdown as any[]) || [],
    llmAssessment: (match as any).llmAssessment || undefined,
    potentialBlockers: ((match.potentialBlockers as any) || []) as string[],
    profile: match.patient.profile as any,
    sites: trial.sites?.map((s: any) => ({
      facility: s.facility,
      city: s.city,
      state: s.state,
    })),
  });
  return {
    content,
    matchId,
    generatedAt: new Date().toISOString(),
  };
}

// --- Financial ---

async function matchFinancialPrograms(patientId: string, _profile: any) {
  return _matchFinancialPrograms(patientId);
}

async function getFinancialProgram(programId: string) {
  return prisma.financialProgram.findUnique({ where: { id: programId } });
}

// --- Sequencing ---

async function checkCoverage(patientId: string, insurer: string, testType: string) {
  return checkSequencingCoverage(patientId, testType, insurer);
}

async function sequencingRecommendationAdapter(patientId: string) {
  const patient = await prisma.patient.findUnique({ where: { id: patientId } });
  if (!patient) throw new Error('Patient not found');
  return _genSeqRec(patient.profile as any, patientId);
}

async function sequencingExplanationAdapter(patientId: string) {
  const patient = await prisma.patient.findUnique({ where: { id: patientId } });
  if (!patient) throw new Error('Patient not found');
  return _genSeqExpl(patient.profile as any, patientId);
}

async function testRecommendationAdapter(
  patientId: string,
  opts?: { tissueAvailable?: boolean; preferComprehensive?: boolean },
) {
  const patient = await prisma.patient.findUnique({ where: { id: patientId } });
  if (!patient) throw new Error('Patient not found');
  return _genTestRec({
    profile: patient.profile as any,
    patientId,
    tissueAvailable: opts?.tissueAvailable,
    preferComprehensive: opts?.preferComprehensive,
  });
}

async function conversationGuideAdapter(patientId: string) {
  const patient = await prisma.patient.findUnique({ where: { id: patientId } });
  if (!patient) throw new Error('Patient not found');
  const testRec = await _genTestRec({ profile: patient.profile as any, patientId });
  return _genConvGuide(patient.profile as any, patientId, testRec);
}

async function waitingContentAdapter(patientId: string) {
  const patient = await prisma.patient.findUnique({ where: { id: patientId } });
  if (!patient) throw new Error('Patient not found');
  const profile = patient.profile as any;
  return _genWaiting(profile?.cancerType || 'cancer');
}

async function sequencingBriefAdapter(
  patientId: string,
  testType: string,
  providerIds: string[],
  insurer?: string,
) {
  const patient = await prisma.patient.findUnique({ where: { id: patientId } });
  if (!patient) throw new Error('Patient not found');
  const coverageResult = await checkSequencingCoverage(
    patientId,
    testType,
    insurer || 'generic',
  );
  const providers = await prisma.sequencingProvider.findMany({
    where: { id: { in: providerIds } },
  });
  return _genSeqBrief({
    profile: patient.profile as any,
    recommendedTests: providers.map((p: any) => ({
      testType,
      providerName: p.name,
      geneCount: p.details?.geneCount || 0,
    })),
    coverageResult,
  });
}

async function lomnAdapter(patientId: string, testType: string, insurer?: string) {
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: { user: { select: { name: true } } },
  });
  if (!patient) throw new Error('Patient not found');
  const coverage = await checkSequencingCoverage(
    patientId,
    testType,
    insurer || 'generic',
  );
  const providers = await prisma.sequencingProvider.findMany({ take: 1 });
  const providerName = providers.length > 0 ? providers[0].name : 'genomic testing provider';
  return generateLetterOfMedicalNecessity(
    { name: (patient as any).user?.name || undefined, profile: patient.profile as any },
    providerName,
    testType,
    coverage,
  );
}

// --- Genomics ---

async function extractGenomicReport(documentId: string) {
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

async function confirmGenomicsAdapter(patientId: string, genomicResultId: string, edits?: any) {
  const result = await prisma.genomicResult.findUnique({ where: { id: genomicResultId } });
  if (!result || result.patientId !== patientId) throw new Error('Genomic result not found');
  const updateData: any = { patientConfirmed: true };
  if (edits) {
    if (edits.alterations) updateData.alterations = edits.alterations;
    if (edits.biomarkers) updateData.biomarkers = edits.biomarkers;
  }
  return prisma.genomicResult.update({
    where: { id: genomicResultId },
    data: updateData,
  });
}

async function computeMatchDelta(patientId: string) {
  return _computeMatchDelta(patientId);
}

// --- Pipeline ---

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

async function neoantigenAdapter(pipelineJobId: string, params: any) {
  const page = params.page || 1;
  const limit = params.limit || 20;
  const skip = (page - 1) * limit;
  const where: any = { jobId: pipelineJobId };
  if (params.confidence) where.confidence = params.confidence;
  if (params.gene) where.gene = params.gene;

  const orderBy: any = {};
  const sortField = params.sort || 'rank';
  orderBy[sortField] = params.order || 'asc';

  const [neoantigens, total] = await Promise.all([
    prisma.neoantigenCandidate.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    }),
    prisma.neoantigenCandidate.count({ where }),
  ]);

  return {
    neoantigens,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

async function pipelineResultsAdapter(pipelineJobId: string) {
  const job = await prisma.pipelineJob.findUnique({ where: { id: pipelineJobId } });
  if (!job) throw new Error('Pipeline job not found');
  return {
    jobId: pipelineJobId,
    patientSummary: job.patientSummaryPath || null,
    fullReportPdf: job.fullReportPdfPath || null,
    vaccineBlueprint: job.vaccineBlueprintPath || null,
  };
}

async function generateReportPdfAdapter(pipelineJobId: string, reportType: string) {
  let result: any;
  if (reportType === 'patient') result = await generatePatientReport(pipelineJobId);
  else if (reportType === 'clinician') result = await generateClinicianReport(pipelineJobId);
  else if (reportType === 'manufacturer') result = await generateManufacturerBlueprint(pipelineJobId);
  else throw new Error(`Unknown report type: ${reportType}`);

  return {
    url: result?.url || result?.s3Key || '',
    cached: false,
  };
}

async function crossReferenceTrialsAdapter(pipelineJobId: string) {
  return _crossRefTrials(pipelineJobId);
}

async function generateReportAdapter(pipelineJobId: string, reportType: string) {
  let result: any;
  if (reportType === 'patient') result = await generatePatientReport(pipelineJobId);
  else if (reportType === 'clinician') result = await generateClinicianReport(pipelineJobId);
  else if (reportType === 'manufacturer') result = await generateManufacturerBlueprint(pipelineJobId);
  else throw new Error(`Unknown report type: ${reportType}`);
  return result?.report ?? result ?? {};
}

// --- Manufacturing ---

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
  const result = _assessPathway(input);
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

async function recommendPartnersAdapter(pipelineJobId: string) {
  const job = await prisma.pipelineJob.findUnique({ where: { id: pipelineJobId } });
  if (!job) throw new Error('Pipeline job not found');
  const blueprint = job.vaccineBlueprint as any;
  const partners = await prisma.manufacturingPartner.findMany({
    where: { status: 'active' },
  });
  return partners
    .map((p: any) => {
      let score = 50;
      const reasons: string[] = [];
      if (blueprint?.platform && p.capabilities.includes(blueprint.platform)) {
        score += 20;
        reasons.push(`Supports ${blueprint.platform} platform`);
      }
      if (p.capabilities.includes('mrna_synthesis')) {
        score += 10;
        reasons.push('mRNA synthesis capability');
      }
      if (p.certifications.includes('GMP')) {
        score += 10;
        reasons.push('GMP certified');
      }
      if (p.capacityTier === 'tier_1') {
        score += 10;
        reasons.push('Tier 1 capacity');
      }
      return {
        partnerId: p.id,
        name: p.name,
        slug: p.slug,
        type: p.type,
        score: Math.min(score, 100),
        reasons,
        costRangeMin: p.costRangeMin,
        costRangeMax: p.costRangeMax,
        turnaroundWeeksMin: p.turnaroundWeeksMin,
        turnaroundWeeksMax: p.turnaroundWeeksMax,
        capabilities: p.capabilities,
        certifications: p.certifications,
      };
    })
    .sort((a: any, b: any) => b.score - a.score);
}

async function acceptQuoteAdapter(patientId: string, orderId: string) {
  const order = await prisma.manufacturingOrder.findUnique({ where: { id: orderId } });
  if (!order || order.patientId !== patientId) throw new Error('Order not found');
  if (!isValidTransition(order.status as any, 'quote_accepted' as any)) {
    throw new Error(`Cannot accept quote from status: ${order.status}`);
  }
  return prisma.manufacturingOrder.update({
    where: { id: orderId },
    data: { status: 'quote_accepted' },
  });
}

async function connectSiteAdapter(patientId: string, orderId: string, siteId: string) {
  const order = await prisma.manufacturingOrder.findUnique({ where: { id: orderId } });
  if (!order || order.patientId !== patientId) throw new Error('Order not found');
  return prisma.manufacturingOrder.update({
    where: { id: orderId },
    data: { administrationSiteId: siteId },
  });
}

async function addOrderNoteAdapter(patientId: string, orderId: string, note: string) {
  const order = await prisma.manufacturingOrder.findUnique({ where: { id: orderId } });
  if (!order || order.patientId !== patientId) throw new Error('Order not found');
  const existing = (order.notes as any[]) || [];
  const newNote = { text: note, createdAt: new Date().toISOString() };
  return prisma.manufacturingOrder.update({
    where: { id: orderId },
    data: { notes: [...existing, newNote] },
  });
}

// --- Monitoring ---

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

async function monitoringScheduleAdapter(orderId: string) {
  const order = await prisma.manufacturingOrder.findUnique({
    where: { id: orderId },
    include: {
      reports: { select: { reportType: true, createdAt: true } },
    },
  });
  if (!order) throw new Error('Order not found');
  if (!order.administeredAt) return [];
  return _getMonSchedule(
    order.administeredAt,
    order.reports.map((r: any) => ({
      reportType: r.reportType,
      createdAt: r.createdAt.toISOString(),
    })),
  );
}

// --- FHIR ---

async function searchHealthSystemsAdapter(query?: string) {
  const where: any = {};
  if (query) {
    where.name = { contains: query, mode: 'insensitive' };
  }
  return prisma.healthSystem.findMany({
    where,
    orderBy: { name: 'asc' },
    take: 50,
  });
}

async function fhirConnectionsAdapter(patientId: string) {
  return prisma.fhirConnection.findMany({
    where: { patientId },
    include: { healthSystem: true },
    orderBy: { createdAt: 'desc' },
  });
}

async function authorizeFhirAdapter(userId: string, healthSystemId: string) {
  const hs = await prisma.healthSystem.findUnique({ where: { id: healthSystemId } });
  if (!hs) throw new Error('Health system not found');
  const endpoints = await discoverEndpoints(hs.fhirBaseUrl);
  const clientId = process.env.FHIR_CLIENT_ID || 'iish';
  const redirectUri = `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/fhir/callback`;
  const state = `${userId}:${healthSystemId}`;
  const scopes = ['launch/patient', 'patient/*.read', 'openid', 'fhirUser'] as const;
  const authorizeUrl = buildAuthorizeUrl(endpoints, clientId, redirectUri, state, scopes);
  return { authorizeUrl };
}

async function extractFhirAdapter(patientId: string, connectionId: string) {
  const conn = await prisma.fhirConnection.findUnique({
    where: { id: connectionId },
    include: { healthSystem: true },
  });
  if (!conn || conn.patientId !== patientId) throw new Error('Connection not found');
  if (!conn.accessTokenEnc) throw new Error('No access token');
  const accessToken = await decryptToken(conn.accessTokenEnc);
  const client = new FhirClient(conn.fhirBaseUrl || conn.healthSystem?.fhirBaseUrl || '', accessToken);
  const resources = await extractFhirResources(client, patientId);
  await prisma.fhirConnection.update({
    where: { id: connectionId },
    data: {
      resourcesPulled: resources as any,
      lastSyncedAt: new Date(),
      syncStatus: 'synced',
    },
  });
  return resources;
}

// --- Documents ---

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

async function generalUploadUrlAdapter(filename: string, contentType: string, bucket?: string) {
  const s3Key = `uploads/${Date.now()}-${filename}`;
  const result = await _generatePresignedUploadUrl(s3Key, contentType);
  return {
    uploadUrl: result.uploadUrl,
    s3Key: result.s3Key,
    bucket: result.bucket || bucket || 'iish-documents',
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
  };
}

// --- Patient Intake ---

async function savePatientIntakeAdapter(userId: string, _email: string, input: any) {
  const existing = await prisma.patient.findUnique({ where: { userId } });
  const profileData = {
    ...input.profile,
  };
  if (existing) {
    return prisma.patient.update({
      where: { id: existing.id },
      data: {
        profile: profileData,
        intakePath: input.intakePath,
        fieldSources: input.fieldSources || undefined,
        fieldConfidence: input.fieldConfidence || undefined,
      },
    });
  }
  return prisma.patient.create({
    data: {
      userId,
      profile: profileData,
      intakePath: input.intakePath,
      fieldSources: input.fieldSources || undefined,
      fieldConfidence: input.fieldConfidence || undefined,
    },
  });
}

async function extractDocumentsAdapter(s3Keys: string[], mimeTypes: string[]) {
  try {
    const result = await runExtractionPipeline('graphql', s3Keys, mimeTypes);
    return {
      status: 'completed',
      profile: result.profile || null,
      fieldSources: result.fieldSources || null,
      fieldConfidence: result.fieldConfidence || null,
      extractions: result.extractions || null,
      claudeApiCost: result.claudeApiCost || null,
      error: null,
    };
  } catch (err: any) {
    return {
      status: 'failed',
      profile: null,
      fieldSources: null,
      fieldConfidence: null,
      extractions: null,
      claudeApiCost: null,
      error: err.message || 'Extraction failed',
    };
  }
}

async function createSequencingOrderAdapter(patientId: string, providerId: string, testType: string) {
  return prisma.sequencingOrder.create({
    data: { patientId, providerId, testType, status: 'pending' },
    include: { provider: true },
  });
}

// --- FHIR revoke/resync ---

async function revokeFhirConnectionAdapter(patientId: string, connectionId: string) {
  const connection = await prisma.fhirConnection.findFirst({
    where: { id: connectionId, patientId },
  });
  if (!connection) throw new Error('Connection not found');

  await prisma.fhirConnection.update({
    where: { id: connection.id },
    data: {
      accessTokenEnc: null,
      refreshTokenEnc: null,
      tokenExpiresAt: null,
      syncStatus: 'revoked',
    },
  });

  // Clear FHIR-sourced fields from patient profile
  const patient = await prisma.patient.findUnique({ where: { id: patientId } });
  if (patient) {
    const existingProfile = (patient.profile as PatientProfile | null) ?? {};
    const existingFieldSources = (patient.fieldSources as Record<string, string> | null) ?? {};
    const cleanedProfile = { ...existingProfile } as Record<string, unknown>;
    const cleanedFieldSources = { ...existingFieldSources };

    for (const [key, source] of Object.entries(existingFieldSources)) {
      if (source === 'fhir') {
        delete cleanedProfile[key];
        delete cleanedFieldSources[key];
      }
    }

    await prisma.patient.update({
      where: { id: patientId },
      data: {
        profile: JSON.parse(JSON.stringify(cleanedProfile)),
        fieldSources: JSON.parse(JSON.stringify(cleanedFieldSources)),
      },
    });
  }

  return true;
}

const EPIC_CLIENT_ID = process.env.EPIC_CLIENT_ID ?? 'iish-dev';

async function resyncFhirConnectionAdapter(patientId: string, connectionId: string) {
  const connection = await prisma.fhirConnection.findFirst({
    where: { id: connectionId, patientId },
    include: { healthSystem: true },
  });
  if (!connection || !connection.fhirBaseUrl) throw new Error('Connection not found');
  if (connection.syncStatus === 'revoked') throw new Error('Connection has been revoked');
  if (!connection.accessTokenEnc) throw new Error('No access token');

  let accessToken = await decryptToken(connection.accessTokenEnc);

  // Refresh token if expired or about to expire
  const isExpiring = connection.tokenExpiresAt &&
    new Date(connection.tokenExpiresAt).getTime() - Date.now() < 5 * 60 * 1000;

  if (isExpiring && connection.refreshTokenEnc) {
    const refreshToken = await decryptToken(connection.refreshTokenEnc);
    const endpoints = await discoverEndpoints(connection.fhirBaseUrl);
    const newTokens = await refreshAccessToken(endpoints.tokenUrl, refreshToken, EPIC_CLIENT_ID);

    accessToken = newTokens.accessToken;
    const newAccessEnc = await encryptToken(newTokens.accessToken);
    const newRefreshEnc = newTokens.refreshToken
      ? await encryptToken(newTokens.refreshToken)
      : connection.refreshTokenEnc;

    await prisma.fhirConnection.update({
      where: { id: connection.id },
      data: {
        accessTokenEnc: newAccessEnc,
        refreshTokenEnc: newRefreshEnc,
        tokenExpiresAt: newTokens.expiresIn
          ? new Date(Date.now() + newTokens.expiresIn * 1000)
          : null,
      },
    });
  }

  const client = new FhirClient(connection.fhirBaseUrl, accessToken);
  const rawData = await extractFhirResources(client, patientId);
  const result = mapFhirToPatientProfile(rawData, connection.healthSystemName ?? undefined);

  // Merge profile
  const patient = await prisma.patient.findUnique({ where: { id: patientId } });
  if (patient) {
    const existingProfile = (patient.profile as PatientProfile | null) ?? {};
    const existingFieldSources = (patient.fieldSources as Record<string, string> | null) ?? {};
    const mergedProfile: Record<string, unknown> = { ...existingProfile };
    const mergedFieldSources = { ...existingFieldSources };

    for (const [key, value] of Object.entries(result.profile)) {
      if (value !== undefined && value !== null) {
        const existingSource = existingFieldSources[key];
        if (!existingSource || existingSource !== 'manual') {
          mergedProfile[key] = value;
          mergedFieldSources[key] = 'fhir';
        }
      }
    }

    await prisma.patient.update({
      where: { id: patientId },
      data: {
        profile: JSON.parse(JSON.stringify(mergedProfile)),
        fieldSources: JSON.parse(JSON.stringify(mergedFieldSources)),
      },
    });
  }

  await prisma.fhirConnection.update({
    where: { id: connection.id },
    data: {
      lastSyncedAt: new Date(),
      resourcesPulled: JSON.parse(JSON.stringify(result.resourceSummary)),
      syncStatus: 'synced',
    },
  });

  return {
    completeness: result.completeness,
    missingFields: result.missingFields,
    resourceSummary: result.resourceSummary,
    extractedAt: result.extractedAt,
  };
}

// --- Survivorship ---

async function generateSCPAdapter(patientId: string, input: any) {
  return _generateSCP(patientId, input);
}

async function refreshSCPAdapter(patientId: string) {
  return _refreshSCP(patientId);
}

// --- Surveillance ---

async function markEventCompleteAdapter(eventId: string, completedDate: string, resultSummary?: string, resultDocumentId?: string) {
  return _markEventComplete(eventId, completedDate, resultSummary, resultDocumentId);
}

async function skipEventAdapter(eventId: string, reason: string) {
  return _skipEvent(eventId, reason);
}

async function rescheduleEventAdapter(eventId: string, newDueDate: string) {
  return _rescheduleEvent(eventId, newDueDate);
}

async function uploadEventResultAdapter(eventId: string, documentId: string) {
  return _uploadEventResult(eventId, documentId);
}

// --- Journal ---

async function submitJournalEntryAdapter(patientId: string, input: any) {
  return _submitJournalEntry(patientId, input);
}

async function deleteJournalEntryAdapter(patientId: string, entryId: string) {
  return _deleteJournalEntry(patientId, entryId);
}

async function getJournalTrendsAdapter(patientId: string, days: number) {
  return _getJournalTrends(patientId, days);
}

// --- Lifestyle ---

async function getLifestyleRecommendationsAdapter(patientId: string) {
  return _getLifestyleRecs(patientId);
}

async function generateLifestyleRecommendationsAdapter(patientId: string) {
  return _genLifestyleRecs(patientId);
}

// --- Care Team ---

async function getCareTeamAdapter(patientId: string) {
  return _getCareTeam(patientId);
}

async function addCareTeamMemberAdapter(patientId: string, input: any) {
  return _addCareTeamMember(patientId, input);
}

async function updateCareTeamMemberAdapter(patientId: string, memberId: string, input: any) {
  return _updateCareTeamMember(patientId, memberId, input);
}

async function removeCareTeamMemberAdapter(patientId: string, memberId: string) {
  return _removeCareTeamMember(patientId, memberId);
}

async function routeSymptomAdapter(patientId: string, symptom: string) {
  return _routeSymptom(patientId, symptom);
}

async function generateAppointmentPrepAdapter(patientId: string, eventId: string) {
  return _generateAppointmentPrep(patientId, eventId);
}

// --- ctDNA ---

async function getCtdnaHistoryAdapter(patientId: string) {
  return _getCtdnaHistory(patientId);
}

async function addCtdnaResultAdapter(patientId: string, input: any) {
  return _addCtdnaResult(patientId, input);
}

// --- Notifications + Feedback ---

async function getNotificationPreferencesAdapter(patientId: string) {
  return _getNotifPrefs(patientId);
}

async function updateNotificationPreferencesAdapter(patientId: string, updates: any) {
  return _updateNotifPrefs(patientId, updates);
}

async function getNotificationHistoryAdapter(patientId: string, limit?: number) {
  return _getNotifHistory(patientId, limit);
}

async function submitFeedbackAdapter(patientId: string, input: any) {
  return _submitFeedback(patientId, input);
}

async function getFeedbackAdapter(patientId: string) {
  return _getFeedback(patientId);
}

async function annualRefreshSCPAdapter(patientId: string) {
  return _annualRefreshSCP(patientId);
}

// --- Recurrence ---

async function reportRecurrenceAdapter(patientId: string, input: any) {
  return _reportRecurrence(patientId, input);
}

async function acknowledgeRecurrenceAdapter(recurrenceEventId: string) {
  return _acknowledgeRecurrence(recurrenceEventId);
}

async function updateCascadeStepAdapter(recurrenceEventId: string, step: string, value: boolean) {
  return _updateCascadeStep(recurrenceEventId, step, value);
}

async function regenerateTranslatorAdapter(patientId: string, recurrenceEventId: string) {
  return _regenerateTranslator(patientId, recurrenceEventId);
}

async function archiveSurvivorshipPlanAdapter(patientId: string) {
  return _archiveSurvivorshipPlan(patientId);
}

async function getRecurrenceEventAdapter(patientId: string) {
  return _getRecurrenceEvent(patientId);
}

async function getRecurrenceEventsAdapter(patientId: string) {
  return _getRecurrenceEvents(patientId);
}

async function generateGenomicComparisonAdapter(patientId: string, recurrenceEventId: string) {
  return _generateGenomicComparison(patientId, recurrenceEventId);
}

async function getSecondOpinionResourcesAdapter(patientId: string) {
  return _getSecondOpinionResources(patientId);
}

// --- Fertility ---

async function assessFertilityRiskAdapter(patientId: string) {
  return _assessFertilityRisk(patientId);
}

async function getFertilityAssessmentAdapter(patientId: string) {
  return _getFertilityAssessment(patientId);
}

async function getPreservationOptionsAdapter(patientId: string) {
  return _getPreservationOptions(patientId);
}

async function getFertilityProvidersAdapter(patientId: string, filters?: any) {
  return _getFertilityProviders(patientId, filters);
}

async function getFertilityFinancialProgramsAdapter(patientId: string) {
  return _getFertilityFinancialPrograms(patientId);
}

async function generateDiscussionGuideAdapter(patientId: string) {
  return _generateDiscussionGuide(patientId);
}

async function requestFertilityReferralAdapter(assessmentId: string, providerId: string) {
  return _requestFertilityReferral(assessmentId, providerId);
}

async function updateFertilityOutcomeAdapter(assessmentId: string, input: any) {
  return _updateFertilityOutcome(assessmentId, input);
}

// --- Insurance Advocate ---

async function createDenialAdapter(patientId: string, input: any) {
  return _createDenial(patientId, input);
}

async function getDenialsAdapter(patientId: string) {
  return _getDenials(patientId);
}

async function getDenialAdapter(denialId: string) {
  return _getDenial(denialId);
}

async function updateDenialStatusAdapter(denialId: string, status: string) {
  return _updateDenialStatus(denialId, status);
}

async function generateAppealLetterAdapter(denialId: string) {
  return _generateAppealLetter(denialId);
}

async function getAppealLetterAdapter(appealId: string) {
  return _getAppealLetter(appealId);
}

async function updateAppealOutcomeAdapter(appealId: string, input: any) {
  return _updateAppealOutcome(appealId, input);
}

function getAppealStrategyAdapter(denialCategory: string) {
  return _getAppealStrategy(denialCategory);
}

function getAppealRightsAdapter(state?: string) {
  return _getAppealRights(state);
}

async function generatePeerReviewPrepAdapter(denialId: string) {
  return _generatePeerReviewPrep(denialId);
}

// --- Logistics ---

async function assessTrialLogisticsAdapter(patientId: string, matchId: string) {
  return _assessTrialLogistics(patientId, matchId);
}

async function getLogisticsAssessmentAdapter(patientId: string, matchId: string) {
  return _getLogisticsAssessment(patientId, matchId);
}

async function getLogisticsAssessmentsAdapter(patientId: string) {
  return _getLogisticsAssessments(patientId);
}

async function getAssistanceProgramsAdapter(patientId: string) {
  return _getAssistancePrograms(patientId);
}

async function generateLogisticsPlanAdapter(patientId: string, matchId: string) {
  return _generateLogisticsPlan(patientId, matchId);
}

async function updateAssistanceApplicationAdapter(patientId: string, assessmentId: string, programKey: string, status: string, notes?: string) {
  return _updateAssistanceApplication(patientId, assessmentId, programKey, status, notes);
}

async function getAssistanceApplicationsAdapter(patientId: string) {
  return _getAssistanceApplications(patientId);
}

// --- Second Opinion ---

async function evaluateSecondOpinionTriggersAdapter(patientId: string) {
  return _evaluateSecondOpinionTriggers(patientId);
}

async function createSecondOpinionRequestAdapter(patientId: string) {
  return _createSecondOpinionRequest(patientId);
}

async function getSecondOpinionRequestAdapter(patientId: string) {
  return _getSecondOpinionRequest(patientId);
}

async function getSecondOpinionCentersAdapter(patientId: string, filters?: any) {
  return _getSecondOpinionCenters(patientId, filters);
}

async function generateRecordPacketAdapter(patientId: string) {
  return _generateRecordPacket(patientId);
}

async function generateCommunicationGuideAdapter(patientId: string) {
  return _generateCommunicationGuide(patientId);
}

async function selectCenterAdapter(patientId: string, centerId: string, isVirtual: boolean, appointmentDate?: string) {
  return _selectCenter(patientId, centerId, isVirtual, appointmentDate);
}

async function recordSecondOpinionOutcomeAdapter(patientId: string, outcome: string, outcomeSummary?: string) {
  return _recordSecondOpinionOutcome(patientId, outcome, outcomeSummary);
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
        // Matches
        generateMatches,
        translateTreatment,
        generateOncologistBrief: generateOncologistBriefAdapter,

        // Financial
        matchFinancialPrograms,
        getFinancialProgram,

        // Sequencing
        checkCoverage,
        generateSequencingRecommendation: sequencingRecommendationAdapter,
        generateSequencingExplanation: sequencingExplanationAdapter,
        generateTestRecommendation: testRecommendationAdapter,
        generateConversationGuide: conversationGuideAdapter,
        generateWaitingContent: waitingContentAdapter,
        generateSequencingBrief: sequencingBriefAdapter,
        generateLOMN: lomnAdapter,

        // Genomics
        extractGenomicReport,
        interpretGenomics,
        confirmGenomics: confirmGenomicsAdapter,
        computeMatchDelta,

        // Pipeline
        submitPipelineJob,
        getNeoantigens: neoantigenAdapter,
        getPipelineResults: pipelineResultsAdapter,
        generateReportPdf: generateReportPdfAdapter,
        crossReferenceTrials: crossReferenceTrialsAdapter,

        // Manufacturing
        createOrder,
        updateOrderStatus,
        assessPathway,
        generateDocument,
        recommendPartners: recommendPartnersAdapter,
        acceptQuote: acceptQuoteAdapter,
        connectSite: connectSiteAdapter,
        addOrderNote: addOrderNoteAdapter,

        // Monitoring
        searchSites,
        submitMonitoringReport,
        getMonitoringSchedule: monitoringScheduleAdapter,

        // FHIR
        searchHealthSystems: searchHealthSystemsAdapter,
        getFhirConnections: fhirConnectionsAdapter,
        authorizeFhir: authorizeFhirAdapter,
        extractFhir: extractFhirAdapter,
        revokeFhirConnection: revokeFhirConnectionAdapter,
        resyncFhirConnection: resyncFhirConnectionAdapter,

        // Documents
        getPresignedUploadUrl,
        extractDocument,
        requestGeneralUploadUrl: generalUploadUrlAdapter,

        // Patient Intake
        savePatientIntake: savePatientIntakeAdapter,
        extractDocuments: extractDocumentsAdapter,

        // Sequencing Orders
        createSequencingOrder: createSequencingOrderAdapter,

        // Auth (magic link)
        sendMagicLink: sendMagicLinkAdapter,

        // Report (inline preview)
        generateReport: generateReportAdapter,

        // Survivorship
        generateSCP: generateSCPAdapter,
        refreshSCP: refreshSCPAdapter,
        markEventComplete: markEventCompleteAdapter,
        skipEvent: skipEventAdapter,
        rescheduleEvent: rescheduleEventAdapter,
        uploadEventResult: uploadEventResultAdapter,
        submitJournalEntry: submitJournalEntryAdapter,
        deleteJournalEntry: deleteJournalEntryAdapter,
        getJournalTrends: getJournalTrendsAdapter,
        getLifestyleRecommendations: getLifestyleRecommendationsAdapter,
        generateLifestyleRecommendations: generateLifestyleRecommendationsAdapter,
        getCareTeam: getCareTeamAdapter,
        addCareTeamMember: addCareTeamMemberAdapter,
        updateCareTeamMember: updateCareTeamMemberAdapter,
        removeCareTeamMember: removeCareTeamMemberAdapter,
        routeSymptom: routeSymptomAdapter,
        generateAppointmentPrep: generateAppointmentPrepAdapter,
        getAppointmentPrep: generateAppointmentPrepAdapter,
        getCtdnaHistory: getCtdnaHistoryAdapter,
        addCtdnaResult: addCtdnaResultAdapter,

        // Notifications + Feedback
        getNotificationPreferences: getNotificationPreferencesAdapter,
        updateNotificationPreferences: updateNotificationPreferencesAdapter,
        getNotificationHistory: getNotificationHistoryAdapter,
        submitFeedback: submitFeedbackAdapter,
        getFeedback: getFeedbackAdapter,
        annualRefreshSCP: annualRefreshSCPAdapter,

        // Recurrence
        reportRecurrence: reportRecurrenceAdapter,
        acknowledgeRecurrence: acknowledgeRecurrenceAdapter,
        updateCascadeStep: updateCascadeStepAdapter,
        regenerateTranslator: regenerateTranslatorAdapter,
        archiveSurvivorshipPlan: archiveSurvivorshipPlanAdapter,
        getRecurrenceEvent: getRecurrenceEventAdapter,
        getRecurrenceEvents: getRecurrenceEventsAdapter,
        generateGenomicComparison: generateGenomicComparisonAdapter,
        getSecondOpinionResources: getSecondOpinionResourcesAdapter,

        // Fertility
        assessFertilityRisk: assessFertilityRiskAdapter,
        getFertilityAssessment: getFertilityAssessmentAdapter,
        getPreservationOptions: getPreservationOptionsAdapter,
        getFertilityProviders: getFertilityProvidersAdapter,
        getFertilityFinancialPrograms: getFertilityFinancialProgramsAdapter,
        generateFertilityDiscussionGuide: generateDiscussionGuideAdapter,
        requestFertilityReferral: requestFertilityReferralAdapter,
        updateFertilityOutcome: updateFertilityOutcomeAdapter,

        // Insurance Advocate
        createDenial: createDenialAdapter,
        getDenials: getDenialsAdapter,
        getDenial: getDenialAdapter,
        updateDenialStatus: updateDenialStatusAdapter,
        generateAppealLetter: generateAppealLetterAdapter,
        getAppealLetter: getAppealLetterAdapter,
        updateAppealOutcome: updateAppealOutcomeAdapter,
        getAppealStrategy: getAppealStrategyAdapter,
        getAppealRights: getAppealRightsAdapter,
        generatePeerReviewPrep: generatePeerReviewPrepAdapter,

        // Logistics
        assessTrialLogistics: assessTrialLogisticsAdapter,
        getLogisticsAssessment: getLogisticsAssessmentAdapter,
        getLogisticsAssessments: getLogisticsAssessmentsAdapter,
        getAssistancePrograms: getAssistanceProgramsAdapter,
        generateLogisticsPlan: generateLogisticsPlanAdapter,
        updateAssistanceApplication: updateAssistanceApplicationAdapter,
        getAssistanceApplications: getAssistanceApplicationsAdapter,

        // Learn
        getArticle: _getArticle,
        getArticles: _getArticles,
        getArticlesByCategory: _getArticlesByCategory,
        searchArticles: _searchArticles,
        getGlossaryTerms: _getGlossaryTerms,
        getGlossaryTerm: _getGlossaryTerm,
        generateArticle: _generateArticle,
        publishArticle: _publishArticle,
        generatePersonalizedContext: _generatePersonalizedContext,
        generateReadingPlan: _generateReadingPlan,
        getArticleForSeo: _getArticleForSeo,
        getAllPublishedSlugs: _getAllPublishedSlugs,
        generateArticleBatch: _generateArticleBatch,
        getRelatedArticles: _getRelatedArticles,
        getArticlesAdmin: _getArticlesAdmin,
        checkArticleQuality: _checkArticleQuality,
        runArticleQualityChecks: _runArticleQualityChecks,
        updateArticleStatus: _updateArticleStatus,
        insertPlatformLinks: _insertPlatformLinks,

        // Learn — INTEL Bridge
        getRelatedResearch: _getRelatedResearch,
        getArticlesForResearchItem: _getArticlesForResearchItem,
        getArticleRefreshStatus: _getArticleRefreshStatus,
        getArticleEngagement: _getArticleEngagement,
        generateRefreshSuggestion: _generateRefreshSuggestion,
        runRefreshCheckCycle: _runRefreshCheckCycle,

        // Second Opinion
        evaluateSecondOpinionTriggers: evaluateSecondOpinionTriggersAdapter,
        createSecondOpinionRequest: createSecondOpinionRequestAdapter,
        getSecondOpinionRequest: getSecondOpinionRequestAdapter,
        getSecondOpinionCenters: getSecondOpinionCentersAdapter,
        generateRecordPacket: generateRecordPacketAdapter,
        generateCommunicationGuide: generateCommunicationGuideAdapter,
        selectCenter: selectCenterAdapter,
        recordSecondOpinionOutcome: recordSecondOpinionOutcomeAdapter,

        // Intel — Landscape Views (I6)
        getLandscapeOverview: _getLandscapeOverview,
        getSubtypeLandscape: _getSubtypeLandscape,
        getTreatmentPipeline: _getTreatmentPipeline,
        getRecentDevelopments: _getRecentDevelopments,
        generateStandardOfCareSummary: _generateStandardOfCareSummary,
        checkTranslatorUpdates: _checkTranslatorUpdates,
        checkFinancialUpdates: _checkFinancialUpdates,
        checkSurvivorshipUpdates: _checkSurvivorshipUpdates,

        // Intel — Research Intelligence
        getResearchItems: _getResearchItems,
        getResearchItem: _getResearchItem,
        searchResearchItems: _searchResearchItems,
        getSyncStates: _getSyncStates,
        triggerIngestion: _triggerIngestion,
        reclassifyItem: _reclassifyItem,
        processQCQueue: _processQCQueue,
        migrateOldTaxonomy: _migrateOldTaxonomy,

        // Intel — Feed Personalization (I4)
        getPersonalizedFeed: _getPersonalizedFeed,
        getPersonalizedNote: _generatePersonalizedNote,
        getFeedConfig: _getUserFeedConfig,
        markItemViewed: _markItemViewed,
        markItemSaved: _markItemSaved,
        markItemDismissed: _markItemDismissed,
        updateFeedConfig: _updateUserFeedConfig,
        computeRelevanceScores: _computeRelevanceScores,

        // Intel — Community Intelligence (I5)
        submitCommunityReport: _submitCommunityReport,
        getCommunityReports: _getCommunityReports,
        getCommunityInsights: _getDrugInsights,
        getCommunityInsightsForItem: _getCommunityInsightsForItem,
        compileDigest: _compileDigest,
        moderateCommunityReport: _moderateReport,
        updateDigestPreferences: _updateDigestPreferences,

        // Palliative Care
        submitSymptomAssessment: _submitSymptomAssessment,
        getSymptomAssessments: _getSymptomAssessments,
        getLatestAssessment: _getLatestAssessment,
        getPalliativeCareProviders: _getPalliativeCareProviders,
        getAdvanceCarePlan: _getAdvanceCarePlan,
        updateAdvanceCarePlan: _updateAdvanceCarePlan,
        generateGoalsOfCareGuide: _generateGoalsOfCareGuide,
        generateReferralLetter: _generateReferralLetter,
        shouldRecommendPalliative: _shouldRecommendPalliative,

        // PREVENT — Pre-Diagnosis Risk
        createPreventProfile: _createPreventProfile,
        getPreventProfile: _getPreventProfile,
        updatePreventProfile: _updatePreventProfile,
        getRiskAssessments: _getRiskAssessments,
        getLatestRisk: _getLatestRisk,
        saveLocationHistory: _saveLocationHistory,
        getLocationHistory: _getLocationHistory,
        getDataConsent: _getDataConsent,
        updateDataConsent: _updateDataConsent,
        getScreeningSchedule: _getScreeningSchedule,
        generateScreeningSchedule: _generateScreeningSchedule,
        getChemopreventionEligibility: _getChemopreventionEligibility,
        getChemopreventionGuide: _getChemopreventionGuide,
        generateChemopreventionGuide: _generateChemopreventionGuide,
        getTestingRecommendations: _getTestingRecommendations,
        getPreventGenomicProfile: _getPreventGenomicProfile,
        getPreventionLifestyle: _getPreventionLifestyle,
        generatePreventionLifestyle: _generatePreventionLifestyle,
        updateFamilyHistory: _updateFamilyHistory,

        // PEERS — Peer Matching & Support
        enrollAsMentor: _enrollAsMentor,
        getMentorProfile: _getMentorProfile,
        updateMentorProfile: _updateMentorProfile,
        findMatches: _findMatches,
        proposeConnection: _proposeConnection,
        respondToConnection: _respondToConnection,
        getConnections: _getConnections,
        getConnection: _getConnection,
        getTrainingModules: _getTrainingModules,
        completeTrainingModule: _completeTrainingModule,
        sendMessage: _sendMessage,
        getMessages: _getMessages,
        markMessagesRead: _markMessagesRead,
        updateConnectionStatus: _updateConnectionStatus,
        reportConcern: _reportConcern,
        submitConnectionFeedback: _submitConnectionFeedback,
        getMentorStats: _getMentorStats,

        // Preventive Trial Matcher
        getPreventiveTrials: (filters?: any) => _getPreventiveTrials(prisma, filters),
        runPreventivePrescreen: (input: any, userId?: string | null) => _runPreventivePrescreen(prisma, input, userId),
        getPreventiveTrialsForFamily: (patientId: string) => _getPreventiveTrialsForFamily(prisma, patientId),
        getRecurrencePreventionTrials: (patientId: string) => _getRecurrencePreventionTrials(prisma, patientId),
        generateReferralLink: (patientId: string) => _generateReferralLink(prisma, patientId),
        redeemReferralCode: (code: string, userId?: string | null) => _redeemReferralCode(prisma, code, userId),
        getReferralStats: (patientId: string) => _getReferralStats(prisma, patientId),
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
