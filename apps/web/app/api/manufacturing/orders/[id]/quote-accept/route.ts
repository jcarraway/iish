import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/session';
import { trackEvent } from '@/lib/events';

export async function POST(
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
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.status !== 'quote_received') {
      return NextResponse.json(
        { error: `Cannot accept quote — order status is "${order.status}", expected "quote_received"` },
        { status: 400 },
      );
    }

    if (order.quoteExpiresAt && new Date(order.quoteExpiresAt) < new Date()) {
      return NextResponse.json({ error: 'Quote has expired' }, { status: 400 });
    }

    const existingNotes = (order.notes as { type: string; text: string; at: string }[]) ?? [];
    const updated = await prisma.manufacturingOrder.update({
      where: { id },
      data: {
        status: 'quote_accepted',
        totalCost: order.quotePrice,
        notes: [
          ...existingNotes,
          { type: 'system', text: 'Quote accepted by patient', at: new Date().toISOString() },
        ],
      },
    });

    await trackEvent(session.userId, 'manufacturing_quote_accepted', {
      orderId: id,
      quotePrice: order.quotePrice ?? 0,
    });

    return NextResponse.json({ order: updated });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('Accept quote error:', err);
    return NextResponse.json({ error: 'Failed to accept quote' }, { status: 500 });
  }
}
