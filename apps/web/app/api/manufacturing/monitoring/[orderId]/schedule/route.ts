import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/session';
import { getMonitoringSchedule } from '@/lib/monitoring';

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
      select: { administeredAt: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (!order.administeredAt) {
      return NextResponse.json({ error: 'Vaccine has not been administered yet' }, { status: 400 });
    }

    const reports = await prisma.postAdministrationReport.findMany({
      where: { orderId },
      select: { reportType: true, createdAt: true },
    });

    const schedule = getMonitoringSchedule(
      order.administeredAt,
      reports.map((r) => ({ reportType: r.reportType, createdAt: r.createdAt.toISOString() })),
    );

    return NextResponse.json({ schedule });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('Monitoring schedule error:', err);
    return NextResponse.json({ error: 'Failed to load schedule' }, { status: 500 });
  }
}
