import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/session';
import { MATCH_STATUSES } from '@oncovax/shared';
import { z } from 'zod';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ matchId: string }> },
) {
  try {
    const session = await requireSession();
    const { matchId } = await params;

    const patient = await prisma.patient.findUnique({
      where: { userId: session.userId },
      select: { id: true },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 });
    }

    const match = await prisma.match.findFirst({
      where: { id: matchId, patientId: patient.id },
      include: {
        trial: {
          include: {
            sites: {
              select: {
                facility: true,
                city: true,
                state: true,
                country: true,
                lat: true,
                lng: true,
                contactName: true,
                contactEmail: true,
                contactPhone: true,
              },
            },
          },
        },
      },
    });

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    return NextResponse.json({ match });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('Get match error:', err);
    return NextResponse.json({ error: 'Failed to load match' }, { status: 500 });
  }
}

const updateMatchSchema = z.object({
  status: z.enum([
    MATCH_STATUSES.SAVED,
    MATCH_STATUSES.CONTACTED,
    MATCH_STATUSES.APPLIED,
    MATCH_STATUSES.DISMISSED,
  ]),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ matchId: string }> },
) {
  try {
    const session = await requireSession();
    const { matchId } = await params;

    const patient = await prisma.patient.findUnique({
      where: { userId: session.userId },
      select: { id: true },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 });
    }

    const body = await req.json();
    const data = updateMatchSchema.parse(body);

    const match = await prisma.match.updateMany({
      where: { id: matchId, patientId: patient.id },
      data: { status: data.status },
    });

    if (match.count === 0) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: err.issues }, { status: 400 });
    }
    console.error('Update match error:', err);
    return NextResponse.json({ error: 'Failed to update match' }, { status: 500 });
  }
}
