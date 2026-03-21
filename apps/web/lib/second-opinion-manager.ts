import { anthropic, CLAUDE_MODEL } from './ai';
import { redis } from './redis';
import { prisma } from './db';
import type { PatientProfile } from '@iish/shared';

// ============================================================================
// Types
// ============================================================================

export interface TriggerResult {
  triggered: boolean;
  rationale: string;
}

export interface TriggerRule {
  id: string;
  name: string;
  severity: 'high' | 'moderate' | 'low';
  evidenceBase: string;
  evaluate: (profile: any) => TriggerResult;
}

export interface TriggerEvaluation {
  triggers: {
    id: string;
    name: string;
    severity: string;
    rationale: string;
    evidenceBase: string;
  }[];
  overallSeverity: string;
  recommended: boolean;
}

export interface RecordPacket {
  clinicalSummary: string;
  questionsForReview: string[];
  documentReferences: string[];
}

export interface CommunicationGuide {
  portalMessage: string;
  inPersonScript: string;
  recordsRequest: string;
  reassurance: string;
}

// ============================================================================
// Haversine Distance (inline — same pattern as administration sites)
// ============================================================================

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959; // miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ============================================================================
// Inline Constants — Second Opinion Trigger Rules
// ============================================================================

const SECOND_OPINION_TRIGGERS: TriggerRule[] = [
  {
    id: 'tnbc_no_immunotherapy',
    name: 'TNBC without immunotherapy considered',
    severity: 'high',
    evidenceBase: 'KEYNOTE-522: Pembrolizumab + chemotherapy significantly improved pCR and EFS in early-stage TNBC.',
    evaluate: (profile: any): TriggerResult => {
      const subtype = ((profile as any)?.cancerSubtype ?? '').toLowerCase();
      const stage = ((profile as any)?.stage ?? '').toLowerCase();
      const treatmentPlan = ((profile as any)?.treatmentPlan ?? '').toLowerCase();
      const priorTreatments = ((profile as any)?.priorTreatments ?? [])
        .map((t: any) => (t.name || t.type || String(t)).toLowerCase())
        .join(' ');
      const allTreatment = `${treatmentPlan} ${priorTreatments}`;

      const isTNBC =
        subtype.includes('tnbc') || subtype.includes('triple negative') || subtype.includes('triple-negative');
      const isStageIIPlus =
        stage.includes('ii') || stage.includes('iii') || stage.includes('iv') || stage.includes('2') || stage.includes('3') || stage.includes('4');
      const hasImmunotherapy =
        allTreatment.includes('pembrolizumab') || allTreatment.includes('keytruda');

      if (isTNBC && isStageIIPlus && !hasImmunotherapy) {
        return {
          triggered: true,
          rationale:
            'Your diagnosis is triple-negative breast cancer stage II or higher, but your treatment plan does not appear to include pembrolizumab (Keytruda). The KEYNOTE-522 trial showed significant benefit for this combination. A second opinion could confirm whether immunotherapy should be part of your plan.',
        };
      }
      return { triggered: false, rationale: '' };
    },
  },
  {
    id: 'her2_no_pertuzumab',
    name: 'HER2+ without dual anti-HER2',
    severity: 'high',
    evidenceBase: 'CLEOPATRA: Adding pertuzumab to trastuzumab + docetaxel improved overall survival by 15.7 months in HER2+ metastatic breast cancer.',
    evaluate: (profile: any): TriggerResult => {
      const subtype = ((profile as any)?.cancerSubtype ?? '').toLowerCase();
      const receptorStatus = (profile as any)?.receptorStatus;
      const stage = ((profile as any)?.stage ?? '').toLowerCase();
      const treatmentPlan = ((profile as any)?.treatmentPlan ?? '').toLowerCase();
      const priorTreatments = ((profile as any)?.priorTreatments ?? [])
        .map((t: any) => (t.name || t.type || String(t)).toLowerCase())
        .join(' ');
      const allTreatment = `${treatmentPlan} ${priorTreatments}`;

      const her2Status = (receptorStatus?.her2?.status ?? '').toLowerCase();
      const isHER2Positive =
        her2Status === 'positive' ||
        subtype.includes('her2+') ||
        subtype.includes('her2 positive') ||
        subtype.includes('her2-positive');
      const isStageIIPlus =
        stage.includes('ii') || stage.includes('iii') || stage.includes('iv') || stage.includes('2') || stage.includes('3') || stage.includes('4');
      const hasPertuzumab =
        allTreatment.includes('pertuzumab') || allTreatment.includes('perjeta');

      if (isHER2Positive && isStageIIPlus && !hasPertuzumab) {
        return {
          triggered: true,
          rationale:
            'Your diagnosis is HER2-positive breast cancer stage II or higher, but your treatment plan does not appear to include pertuzumab (Perjeta). The CLEOPATRA trial demonstrated significant survival benefit from dual anti-HER2 therapy. A second opinion could clarify whether this addition is appropriate for you.',
        };
      }
      return { triggered: false, rationale: '' };
    },
  },
  {
    id: 'no_genomic_testing',
    name: 'No genomic testing ordered',
    severity: 'moderate',
    evidenceBase: 'TAILORx: Oncotype DX identifies ER+ early-stage patients who can safely skip chemotherapy, avoiding unnecessary toxicity.',
    evaluate: (profile: any): TriggerResult => {
      const subtype = ((profile as any)?.cancerSubtype ?? '').toLowerCase();
      const receptorStatus = (profile as any)?.receptorStatus;
      const stage = ((profile as any)?.stage ?? '').toLowerCase();
      const profileStr = JSON.stringify(profile).toLowerCase();

      const erStatus = (receptorStatus?.er?.status ?? '').toLowerCase();
      const isERPositive =
        erStatus === 'positive' ||
        subtype.includes('er+') ||
        subtype.includes('er positive') ||
        subtype.includes('luminal');
      const isEarlyStage =
        stage.includes('i') || stage.includes('ii') || stage.includes('1') || stage.includes('2');
      const hasGenomicTesting =
        profileStr.includes('oncotype') ||
        profileStr.includes('mammaprint') ||
        profileStr.includes('genomic') ||
        profileStr.includes('gene expression');

      if (isERPositive && isEarlyStage && !hasGenomicTesting) {
        return {
          triggered: true,
          rationale:
            'You have ER-positive early-stage breast cancer, but there is no record of genomic testing (such as Oncotype DX or MammaPrint) being ordered. The TAILORx trial showed that genomic testing can identify patients who may safely skip chemotherapy. A second opinion can help determine if this testing is right for you.',
        };
      }
      return { triggered: false, rationale: '' };
    },
  },
  {
    id: 'rare_subtype',
    name: 'Rare cancer subtype',
    severity: 'moderate',
    evidenceBase: 'NCCN recommends referral to high-volume centers for rare subtypes due to limited community-level expertise and evolving treatment paradigms.',
    evaluate: (profile: any): TriggerResult => {
      const subtype = ((profile as any)?.cancerSubtype ?? '').toLowerCase();

      const rareSubtypes = ['inflammatory', 'metaplastic', 'paget', 'phyllodes'];
      const matchedRare = rareSubtypes.find((rs) => subtype.includes(rs));

      if (matchedRare) {
        return {
          triggered: true,
          rationale:
            `Your cancer subtype (${matchedRare}) is rare and may benefit from review at a center with high-volume experience in this specific subtype. Treatment approaches for rare subtypes are evolving and often require specialized expertise.`,
        };
      }
      return { triggered: false, rationale: '' };
    },
  },
  {
    id: 'borderline_biomarkers',
    name: 'Borderline biomarker results',
    severity: 'moderate',
    evidenceBase: 'ASCO/CAP guidelines: HER2 IHC 2+ requires reflex FISH testing. ER 1-10% ("low positive") has uncertain clinical significance. Equivocal Ki-67 can change treatment recommendations.',
    evaluate: (profile: any): TriggerResult => {
      const receptorStatus = (profile as any)?.receptorStatus;
      const ki67 = ((profile as any)?.ki67 ?? '').toLowerCase();
      const profileStr = JSON.stringify(profile).toLowerCase();

      const her2Ihc = (receptorStatus?.her2?.ihc ?? '').toString();
      const erPercent = receptorStatus?.er?.percent;

      const reasons: string[] = [];

      if (her2Ihc === '2+' || her2Ihc.includes('2+') || her2Ihc.includes('equivocal')) {
        reasons.push('HER2 IHC 2+ (equivocal) — reflex FISH testing should be performed');
      }

      if (erPercent !== undefined && erPercent >= 1 && erPercent <= 10) {
        reasons.push(`ER ${erPercent}% (low positive) — clinical significance is uncertain and treatment recommendations vary`);
      }

      if (
        ki67.includes('equivocal') ||
        ki67.includes('borderline') ||
        profileStr.includes('ki-67 equivocal') ||
        profileStr.includes('ki67 borderline')
      ) {
        reasons.push('Ki-67 is equivocal — interpretation can vary between pathologists');
      }

      if (reasons.length > 0) {
        return {
          triggered: true,
          rationale:
            `Your biomarker results include borderline values that could be interpreted differently: ${reasons.join('; ')}. A second pathology review at a high-volume center may provide more definitive results.`,
        };
      }
      return { triggered: false, rationale: '' };
    },
  },
  {
    id: 'discordant_findings',
    name: 'Discordant clinical findings',
    severity: 'high',
    evidenceBase: 'Discordance between imaging, pathology, and clinical findings is a recognized indication for expert review per NCCN guidelines.',
    evaluate: (profile: any): TriggerResult => {
      const hasDiscordantFlag = (profile as any)?.discordantFindings === true;
      const profileStr = JSON.stringify(profile).toLowerCase();
      const hasDiscordantNotes =
        profileStr.includes('discordant') ||
        profileStr.includes('discordance') ||
        profileStr.includes('inconsistent findings') ||
        profileStr.includes('conflicting results');

      if (hasDiscordantFlag || hasDiscordantNotes) {
        return {
          triggered: true,
          rationale:
            'Your medical records indicate discordant or conflicting findings between tests. This is a strong indication for a second opinion to resolve the inconsistency and ensure an accurate diagnosis.',
        };
      }
      return { triggered: false, rationale: '' };
    },
  },
  {
    id: 'community_advanced',
    name: 'Advanced cancer at community facility',
    severity: 'moderate',
    evidenceBase: 'Studies show improved outcomes for complex/advanced cancers treated at NCI-designated comprehensive cancer centers and high-volume academic institutions.',
    evaluate: (profile: any): TriggerResult => {
      const stage = ((profile as any)?.stage ?? '').toLowerCase();
      const facilityType = ((profile as any)?.facilityType ?? '').toLowerCase();

      const isAdvanced =
        stage.includes('iii') || stage.includes('iv') || stage.includes('3') || stage.includes('4');
      const isCommunity =
        facilityType !== '' && !facilityType.includes('nci') && !facilityType.includes('academic');

      if (isAdvanced && isCommunity) {
        return {
          triggered: true,
          rationale:
            'You have advanced-stage cancer being treated at a community facility. Research shows that patients with complex or advanced cancers may benefit from consultation at an NCI-designated cancer center, which often has access to more clinical trials and multidisciplinary tumor boards.',
        };
      }
      return { triggered: false, rationale: '' };
    },
  },
  {
    id: 'young_patient',
    name: 'Young patient (under 40)',
    severity: 'low',
    evidenceBase: 'Cancer in young adults often presents with unique biological features and may require age-specific treatment considerations including fertility preservation and long-term survivorship planning.',
    evaluate: (profile: any): TriggerResult => {
      const age = (profile as any)?.age ?? null;

      if (age !== null && age < 40) {
        return {
          triggered: true,
          rationale:
            `At age ${age}, cancer may present with unique biological characteristics. A second opinion at a center experienced with young adult oncology can ensure your treatment plan accounts for age-specific considerations including fertility, long-term side effects, and survivorship.`,
        };
      }
      return { triggered: false, rationale: '' };
    },
  },
];

// ============================================================================
// 1. Evaluate Second Opinion Triggers
// ============================================================================

export async function evaluateSecondOpinionTriggers(
  patientId: string,
): Promise<TriggerEvaluation> {
  const patient = await prisma.patient.findUnique({ where: { id: patientId } });
  if (!patient) throw new Error('Patient not found');

  const profile = (patient.profile as PatientProfile | null) ?? {};

  const firedTriggers: TriggerEvaluation['triggers'] = [];

  for (const trigger of SECOND_OPINION_TRIGGERS) {
    const result = trigger.evaluate(profile);
    if (result.triggered) {
      firedTriggers.push({
        id: trigger.id,
        name: trigger.name,
        severity: trigger.severity,
        rationale: result.rationale,
        evidenceBase: trigger.evidenceBase,
      });
    }
  }

  // Determine overall severity: high > moderate > low
  let overallSeverity = 'none';
  const severities = firedTriggers.map((t) => t.severity);
  if (severities.includes('high')) {
    overallSeverity = 'high';
  } else if (severities.includes('moderate')) {
    overallSeverity = 'moderate';
  } else if (severities.includes('low')) {
    overallSeverity = 'low';
  }

  return {
    triggers: firedTriggers,
    overallSeverity,
    recommended: firedTriggers.length > 0,
  };
}

// ============================================================================
// 2. Create Second Opinion Request
// ============================================================================

export async function createSecondOpinionRequest(patientId: string) {
  // Check for existing non-completed request
  const existing = await prisma.secondOpinionRequest.findFirst({
    where: {
      patientId,
      status: { not: 'completed' },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (existing) return existing;

  // Evaluate triggers
  const evaluation = await evaluateSecondOpinionTriggers(patientId);

  // Create request
  const request = await prisma.secondOpinionRequest.create({
    data: {
      patientId,
      triggerReasons: evaluation.triggers as any,
      triggerSeverity: evaluation.overallSeverity,
      status: 'recommended',
    },
  });

  return request;
}

// ============================================================================
// 3. Get Second Opinion Request
// ============================================================================

export async function getSecondOpinionRequest(patientId: string) {
  return prisma.secondOpinionRequest.findFirst({
    where: { patientId },
    orderBy: { createdAt: 'desc' },
  });
}

// ============================================================================
// 4. Get Second Opinion Centers
// ============================================================================

export async function getSecondOpinionCenters(
  patientId: string,
  filters?: { virtual?: boolean; subspecialty?: string },
) {
  const patient = await prisma.patient.findUnique({ where: { id: patientId } });
  if (!patient) throw new Error('Patient not found');

  // Build where clause
  const where: any = { isActive: true };
  if (filters?.virtual) where.offersVirtual = true;
  if (filters?.subspecialty) where.subspecialties = { has: filters.subspecialty };

  const centers = await prisma.secondOpinionCenter.findMany({ where });

  // Compute distance if patient has lat/lng
  const patientLat = patient.lat;
  const patientLng = patient.lng;

  const withDistance = centers.map((c) => {
    let distance: number | null = null;
    if (patientLat != null && patientLng != null && c.latitude != null && c.longitude != null) {
      distance = Math.round(haversineDistance(patientLat, patientLng, c.latitude, c.longitude) * 10) / 10;
    }
    return { ...c, distance };
  });

  // Sort by distance if available, otherwise by name
  withDistance.sort((a, b) => {
    if (a.distance != null && b.distance != null) return a.distance - b.distance;
    if (a.distance != null) return -1;
    if (b.distance != null) return 1;
    return a.name.localeCompare(b.name);
  });

  return withDistance;
}

// ============================================================================
// 5. Generate Record Packet (Claude-powered)
// ============================================================================

export async function generateRecordPacket(
  patientId: string,
): Promise<RecordPacket> {
  // Check Redis cache
  const cacheKey = `second-opinion:packet:${patientId}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached) as RecordPacket;

  // Load patient + documents + request
  const [patient, documents, request] = await Promise.all([
    prisma.patient.findUnique({ where: { id: patientId } }),
    prisma.documentUpload.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.secondOpinionRequest.findFirst({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  if (!patient) throw new Error('Patient not found');

  const profile = (patient.profile as PatientProfile | null) ?? {};
  const triggerReasons = (request?.triggerReasons as any[]) ?? [];

  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 4096,
    system: `You are a clinical oncology specialist preparing a second opinion record packet for a cancer patient. Your role is to organize their clinical information into a concise, professional summary that a reviewing oncologist can quickly assess.

KEY REQUIREMENTS:
- Be thorough but concise — reviewing oncologists are busy
- Highlight areas of clinical uncertainty or concern
- Frame questions specifically around the trigger reasons that prompted this second opinion
- Reference specific documents that should be included in the packet
- Use professional clinical language

Return ONLY valid JSON with this exact structure:
{
  "clinicalSummary": "string — a comprehensive clinical narrative suitable for a reviewing oncologist, including diagnosis, staging, biomarkers, treatment history, and areas of concern",
  "questionsForReview": ["string — specific clinical questions the reviewing oncologist should address"],
  "documentReferences": ["string — documents that should be included in the second opinion packet"]
}`,
    messages: [
      {
        role: 'user',
        content: `Patient profile:
- Cancer type: ${(profile as any)?.cancerType || 'not specified'}
- Cancer subtype: ${(profile as any)?.cancerSubtype || 'not specified'}
- Stage: ${(profile as any)?.stage || 'not specified'}
- Age: ${(profile as any)?.age || 'not specified'}
- Receptor status: ${JSON.stringify((profile as any)?.receptorStatus || 'not specified')}
- Treatment plan: ${(profile as any)?.priorTreatments?.map((t: any) => t.name || t.type || String(t)).join(', ') || (profile as any)?.treatmentPlan || 'not specified'}
- Ki-67: ${(profile as any)?.ki67 || 'not specified'}
- Facility type: ${(profile as any)?.facilityType || 'not specified'}

Available documents:
${documents.map((d) => `- ${d.documentType}: uploaded ${d.createdAt.toISOString().split('T')[0]}`).join('\n') || '- No documents on file'}

Second opinion trigger reasons:
${triggerReasons.map((t: any) => `- ${t.name} (${t.severity}): ${t.rationale}`).join('\n') || '- No specific triggers identified'}

Generate a clinical summary, 5-8 specific questions for the reviewing oncologist, and a list of documents that should be gathered for the second opinion packet.`,
      },
    ],
  });

  const text = (response.content[0] as { type: 'text'; text: string }).text;
  let packet: RecordPacket;
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    packet = JSON.parse(jsonMatch ? jsonMatch[0] : text);
  } catch {
    packet = {
      clinicalSummary:
        'A comprehensive clinical summary could not be generated automatically. Please gather your pathology reports, imaging studies, and treatment records for the reviewing oncologist.',
      questionsForReview: [
        'Do you agree with the current diagnosis and staging?',
        'Are there additional tests or biomarker analyses that should be performed?',
        'Do you concur with the proposed treatment plan?',
        'Are there clinical trials that should be considered?',
        'Are there any aspects of the current management you would approach differently?',
      ],
      documentReferences: [
        'Original pathology report',
        'All imaging studies (CT, MRI, PET)',
        'Surgical reports (if applicable)',
        'Current treatment plan documentation',
        'Laboratory results including tumor markers',
      ],
    };
  }

  // Update the request with clinical summary and questions
  if (request) {
    await prisma.secondOpinionRequest.update({
      where: { id: request.id },
      data: {
        clinicalSummary: packet.clinicalSummary,
        questionsForReview: packet.questionsForReview,
        status: 'packet_prepared',
      },
    });
  }

  // Cache for 7 days
  await redis.set(cacheKey, JSON.stringify(packet), 'EX', 7 * 24 * 60 * 60);

  return packet;
}

// ============================================================================
// 6. Generate Communication Guide (Claude-powered)
// ============================================================================

export async function generateCommunicationGuide(
  patientId: string,
): Promise<CommunicationGuide> {
  // Check Redis cache
  const cacheKey = `second-opinion:comm:${patientId}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached) as CommunicationGuide;

  // Load patient + request
  const [patient, request] = await Promise.all([
    prisma.patient.findUnique({ where: { id: patientId } }),
    prisma.secondOpinionRequest.findFirst({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  if (!patient) throw new Error('Patient not found');

  const profile = (patient.profile as PatientProfile | null) ?? {};
  const triggerReasons = (request?.triggerReasons as any[]) ?? [];

  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 2048,
    system: `You are a patient advocate helping a cancer patient communicate about seeking a second opinion. Tone: collaborative, not adversarial. Key message: Most oncologists welcome second opinions.

KEY TONE RULES:
- Frame the second opinion as a partnership, not a vote of no confidence
- Acknowledge the patient-oncologist relationship is important
- Provide practical, ready-to-use language
- Be warm and reassuring — many patients feel guilty about seeking second opinions
- Normalize the process — second opinions are standard of care for cancer

Return ONLY valid JSON with this exact structure:
{
  "portalMessage": "string — a ready-to-send patient portal message to the current oncologist requesting records for a second opinion",
  "inPersonScript": "string — a conversational script the patient can use to discuss the second opinion with their current oncologist in person",
  "recordsRequest": "string — a formal records release request letter the patient can submit to the medical records department",
  "reassurance": "string — a reassuring message for the patient explaining why second opinions are normal and encouraged"
}`,
    messages: [
      {
        role: 'user',
        content: `Patient context:
- Cancer type: ${(profile as any)?.cancerType || 'not specified'}
- Cancer subtype: ${(profile as any)?.cancerSubtype || 'not specified'}
- Stage: ${(profile as any)?.stage || 'not specified'}
- Current treatment status: ${(profile as any)?.treatmentStatus || 'not specified'}

Reasons for second opinion:
${triggerReasons.map((t: any) => `- ${t.name}: ${t.rationale}`).join('\n') || '- Patient-initiated request'}

Generate personalized communication templates for this patient. The portal message should be concise and professional. The in-person script should be warm and collaborative. The records request should be formal and complete.`,
      },
    ],
  });

  const text = (response.content[0] as { type: 'text'; text: string }).text;
  let guide: CommunicationGuide;
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    guide = JSON.parse(jsonMatch ? jsonMatch[0] : text);
  } catch {
    guide = {
      portalMessage:
        'Dear [Oncologist Name], I hope this message finds you well. I am writing to request copies of my complete medical records, including pathology reports, imaging studies, and treatment plans. I am seeking a second opinion consultation, which I understand is a standard and encouraged part of cancer care. I value our relationship and look forward to discussing any new insights with you. Thank you for your understanding and support.',
      inPersonScript:
        'Dr. [Name], I want you to know how much I appreciate your care. I have decided to seek a second opinion — not because I doubt your expertise, but because I want to feel fully confident in my treatment plan. I know you understand how important that peace of mind is. I would love to discuss any findings with you afterward.',
      recordsRequest:
        'To the Medical Records Department: I am requesting a complete copy of my medical records for the purpose of a second opinion consultation. Please include: pathology reports, imaging studies and reports, laboratory results, treatment plans and notes, surgical reports (if applicable), and any genetic or genomic testing results. Please send records to [Second Opinion Center Address] or provide them to me directly.',
      reassurance:
        'Seeking a second opinion is one of the most responsible things you can do as a cancer patient. It is a normal, encouraged part of cancer care — not a sign of distrust. Most oncologists welcome second opinions because they want you to feel confident in your treatment plan. A second opinion may confirm your current path (which brings peace of mind) or reveal additional options worth considering.',
    };
  }

  // Update request with communication guide
  if (request) {
    await prisma.secondOpinionRequest.update({
      where: { id: request.id },
      data: {
        communicationGuide: guide as any,
      },
    });
  }

  // Cache for 7 days
  await redis.set(cacheKey, JSON.stringify(guide), 'EX', 7 * 24 * 60 * 60);

  return guide;
}

// ============================================================================
// 7. Select Center
// ============================================================================

export async function selectCenter(
  patientId: string,
  centerId: string,
  isVirtual: boolean,
  appointmentDate?: string,
) {
  // Load center to get name
  const center = await prisma.secondOpinionCenter.findUnique({ where: { id: centerId } });
  if (!center) throw new Error('Center not found');

  // Find latest request for this patient
  const request = await prisma.secondOpinionRequest.findFirst({
    where: { patientId },
    orderBy: { createdAt: 'desc' },
  });

  if (!request) throw new Error('No second opinion request found');

  // Update request with center selection
  const updated = await prisma.secondOpinionRequest.update({
    where: { id: request.id },
    data: {
      centerId,
      centerName: center.name,
      isVirtual,
      appointmentDate: appointmentDate ? new Date(appointmentDate) : undefined,
      status: 'sent',
    },
  });

  return updated;
}

// ============================================================================
// 8. Record Second Opinion Outcome
// ============================================================================

export async function recordSecondOpinionOutcome(
  patientId: string,
  outcome: string,
  outcomeSummary?: string,
) {
  // Find latest request for this patient
  const request = await prisma.secondOpinionRequest.findFirst({
    where: { patientId },
    orderBy: { createdAt: 'desc' },
  });

  if (!request) throw new Error('No second opinion request found');

  // Update request with outcome
  const updated = await prisma.secondOpinionRequest.update({
    where: { id: request.id },
    data: {
      outcome,
      outcomeSummary: outcomeSummary ?? null,
      status: 'completed',
    },
  });

  return updated;
}
