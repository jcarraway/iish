import { anthropic, CLAUDE_MODEL } from './ai';
import { redis } from './redis';
import { prisma } from './db';
import type { NeoantigenTrialMatch } from '@iish/shared';

const CACHE_TTL = 24 * 60 * 60; // 24 hours

const TRIAL_ASSESSMENT_SYSTEM = `You are a clinical trial matching specialist for neoantigen-based cancer immunotherapy. Given a patient's neoantigen profile, HLA genotype, and a list of clinical trials, assess which trials are most relevant.

For each relevant trial, provide:
- A relevance score (0-100)
- A brief explanation of why it's relevant to this specific patient
- Which of the patient's neoantigens or mutations are most relevant

Focus on trials involving:
- Neoantigen vaccines (mRNA, peptide, or dendritic cell-based)
- Checkpoint inhibitors (especially if TMB is high)
- Adoptive cell therapy targeting specific mutations
- Combination immunotherapy approaches

Respond ONLY with valid JSON.`;

export async function crossReferenceTrials(jobId: string): Promise<NeoantigenTrialMatch[]> {
  const cacheKey = `neoantigen-trials:${jobId}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached) as NeoantigenTrialMatch[];

  const job = await prisma.pipelineJob.findUniqueOrThrow({
    where: { id: jobId },
    include: {
      neoantigens: { orderBy: { rank: 'asc' }, take: 20 },
      patient: { select: { profile: true } },
    },
  });

  const profile = (job.patient.profile ?? {}) as { cancerType?: string; stage?: string };

  // Find relevant trials
  const trials = await prisma.trial.findMany({
    where: {
      status: { in: ['Recruiting', 'Not yet recruiting', 'Active, not recruiting'] },
      OR: [
        { interventionType: { contains: 'vaccine', mode: 'insensitive' } },
        { interventionName: { contains: 'neoantigen', mode: 'insensitive' } },
        { interventionName: { contains: 'mRNA', mode: 'insensitive' } },
        { interventionType: { contains: 'immunotherapy', mode: 'insensitive' } },
        { briefSummary: { contains: 'neoantigen', mode: 'insensitive' } },
        { briefSummary: { contains: 'personalized vaccine', mode: 'insensitive' } },
        { interventionName: { contains: 'checkpoint', mode: 'insensitive' } },
        { interventionName: { contains: 'pembrolizumab', mode: 'insensitive' } },
        { interventionName: { contains: 'nivolumab', mode: 'insensitive' } },
      ],
    },
    take: 50,
    select: {
      id: true,
      nctId: true,
      title: true,
      phase: true,
      interventionType: true,
      interventionName: true,
      briefSummary: true,
    },
  });

  if (trials.length === 0) {
    const empty: NeoantigenTrialMatch[] = [];
    await redis.set(cacheKey, JSON.stringify(empty), 'EX', CACHE_TTL);
    return empty;
  }

  const topNeoantigens = job.neoantigens.map((n) => ({
    gene: n.gene,
    mutation: n.mutation,
    mutantPeptide: n.mutantPeptide,
    hlaAllele: n.hlaAllele,
    compositeScore: n.compositeScore,
    confidence: n.confidence,
  }));

  const result = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 4096,
    system: TRIAL_ASSESSMENT_SYSTEM,
    messages: [{
      role: 'user',
      content: `Patient info:
- Cancer type: ${profile.cancerType ?? 'Unknown'}
- Stage: ${profile.stage ?? 'Unknown'}
- TMB: ${job.tmb ?? 'N/A'}
- HLA genotype: ${JSON.stringify(job.hlaGenotype ?? {})}

Top neoantigens:
${JSON.stringify(topNeoantigens, null, 2)}

Available trials:
${JSON.stringify(trials.map(t => ({
  id: t.id, nctId: t.nctId, title: t.title, phase: t.phase,
  type: t.interventionType, intervention: t.interventionName,
  summary: t.briefSummary?.slice(0, 300),
})), null, 2)}

Return a JSON array of relevant trial matches (relevance score > 30):
[{
  "trialId": "uuid",
  "nctId": "NCTxxxxxxxx",
  "title": "string",
  "phase": "string|null",
  "trialType": "string|null",
  "relevanceScore": number,
  "relevanceExplanation": "string",
  "matchedNeoantigens": ["gene names"]
}]`,
    }],
  });

  const text = (result.content[0] as { type: 'text'; text: string }).text;
  const matches: NeoantigenTrialMatch[] = JSON.parse(text.replace(/```json\n?|```\n?/g, '').trim());

  matches.sort((a, b) => b.relevanceScore - a.relevanceScore);

  await redis.set(cacheKey, JSON.stringify(matches), 'EX', CACHE_TTL);
  return matches;
}
