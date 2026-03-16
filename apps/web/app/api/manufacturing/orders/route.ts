import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/session';
import { packageBlueprint } from '@/lib/manufacturing-orders';
import { trackEvent } from '@/lib/events';

export async function GET() {
  try {
    const session = await requireSession();

    const patient = await prisma.patient.findUnique({
      where: { userId: session.userId },
      select: { id: true },
    });

    if (!patient) {
      return NextResponse.json({ orders: [] });
    }

    const orders = await prisma.manufacturingOrder.findMany({
      where: { patientId: patient.id },
      include: {
        partner: { select: { id: true, name: true, slug: true, type: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      orders: orders.map((o) => ({
        id: o.id,
        status: o.status,
        partnerName: o.partner.name,
        partnerId: o.partner.id,
        partnerSlug: o.partner.slug,
        partnerType: o.partner.type,
        pipelineJobId: o.pipelineJobId,
        quotePrice: o.quotePrice,
        quoteCurrency: o.quoteCurrency,
        quoteTurnaroundWeeks: o.quoteTurnaroundWeeks,
        totalCost: o.totalCost,
        batchNumber: o.batchNumber,
        trackingNumber: o.trackingNumber,
        message: o.message,
        createdAt: o.createdAt.toISOString(),
        updatedAt: o.updatedAt.toISOString(),
      })),
    });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('List manufacturing orders error:', err);
    return NextResponse.json({ error: 'Failed to load orders' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    const { partnerId, pipelineJobId, assessmentId, message } = await req.json();

    if (!partnerId || !pipelineJobId) {
      return NextResponse.json({ error: 'partnerId and pipelineJobId are required' }, { status: 400 });
    }

    const patient = await prisma.patient.findUnique({
      where: { userId: session.userId },
      select: { id: true },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 });
    }

    const [partner, pipelineJob] = await Promise.all([
      prisma.manufacturingPartner.findUnique({ where: { id: partnerId } }),
      prisma.pipelineJob.findUnique({
        where: { id: pipelineJobId },
        select: { id: true, patientId: true, vaccineBlueprint: true, topNeoantigens: true, hlaGenotype: true, neoantigenCount: true, status: true },
      }),
    ]);

    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }
    if (!pipelineJob || pipelineJob.patientId !== patient.id) {
      return NextResponse.json({ error: 'Pipeline job not found' }, { status: 404 });
    }

    const blueprint = packageBlueprint(pipelineJob);

    const order = await prisma.manufacturingOrder.create({
      data: {
        patientId: patient.id,
        partnerId,
        pipelineJobId,
        assessmentId: assessmentId || null,
        status: 'inquiry_sent',
        blueprintSentAt: new Date(),
        blueprintFormat: 'oncovax_blueprint_v1',
        blueprintVersion: '1.0',
        message: message || null,
        notes: [{ type: 'system', text: 'Order created — inquiry sent to manufacturer', at: new Date().toISOString() }],
      },
    });

    await trackEvent(session.userId, 'manufacturing_order_created', {
      orderId: order.id,
      partnerId,
      partnerName: partner.name,
    });

    return NextResponse.json({
      order: { id: order.id, status: order.status },
      blueprint,
    });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('Create manufacturing order error:', err);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
