/**
 * PREVENT Manager — Profile + Risk Assessment CRUD
 *
 * Handles prevention profile creation, risk assessment storage,
 * location history, and data consent management.
 */

import { prisma } from './db';
import {
  calculateGailRisk,
  projectTrajectory,
  analyzeModifiableFactors,
  type GailInputs,
} from './prevent-risk-engine';
import {
  calculateCompositeRisk,
  projectCompositeTrajectory,
} from './composite-risk-engine';

// ============================================================================
// Profile Management
// ============================================================================

/**
 * Create a prevention profile and run initial risk assessment.
 */
export async function createPreventProfile(userId: string, data: any) {
  const patient = await prisma.patient.findUnique({ where: { userId } });
  if (!patient) throw new Error('Patient not found');

  const profile = await prisma.preventProfile.create({
    data: {
      patientId: patient.id,
      ageAtMenarche: data.ageAtMenarche ?? null,
      pregnancies: data.pregnancies ?? null,
      ageAtFirstLiveBirth: data.ageAtFirstLiveBirth ?? null,
      breastfeedingMonths: data.breastfeedingMonths ?? null,
      menopausalStatus: data.menopausalStatus ?? null,
      ageAtMenopause: data.ageAtMenopause ?? null,
      ocEver: data.ocEver ?? null,
      ocCurrent: data.ocCurrent ?? null,
      ocTotalYears: data.ocTotalYears ?? null,
      hrtEver: data.hrtEver ?? null,
      hrtCurrent: data.hrtCurrent ?? null,
      hrtType: data.hrtType ?? null,
      hrtTotalYears: data.hrtTotalYears ?? null,
      previousBiopsies: data.previousBiopsies ?? null,
      atypicalHyperplasia: data.atypicalHyperplasia ?? null,
      lcis: data.lcis ?? null,
      chestRadiation: data.chestRadiation ?? null,
      breastDensity: data.breastDensity ?? null,
      bmi: data.bmi ?? null,
      alcoholDrinksPerWeek: data.alcoholDrinksPerWeek ?? null,
      exerciseMinutesPerWeek: data.exerciseMinutesPerWeek ?? null,
      smokingStatus: data.smokingStatus ?? null,
      familyHistory: data.familyHistory ?? null,
      ethnicity: data.ethnicity ?? null,
      onboardingCompletedAt: new Date(),
      onboardingTier: 'complete',
    },
  });

  // Run initial risk assessment
  await runRiskAssessment(patient.id, profile);

  return profile;
}

/**
 * Get prevention profile for a user.
 */
export async function getPreventProfile(userId: string) {
  const patient = await prisma.patient.findUnique({ where: { userId } });
  if (!patient) return null;
  return prisma.preventProfile.findUnique({ where: { patientId: patient.id } });
}

/**
 * Update prevention profile and re-run risk assessment.
 */
export async function updatePreventProfile(userId: string, updates: any) {
  const patient = await prisma.patient.findUnique({ where: { userId } });
  if (!patient) throw new Error('Patient not found');

  const profile = await prisma.preventProfile.update({
    where: { patientId: patient.id },
    data: {
      ...updates,
      updatedAt: new Date(),
    },
  });

  // Re-run risk assessment with updated profile
  await runRiskAssessment(patient.id, profile);

  return profile;
}

// ============================================================================
// Risk Assessment
// ============================================================================

/**
 * Run Gail model risk assessment and store results.
 */
async function runRiskAssessment(patientId: string, profile: any) {
  const patient = await prisma.patient.findUnique({ where: { id: patientId } });
  if (!patient) return null;

  // Compute current age from DOB or default
  const dob = patient.dateOfBirth;
  const currentAge = dob
    ? Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : 50; // default if no DOB

  // Extract first-degree relatives count from family history JSON
  let firstDegreeRelatives = 0;
  if (profile.familyHistory) {
    const fh = typeof profile.familyHistory === 'string'
      ? JSON.parse(profile.familyHistory)
      : profile.familyHistory;
    if (Array.isArray(fh)) {
      firstDegreeRelatives = fh.filter(
        (r: any) => r.relationship === 'mother' || r.relationship === 'sister' || r.relationship === 'daughter'
      ).length;
    } else if (typeof fh === 'object' && fh.firstDegreeCount != null) {
      firstDegreeRelatives = fh.firstDegreeCount;
    }
  }

  const gailInputs: GailInputs = {
    currentAge,
    ageAtMenarche: profile.ageAtMenarche,
    ageAtFirstLiveBirth: profile.ageAtFirstLiveBirth,
    previousBiopsies: profile.previousBiopsies ?? 0,
    atypicalHyperplasia: profile.atypicalHyperplasia ?? false,
    firstDegreeRelatives,
    ethnicity: profile.ethnicity || 'white',
  };

  const risk = calculateGailRisk(gailInputs);
  const trajectory = projectTrajectory(gailInputs, currentAge);
  const modifiableFactors = analyzeModifiableFactors({
    bmi: profile.bmi,
    alcoholDrinksPerWeek: profile.alcoholDrinksPerWeek,
    exerciseMinutesPerWeek: profile.exerciseMinutesPerWeek,
    smokingStatus: profile.smokingStatus,
    hrtCurrent: profile.hrtCurrent,
    hrtType: profile.hrtType,
  });

  return prisma.riskAssessment.create({
    data: {
      patientId,
      modelVersion: 'gail_v1',
      gailInputs: gailInputs as any,
      lifetimeRiskEstimate: risk.lifetimeRiskEstimate,
      lifetimeRiskCiLow: risk.lifetimeRiskCiLow,
      lifetimeRiskCiHigh: risk.lifetimeRiskCiHigh,
      fiveYearRiskEstimate: risk.fiveYearRiskEstimate,
      tenYearRiskEstimate: risk.tenYearRiskEstimate,
      riskCategory: risk.riskCategory,
      riskTrajectory: trajectory as any,
      modifiableFactors: modifiableFactors as any,
      fullAssessment: risk as any,
    },
  });
}

/**
 * Run composite risk assessment integrating Gail model + genomic data.
 * Called after PRS calculation or pathogenic variant detection.
 */
export async function runCompositeRiskAssessment(patientId: string) {
  const patient = await prisma.patient.findUnique({ where: { id: patientId } });
  if (!patient) return null;

  const profile = await prisma.preventProfile.findUnique({
    where: { patientId },
  });
  if (!profile) return null;

  const genomicProfile = await prisma.genomicProfile.findUnique({
    where: { patientId },
  });

  // Compute current age
  const dob = patient.dateOfBirth;
  const currentAge = dob
    ? Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : 50;

  // Extract first-degree relatives count
  let firstDegreeRelatives = 0;
  if (profile.familyHistory) {
    const fh = typeof profile.familyHistory === 'string'
      ? JSON.parse(profile.familyHistory as string)
      : profile.familyHistory;
    if (Array.isArray(fh)) {
      firstDegreeRelatives = fh.filter(
        (r: any) => r.relationship === 'mother' || r.relationship === 'sister' || r.relationship === 'daughter'
      ).length;
    } else if (typeof fh === 'object' && (fh as any).firstDegreeCount != null) {
      firstDegreeRelatives = (fh as any).firstDegreeCount;
    }
  }

  const gailInputs: GailInputs = {
    currentAge,
    ageAtMenarche: profile.ageAtMenarche,
    ageAtFirstLiveBirth: profile.ageAtFirstLiveBirth,
    previousBiopsies: profile.previousBiopsies ?? 0,
    atypicalHyperplasia: profile.atypicalHyperplasia ?? false,
    firstDegreeRelatives,
    ethnicity: profile.ethnicity || 'white',
  };

  const compositeResult = calculateCompositeRisk(gailInputs, genomicProfile);

  // Project trajectory with effective multiplier
  const effectiveMultiplier = compositeResult.genomicComponents?.effectiveMultiplier ?? 1.0;
  const trajectory = compositeResult.modelVersion === 'composite_v1'
    ? projectCompositeTrajectory(gailInputs, currentAge, effectiveMultiplier)
    : projectTrajectory(gailInputs, currentAge);

  const modifiableFactors = analyzeModifiableFactors({
    bmi: profile.bmi,
    alcoholDrinksPerWeek: profile.alcoholDrinksPerWeek,
    exerciseMinutesPerWeek: profile.exerciseMinutesPerWeek,
    smokingStatus: profile.smokingStatus,
    hrtCurrent: profile.hrtCurrent,
    hrtType: profile.hrtType,
  });

  return prisma.riskAssessment.create({
    data: {
      patientId,
      modelVersion: compositeResult.modelVersion,
      gailInputs: gailInputs as any,
      lifetimeRiskEstimate: compositeResult.lifetimeRiskEstimate,
      lifetimeRiskCiLow: compositeResult.lifetimeRiskCiLow,
      lifetimeRiskCiHigh: compositeResult.lifetimeRiskCiHigh,
      fiveYearRiskEstimate: compositeResult.fiveYearRiskEstimate,
      tenYearRiskEstimate: compositeResult.tenYearRiskEstimate,
      riskCategory: compositeResult.riskCategory,
      riskTrajectory: trajectory as any,
      modifiableFactors: modifiableFactors as any,
      fullAssessment: compositeResult as any,
    },
  });
}

/**
 * Recalculate risk for a user (manual trigger).
 * Uses composite engine if genomic data is available.
 */
export async function recalculateRisk(userId: string) {
  const patient = await prisma.patient.findUnique({ where: { userId } });
  if (!patient) throw new Error('Patient not found');
  const result = await runCompositeRiskAssessment(patient.id);
  if (!result) throw new Error('Could not calculate risk. Complete your prevention profile first.');
  return result;
}

/**
 * Get risk assessment history for a user.
 */
export async function getRiskAssessments(userId: string) {
  const patient = await prisma.patient.findUnique({ where: { userId } });
  if (!patient) return [];
  return prisma.riskAssessment.findMany({
    where: { patientId: patient.id },
    orderBy: { assessmentDate: 'desc' },
  });
}

/**
 * Get latest risk assessment for a user.
 */
export async function getLatestRisk(userId: string) {
  const patient = await prisma.patient.findUnique({ where: { userId } });
  if (!patient) return null;
  return prisma.riskAssessment.findFirst({
    where: { patientId: patient.id },
    orderBy: { assessmentDate: 'desc' },
  });
}

// ============================================================================
// Location History
// ============================================================================

/**
 * Save location history entries (batch upsert).
 */
export async function saveLocationHistory(userId: string, locations: any[]) {
  const patient = await prisma.patient.findUnique({ where: { userId } });
  if (!patient) throw new Error('Patient not found');

  const results = [];
  for (const loc of locations) {
    const entry = await prisma.locationHistory.create({
      data: {
        patientId: patient.id,
        zipCode: loc.zipCode,
        state: loc.state ?? null,
        moveInDate: loc.moveInDate ? new Date(loc.moveInDate) : null,
        moveOutDate: loc.moveOutDate ? new Date(loc.moveOutDate) : null,
        residenceType: loc.residenceType ?? null,
        waterSource: loc.waterSource ?? null,
        nearbyIndustry: loc.nearbyIndustry ?? [],
        agriculturalProximity: loc.agriculturalProximity ?? null,
        lifeStages: loc.lifeStages ?? [],
        durationMonths: loc.durationMonths ?? null,
        consentResearchUse: loc.consentResearchUse ?? false,
      },
    });
    results.push(entry);
  }
  return results;
}

/**
 * Get location history for a user.
 */
export async function getLocationHistory(userId: string) {
  const patient = await prisma.patient.findUnique({ where: { userId } });
  if (!patient) return [];
  return prisma.locationHistory.findMany({
    where: { patientId: patient.id },
    orderBy: { moveInDate: 'desc' },
  });
}

// ============================================================================
// Data Consent
// ============================================================================

/**
 * Get data consent for a user (create default level 1 if none).
 */
export async function getDataConsent(userId: string) {
  const patient = await prisma.patient.findUnique({ where: { userId } });
  if (!patient) return null;

  let consent = await prisma.dataConsent.findUnique({ where: { patientId: patient.id } });
  if (!consent) {
    consent = await prisma.dataConsent.create({
      data: { patientId: patient.id, consentLevel: 1 },
    });
  }
  return consent;
}

/**
 * Update data consent level (1-4).
 */
export async function updateDataConsent(userId: string, level: number) {
  const patient = await prisma.patient.findUnique({ where: { userId } });
  if (!patient) throw new Error('Patient not found');

  const clampedLevel = Math.max(1, Math.min(4, level));

  return prisma.dataConsent.upsert({
    where: { patientId: patient.id },
    update: {
      consentLevel: clampedLevel,
      consentedAt: new Date(),
      withdrawnAt: clampedLevel === 1 ? new Date() : null,
    },
    create: {
      patientId: patient.id,
      consentLevel: clampedLevel,
    },
  });
}
