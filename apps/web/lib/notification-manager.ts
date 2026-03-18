import { Resend } from 'resend';
import { anthropic, CLAUDE_MODEL } from './ai';
import { redis } from './redis';
import { prisma } from './db';
import { refreshSCP } from './scp-generator';
import type { PatientProfile } from '@oncovax/shared';

// ============================================================================
// Types
// ============================================================================

interface NotificationResults {
  surveillanceReminders: number;
  surveillanceOverdue: number;
  journalReminders: number;
  weeklySummaries: number;
  appointmentPrep: number;
  scpAnnualReviews: number;
  lifestyleCheckIns: number;
  phaseTransitions: number;
  errors: string[];
}

export interface SCPDiff {
  changedSections: string[];
  addedItems: string[];
  removedItems: string[];
  summary: string;
}

// ============================================================================
// Resend client
// ============================================================================

const resend = new Resend(process.env.RESEND_API_KEY!);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@oncovax.com';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// ============================================================================
// Phase computation
// ============================================================================

export function computePhase(completionDate: Date): 'early' | 'mid' | 'late' {
  const years = (Date.now() - completionDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  if (years < 2) return 'early';
  if (years < 5) return 'mid';
  return 'late';
}

// ============================================================================
// Notification Preferences
// ============================================================================

export async function getNotificationPreferences(patientId: string) {
  let prefs = await prisma.notificationPreference.findUnique({
    where: { patientId },
  });
  if (!prefs) {
    prefs = await prisma.notificationPreference.create({
      data: { patientId },
    });
  }
  return prefs;
}

export async function updateNotificationPreferences(patientId: string, updates: Record<string, unknown>) {
  // Ensure prefs exist
  await getNotificationPreferences(patientId);
  return prisma.notificationPreference.update({
    where: { patientId },
    data: updates as any,
  });
}

// ============================================================================
// Notification History
// ============================================================================

export async function getNotificationHistory(patientId: string, limit = 20) {
  return prisma.notificationLog.findMany({
    where: { patientId },
    orderBy: { sentAt: 'desc' },
    take: limit,
  });
}

// ============================================================================
// Feedback
// ============================================================================

export async function submitFeedback(patientId: string, input: {
  feedbackType: string;
  rating?: number;
  comment?: string;
  context?: any;
}) {
  return prisma.survivorshipFeedback.create({
    data: {
      patientId,
      feedbackType: input.feedbackType,
      rating: input.rating ?? null,
      comment: input.comment ?? null,
      context: input.context ?? null,
    },
  });
}

export async function getFeedback(patientId: string) {
  return prisma.survivorshipFeedback.findMany({
    where: { patientId },
    orderBy: { createdAt: 'desc' },
  });
}

// ============================================================================
// SCP Annual Refresh with Diff
// ============================================================================

export async function annualRefreshSCP(patientId: string): Promise<{ newPlan: any; diff: SCPDiff }> {
  // Load existing plan
  const existingPlan = await prisma.survivorshipPlan.findUnique({
    where: { patientId },
  });
  if (!existingPlan) throw new Error('No existing survivorship plan found');

  const oldContent = existingPlan.planContent as any;

  // Archive old plan
  const archives = (existingPlan.archivedPlans as any[]) || [];
  archives.push({
    planContent: oldContent,
    archivedAt: new Date().toISOString(),
    phase: existingPlan.currentPhase,
  });
  await prisma.survivorshipPlan.update({
    where: { patientId },
    data: { archivedPlans: archives },
  });

  // Regenerate
  const newScp = await refreshSCP(patientId);
  const newContent = newScp as any;

  // Compute diff
  const diff = computeSCPDiff(oldContent, newContent);

  // Generate human-readable summary via Claude
  try {
    const summaryResponse = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 256,
      system: 'You are a survivorship care plan assistant. Given the changes between two versions of a care plan, write a 2-3 sentence warm, patient-friendly summary of what changed. Be reassuring and focus on how the updates reflect their progress.',
      messages: [{
        role: 'user',
        content: `Changes between old and new care plan:\n- Changed sections: ${diff.changedSections.join(', ') || 'none'}\n- Added items: ${diff.addedItems.join(', ') || 'none'}\n- Removed items: ${diff.removedItems.join(', ') || 'none'}\n\nWrite a 2-3 sentence summary.`,
      }],
    });
    diff.summary = (summaryResponse.content[0] as { type: 'text'; text: string }).text.trim();
  } catch {
    diff.summary = 'Your care plan has been updated based on the latest clinical guidelines and your time since treatment.';
  }

  // Update next review date
  const nextReview = new Date();
  nextReview.setFullYear(nextReview.getFullYear() + 1);
  await prisma.survivorshipPlan.update({
    where: { patientId },
    data: { nextReviewDate: nextReview },
  });

  return { newPlan: newScp, diff };
}

function computeSCPDiff(oldContent: any, newContent: any): SCPDiff {
  const changedSections: string[] = [];
  const addedItems: string[] = [];
  const removedItems: string[] = [];

  // Compare surveillance schedules
  const oldSchedule = oldContent?.surveillance?.schedule || [];
  const newSchedule = newContent?.surveillance?.schedule || [];
  const oldTitles = new Set(oldSchedule.map((s: any) => s.title));
  const newTitles = new Set(newSchedule.map((s: any) => s.title));

  for (const title of newTitles) {
    if (!oldTitles.has(title)) addedItems.push(`Surveillance: ${title}`);
  }
  for (const title of oldTitles) {
    if (!newTitles.has(title)) removedItems.push(`Surveillance: ${title}`);
  }

  // Compare frequencies
  for (const newItem of newSchedule) {
    const oldItem = oldSchedule.find((o: any) => o.title === newItem.title);
    if (oldItem && oldItem.frequency !== newItem.frequency) {
      changedSections.push(`${newItem.title} frequency: ${oldItem.frequency} → ${newItem.frequency}`);
    }
  }

  // Compare late effects count
  const oldEffects = oldContent?.lateEffects?.byTreatment || [];
  const newEffects = newContent?.lateEffects?.byTreatment || [];
  if (JSON.stringify(oldEffects) !== JSON.stringify(newEffects)) {
    changedSections.push('Late effects guidance');
  }

  // Compare lifestyle
  if (JSON.stringify(oldContent?.lifestyle) !== JSON.stringify(newContent?.lifestyle)) {
    changedSections.push('Lifestyle recommendations');
  }

  return { changedSections, addedItems, removedItems, summary: '' };
}

// ============================================================================
// Main cron entry point
// ============================================================================

export async function processAllNotifications(): Promise<NotificationResults> {
  const results: NotificationResults = {
    surveillanceReminders: 0,
    surveillanceOverdue: 0,
    journalReminders: 0,
    weeklySummaries: 0,
    appointmentPrep: 0,
    scpAnnualReviews: 0,
    lifestyleCheckIns: 0,
    phaseTransitions: 0,
    errors: [],
  };

  const processors = [
    { name: 'surveillanceReminders', fn: processSurveillanceReminders },
    { name: 'surveillanceOverdue', fn: processSurveillanceOverdue },
    { name: 'journalReminders', fn: processJournalReminders },
    { name: 'weeklySummary', fn: processWeeklySummary },
    { name: 'appointmentPrep', fn: processAppointmentPrep },
    { name: 'scpAnnualReviews', fn: processScpAnnualReview },
    { name: 'lifestyleCheckIns', fn: processLifestyleCheckIn },
    { name: 'phaseTransitions', fn: processPhaseTransitions },
  ] as const;

  for (const { name, fn } of processors) {
    try {
      const count = await fn();
      (results as any)[name] = count;
    } catch (err: any) {
      results.errors.push(`${name}: ${err.message}`);
    }
  }

  return results;
}

// ============================================================================
// Internal helper — send + log
// ============================================================================

async function sendSurvivorshipEmail(opts: {
  patientId: string;
  to: string;
  category: string;
  subject: string;
  html: string;
  dedupeKey: string;
  referenceId?: string;
  referenceType?: string;
}) {
  // Check dedupe
  const existing = await prisma.notificationLog.findFirst({
    where: { dedupeKey: opts.dedupeKey },
  });
  if (existing) return false;

  // Send email
  await resend.emails.send({
    from: FROM_EMAIL,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  });

  // Log
  await prisma.notificationLog.create({
    data: {
      patientId: opts.patientId,
      category: opts.category,
      subject: opts.subject,
      dedupeKey: opts.dedupeKey,
      referenceId: opts.referenceId,
      referenceType: opts.referenceType,
    },
  });

  return true;
}

async function getPatientEmail(patientId: string): Promise<string | null> {
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: { user: { select: { email: true } } },
  });
  return (patient as any)?.user?.email || null;
}

// ============================================================================
// Processor 1: Surveillance Reminders (30/7/1 days before)
// ============================================================================

async function processSurveillanceReminders(): Promise<number> {
  let count = 0;
  const now = new Date();

  for (const daysBefore of [30, 7, 1]) {
    const targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() + daysBefore);
    const targetStr = targetDate.toISOString().split('T')[0];

    const events = await prisma.surveillanceEvent.findMany({
      where: {
        status: 'upcoming',
        dueDate: {
          gte: new Date(targetStr + 'T00:00:00Z'),
          lt: new Date(targetStr + 'T23:59:59Z'),
        },
      },
    });

    for (const event of events) {
      const prefs = await getNotificationPreferences(event.patientId);
      if (!prefs.surveillanceReminders) continue;

      const email = await getPatientEmail(event.patientId);
      if (!email) continue;

      const dedupeKey = `surv_rem:${event.id}:${daysBefore}`;
      const daysLabel = daysBefore === 1 ? 'tomorrow' : `in ${daysBefore} days`;
      const sent = await sendSurvivorshipEmail({
        patientId: event.patientId,
        to: email,
        category: 'surveillance_reminder',
        subject: `Your ${event.title} is coming up ${daysLabel}`,
        html: `<p>Hi there,</p>
<p>Your <strong>${event.title}</strong> is scheduled for <strong>${new Date(event.dueDate!).toLocaleDateString()}</strong> (${daysLabel}).</p>
${event.description ? `<p>${event.description}</p>` : ''}
<p><a href="${APP_URL}/survive/monitoring">View your schedule</a></p>
<p>Best,<br>OncoVax Care Team</p>`,
        dedupeKey,
        referenceId: event.id,
        referenceType: 'surveillance_event',
      });
      if (sent) count++;
    }
  }

  return count;
}

// ============================================================================
// Processor 2: Surveillance Overdue (3/14/30 days after)
// ============================================================================

async function processSurveillanceOverdue(): Promise<number> {
  let count = 0;
  const now = new Date();

  for (const daysAfter of [3, 14, 30]) {
    const targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() - daysAfter);
    const targetStr = targetDate.toISOString().split('T')[0];

    const events = await prisma.surveillanceEvent.findMany({
      where: {
        status: 'upcoming',
        dueDate: {
          gte: new Date(targetStr + 'T00:00:00Z'),
          lt: new Date(targetStr + 'T23:59:59Z'),
        },
      },
    });

    for (const event of events) {
      const prefs = await getNotificationPreferences(event.patientId);
      if (!prefs.surveillanceReminders) continue;

      const email = await getPatientEmail(event.patientId);
      if (!email) continue;

      const dedupeKey = `surv_over:${event.id}:${daysAfter}`;
      const sent = await sendSurvivorshipEmail({
        patientId: event.patientId,
        to: email,
        category: 'surveillance_overdue',
        subject: `Your ${event.title} is overdue — need help scheduling?`,
        html: `<p>Hi there,</p>
<p>Your <strong>${event.title}</strong> was due on <strong>${new Date(event.dueDate!).toLocaleDateString()}</strong> (${daysAfter} days ago).</p>
<p>If you haven't scheduled it yet, we're here to help. If you've already completed it, you can log it in your dashboard.</p>
<p><a href="${APP_URL}/survive/monitoring">Update your schedule</a></p>
<p>Best,<br>OncoVax Care Team</p>`,
        dedupeKey,
        referenceId: event.id,
        referenceType: 'surveillance_event',
      });
      if (sent) count++;
    }
  }

  return count;
}

// ============================================================================
// Processor 3: Journal Reminders (phase-adjusted cadence)
// ============================================================================

async function processJournalReminders(): Promise<number> {
  let count = 0;
  const today = new Date().toISOString().split('T')[0];

  const plans = await prisma.survivorshipPlan.findMany({
    select: { patientId: true, currentPhase: true },
  });

  for (const plan of plans) {
    // Phase-adjusted cadence
    const phase = plan.currentPhase;
    if (phase === 'mid') {
      // Every other day — skip even day-of-year
      const dayOfYear = Math.floor(
        (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24),
      );
      if (dayOfYear % 2 === 0) continue;
    } else if (phase === 'late') {
      // Weekly — only Monday
      if (new Date().getDay() !== 1) continue;
    }
    // 'early' = daily, no skip

    // Check if already logged today
    const todayEntry = await prisma.journalEntry.findFirst({
      where: {
        patientId: plan.patientId,
        entryDate: {
          gte: new Date(today + 'T00:00:00Z'),
          lt: new Date(today + 'T23:59:59Z'),
        },
      },
    });
    if (todayEntry) continue;

    const prefs = await getNotificationPreferences(plan.patientId);
    if (!prefs.journalReminders) continue;

    const email = await getPatientEmail(plan.patientId);
    if (!email) continue;

    const dedupeKey = `journal:${plan.patientId}:${today}`;
    const sent = await sendSurvivorshipEmail({
      patientId: plan.patientId,
      to: email,
      category: 'journal_reminder',
      subject: 'How was your day? Quick check-in',
      html: `<p>Hi there,</p>
<p>Take 60 seconds to log how you're feeling today. Tracking your symptoms helps you and your care team spot patterns early.</p>
<p><a href="${APP_URL}/survive/journal/entry">Log today's entry</a></p>
<p>Best,<br>OncoVax Care Team</p>`,
      dedupeKey,
    });
    if (sent) count++;
  }

  return count;
}

// ============================================================================
// Processor 4: Weekly Summary (Monday only)
// ============================================================================

async function processWeeklySummary(): Promise<number> {
  if (new Date().getDay() !== 1) return 0; // Monday only

  let count = 0;
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - 7);
  const isoWeek = `${now.getFullYear()}-W${String(Math.ceil((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))).padStart(2, '0')}`;

  const plans = await prisma.survivorshipPlan.findMany({
    select: { patientId: true },
  });

  for (const plan of plans) {
    const prefs = await getNotificationPreferences(plan.patientId);
    if (!prefs.weeklySummary) continue;

    const email = await getPatientEmail(plan.patientId);
    if (!email) continue;

    const dedupeKey = `weekly:${plan.patientId}:${isoWeek}`;

    // Gather stats
    const [journalCount, upcomingEvents, overdueEvents] = await Promise.all([
      prisma.journalEntry.count({
        where: {
          patientId: plan.patientId,
          entryDate: { gte: weekStart },
        },
      }),
      prisma.surveillanceEvent.findMany({
        where: {
          patientId: plan.patientId,
          status: 'upcoming',
          dueDate: {
            gte: now,
            lt: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
          },
        },
        orderBy: { dueDate: 'asc' },
        take: 5,
      }),
      prisma.surveillanceEvent.count({
        where: {
          patientId: plan.patientId,
          status: 'upcoming',
          dueDate: { lt: now },
        },
      }),
    ]);

    const upcomingList = upcomingEvents.length > 0
      ? upcomingEvents.map((e: any) => `<li>${e.title} — ${new Date(e.dueDate).toLocaleDateString()}</li>`).join('')
      : '<li>Nothing scheduled in the next 2 weeks</li>';

    const sent = await sendSurvivorshipEmail({
      patientId: plan.patientId,
      to: email,
      category: 'weekly_summary',
      subject: 'Your weekly survivorship summary',
      html: `<p>Hi there,</p>
<p>Here's your weekly survivorship check-in:</p>
<ul>
<li><strong>Journal entries this week:</strong> ${journalCount}</li>
${overdueEvents > 0 ? `<li><strong>Overdue items:</strong> ${overdueEvents} — <a href="${APP_URL}/survive/monitoring">view</a></li>` : ''}
</ul>
<p><strong>Coming up:</strong></p>
<ul>${upcomingList}</ul>
<p><a href="${APP_URL}/survive">View your dashboard</a></p>
<p>Best,<br>OncoVax Care Team</p>`,
      dedupeKey,
    });
    if (sent) count++;
  }

  return count;
}

// ============================================================================
// Processor 5: Appointment Prep (3 days before)
// ============================================================================

async function processAppointmentPrep(): Promise<number> {
  let count = 0;
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 3);
  const targetStr = targetDate.toISOString().split('T')[0];

  const events = await prisma.surveillanceEvent.findMany({
    where: {
      status: 'upcoming',
      dueDate: {
        gte: new Date(targetStr + 'T00:00:00Z'),
        lt: new Date(targetStr + 'T23:59:59Z'),
      },
    },
  });

  for (const event of events) {
    const prefs = await getNotificationPreferences(event.patientId);
    if (!prefs.appointmentPrep) continue;

    const email = await getPatientEmail(event.patientId);
    if (!email) continue;

    const dedupeKey = `appt_prep:${event.id}`;
    const sent = await sendSurvivorshipEmail({
      patientId: event.patientId,
      to: email,
      category: 'appointment_prep',
      subject: `Your appointment is in 3 days — here's your prep doc`,
      html: `<p>Hi there,</p>
<p>Your <strong>${event.title}</strong> is in 3 days (${new Date(event.dueDate!).toLocaleDateString()}).</p>
<p>We've prepared a summary of your recent symptoms, completed tests, and suggested questions for your doctor.</p>
<p><a href="${APP_URL}/survive/monitoring/${event.id}">View appointment prep</a></p>
<p>Best,<br>OncoVax Care Team</p>`,
      dedupeKey,
      referenceId: event.id,
      referenceType: 'surveillance_event',
    });
    if (sent) count++;
  }

  return count;
}

// ============================================================================
// Processor 6: SCP Annual Review (anniversary ±3-day window)
// ============================================================================

async function processScpAnnualReview(): Promise<number> {
  let count = 0;
  const now = new Date();
  const year = now.getFullYear();

  const plans = await prisma.survivorshipPlan.findMany({
    where: { nextReviewDate: { not: null } },
  });

  for (const plan of plans) {
    if (!plan.nextReviewDate) continue;

    const reviewDate = new Date(plan.nextReviewDate);
    const diffDays = Math.abs(
      (now.getTime() - reviewDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays > 3) continue; // Only within ±3-day window

    const prefs = await getNotificationPreferences(plan.patientId);
    if (!prefs.scpAnnualReview) continue;

    const email = await getPatientEmail(plan.patientId);
    if (!email) continue;

    const dedupeKey = `scp_annual:${plan.patientId}:${year}`;
    const sent = await sendSurvivorshipEmail({
      patientId: plan.patientId,
      to: email,
      category: 'scp_annual_review',
      subject: 'Your annual care plan update is ready — here\'s what changed',
      html: `<p>Hi there,</p>
<p>It's been a year since your last care plan review. We've updated your survivorship care plan based on the latest guidelines and your progress.</p>
<p><a href="${APP_URL}/survive/plan">Review your updated plan</a></p>
<p>Best,<br>OncoVax Care Team</p>`,
      dedupeKey,
    });
    if (sent) count++;
  }

  return count;
}

// ============================================================================
// Processor 7: Lifestyle Check-In (1st of month)
// ============================================================================

async function processLifestyleCheckIn(): Promise<number> {
  if (new Date().getDate() !== 1) return 0;

  let count = 0;
  const yearMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

  const plans = await prisma.survivorshipPlan.findMany({
    select: { patientId: true },
  });

  for (const plan of plans) {
    const prefs = await getNotificationPreferences(plan.patientId);
    if (!prefs.lifestyleCheckIn) continue;

    const email = await getPatientEmail(plan.patientId);
    if (!email) continue;

    const dedupeKey = `lifestyle:${plan.patientId}:${yearMonth}`;
    const sent = await sendSurvivorshipEmail({
      patientId: plan.patientId,
      to: email,
      category: 'lifestyle_checkin',
      subject: 'Monthly wellness check-in',
      html: `<p>Hi there,</p>
<p>It's the start of a new month — a great time to revisit your personalized lifestyle recommendations.</p>
<p>Check in on your exercise goals, nutrition, and overall wellness.</p>
<p><a href="${APP_URL}/survive/lifestyle">View your recommendations</a></p>
<p>Best,<br>OncoVax Care Team</p>`,
      dedupeKey,
    });
    if (sent) count++;
  }

  return count;
}

// ============================================================================
// Processor 8: Phase Transitions
// ============================================================================

async function processPhaseTransitions(): Promise<number> {
  let count = 0;

  const plans = await prisma.survivorshipPlan.findMany({
    select: {
      id: true,
      patientId: true,
      currentPhase: true,
      treatmentCompletionDate: true,
    },
  });

  for (const plan of plans) {
    const newPhase = computePhase(plan.treatmentCompletionDate);
    if (newPhase === plan.currentPhase) continue;

    // Update phase
    await prisma.survivorshipPlan.update({
      where: { id: plan.id },
      data: { currentPhase: newPhase },
    });

    const prefs = await getNotificationPreferences(plan.patientId);
    if (!prefs.phaseTransitions) continue;

    const email = await getPatientEmail(plan.patientId);
    if (!email) continue;

    const phaseLabels: Record<string, string> = {
      early: 'early survivorship (0-2 years)',
      mid: 'mid survivorship (2-5 years)',
      late: 'long-term survivorship (5+ years)',
    };

    const dedupeKey = `phase:${plan.patientId}:${newPhase}`;
    const sent = await sendSurvivorshipEmail({
      patientId: plan.patientId,
      to: email,
      category: 'phase_transition',
      subject: 'You\'ve reached a new milestone in your survivorship journey',
      html: `<p>Hi there,</p>
<p>Congratulations — you've transitioned to <strong>${phaseLabels[newPhase]}</strong>. This is a meaningful milestone.</p>
<p>Your care plan may be adjusted as your monitoring needs evolve. Some surveillance frequencies may change based on your time since treatment.</p>
<p><a href="${APP_URL}/survive/plan">View your updated plan</a></p>
<p>Best,<br>OncoVax Care Team</p>`,
      dedupeKey,
    });
    if (sent) count++;
  }

  return count;
}
