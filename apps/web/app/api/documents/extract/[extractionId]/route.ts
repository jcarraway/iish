import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ extractionId: string }> }
) {
  const { extractionId } = await params;

  const data = await redis.get(`extraction:${extractionId}`);
  if (!data) {
    return NextResponse.json({ error: 'Extraction not found' }, { status: 404 });
  }

  return NextResponse.json(JSON.parse(data));
}
