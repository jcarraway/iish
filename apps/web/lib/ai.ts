import Anthropic from '@anthropic-ai/sdk';

export const CLAUDE_MODEL = 'claude-opus-4-20250514';

export const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export async function analyzeImageFromUrl(imageUrl: string, prompt: string): Promise<string> {
  const res = await fetch(imageUrl);
  const buffer = await res.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  const mediaType = (res.headers.get('content-type') ?? 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/webp';

  const message = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
        { type: 'text', text: prompt },
      ],
    }],
  });

  return (message.content[0] as { type: 'text'; text: string }).text;
}

export async function analyzeImageStructured<T>(imageUrl: string, systemPrompt: string, jsonSchema: string): Promise<T> {
  const prompt = `${systemPrompt}\n\nRespond ONLY with a valid JSON object matching this schema. No markdown, no preamble:\n${jsonSchema}`;
  const raw = await analyzeImageFromUrl(imageUrl, prompt);
  const clean = raw.replace(/```json\n?|```\n?/g, '').trim();
  return JSON.parse(clean) as T;
}
