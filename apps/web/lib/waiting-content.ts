import { anthropic, CLAUDE_MODEL } from './ai';
import { redis } from './redis';
import type { WaitingContent } from '@oncovax/shared';

const CACHE_TTL = 24 * 60 * 60; // 24 hours

function normalizeCancerType(cancerType: string): string {
  return cancerType
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

const WAITING_SYSTEM = `You are an expert oncology educator helping cancer patients understand what genomic sequencing results might show. You create educational content about common mutations for specific cancer types.

Rules:
- Be factual and evidence-based
- Use plain language (8th-grade reading level)
- Include real mutation names, frequencies, and associated drugs
- Frequencies should be approximate ranges (e.g., "15-20%")
- Be honest but not frightening — frame mutations as opportunities for targeted treatment
- Only include well-established, published mutation data

Respond ONLY with valid JSON matching the requested schema.`;

export async function generateWaitingContent(cancerType: string): Promise<WaitingContent> {
  const normalized = normalizeCancerType(cancerType);
  const cacheKey = `waiting-content:${normalized}`;

  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached) as WaitingContent;
  }

  const result = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 3072,
    system: WAITING_SYSTEM,
    messages: [{
      role: 'user',
      content: `Cancer type: ${cancerType}

Generate educational waiting content as JSON:
{
  "commonMutations": [
    {
      "name": "string - mutation/gene name (e.g., EGFR, KRAS, BRCA1)",
      "frequency": "string - how common in this cancer type (e.g., '15-20%')",
      "significance": "string - what it means in plain language",
      "drugs": ["string - FDA-approved targeted therapies for this mutation"]
    }
  ],
  "whatMutationsMean": "string - 2-3 paragraph plain-language explanation of what mutations are and why they matter for treatment",
  "clinicalTrialContext": "string - how genomic results can open doors to clinical trials, specific to this cancer type",
  "timelineExpectations": "string - what to expect while waiting for results (typical 2-3 weeks), when to contact the lab, what the report will look like"
}

Include 5-8 of the most common/important mutations for ${cancerType}. Only include mutations with at least one FDA-approved targeted therapy or active clinical trial significance.`,
    }],
  });

  const text = (result.content[0] as { type: 'text'; text: string }).text;
  const parsed = JSON.parse(text.replace(/```json\n?|```\n?/g, '').trim());

  const content: WaitingContent = {
    cancerType,
    ...parsed,
    generatedAt: new Date().toISOString(),
  };

  await redis.set(cacheKey, JSON.stringify(content), 'EX', CACHE_TTL);

  return content;
}
