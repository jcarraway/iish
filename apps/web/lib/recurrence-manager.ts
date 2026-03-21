import { anthropic, CLAUDE_MODEL } from './ai';
import { redis } from './redis';
import { prisma } from './db';
import { generateMatchesForPatient } from './matcher';
import { matchFinancialPrograms } from './financial-matcher';
import type { PatientProfile } from '@iish/shared';

// ============================================================================
// Types
// ============================================================================

interface ReportRecurrenceInput {
  detectedDate: string;
  detectionMethod: string;
  recurrenceType?: string;
  recurrenceSites?: string[];
  confirmedByBiopsy?: boolean;
  newStage?: string;
  documentUploadId?: string;
}

interface CascadeStatus {
  acknowledged: boolean;
  supportOffered: boolean;
  resequencingRecommended: boolean;
  trialRematched: boolean;
  financialRematched: boolean;
  secondOpinionOffered: boolean;
  careTeamUpdated: boolean;
  translatorRegenerated: boolean;
  planArchived: boolean;
  pipelineActivated: boolean;
  genomicComparisonReady: boolean;
}

export interface GenomicComparison {
  hasNewData: boolean;
  resistanceMutations: string[];
  biomarkerChanges: string[];
  actionableChanges: string[];
  patientSummary: string;
  generatedAt: string;
}

export interface SecondOpinionResource {
  name: string;
  type: string;
  description: string;
  url: string;
  virtual: boolean;
}

// ============================================================================
// Entry Points
// ============================================================================

export async function reportRecurrence(
  patientId: string,
  input: ReportRecurrenceInput,
) {
  // Compute time since initial diagnosis and treatment completion
  const [patient, plan] = await Promise.all([
    prisma.patient.findUnique({ where: { id: patientId } }),
    prisma.survivorshipPlan.findUnique({ where: { patientId } }),
  ]);
  if (!patient) throw new Error('Patient not found');

  const profile = (patient.profile as PatientProfile | null) ?? {};
  const now = new Date(input.detectedDate);

  let timeSinceInitialDx: number | null = null;
  if ((profile as any)?.diagnosisDate) {
    timeSinceInitialDx = Math.round(
      (now.getTime() - new Date((profile as any).diagnosisDate).getTime()) /
        (1000 * 60 * 60 * 24 * 30),
    );
  }

  let timeSinceCompletion: number | null = null;
  if (plan?.treatmentCompletionDate) {
    timeSinceCompletion = Math.round(
      (now.getTime() - new Date(plan.treatmentCompletionDate).getTime()) /
        (1000 * 60 * 60 * 24 * 30),
    );
  }

  // Extract prior treatments from profile
  const priorTreatments: string[] =
    ((profile as any)?.priorTreatments as any[])?.map(
      (t: any) => t.name || t.type || String(t),
    ) ?? [];

  const event = await prisma.recurrenceEvent.create({
    data: {
      patientId,
      detectedDate: new Date(input.detectedDate),
      detectionMethod: input.detectionMethod,
      recurrenceType: input.recurrenceType ?? null,
      recurrenceSites: input.recurrenceSites ?? [],
      confirmedByBiopsy: input.confirmedByBiopsy ?? false,
      newStage: input.newStage ?? null,
      documentUploadId: input.documentUploadId ?? null,
      timeSinceInitialDx,
      timeSinceCompletion,
      priorTreatments,
      cascadeStatus: buildInitialCascade() as any,
    },
  });

  // Run full cascade
  runRecurrenceCascade(event.id).catch(() => {});

  return event;
}

export async function createPreliminaryRecurrenceEvent(
  patientId: string,
  ctdnaResultId: string,
) {
  // Idempotency: check for existing active event
  const existing = await prisma.recurrenceEvent.findFirst({
    where: { patientId, acknowledgedAt: null },
    orderBy: { createdAt: 'desc' },
  });
  if (existing) return existing;

  const event = await prisma.recurrenceEvent.create({
    data: {
      patientId,
      detectedDate: new Date(),
      detectionMethod: 'ctdna_positive',
      confirmedByBiopsy: false,
      ctdnaResultId,
      cascadeStatus: buildInitialCascade() as any,
    },
  });

  // Run PARTIAL cascade (steps 2-4, 6-7 only)
  runPartialCascade(event.id, patientId).catch(() => {});

  return event;
}

// ============================================================================
// Cascade Management
// ============================================================================

export async function acknowledgeRecurrence(recurrenceEventId: string) {
  const event = await prisma.recurrenceEvent.update({
    where: { id: recurrenceEventId },
    data: { acknowledgedAt: new Date() },
  });

  await updateCascadeStep(recurrenceEventId, 'acknowledged', true);

  return prisma.recurrenceEvent.findUnique({ where: { id: recurrenceEventId } });
}

export async function updateCascadeStep(
  recurrenceEventId: string,
  step: string,
  value: boolean,
) {
  // Use a transaction for safe read-modify-write on JSON
  return prisma.$transaction(async (tx: any) => {
    const event = await tx.recurrenceEvent.findUnique({
      where: { id: recurrenceEventId },
    });
    if (!event) throw new Error('Recurrence event not found');

    const cascade = (event.cascadeStatus as CascadeStatus) || buildInitialCascade();
    (cascade as any)[step] = value;

    return tx.recurrenceEvent.update({
      where: { id: recurrenceEventId },
      data: { cascadeStatus: cascade as any },
    });
  });
}

export async function regenerateTranslator(
  patientId: string,
  recurrenceEventId: string,
) {
  const event = await prisma.recurrenceEvent.findUnique({
    where: { id: recurrenceEventId },
  });
  if (!event) throw new Error('Recurrence event not found');
  if (!event.acknowledgedAt) {
    throw new Error('Must acknowledge recurrence before regenerating translator');
  }

  // Re-generate translation for the patient
  const { generateTranslation } = await import('./translator');
  const patient = await prisma.patient.findUnique({ where: { id: patientId } });
  if (!patient) throw new Error('Patient not found');

  await generateTranslation(patient.profile as any, patientId);
  await updateCascadeStep(recurrenceEventId, 'translatorRegenerated', true);

  return prisma.recurrenceEvent.findUnique({ where: { id: recurrenceEventId } });
}

export async function archiveSurvivorshipPlan(patientId: string) {
  const plan = await prisma.survivorshipPlan.findUnique({
    where: { patientId },
  });
  if (!plan) return false;

  // Archive current planContent
  const archives = (plan.archivedPlans as any[]) || [];
  archives.push({
    planContent: plan.planContent,
    archivedAt: new Date().toISOString(),
    phase: plan.currentPhase,
    reason: 'recurrence',
  });

  await prisma.survivorshipPlan.update({
    where: { patientId },
    data: { archivedPlans: archives },
  });

  // Set all upcoming surveillance events to skipped
  await prisma.surveillanceEvent.updateMany({
    where: { patientId, status: 'upcoming' },
    data: {
      status: 'skipped',
      resultSummary: 'Paused: recurrence active',
    },
  });

  return true;
}

// ============================================================================
// Queries
// ============================================================================

export async function getRecurrenceEvent(patientId: string) {
  return prisma.recurrenceEvent.findFirst({
    where: { patientId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getRecurrenceEvents(patientId: string) {
  return prisma.recurrenceEvent.findMany({
    where: { patientId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function generateGenomicComparison(
  patientId: string,
  recurrenceEventId: string,
): Promise<GenomicComparison> {
  // Check Redis cache
  const cacheKey = `recurrence:genomic:${recurrenceEventId}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  // Load original + newest genomic results
  const results = await prisma.genomicResult.findMany({
    where: { patientId },
    orderBy: { createdAt: 'asc' },
  });

  if (results.length < 2) {
    return {
      hasNewData: false,
      resistanceMutations: [],
      biomarkerChanges: [],
      actionableChanges: [],
      patientSummary:
        'Waiting for new genomic data from your recurrent tumor. Once available, we will compare it with your original genomic profile.',
      generatedAt: new Date().toISOString(),
    };
  }

  const original = results[0];
  const latest = results[results.length - 1];

  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 1024,
    system: `You are an oncology genomics assistant. Compare two genomic profiles (original vs recurrent tumor) and identify clinically meaningful differences.

Return valid JSON:
{
  "resistanceMutations": ["list of new mutations that may indicate treatment resistance"],
  "biomarkerChanges": ["list of changed biomarker values"],
  "actionableChanges": ["list of changes that open new treatment options"],
  "patientSummary": "2-3 sentence patient-friendly summary of what changed and what it means for treatment options"
}

Be honest but not alarming. Focus on actionable information.`,
    messages: [
      {
        role: 'user',
        content: `Original Genomic Profile (${original.provider}, ${original.testName}):
Alterations: ${JSON.stringify(original.alterations)}
Biomarkers: ${JSON.stringify(original.biomarkers)}

Recurrent Tumor Profile (${latest.provider}, ${latest.testName}):
Alterations: ${JSON.stringify(latest.alterations)}
Biomarkers: ${JSON.stringify(latest.biomarkers)}

Compare these profiles and identify clinically meaningful changes.`,
      },
    ],
  });

  const text = (response.content[0] as { type: 'text'; text: string }).text;
  let parsed: any;
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
  } catch {
    parsed = {
      resistanceMutations: [],
      biomarkerChanges: [],
      actionableChanges: [],
      patientSummary:
        'We were unable to automatically compare your genomic profiles. Please discuss the results with your oncologist.',
    };
  }

  const comparison: GenomicComparison = {
    hasNewData: true,
    resistanceMutations: parsed.resistanceMutations ?? [],
    biomarkerChanges: parsed.biomarkerChanges ?? [],
    actionableChanges: parsed.actionableChanges ?? [],
    patientSummary: parsed.patientSummary ?? '',
    generatedAt: new Date().toISOString(),
  };

  // Cache for 30 days
  await redis.set(cacheKey, JSON.stringify(comparison), 'EX', 30 * 24 * 60 * 60);

  return comparison;
}

export async function getSecondOpinionResources(_patientId: string): Promise<SecondOpinionResource[]> {
  // Query seeded SecondOpinionCenter table for real center data
  const centers = await prisma.secondOpinionCenter.findMany({
    where: { isActive: true, offersVirtual: true },
    orderBy: { name: 'asc' },
    take: 6,
  });

  if (centers.length > 0) {
    return centers.map((c: any) => ({
      name: c.name,
      type: c.nciDesignation === 'comprehensive' ? 'nci_designated' : 'nci_designated',
      description: `${c.nciDesignation === 'comprehensive' ? 'NCI Comprehensive' : 'NCI Designated'} Cancer Center in ${c.city}, ${c.state}. ${c.virtualPlatform ? `Virtual consultations via ${c.virtualPlatform}.` : 'Virtual consultations available.'} ${c.pathologyReReview ? 'Offers pathology re-review.' : ''}`.trim(),
      url: c.website ? `https://${c.website.replace(/^https?:\/\//, '')}` : '',
      virtual: c.offersVirtual,
    }));
  }

  // Fallback if no centers seeded
  return [
    {
      name: 'Memorial Sloan Kettering Cancer Center',
      type: 'nci_designated',
      description: 'World-renowned cancer center offering second opinions for complex cases. Virtual consultations available.',
      url: 'https://www.mskcc.org/experience/become-patient/second-opinion',
      virtual: true,
    },
    {
      name: 'Dana-Farber Cancer Institute',
      type: 'nci_designated',
      description: 'NCI-designated comprehensive cancer center. Expert second opinions for recurrent cancer.',
      url: 'https://www.dana-farber.org/for-patients-and-families/becoming-a-patient/second-opinions',
      virtual: true,
    },
    {
      name: 'MD Anderson Cancer Center',
      type: 'nci_designated',
      description: 'Top-ranked cancer hospital with extensive clinical trial portfolio. myMDAnderson portal for remote second opinions.',
      url: 'https://www.mdanderson.org/patients-family/becoming-our-patient/second-opinion.html',
      virtual: true,
    },
  ];
}

// ============================================================================
// Internal — Cascade Orchestration
// ============================================================================

function buildInitialCascade(): CascadeStatus {
  return {
    acknowledged: false,
    supportOffered: false,
    resequencingRecommended: false,
    trialRematched: false,
    financialRematched: false,
    secondOpinionOffered: false,
    careTeamUpdated: false,
    translatorRegenerated: false,
    planArchived: false,
    pipelineActivated: false,
    genomicComparisonReady: false,
  };
}

async function runRecurrenceCascade(recurrenceEventId: string): Promise<void> {
  const event = await prisma.recurrenceEvent.findUnique({
    where: { id: recurrenceEventId },
  });
  if (!event) return;

  // Step 2: Support offered (always)
  await updateCascadeStep(recurrenceEventId, 'supportOffered', true);

  // Step 3: Re-sequencing recommended (always)
  await updateCascadeStep(recurrenceEventId, 'resequencingRecommended', true);

  // Step 4: Trial re-match (fire-and-forget)
  generateMatchesForPatient(event.patientId)
    .then(() => updateCascadeStep(recurrenceEventId, 'trialRematched', true))
    .catch(() => {});

  // Step 5: Financial re-match (fire-and-forget)
  matchFinancialPrograms(event.patientId)
    .then(() => updateCascadeStep(recurrenceEventId, 'financialRematched', true))
    .catch(() => {});

  // Step 6: Second opinion offered (always)
  await updateCascadeStep(recurrenceEventId, 'secondOpinionOffered', true);

  // Step 7: Care team updated (suggestions)
  await updateCascadeStep(recurrenceEventId, 'careTeamUpdated', true);

  // Step 9: Archive plan (conditional — only if confirmed by biopsy)
  if (event.confirmedByBiopsy) {
    try {
      await archiveSurvivorshipPlan(event.patientId);
      await updateCascadeStep(recurrenceEventId, 'planArchived', true);
    } catch {
      // Non-critical
    }
  }

  // Step 10: Pipeline activated (conditional — only if new sequencing data)
  if (event.newPathologyAvailable) {
    await updateCascadeStep(recurrenceEventId, 'pipelineActivated', true);
  }

  // Step 11: Genomic comparison (conditional — only if new genomic data)
  const genomicCount = await prisma.genomicResult.count({
    where: { patientId: event.patientId },
  });
  if (genomicCount >= 2) {
    await updateCascadeStep(recurrenceEventId, 'genomicComparisonReady', true);
  }
}

async function runPartialCascade(
  recurrenceEventId: string,
  patientId: string,
): Promise<void> {
  // Steps 2-4, 6-7 only (no translator regen, no plan archive)
  await updateCascadeStep(recurrenceEventId, 'supportOffered', true);
  await updateCascadeStep(recurrenceEventId, 'resequencingRecommended', true);

  // Trial re-match (already triggered by ctdna-manager, but mark cascade)
  await updateCascadeStep(recurrenceEventId, 'trialRematched', true);

  // Financial re-match
  matchFinancialPrograms(patientId)
    .then(() => updateCascadeStep(recurrenceEventId, 'financialRematched', true))
    .catch(() => {});

  await updateCascadeStep(recurrenceEventId, 'secondOpinionOffered', true);
  await updateCascadeStep(recurrenceEventId, 'careTeamUpdated', true);
}
