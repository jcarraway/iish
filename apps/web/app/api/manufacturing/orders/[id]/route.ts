import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/session';
import { getOrderTimeline, isValidTransition } from '@/lib/manufacturing-orders';
import type { ManufacturingOrderStatus } from '@iish/shared';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireSession();
    const { id } = await params;

    const patient = await prisma.patient.findUnique({
      where: { userId: session.userId },
      select: { id: true },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    const order = await prisma.manufacturingOrder.findFirst({
      where: { id, patientId: patient.id },
      include: {
        partner: true,
        administrationSite: true,
        reports: { orderBy: { createdAt: 'asc' } },
        assessment: { select: { id: true, recommendedPathway: true, pathwayRationale: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const timeline = getOrderTimeline({
      status: order.status,
      createdAt: order.createdAt,
      blueprintSentAt: order.blueprintSentAt,
      productionStartedAt: order.productionStartedAt,
      qcStartedAt: order.qcStartedAt,
      qcCompletedAt: order.qcCompletedAt,
      shippedAt: order.shippedAt,
      deliveredAt: order.deliveredAt,
      administeredAt: order.administeredAt,
    });

    return NextResponse.json({ order, timeline });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('Get manufacturing order error:', err);
    return NextResponse.json({ error: 'Failed to load order' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireSession();
    const { id } = await params;
    const body = await req.json();

    const patient = await prisma.patient.findUnique({
      where: { userId: session.userId },
      select: { id: true },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    const order = await prisma.manufacturingOrder.findFirst({
      where: { id, patientId: patient.id },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Validate status transition if status is changing
    if (body.status && body.status !== order.status) {
      if (!isValidTransition(order.status as ManufacturingOrderStatus, body.status)) {
        return NextResponse.json(
          { error: `Cannot transition from ${order.status} to ${body.status}` },
          { status: 400 },
        );
      }
    }

    const allowedFields: Record<string, true> = {
      status: true,
      quotePrice: true,
      quoteCurrency: true,
      quoteTurnaroundWeeks: true,
      quoteExpiresAt: true,
      quoteDocumentPath: true,
      productionStartedAt: true,
      productionEstimatedCompletion: true,
      batchNumber: true,
      qcStartedAt: true,
      qcCompletedAt: true,
      qcPassed: true,
      qcReportPath: true,
      qcNotes: true,
      shippedAt: true,
      trackingNumber: true,
      shippingCarrier: true,
      shippingConditions: true,
      deliveredAt: true,
      administeredAt: true,
      administeredBy: true,
      totalCost: true,
      paymentStatus: true,
    };

    const updateData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(body)) {
      if (allowedFields[key]) {
        updateData[key] = value;
      }
    }

    const updated = await prisma.manufacturingOrder.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ order: updated });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('Update manufacturing order error:', err);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
