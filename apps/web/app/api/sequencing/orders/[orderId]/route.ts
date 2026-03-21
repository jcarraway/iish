import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/session';
import { SEQUENCING_ORDER_STATUSES } from '@iish/shared';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    const session = await requireSession();
    const { orderId } = await params;

    const patient = await prisma.patient.findUnique({
      where: { userId: session.userId },
      select: { id: true },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 });
    }

    const order = await prisma.sequencingOrder.findFirst({
      where: { id: orderId, patientId: patient.id },
      include: { provider: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('Order detail error:', err);
    return NextResponse.json({ error: 'Failed to load order' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    const session = await requireSession();
    const { orderId } = await params;

    const patient = await prisma.patient.findUnique({
      where: { userId: session.userId },
      select: { id: true },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 });
    }

    const existing = await prisma.sequencingOrder.findFirst({
      where: { id: orderId, patientId: patient.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const body = await req.json();
    const { status, insuranceCoverage, lomnContent, results } = body as {
      status?: string;
      insuranceCoverage?: unknown;
      lomnContent?: string;
      results?: unknown;
    };

    const validStatuses = Object.values(SEQUENCING_ORDER_STATUSES);
    if (status && !validStatuses.includes(status as typeof validStatuses[number])) {
      return NextResponse.json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (insuranceCoverage !== undefined) updateData.insuranceCoverage = insuranceCoverage;
    if (lomnContent !== undefined) updateData.lomnContent = lomnContent;
    if (results !== undefined) updateData.results = results;

    const order = await prisma.sequencingOrder.update({
      where: { id: orderId },
      data: updateData,
      include: { provider: { select: { name: true, type: true } } },
    });

    return NextResponse.json({ order });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('Update order error:', err);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
