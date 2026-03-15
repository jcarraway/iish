import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/session';
import { runTrialSync } from '@/lib/trial-sync';
import { parseAllUnparsedTrials } from '@/lib/eligibility-parser';

export async function POST(req: NextRequest) {
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

  const body = await req.json().catch(() => ({}));
  const skipParse = body.skipParse === true;

  const logs: string[] = [];
  const log = (msg: string) => {
    logs.push(msg);
    console.log(`[trial-sync] ${msg}`);
  };

  const syncResult = await runTrialSync(prisma, { onProgress: log });

  let parseResult = null;
  if (!skipParse) {
    parseResult = await parseAllUnparsedTrials(prisma, { onProgress: log });
  }

  return NextResponse.json({ syncResult, parseResult, logs });
}
