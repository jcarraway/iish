import { Resend } from 'resend';
import { prisma } from './db';
import { redis } from './redis';
import { anthropic, CLAUDE_MODEL } from './ai';
import type { PatientProfile } from '@oncovax/shared';

// ============================================================================
// Types
// ============================================================================

interface SubmitReportInput {
  reportType: string;
  consentScope: string;
  structuredData: any;
  narrative?: string;
  relatedDrug?: string;
  relatedTrialNctId?: string;
  relatedItemId?: string;
}

interface DigestItem {
  itemId: string;
  headline: string;
  summary: string;
  maturityBadge: string;
  relevanceReason?: string;
  viewUrl: string;
}

interface DigestContent {
  urgent: DigestItem[];
  personallyRelevant: DigestItem[];
  landscapeHighlights: DigestItem[];
  communityHighlights: DigestItem[];
  trialUpdates: DigestItem[];
  totalNewItems: number;
}

interface CommunityInsightSideEffect {
  effect: string;
  reportedByPercent: number;
  averageSeverity: number;
  averageOnset: string | null;
  resolvedPercent: number;
  topManagementTips: string[];
}

interface CommunityTrialSummary {
  totalReports: number;
  averageRating: number;
  commonPros: string[];
  commonCons: string[];
}

interface CommunityInsight {
  drugName: string;
  totalReports: number;
  averageRating: number | null;
  commonSideEffects: CommunityInsightSideEffect[];
  trialSummary: CommunityTrialSummary | null;
}

interface TrialInsight {
  nctId: string;
  totalReports: number;
  averageRating: number;
  commonPros: string[];
  commonCons: string[];
  averageDuration: string | null;
}

// ============================================================================
// Resend client
// ============================================================================

const resend = new Resend(process.env.RESEND_API_KEY!);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@oncovax.com';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// ============================================================================
// Validation constants
// ============================================================================

const VALID_REPORT_TYPES = ['treatment_experience', 'trial_participation', 'side_effect'] as const;
const VALID_CONSENT_SCOPES = ['platform_only', 'research_anonymized', 'public'] as const;
const VALID_MODERATION_STATUSES = ['pending', 'approved', 'flagged', 'removed'] as const;
const VALID_DIGEST_FREQUENCIES = [null, 'daily', 'weekly', 'monthly'] as const;

// ============================================================================
// 1. submitCommunityReport
// ============================================================================

export async function submitCommunityReport(
  patientId: string,
  input: SubmitReportInput,
): Promise<any> {
  // Validate reportType
  if (!VALID_REPORT_TYPES.includes(input.reportType as any)) {
    throw new Error(`Invalid reportType: ${input.reportType}. Must be one of: ${VALID_REPORT_TYPES.join(', ')}`);
  }

  // Validate consentScope
  if (!VALID_CONSENT_SCOPES.includes(input.consentScope as any)) {
    throw new Error(`Invalid consentScope: ${input.consentScope}. Must be one of: ${VALID_CONSENT_SCOPES.join(', ')}`);
  }

  // Auto-verify: check if relatedDrug matches a priorTreatment name from patient profile
  let verified = false;
  if (input.relatedDrug) {
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      select: { profile: true },
    });
    if (patient?.profile) {
      const profile = patient.profile as unknown as PatientProfile;
      const drugLower = input.relatedDrug.toLowerCase();
      if (profile.priorTreatments) {
        for (const tx of profile.priorTreatments) {
          const names = tx.name.split(/\s*\+\s*/);
          if (names.some(n => n.trim().toLowerCase() === drugLower)) {
            verified = true;
            break;
          }
        }
      }
    }
  }

  // Basic moderation: flag long narratives
  let moderationStatus = 'pending';
  if (input.narrative && input.narrative.length > 5000) {
    moderationStatus = 'flagged';
  }

  const report = await prisma.communityReport.create({
    data: {
      patientId,
      reportType: input.reportType,
      consentScope: input.consentScope,
      structuredData: input.structuredData,
      narrative: input.narrative ?? null,
      moderationStatus,
      verified,
      relatedDrug: input.relatedDrug ?? null,
      relatedTrialNctId: input.relatedTrialNctId ?? null,
      relatedItemId: input.relatedItemId ?? null,
    },
  });

  return report;
}

// ============================================================================
// 2. getCommunityReports
// ============================================================================

export async function getCommunityReports(patientId: string): Promise<any[]> {
  return prisma.communityReport.findMany({
    where: { patientId },
    orderBy: { createdAt: 'desc' },
  });
}

// ============================================================================
// 3. getCommunityReportsByDrug
// ============================================================================

export async function getCommunityReportsByDrug(
  drug: string,
  limit = 20,
): Promise<any[]> {
  return prisma.communityReport.findMany({
    where: {
      relatedDrug: { contains: drug, mode: 'insensitive' },
      moderationStatus: 'approved',
      consentScope: { not: 'platform_only' },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

// ============================================================================
// 4. moderateReport
// ============================================================================

export async function moderateReport(
  reportId: string,
  status: string,
): Promise<any> {
  if (!VALID_MODERATION_STATUSES.includes(status as any)) {
    throw new Error(`Invalid moderation status: ${status}. Must be one of: ${VALID_MODERATION_STATUSES.join(', ')}`);
  }

  return prisma.communityReport.update({
    where: { id: reportId },
    data: { moderationStatus: status },
  });
}

// ============================================================================
// 5. getDrugInsights
// ============================================================================

export async function getDrugInsights(drugName: string): Promise<CommunityInsight> {
  // Load approved reports matching the drug (case-insensitive)
  const reports = await prisma.communityReport.findMany({
    where: {
      relatedDrug: { contains: drugName, mode: 'insensitive' },
      moderationStatus: 'approved',
    },
  });

  const totalReports = reports.length;

  // Average rating from treatment_experience reports
  const experienceReports = reports.filter(r => r.reportType === 'treatment_experience');
  let averageRating: number | null = null;
  if (experienceReports.length > 0) {
    const ratings = experienceReports
      .map(r => (r.structuredData as any)?.rating)
      .filter((r): r is number => typeof r === 'number');
    if (ratings.length > 0) {
      averageRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
    }
  }

  // Aggregate side effects from side_effect reports AND treatment_experience reports
  const sideEffectMap = new Map<string, {
    count: number;
    severities: number[];
    onsets: string[];
    resolvedCount: number;
    managementTips: string[];
  }>();

  for (const report of reports) {
    const data = report.structuredData as any;
    let sideEffects: any[] = [];

    if (report.reportType === 'side_effect') {
      // Side effect report — the structuredData is the side effect itself
      if (data.effect) {
        sideEffects = [data];
      }
    } else if (report.reportType === 'treatment_experience' && Array.isArray(data.sideEffects)) {
      sideEffects = data.sideEffects;
    }

    for (const se of sideEffects) {
      if (!se.effect) continue;
      const key = se.effect.toLowerCase().trim();
      const existing = sideEffectMap.get(key) || {
        count: 0,
        severities: [],
        onsets: [],
        resolvedCount: 0,
        managementTips: [],
      };

      existing.count++;
      if (typeof se.severity === 'number') existing.severities.push(se.severity);
      if (se.onset) existing.onsets.push(se.onset);
      if (se.resolved === true) existing.resolvedCount++;
      if (se.managementTips) {
        const tips = Array.isArray(se.managementTips) ? se.managementTips : [se.managementTips];
        for (const tip of tips) {
          if (typeof tip === 'string' && !existing.managementTips.includes(tip)) {
            existing.managementTips.push(tip);
          }
        }
      }

      sideEffectMap.set(key, existing);
    }
  }

  const totalReportingEffects = reports.filter(r =>
    r.reportType === 'side_effect' || r.reportType === 'treatment_experience',
  ).length;

  const commonSideEffects: CommunityInsightSideEffect[] = Array.from(sideEffectMap.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10)
    .map(([effect, data]) => ({
      effect,
      reportedByPercent: totalReportingEffects > 0
        ? Math.round((data.count / totalReportingEffects) * 100)
        : 0,
      averageSeverity: data.severities.length > 0
        ? data.severities.reduce((s, v) => s + v, 0) / data.severities.length
        : 0,
      averageOnset: data.onsets.length > 0 ? data.onsets[0] : null,
      resolvedPercent: data.count > 0
        ? Math.round((data.resolvedCount / data.count) * 100)
        : 0,
      topManagementTips: data.managementTips.slice(0, 5),
    }));

  // Trial summary: aggregate trial_participation reports referencing this drug
  const trialReports = reports.filter(r => r.reportType === 'trial_participation');
  let trialSummary: CommunityTrialSummary | null = null;
  if (trialReports.length > 0) {
    const trialRatings = trialReports
      .map(r => (r.structuredData as any)?.rating)
      .filter((r): r is number => typeof r === 'number');

    const prosMap = new Map<string, number>();
    const consMap = new Map<string, number>();
    for (const tr of trialReports) {
      const data = tr.structuredData as any;
      if (Array.isArray(data.pros)) {
        for (const p of data.pros) {
          prosMap.set(p, (prosMap.get(p) || 0) + 1);
        }
      }
      if (Array.isArray(data.cons)) {
        for (const c of data.cons) {
          consMap.set(c, (consMap.get(c) || 0) + 1);
        }
      }
    }

    trialSummary = {
      totalReports: trialReports.length,
      averageRating: trialRatings.length > 0
        ? trialRatings.reduce((s, r) => s + r, 0) / trialRatings.length
        : 0,
      commonPros: Array.from(prosMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([p]) => p),
      commonCons: Array.from(consMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([c]) => c),
    };
  }

  return {
    drugName,
    totalReports,
    averageRating,
    commonSideEffects,
    trialSummary,
  };
}

// ============================================================================
// 6. getTrialInsights
// ============================================================================

export async function getTrialInsights(nctId: string): Promise<TrialInsight | null> {
  const reports = await prisma.communityReport.findMany({
    where: {
      reportType: 'trial_participation',
      relatedTrialNctId: nctId,
      moderationStatus: 'approved',
    },
  });

  if (reports.length === 0) return null;

  const ratings = reports
    .map(r => (r.structuredData as any)?.rating)
    .filter((r): r is number => typeof r === 'number');

  const prosMap = new Map<string, number>();
  const consMap = new Map<string, number>();
  const durations: string[] = [];

  for (const report of reports) {
    const data = report.structuredData as any;
    if (Array.isArray(data.pros)) {
      for (const p of data.pros) {
        prosMap.set(p, (prosMap.get(p) || 0) + 1);
      }
    }
    if (Array.isArray(data.cons)) {
      for (const c of data.cons) {
        consMap.set(c, (consMap.get(c) || 0) + 1);
      }
    }
    if (data.duration) durations.push(data.duration);
  }

  return {
    nctId,
    totalReports: reports.length,
    averageRating: ratings.length > 0
      ? ratings.reduce((s, r) => s + r, 0) / ratings.length
      : 0,
    commonPros: Array.from(prosMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([p]) => p),
    commonCons: Array.from(consMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([c]) => c),
    averageDuration: durations.length > 0 ? durations[0] : null,
  };
}

// ============================================================================
// 7. getCommunityInsightsForItem
// ============================================================================

export async function getCommunityInsightsForItem(
  itemId: string,
): Promise<CommunityInsight | null> {
  const item = await prisma.researchItem.findUnique({
    where: { id: itemId },
    select: { drugNames: true },
  });

  if (!item || !item.drugNames || item.drugNames.length === 0) return null;

  // Find approved community reports matching any of the item's drug names
  for (const drug of item.drugNames) {
    const matchCount = await prisma.communityReport.count({
      where: {
        relatedDrug: { contains: drug, mode: 'insensitive' },
        moderationStatus: 'approved',
      },
    });

    if (matchCount > 0) {
      return getDrugInsights(drug);
    }
  }

  return null;
}

// ============================================================================
// 8. compileDigest
// ============================================================================

export async function compileDigest(
  userId: string,
  period: string,
): Promise<DigestContent> {
  // 1. Load user and related data
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      patient: { select: { id: true, profile: true } },
      feedConfig: true,
    },
  });

  if (!user || !user.patient) {
    return { urgent: [], personallyRelevant: [], landscapeHighlights: [], communityHighlights: [], trialUpdates: [], totalNewItems: 0 };
  }

  const profile = user.patient.profile as unknown as PatientProfile | null;
  const patientId = user.patient.id;

  // 2. Determine period start
  const now = new Date();
  const periodStart = new Date(now);
  if (period === 'daily') {
    periodStart.setDate(periodStart.getDate() - 1);
  } else if (period === 'weekly') {
    periodStart.setDate(periodStart.getDate() - 7);
  } else {
    periodStart.setDate(periodStart.getDate() - 30);
  }

  // 3. Load recent ResearchItems published since periodStart
  const recentItems = await prisma.researchItem.findMany({
    where: {
      classificationStatus: 'complete',
      publishedAt: { gte: periodStart },
    },
    orderBy: { publishedAt: 'desc' },
  });

  // 4. Load FeedRelevance scores for user
  const relevances = await prisma.feedRelevance.findMany({
    where: { userId },
    orderBy: { relevanceScore: 'desc' },
  });
  const relevanceMap = new Map(relevances.map(r => [r.itemId, r]));

  // Extract patient drugs from profile
  const patientDrugs: string[] = [];
  if (profile?.priorTreatments) {
    const nowDate = new Date();
    for (const tx of profile.priorTreatments) {
      const isActive = !tx.endDate || new Date(tx.endDate) > nowDate;
      if (isActive) {
        const names = tx.name.split(/\s*\+\s*/);
        for (const n of names) {
          const trimmed = n.trim().toLowerCase();
          if (trimmed && !patientDrugs.includes(trimmed)) patientDrugs.push(trimmed);
        }
      }
    }
  }

  const cancerType = profile?.cancerTypeNormalized?.toLowerCase() || profile?.cancerType?.toLowerCase() || '';

  // Helper to build a DigestItem from a ResearchItem
  function itemToDigest(item: any, relevanceReason?: string): DigestItem {
    return {
      itemId: item.id,
      headline: item.title,
      summary: item.patientSummary || item.title,
      maturityBadge: item.maturityTier || 'T5',
      relevanceReason,
      viewUrl: `${APP_URL}/intel/${item.id}`,
    };
  }

  // 5a. Urgent: safety_alert items matching user's drug names
  const urgent: DigestItem[] = [];
  for (const item of recentItems) {
    if (item.practiceImpact === 'safety_alert') {
      const itemDrugs = (item.drugNames || []).map((d: string) => d.toLowerCase());
      if (patientDrugs.some(d => itemDrugs.includes(d))) {
        urgent.push(itemToDigest(item, 'Safety alert for a drug in your treatment'));
      }
    }
  }

  // 5b. Personally relevant: top 5 by relevance score published in period
  const recentItemIds = new Set(recentItems.map(i => i.id));
  const relevantInPeriod = relevances
    .filter(r => recentItemIds.has(r.itemId))
    .slice(0, 5);
  const personallyRelevant: DigestItem[] = [];
  for (const rel of relevantInPeriod) {
    const item = recentItems.find(i => i.id === rel.itemId);
    if (item) {
      personallyRelevant.push(
        itemToDigest(item, `Relevance score: ${rel.relevanceScore}`),
      );
    }
  }

  // 5c. Landscape highlights: top 3 by maturity (T1 > T2 > T3)
  const tierOrder: Record<string, number> = { T1: 1, T2: 2, T3: 3, T4: 4, T5: 5 };
  const landscapeSorted = [...recentItems].sort((a, b) => {
    const ta = tierOrder[a.maturityTier || 'T5'] || 5;
    const tb = tierOrder[b.maturityTier || 'T5'] || 5;
    return ta - tb;
  });
  const landscapeHighlights: DigestItem[] = landscapeSorted
    .slice(0, 3)
    .map(item => itemToDigest(item));

  // 5d. Community highlights: new approved CommunityReports for user's drugs/trials
  const communityHighlights: DigestItem[] = [];
  if (patientDrugs.length > 0) {
    const communityReports = await prisma.communityReport.findMany({
      where: {
        moderationStatus: 'approved',
        createdAt: { gte: periodStart },
        consentScope: { not: 'platform_only' },
        OR: patientDrugs.map(drug => ({
          relatedDrug: { contains: drug, mode: 'insensitive' as const },
        })),
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    for (const report of communityReports) {
      communityHighlights.push({
        itemId: report.id,
        headline: `${report.reportType.replace(/_/g, ' ')} report: ${report.relatedDrug || 'Unknown drug'}`,
        summary: report.narrative
          ? report.narrative.substring(0, 200) + (report.narrative.length > 200 ? '...' : '')
          : `A patient shared their ${report.reportType.replace(/_/g, ' ')} with ${report.relatedDrug || 'this treatment'}.`,
        maturityBadge: 'community',
        viewUrl: `${APP_URL}/intel/community/${report.id}`,
      });
    }
  }

  // 5e. Trial updates: clinicaltrials source items with user's cancer type
  const trialUpdates: DigestItem[] = [];
  if (cancerType) {
    const trialItems = recentItems.filter(item =>
      item.sourceType === 'clinicaltrials' &&
      item.cancerTypes.some((ct: string) => ct.toLowerCase().includes(cancerType)),
    );
    for (const item of trialItems.slice(0, 5)) {
      trialUpdates.push(itemToDigest(item, 'New clinical trial update'));
    }
  }

  return {
    urgent,
    personallyRelevant,
    landscapeHighlights,
    communityHighlights,
    trialUpdates,
    totalNewItems: recentItems.length,
  };
}

// ============================================================================
// 9. sendDigest
// ============================================================================

export async function sendDigest(userId: string): Promise<boolean> {
  // 1. Load UserFeedConfig — check digestFrequency
  const config = await prisma.userFeedConfig.findUnique({ where: { userId } });
  if (!config?.digestFrequency) return false;

  // 2. Load Patient for notification preferences
  const patient = await prisma.patient.findFirst({
    where: { userId },
    select: { id: true },
  });
  if (!patient) return false;

  const prefs = await prisma.notificationPreference.findUnique({
    where: { patientId: patient.id },
  });
  if (prefs && !prefs.researchAlerts) return false;

  // 3. Determine period from digestFrequency
  const period = config.digestFrequency;

  // 4. Build dedupe key
  const isoDate = new Date().toISOString().split('T')[0];
  const dedupeKey = `digest:${userId}:${period}:${isoDate}`;

  // Check dedupe
  const existing = await prisma.notificationLog.findFirst({
    where: { dedupeKey },
  });
  if (existing) return false;

  // 5. Compile digest
  const digest = await compileDigest(userId, period);

  // 6. If no sections have items, return false
  const hasContent = digest.urgent.length > 0 ||
    digest.personallyRelevant.length > 0 ||
    digest.landscapeHighlights.length > 0 ||
    digest.communityHighlights.length > 0 ||
    digest.trialUpdates.length > 0;
  if (!hasContent) return false;

  // 7. Build HTML email
  const frequencyLabel = period === 'daily' ? 'Daily' : period === 'weekly' ? 'Weekly' : 'Monthly';
  const subject = `Your ${frequencyLabel.toLowerCase()} research digest — ${digest.totalNewItems} new items`;

  let html = `<p>Hi there,</p>
<p>Here's your ${frequencyLabel.toLowerCase()} research digest with ${digest.totalNewItems} new research items.</p>`;

  if (digest.urgent.length > 0) {
    html += `<h3 style="color: #dc2626;">Urgent: Safety Alerts</h3><ul>`;
    for (const item of digest.urgent) {
      html += `<li><strong><a href="${item.viewUrl}">${item.headline}</a></strong><br>${item.summary}${item.relevanceReason ? ` <em>(${item.relevanceReason})</em>` : ''}</li>`;
    }
    html += `</ul>`;
  }

  if (digest.personallyRelevant.length > 0) {
    html += `<h3>Personally Relevant</h3><ul>`;
    for (const item of digest.personallyRelevant) {
      html += `<li><a href="${item.viewUrl}">${item.headline}</a> [${item.maturityBadge}]<br>${item.summary}</li>`;
    }
    html += `</ul>`;
  }

  if (digest.landscapeHighlights.length > 0) {
    html += `<h3>Research Landscape</h3><ul>`;
    for (const item of digest.landscapeHighlights) {
      html += `<li><a href="${item.viewUrl}">${item.headline}</a> [${item.maturityBadge}]<br>${item.summary}</li>`;
    }
    html += `</ul>`;
  }

  if (digest.communityHighlights.length > 0) {
    html += `<h3>Community Reports</h3><ul>`;
    for (const item of digest.communityHighlights) {
      html += `<li><a href="${item.viewUrl}">${item.headline}</a><br>${item.summary}</li>`;
    }
    html += `<p><em>Based on reports from ${digest.communityHighlights.length} patients on this platform. Community reports are self-reported and not independently verified.</em></p>`;
  }

  if (digest.trialUpdates.length > 0) {
    html += `<h3>Clinical Trial Updates</h3><ul>`;
    for (const item of digest.trialUpdates) {
      html += `<li><a href="${item.viewUrl}">${item.headline}</a> [${item.maturityBadge}]<br>${item.summary}</li>`;
    }
    html += `</ul>`;
  }

  html += `<p><a href="${APP_URL}/intel">View your full research feed</a></p>
<p>Best,<br>OncoVax Care Team</p>`;

  // 8. Get user email, send via Resend
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });
  if (!user?.email) return false;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: user.email,
    subject,
    html,
  });

  // 9. Log to NotificationLog
  await prisma.notificationLog.create({
    data: {
      patientId: patient.id,
      category: 'research_digest',
      subject,
      dedupeKey,
    },
  });

  // 10. Return true
  return true;
}

// ============================================================================
// 10. updateDigestPreferences
// ============================================================================

export async function updateDigestPreferences(
  userId: string,
  frequency: string | null,
): Promise<any> {
  // Validate frequency
  if (frequency !== null && !['daily', 'weekly', 'monthly'].includes(frequency)) {
    throw new Error(`Invalid digest frequency: ${frequency}. Must be null, 'daily', 'weekly', or 'monthly'.`);
  }

  return prisma.userFeedConfig.upsert({
    where: { userId },
    create: { userId, digestFrequency: frequency },
    update: { digestFrequency: frequency },
  });
}
