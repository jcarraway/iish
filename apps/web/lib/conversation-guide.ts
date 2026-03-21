import { anthropic, CLAUDE_MODEL } from './ai';
import { redis } from './redis';
import type { PatientProfile, TestRecommendation, ConversationGuide } from '@iish/shared';

const CACHE_TTL = 24 * 60 * 60; // 24 hours

const GUIDE_SYSTEM = `You are an expert patient advocate who helps cancer patients communicate effectively with their oncologists about genomic sequencing. You create practical, ready-to-use conversation tools.

Rules:
- Write at an 8th-grade reading level
- Be confident but not pushy — the patient is asking, not demanding
- Use the patient's specific cancer type, stage, and recommended test
- Make the email template ready to send with only [YOUR NAME] and [DATE] as placeholders
- Include provider-specific ordering details when available

Respond ONLY with valid JSON matching the requested schema.`;

export async function generateConversationGuide(
  profile: PatientProfile,
  patientId: string,
  testRecommendation: TestRecommendation,
): Promise<ConversationGuide> {
  const cached = await redis.get(`conv-guide:${patientId}`);
  if (cached) {
    return JSON.parse(cached) as ConversationGuide;
  }

  const cancerType = profile.cancerType ?? profile.cancerTypeNormalized ?? 'cancer';
  const stage = profile.stage ?? '';
  const test = testRecommendation.primary;

  const result = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 3072,
    system: GUIDE_SYSTEM,
    messages: [{
      role: 'user',
      content: `Patient profile:
- Cancer type: ${cancerType}
- Stage: ${stage}
- Prior treatments: ${profile.priorTreatments?.map(t => t.name).join(', ') || 'None documented'}
- Age: ${profile.age ?? 'Unknown'}

Recommended test:
- Provider: ${test.providerName}
- Test: ${test.testName}
- Type: ${test.testType}
- Gene count: ${test.geneCount}
- Sample: ${test.sampleType}
- FDA approved: ${test.fdaApproved ? 'Yes' : 'No'}

Generate a conversation guide as JSON:
{
  "talkingPoints": [
    { "point": "string - key point to raise with oncologist", "detail": "string - supporting detail or how to phrase it" }
  ],
  "questionsToAsk": [
    { "question": "string - specific question for the oncologist", "whyItMatters": "string - why this question is important for the patient" }
  ],
  "emailTemplate": "string - complete MyChart/email message ready to send. Include [YOUR NAME] and [DATE] placeholders. Should mention the specific test and why the patient is interested based on their diagnosis.",
  "orderingInstructions": "string - step-by-step instructions for getting the test ordered through their oncologist, specific to the recommended provider"
}

Include 4-5 talking points and 5-6 questions.`,
    }],
  });

  const text = (result.content[0] as { type: 'text'; text: string }).text;
  const parsed = JSON.parse(text.replace(/```json\n?|```\n?/g, '').trim());

  const guide: ConversationGuide = {
    ...parsed,
    generatedAt: new Date().toISOString(),
  };

  await redis.set(`conv-guide:${patientId}`, JSON.stringify(guide), 'EX', CACHE_TTL);

  return guide;
}
