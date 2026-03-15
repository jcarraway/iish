import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/session';
import { parseTrialEligibility } from '@/lib/eligibility-parser';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ trialId: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { role: true },
  });

  if (user?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { trialId } = await params;

  const trial = await prisma.trial.findUnique({
    where: { id: trialId },
    select: { id: true, nctId: true },
  });

  if (!trial) {
    return NextResponse.json({ error: 'Trial not found' }, { status: 404 });
  }

  try {
    const parsed = await parseTrialEligibility(trialId, prisma);
    return NextResponse.json({ success: true, parsedEligibility: parsed });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Parse failed: ${message}` }, { status: 500 });
  }
}
