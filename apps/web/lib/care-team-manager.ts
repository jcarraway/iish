import { anthropic, CLAUDE_MODEL } from './ai';
import { redis } from './redis';
import { prisma } from './db';
import type { PatientProfile } from '@oncovax/shared';
import crypto from 'crypto';

// ============================================================================
// Types
// ============================================================================

export interface SymptomRouting {
  urgency: string;
  providerName: string | null;
  providerRole: string | null;
  providerPhone: string | null;
  reasoning: string;
  immediateAction: string | null;
}

export interface AppointmentPrep {
  eventId: string;
  appointmentType: string;
  appointmentDate: string | null;
  symptomSummary: { dimension: string; average: number | null; trend: string; notableChanges: string | null }[];
  completedSince: string[];
  upcomingTests: string[];
  overdueItems: string[];
  questionsToAsk: { question: string; context: string }[];
  medicationNotes: string[];
  generatedAt: string;
}

// ============================================================================
// CRUD
// ============================================================================

export async function getCareTeam(patientId: string) {
  return prisma.careTeamMember.findMany({
    where: { patientId },
    orderBy: { createdAt: 'asc' },
  });
}

export async function addCareTeamMember(
  patientId: string,
  input: { name: string; role: string; practice?: string; phone?: string; contactFor?: string[] },
) {
  return prisma.careTeamMember.create({
    data: {
      patientId,
      name: input.name,
      role: input.role,
      practice: input.practice ?? null,
      phone: input.phone ?? null,
      contactFor: input.contactFor ?? [],
    },
  });
}

export async function updateCareTeamMember(
  patientId: string,
  memberId: string,
  input: Partial<{ name: string; role: string; practice: string; phone: string; contactFor: string[] }>,
) {
  const member = await prisma.careTeamMember.findUnique({ where: { id: memberId } });
  if (!member || member.patientId !== patientId) throw new Error('Care team member not found');
  return prisma.careTeamMember.update({
    where: { id: memberId },
    data: input,
  });
}

export async function removeCareTeamMember(patientId: string, memberId: string): Promise<void> {
  const member = await prisma.careTeamMember.findUnique({ where: { id: memberId } });
  if (!member || member.patientId !== patientId) throw new Error('Care team member not found');
  await prisma.careTeamMember.delete({ where: { id: memberId } });
}

// ============================================================================
// Symptom routing (Claude-powered)
// ============================================================================

export async function routeSymptom(patientId: string, symptom: string): Promise<SymptomRouting> {
  // Check Redis cache
  const hash = crypto.createHash('md5').update(symptom.toLowerCase().trim()).digest('hex');
  const cacheKey = `symptomroute:${patientId}:${hash}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached) as SymptomRouting;

  // Load care team + SCP
  const [careTeam, plan] = await Promise.all([
    prisma.careTeamMember.findMany({ where: { patientId } }),
    prisma.survivorshipPlan.findUnique({ where: { patientId } }),
  ]);

  const planContent = plan?.planContent as Record<string, unknown> | null;
  const patient = await prisma.patient.findUnique({ where: { id: patientId } });
  const profile = patient?.profile as PatientProfile | null;

  const teamDescription = careTeam.length > 0
    ? careTeam.map(m => `- ${m.name} (${m.role}${m.practice ? `, ${m.practice}` : ''}${m.phone ? `, ${m.phone}` : ''}) — handles: ${m.contactFor.length > 0 ? m.contactFor.join(', ') : 'general'}`).join('\n')
    : 'No care team members added yet.';

  const result = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 1024,
    system: `You are a cancer survivorship care coordinator. Given a patient's care team, treatment history, and a reported symptom, determine which provider to contact, urgency, and reasoning.

Urgency levels: emergency (call 911), urgent (call within hours), soon (within 1-2 days), routine (at next appointment).

If no care team members are available, recommend "your oncologist or primary care physician" generically.

CRITICAL: If urgency is "emergency", immediateAction MUST be "Call 911 or go to the nearest emergency room immediately."

Respond ONLY with valid JSON.`,
    messages: [{
      role: 'user',
      content: `Patient care team:
${teamDescription}

Cancer type: ${profile?.cancerType || 'unknown'}
Stage: ${profile?.stage || 'unknown'}
Treatments received: ${(profile?.priorTreatments || []).map(t => t.name).join(', ') || 'unknown'}
Ongoing therapies: ${plan?.ongoingTherapies?.join(', ') || 'none'}

Patient symptom: "${symptom}"

Respond with JSON:
{
  "urgency": "emergency | urgent | soon | routine",
  "providerName": "string or null",
  "providerRole": "string or null",
  "providerPhone": "string or null",
  "reasoning": "string - 2-3 sentences explaining why this provider and urgency level",
  "immediateAction": "string or null - any immediate step before calling provider"
}`,
    }],
  });

  const text = (result.content[0] as { type: 'text'; text: string }).text;
  const routing: SymptomRouting = JSON.parse(text.replace(/```json\n?|```\n?/g, '').trim());

  // Safety override
  if (routing.urgency === 'emergency') {
    routing.immediateAction = 'Call 911 or go to the nearest emergency room immediately.';
  }

  // Cache 24hr
  await redis.set(cacheKey, JSON.stringify(routing), 'EX', 24 * 60 * 60);

  return routing;
}

// ============================================================================
// Appointment prep (Claude-powered)
// ============================================================================

export async function generateAppointmentPrep(
  patientId: string,
  eventId: string,
): Promise<AppointmentPrep> {
  // Check cache
  const cacheKey = `apptprep:${patientId}:${eventId}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached) as AppointmentPrep;

  // Load event
  const event = await prisma.surveillanceEvent.findUnique({ where: { id: eventId } });
  if (!event || event.patientId !== patientId) throw new Error('Surveillance event not found');

  // Load journal entries (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const journalEntries = await prisma.journalEntry.findMany({
    where: {
      patientId,
      entryDate: { gte: thirtyDaysAgo },
    },
    orderBy: { entryDate: 'desc' },
  });

  // Load all surveillance events
  const allEvents = await prisma.surveillanceEvent.findMany({
    where: { patientId },
    orderBy: { dueDate: 'asc' },
  });

  // Load SCP
  const plan = await prisma.survivorshipPlan.findUnique({ where: { patientId } });
  const planContent = plan?.planContent as Record<string, unknown> | null;

  const result = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 4096,
    system: `You are a survivorship care coordinator preparing a patient for an upcoming medical appointment. Given their recent journal entries, surveillance history, and care plan, create a structured appointment prep document.

Tone: warm, organized, empowering — help the patient feel prepared, not anxious.

Respond ONLY with valid JSON.`,
    messages: [{
      role: 'user',
      content: `Appointment: ${event.title} (${event.type})
Due date: ${event.dueDate?.toISOString().split('T')[0] || 'not set'}

Recent journal entries (last 30 days):
${JSON.stringify(journalEntries.map(e => ({
  date: e.entryDate,
  energy: e.energy,
  pain: e.pain,
  mood: e.mood,
  sleepQuality: e.sleepQuality,
  hotFlashes: e.hotFlashes,
  jointPain: e.jointPain,
  newSymptoms: e.newSymptoms,
  exerciseType: e.exerciseType,
  exerciseMinutes: e.exerciseMinutes,
  notes: e.notes,
})), null, 2)}

All surveillance events:
${JSON.stringify(allEvents.map(e => ({
  title: e.title,
  type: e.type,
  status: e.status,
  dueDate: e.dueDate?.toISOString().split('T')[0],
  completedDate: e.completedDate?.toISOString().split('T')[0],
  resultSummary: e.resultSummary,
})), null, 2)}

Care plan late effects: ${JSON.stringify(planContent?.lateEffects ?? 'none')}
Ongoing medications: ${JSON.stringify(planContent?.ongoingTherapy ?? 'none')}

Respond with JSON:
{
  "symptomSummary": [{ "dimension": "string", "average": "number or null", "trend": "improving | stable | worsening", "notableChanges": "string or null" }],
  "completedSince": ["string - tests/appointments completed since last similar visit"],
  "upcomingTests": ["string - other upcoming events to mention to doctor"],
  "overdueItems": ["string - any overdue surveillance items"],
  "questionsToAsk": [{ "question": "string", "context": "string - why this question matters for this patient" }],
  "medicationNotes": ["string - any medication-related items to discuss"]
}`,
    }],
  });

  const text = (result.content[0] as { type: 'text'; text: string }).text;
  const parsed = JSON.parse(text.replace(/```json\n?|```\n?/g, '').trim());

  const prep: AppointmentPrep = {
    eventId,
    appointmentType: event.title,
    appointmentDate: event.dueDate?.toISOString().split('T')[0] ?? null,
    symptomSummary: parsed.symptomSummary ?? [],
    completedSince: parsed.completedSince ?? [],
    upcomingTests: parsed.upcomingTests ?? [],
    overdueItems: parsed.overdueItems ?? [],
    questionsToAsk: parsed.questionsToAsk ?? [],
    medicationNotes: parsed.medicationNotes ?? [],
    generatedAt: new Date().toISOString(),
  };

  // Cache 7 days
  await redis.set(cacheKey, JSON.stringify(prep), 'EX', 7 * 24 * 60 * 60);

  return prep;
}
