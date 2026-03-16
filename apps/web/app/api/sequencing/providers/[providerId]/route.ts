import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ providerId: string }> },
) {
  try {
    const { providerId } = await params;

    const provider = await prisma.sequencingProvider.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    return NextResponse.json({ provider });
  } catch (err) {
    console.error('Provider detail error:', err);
    return NextResponse.json({ error: 'Failed to load provider' }, { status: 500 });
  }
}
