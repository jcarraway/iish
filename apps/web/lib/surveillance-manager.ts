import { anthropic, CLAUDE_MODEL } from './ai';
import { prisma } from './db';

// ============================================================================
// Frequency parsing — regex-based next-due calculation
// ============================================================================

function parseFrequencyMonths(frequency: string | null): number {
  if (!frequency) return 6;
  const f = frequency.toLowerCase();
  if (/annually|every\s+year|every\s+12\s+months/.test(f)) return 12;
  if (/every\s+1[\s-]+2\s+years/.test(f)) return 12;
  if (/every\s+6[\s-]*(12)?\s*months/.test(f)) return 6;
  if (/every\s+3[\s-]*(6)?\s*months/.test(f)) return 3;
  const match = f.match(/every\s+(\d+)\s+months/);
  if (match) return parseInt(match[1], 10);
  return 6;
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

async function createNextOccurrence(event: any): Promise<Date> {
  const months = parseFrequencyMonths(event.frequency);
  const baseDate = event.status === 'completed' && event.completedDate
    ? new Date(event.completedDate)
    : new Date();
  const nextDue = addMonths(baseDate, months);

  await prisma.surveillanceEvent.create({
    data: {
      patientId: event.patientId,
      planId: event.planId,
      type: event.type,
      title: event.title,
      description: event.description,
      frequency: event.frequency,
      guidelineSource: event.guidelineSource,
      dueDate: nextDue,
      status: 'upcoming',
    },
  });

  return nextDue;
}

// ============================================================================
// Event lifecycle functions
// ============================================================================

export async function markEventComplete(
  eventId: string,
  completedDate: string,
  resultSummary?: string,
  resultDocumentId?: string,
) {
  const event = await prisma.surveillanceEvent.findUnique({ where: { id: eventId } });
  if (!event) throw new Error('Event not found');

  const nextDueDate = await createNextOccurrence({ ...event, status: 'completed', completedDate });

  return prisma.surveillanceEvent.update({
    where: { id: eventId },
    data: {
      status: 'completed',
      completedDate: new Date(completedDate),
      resultSummary: resultSummary || null,
      resultDocumentId: resultDocumentId || null,
      nextDueDate,
    },
  });
}

export async function skipEvent(eventId: string, reason: string) {
  const event = await prisma.surveillanceEvent.findUnique({ where: { id: eventId } });
  if (!event) throw new Error('Event not found');

  const nextDueDate = await createNextOccurrence({ ...event, status: 'skipped' });

  return prisma.surveillanceEvent.update({
    where: { id: eventId },
    data: {
      status: 'skipped',
      resultSummary: `Skipped: ${reason}`,
      nextDueDate,
    },
  });
}

export async function rescheduleEvent(eventId: string, newDueDate: string) {
  return prisma.surveillanceEvent.update({
    where: { id: eventId },
    data: {
      dueDate: new Date(newDueDate),
    },
  });
}

export async function uploadEventResult(eventId: string, documentId: string) {
  const event = await prisma.surveillanceEvent.findUnique({ where: { id: eventId } });
  if (!event) throw new Error('Event not found');

  const doc = await prisma.documentUpload.findUnique({ where: { id: documentId } });
  if (!doc) throw new Error('Document not found');

  let resultSummary: string | null = null;

  // If document has extracted content, use Claude to extract key findings
  const extracted = (doc as any).extractedContent || (doc as any).extraction;
  if (extracted) {
    const extractionResult = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1024,
      system: `You are a medical document analyst. Extract key findings from surveillance test results.

Rules:
- NEVER announce or suggest recurrence — use "findings your oncologist should review" for anything concerning
- Report normal/abnormal status
- List key findings concisely
- Note if follow-up is recommended
- Keep the summary to 3-5 sentences maximum
- Tone: factual and neutral`,
      messages: [{
        role: 'user',
        content: `Surveillance event: ${event.title} (${event.type})
Description: ${event.description || 'N/A'}

Extracted document content:
${typeof extracted === 'string' ? extracted : JSON.stringify(extracted, null, 2)}

Provide a brief result summary.`,
      }],
    });

    resultSummary = (extractionResult.content[0] as { type: 'text'; text: string }).text;
  }

  return prisma.surveillanceEvent.update({
    where: { id: eventId },
    data: {
      resultDocumentId: documentId,
      ...(resultSummary ? { resultSummary } : {}),
    },
  });
}
