/**
 * PREVENT Lifestyle — Prevention-Framed Lifestyle Recommendations
 *
 * Wraps the Claude lifestyle call with primary prevention framing
 * (no treatment history context, focuses on risk reduction).
 */

import { prisma } from './db';
import { redis } from './redis';
import { anthropic } from './ai';
import { generatePresignedUploadUrl, downloadS3AsText } from './s3';
import { parseGenotypeFile as parseRawGenotype } from './genotype-parser';
import { calculatePrs } from './prs-calculator';
import { runCompositeRiskAssessment } from './prevent-manager';
import { DOCUMENT_TYPES } from '@iish/shared';
import { randomUUID } from 'crypto';

/**
 * Get cached prevention lifestyle recommendations or return null.
 */
export async function getPreventionLifestyle(userId: string) {
  const cacheKey = `prevent:lifestyle:${userId}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);
  return null;
}

/**
 * Generate prevention-framed lifestyle recommendations via Claude.
 */
export async function generatePreventionLifestyle(userId: string) {
  const cacheKey = `prevent:lifestyle:${userId}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const patient = await prisma.patient.findUnique({ where: { userId } });
  if (!patient) throw new Error('Patient not found');

  const profile = await prisma.preventProfile.findUnique({ where: { patientId: patient.id } });
  if (!profile) throw new Error('Prevention profile not found');

  const latestRisk = await prisma.riskAssessment.findFirst({
    where: { patientId: patient.id },
    orderBy: { assessmentDate: 'desc' },
  });

  const msg = await anthropic.messages.create({
    model: 'claude-opus-4-20250514',
    max_tokens: 3000,
    messages: [{
      role: 'user',
      content: `Generate evidence-based lifestyle recommendations for breast cancer PRIMARY PREVENTION (not recurrence prevention).

Patient context:
- Risk category: ${latestRisk?.riskCategory ?? 'unknown'}
- Lifetime risk: ${latestRisk?.lifetimeRiskEstimate?.toFixed(1) ?? '?'}%
- BMI: ${profile.bmi ?? 'unknown'}
- Alcohol: ${profile.alcoholDrinksPerWeek ?? 0} drinks/week
- Exercise: ${profile.exerciseMinutesPerWeek ?? 0} min/week
- Smoking: ${profile.smokingStatus ?? 'unknown'}
- Menopausal status: ${profile.menopausalStatus ?? 'unknown'}
- HRT: ${profile.hrtCurrent ? 'Yes' : 'No'}

Frame ALL recommendations as PRIMARY PREVENTION — "reduces your risk by X%" NOT "reduces recurrence by X%".

Return JSON:
{
  "exercise": {
    "headline": "Short motivating headline",
    "weeklyTarget": "150 min moderate or 75 min vigorous",
    "riskReduction": "10-25% risk reduction",
    "evidence": "Citation or study reference",
    "starterPlan": [
      { "week": "Week 1-2", "activity": "Description", "duration": "Minutes" }
    ],
    "tips": ["3-4 practical tips"]
  },
  "nutrition": {
    "headline": "Short headline",
    "keyPrinciples": ["3-5 evidence-based principles"],
    "foods_to_emphasize": ["List"],
    "foods_to_limit": ["List"],
    "evidence": "Citation",
    "myths": [
      { "myth": "Common myth", "reality": "Evidence-based truth" }
    ]
  },
  "alcohol": {
    "headline": "Short headline",
    "currentRisk": "Personalized risk statement based on their intake",
    "recommendation": "Specific recommendation",
    "riskReduction": "Quantified reduction if they change",
    "evidence": "Citation"
  },
  "environment": {
    "headline": "Short headline",
    "actionableSteps": [
      { "step": "What to do", "why": "Brief rationale", "priority": "high/medium/low" }
    ],
    "overblown": [
      { "concern": "Common worry", "reality": "Evidence-based perspective" }
    ]
  }
}`,
    }],
  });

  const text = msg.content[0].type === 'text' ? msg.content[0].text : '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  const lifestyle = jsonMatch ? JSON.parse(jsonMatch[0]) : { exercise: {}, nutrition: {}, alcohol: {}, environment: {} };

  await redis.set(cacheKey, JSON.stringify(lifestyle), 'EX', 7 * 24 * 60 * 60);
  return lifestyle;
}

// ============================================================================
// Testing Recommendations + Genomic Profile
// ============================================================================

/**
 * Get genetic testing recommendations based on profile.
 */
export async function getTestingRecommendations(userId: string) {
  const patient = await prisma.patient.findUnique({ where: { userId } });
  if (!patient) return null;

  const profile = await prisma.preventProfile.findUnique({ where: { patientId: patient.id } });
  if (!profile) return null;

  const familyHistory = typeof profile.familyHistory === 'string'
    ? JSON.parse(profile.familyHistory)
    : profile.familyHistory ?? {};

  const firstDegree = familyHistory.firstDegreeCount ?? 0;
  const knownBrca = familyHistory.knownBrcaMutation === true;

  // NCCN criteria for genetic testing
  const criteria: string[] = [];
  let recommended = false;
  let urgency = 'routine';

  if (knownBrca) {
    criteria.push('Known BRCA mutation in family');
    recommended = true;
    urgency = 'high';
  }

  if (firstDegree >= 2) {
    criteria.push('Two or more first-degree relatives with breast cancer');
    recommended = true;
    urgency = 'high';
  }

  if (firstDegree >= 1) {
    criteria.push('First-degree relative with breast cancer');
    recommended = true;
  }

  if (profile.atypicalHyperplasia) {
    criteria.push('History of atypical hyperplasia');
    recommended = true;
  }

  if (profile.lcis) {
    criteria.push('History of LCIS');
    recommended = true;
  }

  if (profile.chestRadiation) {
    criteria.push('Prior chest radiation exposure');
    recommended = true;
  }

  const recommendedTests = recommended
    ? ['BRCA1/BRCA2', 'PALB2', 'ATM', 'CHEK2', 'TP53']
    : [];

  const rationale = recommended
    ? 'Based on your personal and family history, genetic testing may help clarify your risk and guide screening decisions.'
    : 'Based on your current profile, genetic testing is not strongly indicated. You may still request testing — discuss with a genetic counselor.';

  const resources = [
    { name: 'FORCE (Facing Our Risk of Cancer Empowered)', url: 'https://www.facingourrisk.org', description: 'Support and information for hereditary cancer' },
    { name: 'National Society of Genetic Counselors', url: 'https://www.nsgc.org', description: 'Find a genetic counselor near you' },
    { name: 'InformedDNA', url: 'https://www.informeddna.com', description: 'Telehealth genetic counseling' },
  ];

  return {
    recommended,
    urgency,
    rationale,
    recommendedTests,
    criteria,
    resources,
  };
}

/**
 * Get genomic profile for a user.
 */
export async function getPreventGenomicProfile(userId: string) {
  const patient = await prisma.patient.findUnique({ where: { userId } });
  if (!patient) return null;
  return prisma.genomicProfile.findUnique({ where: { patientId: patient.id } });
}

/**
 * Update family history on the prevent profile.
 */
export async function updateFamilyHistory(userId: string, familyHistory: any) {
  const patient = await prisma.patient.findUnique({ where: { userId } });
  if (!patient) throw new Error('Patient not found');

  return prisma.preventProfile.update({
    where: { patientId: patient.id },
    data: { familyHistory },
  });
}

// ============================================================================
// Genotype File Upload + Parsing
// ============================================================================

const MAX_GENOTYPE_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const ALLOWED_CONTENT_TYPES = [
  'text/plain',
  'text/tab-separated-values',
  'text/csv',
  'application/octet-stream',
  'application/x-gzip',
];

/**
 * Request a presigned S3 URL for uploading a raw genotype file.
 */
export async function requestGenotypeUploadUrl(
  userId: string,
  filename: string,
  contentType: string,
  fileSize: number
): Promise<{ uploadUrl: string; s3Key: string; documentUploadId: string }> {
  if (fileSize > MAX_GENOTYPE_FILE_SIZE) {
    throw new Error('File too large. Maximum genotype file size is 50MB.');
  }

  if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
    throw new Error(`Unsupported file type: ${contentType}. Please upload a .txt, .csv, .tsv, or .vcf file.`);
  }

  const patient = await prisma.patient.findUnique({ where: { userId } });
  if (!patient) throw new Error('Patient not found');

  const ext = filename.split('.').pop() ?? 'txt';
  const s3Key = `genotype/${patient.id}/${randomUUID()}.${ext}`;

  const result = await generatePresignedUploadUrl(s3Key, contentType);

  // Create DocumentUpload record
  const doc = await prisma.documentUpload.create({
    data: {
      patientId: patient.id,
      documentType: DOCUMENT_TYPES.GENOTYPE_RAW,
      s3Key: result.s3Key,
      s3Bucket: result.bucket,
      mimeType: contentType,
      extractionStatus: 'pending',
    },
  });

  // Upsert GenomicProfile with uploading status
  await prisma.genomicProfile.upsert({
    where: { patientId: patient.id },
    update: {
      rawFileS3Key: s3Key,
      parsingStatus: 'uploading',
    },
    create: {
      patientId: patient.id,
      rawFileS3Key: s3Key,
      parsingStatus: 'uploading',
    },
  });

  return {
    uploadUrl: result.uploadUrl,
    s3Key: result.s3Key,
    documentUploadId: doc.id,
  };
}

/**
 * Parse an uploaded genotype file from S3 and populate GenomicProfile.
 */
export async function processGenotypeFile(
  userId: string,
  s3Key: string,
  documentUploadId: string
) {
  const patient = await prisma.patient.findUnique({ where: { userId } });
  if (!patient) throw new Error('Patient not found');

  const genomicProfile = await prisma.genomicProfile.findUnique({
    where: { patientId: patient.id },
  });
  if (!genomicProfile) throw new Error('Genomic profile not found. Request upload URL first.');

  // Update status to parsing
  await prisma.genomicProfile.update({
    where: { patientId: patient.id },
    data: { parsingStatus: 'parsing' },
  });

  try {
    // Download and parse
    const text = await downloadS3AsText(s3Key);
    const parsed = parseRawGenotype(text);

    if (parsed.format === 'unknown') {
      await prisma.genomicProfile.update({
        where: { patientId: patient.id },
        data: { parsingStatus: 'failed' },
      });
      throw new Error('Unrecognized genotype file format. Supported formats: 23andMe, AncestryDNA, VCF.');
    }

    // Map format to data source display name
    const dataSourceMap: Record<string, string> = {
      '23andme': '23andMe',
      ancestry: 'AncestryDNA',
      vcf: 'VCF',
    };

    // Update GenomicProfile with parsed results
    const updated = await prisma.genomicProfile.update({
      where: { patientId: patient.id },
      data: {
        dataSource: dataSourceMap[parsed.format] ?? parsed.format,
        pathogenicVariants: parsed.pathogenicVariants as any,
        vusVariants: parsed.vusVariants as any,
        genesTested: parsed.genesTested,
        prsSnpDosages: parsed.prsSnpDosages,
        prsSnpCount: parsed.prsSnpCount,
        snpCount: parsed.totalSnpCount,
        parsingStatus: 'complete',
        extractedAt: new Date(),
      },
    });

    // Auto-calculate PRS if SNP dosages were extracted
    let finalProfile = updated;
    if (parsed.prsSnpCount > 0) {
      const preventProfile = await prisma.preventProfile.findUnique({
        where: { patientId: patient.id },
        select: { ethnicity: true },
      });
      const prsResult = calculatePrs(
        parsed.prsSnpDosages,
        preventProfile?.ethnicity ?? undefined,
      );
      finalProfile = await prisma.genomicProfile.update({
        where: { patientId: patient.id },
        data: {
          prsValue: prsResult.standardizedScore,
          prsPercentile: prsResult.percentile,
          prsModelVersion: 'mavaddat_2019_313',
          prsAncestryCalibration: prsResult.ancestryCalibration,
          prsConfidence: prsResult.confidence,
          prsRiskMultiplier: prsResult.riskMultiplier,
        },
      });
    }

    // Auto-trigger composite risk recalculation
    try { await runCompositeRiskAssessment(patient.id); } catch (_) { /* non-fatal */ }

    // Update DocumentUpload status
    await prisma.documentUpload.update({
      where: { id: documentUploadId },
      data: { extractionStatus: 'completed' },
    });

    return finalProfile;
  } catch (err) {
    // If parsing failed with a known error, status is already 'failed'
    // For unexpected errors, mark as failed
    const current = await prisma.genomicProfile.findUnique({
      where: { patientId: patient.id },
      select: { parsingStatus: true },
    });
    if (current?.parsingStatus !== 'failed') {
      await prisma.genomicProfile.update({
        where: { patientId: patient.id },
        data: { parsingStatus: 'failed' },
      });
    }

    await prisma.documentUpload.update({
      where: { id: documentUploadId },
      data: { extractionStatus: 'failed' },
    });

    throw err;
  }
}

/**
 * Manually calculate (or recalculate) PRS for a user.
 * Allows ancestry override for recalibration.
 */
export async function calculatePrsForUser(userId: string, ancestryOverride?: string) {
  const patient = await prisma.patient.findUnique({ where: { userId } });
  if (!patient) throw new Error('Patient not found');

  const genomicProfile = await prisma.genomicProfile.findUnique({
    where: { patientId: patient.id },
  });
  if (!genomicProfile?.prsSnpDosages) {
    throw new Error('No PRS data available. Upload a genotype file first.');
  }

  const ethnicity = ancestryOverride ?? (
    await prisma.preventProfile.findUnique({
      where: { patientId: patient.id },
      select: { ethnicity: true },
    })
  )?.ethnicity ?? undefined;

  const prsResult = calculatePrs(
    genomicProfile.prsSnpDosages as Record<string, number>,
    ethnicity,
  );

  const updated = await prisma.genomicProfile.update({
    where: { patientId: patient.id },
    data: {
      prsValue: prsResult.standardizedScore,
      prsPercentile: prsResult.percentile,
      prsModelVersion: 'mavaddat_2019_313',
      prsAncestryCalibration: prsResult.ancestryCalibration,
      prsConfidence: prsResult.confidence,
      prsRiskMultiplier: prsResult.riskMultiplier,
    },
  });

  // Auto-trigger composite risk recalculation
  try { await runCompositeRiskAssessment(patient.id); } catch (_) { /* non-fatal */ }

  return updated;
}
