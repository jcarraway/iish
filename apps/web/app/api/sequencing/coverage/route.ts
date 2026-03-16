import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/session';
import { checkSequencingCoverage } from '@/lib/coverage';

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();

    const patient = await prisma.patient.findUnique({
      where: { userId: session.userId },
      select: { id: true },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 });
    }

    const body = await req.json();
    const { testType, insurer } = body as { testType: string; insurer?: string };

    if (!testType) {
      return NextResponse.json({ error: 'testType is required' }, { status: 400 });
    }

    const result = await checkSequencingCoverage(patient.id, testType, insurer);

    return NextResponse.json({ coverage: result });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('Coverage check error:', err);
    return NextResponse.json({ error: 'Failed to check coverage' }, { status: 500 });
  }
}
