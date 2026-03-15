import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ trialId: string }> },
) {
  const { trialId } = await params;

  const trial = await prisma.trial.findUnique({
    where: { id: trialId },
    include: { sites: true },
  });

  if (!trial) {
    return NextResponse.json({ error: 'Trial not found' }, { status: 404 });
  }

  return NextResponse.json(trial);
}
