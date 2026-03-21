import { anthropic, CLAUDE_MODEL } from './ai';
import { redis } from './redis';
import { prisma } from './db';
import type { PatientReportData, ClinicianReportData, ManufacturerBlueprintData, PatientProfile } from '@iish/shared';

const CACHE_TTL = 24 * 60 * 60; // 24 hours

interface NeoantigenRow {
  rank: number;
  gene: string;
  mutation: string;
  mutantPeptide: string;
  wildtypePeptide: string;
  hlaAllele: string;
  bindingAffinityNm: number;
  bindingClass: string;
  immunogenicityScore: number;
  compositeScore: number;
  confidence: string;
  vaf: number;
  agretopicity: number;
  clonality: number;
  expressionLevel: number | null;
}

async function loadJobData(jobId: string) {
  const job = await prisma.pipelineJob.findUniqueOrThrow({
    where: { id: jobId },
    include: {
      neoantigens: { orderBy: { rank: 'asc' }, take: 30 },
      patient: { select: { profile: true, userId: true } },
    },
  });

  const neoantigens: NeoantigenRow[] = job.neoantigens.map((n) => ({
    rank: n.rank,
    gene: n.gene,
    mutation: n.mutation,
    mutantPeptide: n.mutantPeptide,
    wildtypePeptide: n.wildtypePeptide,
    hlaAllele: n.hlaAllele,
    bindingAffinityNm: n.bindingAffinityNm,
    bindingClass: n.bindingClass,
    immunogenicityScore: n.immunogenicityScore,
    compositeScore: n.compositeScore,
    confidence: n.confidence,
    vaf: n.vaf,
    agretopicity: n.agretopicity,
    clonality: n.clonality,
    expressionLevel: n.expressionLevel,
  }));

  const profile = (job.patient.profile ?? {}) as PatientProfile;

  return { job, neoantigens, profile };
}

// ---- Patient Report ----

const PATIENT_GROUNDING_SYSTEM = `You are an expert tumor immunologist. Given pipeline results (neoantigens, HLA typing, vaccine blueprint), provide a structured clinical grounding of the findings. Be factual and evidence-based. Respond ONLY with valid JSON.`;

const PATIENT_TRANSLATION_SYSTEM = `You are a medical translator who converts complex neoantigen vaccine data into clear, honest explanations for an intelligent adult with no medical background.

Rules:
- Write at an 8th-grade reading level
- Be warm but honest
- Use "you" and "your" — this is personal
- Explain what neoantigens are and why they matter for treatment
- For top candidates, explain in plain language what gene is affected and why it's a good target
- Frame the vaccine explanation in practical terms
- Generate specific questions for the oncologist visit
- Include a clear disclaimer that this is informational, not medical advice

Respond ONLY with valid JSON matching the requested schema.`;

export async function generatePatientReport(jobId: string): Promise<PatientReportData> {
  const cacheKey = `report:patient:${jobId}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached) as PatientReportData;

  const { job, neoantigens, profile } = await loadJobData(jobId);

  // Step 1: Clinical grounding
  const groundingResult = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 4096,
    system: PATIENT_GROUNDING_SYSTEM,
    messages: [{
      role: 'user',
      content: `Patient cancer type: ${profile.cancerType ?? 'Unknown'}
Stage: ${profile.stage ?? 'Unknown'}
Variant count: ${job.variantCount ?? 0}
TMB: ${job.tmb ?? 'N/A'}
HLA genotype: ${JSON.stringify(job.hlaGenotype ?? {})}
Top neoantigens (${neoantigens.length}):
${JSON.stringify(neoantigens.slice(0, 15), null, 2)}
Vaccine blueprint summary: ${JSON.stringify(job.vaccineBlueprint ? { epitopeCount: (job.vaccineBlueprint as Record<string, unknown>).epitopeCount, targetedGenes: (job.vaccineBlueprint as Record<string, unknown>).targetedGenes } : null)}

Provide a clinical grounding JSON with: driverMutations, immunologicRationale, vaccineTargetAssessment, keyFindings.`,
    }],
  });

  const groundingText = (groundingResult.content[0] as { type: 'text'; text: string }).text;

  // Step 2: Patient translation
  const translationResult = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 8192,
    system: PATIENT_TRANSLATION_SYSTEM,
    messages: [{
      role: 'user',
      content: `Clinical grounding:
${groundingText}

Patient profile: ${JSON.stringify({ cancerType: profile.cancerType, stage: profile.stage })}
Neoantigen count: ${job.neoantigenCount ?? neoantigens.length}

Create a patient-facing report as JSON:
{
  "summary": "2-3 sentence plain-language summary of what we found",
  "whatAreNeoantigens": "explanation of neoantigens and personalized vaccines",
  "topCandidates": [{"gene": "string", "mutation": "string", "explanation": "plain language why this is a good target"}],
  "vaccineExplanation": "how the personalized vaccine would work",
  "nextSteps": ["action item strings"],
  "questionsForOncologist": [{"question": "string", "whyItMatters": "string"}],
  "disclaimer": "standard disclaimer text",
  "generatedAt": "${new Date().toISOString()}"
}`,
    }],
  });

  const text = (translationResult.content[0] as { type: 'text'; text: string }).text;
  const report: PatientReportData = JSON.parse(text.replace(/```json\n?|```\n?/g, '').trim());

  await redis.set(cacheKey, JSON.stringify(report), 'EX', CACHE_TTL);
  return report;
}

// ---- Clinician Report ----

const CLINICIAN_GROUNDING_SYSTEM = `You are an expert tumor immunologist and clinical oncologist. Given pipeline results, provide a structured clinical grounding. Be evidence-based and cite relevant literature where applicable. Respond ONLY with valid JSON.`;

const CLINICIAN_REPORT_SYSTEM = `You are a clinical report generator for a neoantigen vaccine pipeline. Generate a formal structured clinical report for the treating oncologist.

The report should be precise, use standard medical terminology, and include:
- Mutation landscape context (TMB implications, driver vs passenger)
- Neoantigen binding data interpretation
- Vaccine design rationale
- Clinical implications and limitations
- Relevant clinical trial suggestions

Respond ONLY with valid JSON matching the requested schema.`;

export async function generateClinicianReport(jobId: string): Promise<ClinicianReportData> {
  const cacheKey = `report:clinician:${jobId}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached) as ClinicianReportData;

  const { job, neoantigens, profile } = await loadJobData(jobId);
  const blueprint = job.vaccineBlueprint as Record<string, unknown> | null;

  // Step 1: Clinical grounding
  const groundingResult = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 4096,
    system: CLINICIAN_GROUNDING_SYSTEM,
    messages: [{
      role: 'user',
      content: `Cancer type: ${profile.cancerType ?? 'Unknown'}, Stage: ${profile.stage ?? 'Unknown'}
Variant count: ${job.variantCount}, TMB: ${job.tmb}
HLA genotype: ${JSON.stringify(job.hlaGenotype ?? {})}
Top ${neoantigens.length} neoantigen candidates:
${JSON.stringify(neoantigens, null, 2)}
Vaccine blueprint: ${JSON.stringify(blueprint)}

Provide clinical grounding JSON with: mutationLandscape, neoantigenAssessment, immunologicContext, clinicalImplications, trialSuggestions, limitations, references.`,
    }],
  });

  const groundingText = (groundingResult.content[0] as { type: 'text'; text: string }).text;

  // Step 2: Structured clinical report
  const reportResult = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 8192,
    system: CLINICIAN_REPORT_SYSTEM,
    messages: [{
      role: 'user',
      content: `Clinical grounding:
${groundingText}

Raw data:
- Reference genome: ${job.referenceGenome}
- Input format: ${job.inputFormat}
- Completed: ${job.completedAt?.toISOString() ?? 'N/A'}
- Patient cancer: ${profile.cancerType ?? 'Unknown'}, stage: ${profile.stage ?? 'Unknown'}
- Variant count: ${job.variantCount}, TMB: ${job.tmb}
- HLA: ${JSON.stringify(job.hlaGenotype ?? {})}
- Total neoantigens: ${job.neoantigenCount}
- Blueprint: ${JSON.stringify(blueprint)}

Top candidates for report table:
${JSON.stringify(neoantigens.map(n => ({
  rank: n.rank, gene: n.gene, mutation: n.mutation,
  mutantPeptide: n.mutantPeptide, wildtypePeptide: n.wildtypePeptide,
  hlaAllele: n.hlaAllele, bindingAffinityNm: n.bindingAffinityNm,
  bindingClass: n.bindingClass, immunogenicityScore: n.immunogenicityScore,
  compositeScore: n.compositeScore, confidence: n.confidence,
})), null, 2)}

Generate JSON with this exact schema:
{
  "sampleInfo": {"patientId": "${job.patientId.slice(0, 8)}", "cancerType": "string", "referenceGenome": "${job.referenceGenome}", "inputFormat": "${job.inputFormat}", "completedAt": "${job.completedAt?.toISOString() ?? ''}"},
  "genomicLandscape": {"totalVariants": ${job.variantCount ?? 0}, "tmb": ${job.tmb ?? 'null'}, "significantGenes": ["string"]},
  "hlaGenotype": ${JSON.stringify(job.hlaGenotype ?? {})},
  "neoantigenAnalysis": {"methodology": "string describing the pipeline methodology", "totalCandidates": ${job.neoantigenCount ?? 0}, "topCandidates": [use the raw candidate data above, keep all numeric values exact]},
  "vaccineDesignSummary": {"epitopeCount": number, "targetedGenes": ["string"], "constructLength": number|null, "deliveryMethod": "string|null"},
  "clinicalImplications": "string",
  "relevantTrials": [{"nctId": "string", "title": "string", "relevance": "string"}],
  "limitations": "string",
  "references": ["string"],
  "generatedAt": "${new Date().toISOString()}"
}`,
    }],
  });

  const text = (reportResult.content[0] as { type: 'text'; text: string }).text;
  const report: ClinicianReportData = JSON.parse(text.replace(/```json\n?|```\n?/g, '').trim());

  await redis.set(cacheKey, JSON.stringify(report), 'EX', CACHE_TTL);
  return report;
}

// ---- Manufacturer Blueprint ----

const MANUFACTURER_SYSTEM = `You are a pharmaceutical manufacturing specification writer. Given a vaccine blueprint and neoantigen data, generate a detailed manufacturing specification document.

Include:
- Complete mRNA sequence specification
- Construct design with signal peptide, epitopes, linkers, and helper epitopes
- LNP formulation details
- QC criteria with test methods and specifications
- Storage and stability requirements
- Regulatory notes

Use standard pharmaceutical manufacturing terminology. Respond ONLY with valid JSON.`;

export async function generateManufacturerBlueprint(jobId: string): Promise<ManufacturerBlueprintData> {
  const cacheKey = `report:manufacturer:${jobId}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached) as ManufacturerBlueprintData;

  const { job, neoantigens } = await loadJobData(jobId);
  const blueprint = job.vaccineBlueprint as Record<string, unknown> | null;

  const result = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 8192,
    system: MANUFACTURER_SYSTEM,
    messages: [{
      role: 'user',
      content: `Vaccine blueprint data:
${JSON.stringify(blueprint, null, 2)}

Top neoantigen candidates used in construct:
${JSON.stringify(neoantigens.slice(0, 20).map(n => ({
  gene: n.gene, mutation: n.mutation, mutantPeptide: n.mutantPeptide,
  hlaAllele: n.hlaAllele, bindingAffinityNm: n.bindingAffinityNm,
  compositeScore: n.compositeScore,
})), null, 2)}

HLA genotype: ${JSON.stringify(job.hlaGenotype ?? {})}

Generate a manufacturing specification as JSON:
{
  "mRnaSequenceSpec": {
    "sequence": "full mRNA sequence or reference to blueprint",
    "lengthNt": number,
    "gcContent": number|null,
    "codonOptimization": "string|null",
    "fivePrimeUtr": "string|null",
    "threePrimeUtr": "string|null",
    "polyATailLength": number|null
  },
  "constructDesign": {
    "signalPeptide": "string|null",
    "epitopes": [{"gene": "string", "peptide": "string", "hlaAllele": "string", "linker": "string|null"}],
    "universalHelper": "string|null - e.g. PADRE sequence",
    "totalLength": number|null
  },
  "lnpFormulation": {
    "ionizableLipid": "string|null",
    "helperLipid": "string|null",
    "cholesterol": "string|null",
    "pegLipid": "string|null",
    "nPRatio": number|null,
    "particleSizeNm": "string|null"
  },
  "qcCriteria": [{"test": "string", "specification": "string", "method": "string"}],
  "storageAndStability": [{"condition": "string", "shelfLife": "string"}],
  "regulatoryNotes": "string",
  "generatedAt": "${new Date().toISOString()}"
}`,
    }],
  });

  const text = (result.content[0] as { type: 'text'; text: string }).text;
  const report: ManufacturerBlueprintData = JSON.parse(text.replace(/```json\n?|```\n?/g, '').trim());

  await redis.set(cacheKey, JSON.stringify(report), 'EX', CACHE_TTL);
  return report;
}
