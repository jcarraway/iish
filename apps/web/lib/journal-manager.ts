import { prisma } from './db';

// ============================================================================
// Journal entry lifecycle
// ============================================================================

export async function submitJournalEntry(patientId: string, input: {
  entryDate: string;
  energy: number;
  pain: number;
  mood: number;
  sleepQuality: number;
  hotFlashes?: number | null;
  jointPain?: number | null;
  newSymptoms?: string[] | null;
  exerciseType?: string | null;
  exerciseMinutes?: number | null;
  notes?: string | null;
}) {
  const date = new Date(input.entryDate);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (date > today) throw new Error('Entry date cannot be in the future');

  return prisma.journalEntry.upsert({
    where: {
      patientId_entryDate: {
        patientId,
        entryDate: date,
      },
    },
    create: {
      patientId,
      entryDate: date,
      energy: input.energy,
      pain: input.pain,
      mood: input.mood,
      sleepQuality: input.sleepQuality,
      hotFlashes: input.hotFlashes ?? null,
      jointPain: input.jointPain ?? null,
      newSymptoms: input.newSymptoms ?? [],
      exerciseType: input.exerciseType ?? null,
      exerciseMinutes: input.exerciseMinutes ?? null,
      notes: input.notes ?? null,
    },
    update: {
      energy: input.energy,
      pain: input.pain,
      mood: input.mood,
      sleepQuality: input.sleepQuality,
      hotFlashes: input.hotFlashes ?? null,
      jointPain: input.jointPain ?? null,
      newSymptoms: input.newSymptoms ?? [],
      exerciseType: input.exerciseType ?? null,
      exerciseMinutes: input.exerciseMinutes ?? null,
      notes: input.notes ?? null,
    },
  });
}

export async function deleteJournalEntry(patientId: string, entryId: string) {
  const entry = await prisma.journalEntry.findUnique({ where: { id: entryId } });
  if (!entry || entry.patientId !== patientId) throw new Error('Entry not found');
  await prisma.journalEntry.delete({ where: { id: entryId } });
}

export async function getJournalTrends(patientId: string, days: number) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const entries = await prisma.journalEntry.findMany({
    where: {
      patientId,
      entryDate: { gte: since },
    },
    orderBy: { entryDate: 'desc' },
  });

  if (entries.length === 0) {
    return {
      averageEnergy: null,
      averagePain: null,
      averageMood: null,
      averageSleep: null,
      energyDelta: null,
      painDelta: null,
      moodDelta: null,
      sleepDelta: null,
      streak: 0,
      totalEntries: 0,
      entries: [],
    };
  }

  // Split into this-week vs last-week halves for delta calculation
  const halfDays = Math.floor(days / 2);
  const midpoint = new Date();
  midpoint.setDate(midpoint.getDate() - halfDays);

  const recent = entries.filter(e => new Date(e.entryDate) >= midpoint);
  const older = entries.filter(e => new Date(e.entryDate) < midpoint);

  const avg = (arr: (number | null)[]): number | null => {
    const valid = arr.filter((v): v is number => v != null);
    if (valid.length === 0) return null;
    return valid.reduce((a, b) => a + b, 0) / valid.length;
  };

  const delta = (recentArr: (number | null)[], olderArr: (number | null)[]): number | null => {
    const recentAvg = avg(recentArr);
    const olderAvg = avg(olderArr);
    if (recentAvg == null || olderAvg == null) return null;
    return Math.round((recentAvg - olderAvg) * 10) / 10;
  };

  const streak = computeStreak(entries.map(e => e.entryDate));

  return {
    averageEnergy: avg(entries.map(e => e.energy)),
    averagePain: avg(entries.map(e => e.pain)),
    averageMood: avg(entries.map(e => e.mood)),
    averageSleep: avg(entries.map(e => e.sleepQuality)),
    energyDelta: delta(recent.map(e => e.energy), older.map(e => e.energy)),
    painDelta: delta(recent.map(e => e.pain), older.map(e => e.pain)),
    moodDelta: delta(recent.map(e => e.mood), older.map(e => e.mood)),
    sleepDelta: delta(recent.map(e => e.sleepQuality), older.map(e => e.sleepQuality)),
    streak,
    totalEntries: entries.length,
    entries,
  };
}

function computeStreak(dates: Date[]): number {
  if (dates.length === 0) return 0;
  const toDateStr = (d: Date) => d.toISOString().split('T')[0];
  const sorted = [...dates].map(toDateStr).sort((a, b) => b.localeCompare(a));
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (sorted[0] !== today && sorted[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diffDays = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}
