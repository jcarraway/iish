import { NextRequest, NextResponse } from 'next/server';
import { runIngestionCycle } from '@/lib/intel-manager';

function authenticate(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return false;
  const token = authHeader.replace('Bearer ', '');
  return token === process.env.CRON_SECRET;
}

export async function POST(req: NextRequest) {
  if (!authenticate(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const results = await runIngestionCycle();
    return NextResponse.json({ ok: true, results });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || 'Ingestion cycle failed' },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  if (!authenticate(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({ status: 'ok', service: 'intel-ingestion' });
}
