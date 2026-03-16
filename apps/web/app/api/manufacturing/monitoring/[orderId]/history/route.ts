import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/session';

export async function GET(
  _req: Request,
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
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    const order = await prisma.manufacturingOrder.findFirst({
      where: { id: orderId, patientId: patient.id },
      select: { id: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const reports = await prisma.postAdministrationReport.findMany({
      where: { orderId },
      orderBy: { createdAt: 'asc' },
    });

    // AE summary
    const allAdverseEvents = reports
      .filter((r) => r.hasAdverseEvents && r.adverseEvents)
      .flatMap((r) => (r.adverseEvents as { event: string; severity: string }[]) ?? []);

    const aeSummary = {
      totalReports: reports.length,
      reportsWithAE: reports.filter((r) => r.hasAdverseEvents).length,
      uniqueEvents: [...new Set(allAdverseEvents.map((ae) => ae.event))],
      severityCounts: allAdverseEvents.reduce(
        (acc, ae) => {
          acc[ae.severity] = (acc[ae.severity] ?? 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      ),
    };

    return NextResponse.json({ reports, aeSummary });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('Monitoring history error:', err);
    return NextResponse.json({ error: 'Failed to load history' }, { status: 500 });
  }
}
