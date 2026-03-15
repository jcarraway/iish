import { NextRequest, NextResponse } from 'next/server';
import { extractionRequestSchema } from '@oncovax/shared';
import { runExtractionPipeline } from '@/lib/extraction';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { s3Keys, mimeTypes } = extractionRequestSchema.parse(body);

    const extractionId = randomUUID();

    // Await the full pipeline — client waits for completion
    const result = await runExtractionPipeline(extractionId, s3Keys, mimeTypes);

    return NextResponse.json({ extractionId, ...result });
  } catch (err) {
    if (err && typeof err === 'object' && 'issues' in err) {
      return NextResponse.json({ error: 'Invalid request', details: err }, { status: 400 });
    }
    console.error('Extraction error:', err);
    return NextResponse.json({ error: 'Extraction failed' }, { status: 500 });
  }
}
