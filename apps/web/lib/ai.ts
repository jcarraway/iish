import Anthropic from '@anthropic-ai/sdk';

export const CLAUDE_MODEL = 'claude-opus-4-20250514';

let _anthropic: Anthropic;
export function getAnthropic() {
  if (!_anthropic) _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  return _anthropic;
}

/** @deprecated Use getAnthropic() instead */
export const anthropic = new Proxy({} as Anthropic, {
  get(_, prop) {
    const a = getAnthropic();
    const val = (a as any)[prop];
    return typeof val === 'function' ? val.bind(a) : val;
  },
});

type ImageMediaType = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';
type DocMediaType = 'application/pdf';

function isDocMediaType(ct: string): ct is DocMediaType {
  return ct === 'application/pdf';
}

function toContentBlock(base64: string, contentType: string): Anthropic.ImageBlockParam | Anthropic.DocumentBlockParam {
  if (isDocMediaType(contentType)) {
    return { type: 'document', source: { type: 'base64', media_type: contentType, data: base64 } };
  }
  const mediaType = (['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(contentType)
    ? contentType
    : 'image/jpeg') as ImageMediaType;
  return { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } };
}

export async function analyzeImageFromUrl(imageUrl: string, prompt: string): Promise<string> {
  const res = await fetch(imageUrl);
  const buffer = await res.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  const contentType = res.headers.get('content-type') ?? 'image/jpeg';

  const message = await getAnthropic().messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: [
        toContentBlock(base64, contentType),
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

export async function analyzeMultipleImages(
  imageUrls: string[],
  systemPrompt: string,
  userPrompt: string
): Promise<{ text: string; inputTokens: number; outputTokens: number }> {
  // Fetch all images in parallel
  const imageResults = await Promise.all(
    imageUrls.map(async (url) => {
      const res = await fetch(url);
      const buffer = await res.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      const contentType = res.headers.get('content-type') ?? 'image/jpeg';
      return { base64, contentType };
    })
  );

  const content: Anthropic.ContentBlockParam[] = [
    ...imageResults.map(({ base64, contentType }) => toContentBlock(base64, contentType)),
    { type: 'text' as const, text: userPrompt },
  ];

  const message = await getAnthropic().messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content }],
  });

  const text = (message.content[0] as { type: 'text'; text: string }).text;

  return {
    text,
    inputTokens: message.usage.input_tokens,
    outputTokens: message.usage.output_tokens,
  };
}
