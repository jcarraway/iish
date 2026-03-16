import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/session';
import { trackEvent } from '@/lib/events';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireSession();
    const { id } = await params;
    const { siteId } = await req.json();

    if (!siteId) {
      return NextResponse.json({ error: 'siteId is required' }, { status: 400 });
    }

    const patient = await prisma.patient.findUnique({
      where: { userId: session.userId },
      select: { id: true },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    const [order, site] = await Promise.all([
      prisma.manufacturingOrder.findFirst({ where: { id, patientId: patient.id } }),
      prisma.administrationSite.findUnique({ where: { id: siteId } }),
    ]);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    if (!site) {
      return NextResponse.json({ error: 'Administration site not found' }, { status: 404 });
    }

    const existingNotes = (order.notes as { type: string; text: string; at: string }[]) ?? [];
    const updated = await prisma.manufacturingOrder.update({
      where: { id },
      data: {
        administrationSiteId: siteId,
        notes: [
          ...existingNotes,
          { type: 'system', text: `Administration site connected: ${site.name}`, at: new Date().toISOString() },
        ],
      },
    });

    await trackEvent(session.userId, 'administration_site_connected', {
      orderId: id,
      siteId,
      siteName: site.name,
    });

    return NextResponse.json({ order: updated });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('Connect site error:', err);
    return NextResponse.json({ error: 'Failed to connect site' }, { status: 500 });
  }
}
