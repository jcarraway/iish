import { anthropic, CLAUDE_MODEL } from './ai';
import { redis } from './redis';
import { prisma } from './db';
import { generateMatchesForPatient } from './matcher';
import type { PatientProfile } from '@iish/shared';

// ============================================================================
// Types
// ============================================================================

export interface CtdnaInterpretation {
  summary: string;
  whatThisMeans: string;
  nextSteps: string;
  trendContext: string | null;
}

// ============================================================================
// Public functions
// ============================================================================

export async function addCtdnaResult(patientId: string, input: {
  testDate: string;
  provider: string;
  result: string;
  ctdnaLevel?: number;
  documentId?: string;
}) {
  // 1. Create the result
  let ctdnaResult = await prisma.ctdnaResult.create({
    data: {
      patientId,
      testDate: new Date(input.testDate),
      provider: input.provider,
      result: input.result,
      ctdnaLevel: input.ctdnaLevel ?? null,
      documentUploadId: input.documentId ?? null,
    },
  });

  // 2. Generate interpretation
  const interpretation = await generateInterpretation(ctdnaResult.id, patientId);
  ctdnaResult = await prisma.ctdnaResult.update({
    where: { id: ctdnaResult.id },
    data: { interpretation: interpretation as any },
  });

  // 3. If detected, trigger trial re-match
  if (input.result === 'detected') {
    generateMatchesForPatient(patientId).catch(() => {});
    ctdnaResult = await prisma.ctdnaResult.update({
      where: { id: ctdnaResult.id },
      data: { triggeredTrialRematch: true },
    });

    // Create preliminary recurrence event
    const { createPreliminaryRecurrenceEvent } = await import('./recurrence-manager');
    createPreliminaryRecurrenceEvent(patientId, ctdnaResult.id).catch(() => {});
  }

  // 4. Auto-complete matching surveillance event
  try {
    const upcomingCtdnaEvent = await prisma.surveillanceEvent.findFirst({
      where: {
        patientId,
        type: { in: ['ctdna', 'ctDNA', 'ct_dna', 'liquid_biopsy'] },
        status: 'upcoming',
      },
      orderBy: { dueDate: 'asc' },
    });

    if (upcomingCtdnaEvent) {
      const { markEventComplete } = await import('./surveillance-manager');
      await markEventComplete(
        upcomingCtdnaEvent.id,
        input.testDate,
        `ctDNA result: ${input.result}${input.ctdnaLevel != null ? ` (level: ${input.ctdnaLevel})` : ''}`,
      );
    }
  } catch {
    // Non-critical — don't fail the result creation
  }

  return ctdnaResult;
}

export async function getCtdnaHistory(patientId: string) {
  return prisma.ctdnaResult.findMany({
    where: { patientId },
    orderBy: { testDate: 'desc' },
  });
}

export async function getCtdnaInterpretation(resultId: string) {
  const result = await prisma.ctdnaResult.findUnique({ where: { id: resultId } });
  if (!result) throw new Error('ctDNA result not found');

  // Return cached interpretation if available
  if (result.interpretation) return result.interpretation;

  // Generate fresh interpretation
  const interpretation = await generateInterpretation(resultId, result.patientId);
  await prisma.ctdnaResult.update({
    where: { id: resultId },
    data: { interpretation: interpretation as any },
  });
  return interpretation;
}

// ============================================================================
// Private — Claude interpretation
// ============================================================================

async function generateInterpretation(
  resultId: string,
  patientId: string,
): Promise<CtdnaInterpretation> {
  // Check Redis cache
  const cacheKey = `ctdna:interp:${resultId}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  // Load result + prior results + patient context
  const [result, priorResults, patient, plan] = await Promise.all([
    prisma.ctdnaResult.findUnique({ where: { id: resultId } }),
    prisma.ctdnaResult.findMany({
      where: { patientId },
      orderBy: { testDate: 'desc' },
      take: 10,
    }),
    prisma.patient.findUnique({ where: { id: patientId } }),
    prisma.survivorshipPlan.findUnique({ where: { patientId } }),
  ]);

  if (!result) throw new Error('ctDNA result not found');

  const profile = (patient?.profile as PatientProfile | null) ?? {};
  const monthsSinceCompletion = plan?.treatmentCompletionDate
    ? Math.round((Date.now() - new Date(plan.treatmentCompletionDate).getTime()) / (1000 * 60 * 60 * 24 * 30))
    : null;

  const priorContext = priorResults
    .filter(r => r.id !== resultId)
    .map(r => `- ${new Date(r.testDate).toLocaleDateString()}: ${r.result}${r.ctdnaLevel != null ? ` (level: ${r.ctdnaLevel})` : ''}`)
    .join('\n');

  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 1024,
    system: `You are a compassionate oncology information assistant helping cancer survivors understand ctDNA monitoring results.

CRITICAL TONE RULES:
- If DETECTED: NEVER say "your cancer is back" or "recurrence detected" or "cancer has returned"
  Instead say: "ctDNA was detected in your blood sample. This finding should be discussed with your oncologist promptly."
  Explain that detected ctDNA can have multiple explanations and does not definitively mean recurrence.
- If NOT_DETECTED: "No cancer DNA was detected in your blood sample. This is reassuring."
  Note that while reassuring, continued monitoring remains important.
- If INDETERMINATE: Explain the test was inconclusive, recommend discussing a repeat test with oncologist.

The platform NEVER announces recurrence. Only respond to what the patient/doctor reports.
Be honest, warm, and empowering. Reduce anxiety, don't create it.

Return valid JSON with this exact structure:
{
  "summary": "1-2 sentence plain-language summary of the result",
  "whatThisMeans": "2-3 sentences explaining what this means in context",
  "nextSteps": "2-3 concrete next steps",
  "trendContext": "If prior results exist, 1-2 sentences about the trend. Null if first test."
}`,
    messages: [{
      role: 'user',
      content: `ctDNA Test Result:
- Date: ${new Date(result.testDate).toLocaleDateString()}
- Provider: ${result.provider || 'Not specified'}
- Result: ${result.result}
${result.ctdnaLevel != null ? `- ctDNA Level: ${result.ctdnaLevel}` : ''}

Patient Context:
- Cancer type: ${(profile as any)?.cancerType || 'Not specified'}
- Stage: ${(profile as any)?.stage || 'Not specified'}
- Risk category: ${plan?.riskCategory || 'Not specified'}
${monthsSinceCompletion != null ? `- Months since treatment completion: ${monthsSinceCompletion}` : ''}

Prior Results:
${priorContext || 'No prior results (this is the first test)'}

Generate the interpretation JSON.`,
    }],
  });

  const text = (response.content[0] as { type: 'text'; text: string }).text;
  let interpretation: CtdnaInterpretation;
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    interpretation = JSON.parse(jsonMatch ? jsonMatch[0] : text);
  } catch {
    interpretation = {
      summary: text.slice(0, 200),
      whatThisMeans: 'Please discuss this result with your oncologist for a complete interpretation.',
      nextSteps: 'Schedule a follow-up appointment with your oncologist to discuss this result.',
      trendContext: null,
    };
  }

  // Cache for 30 days
  await redis.set(cacheKey, JSON.stringify(interpretation), 'EX', 30 * 24 * 60 * 60);

  return interpretation;
}
