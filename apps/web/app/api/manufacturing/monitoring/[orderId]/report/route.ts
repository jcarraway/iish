import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/session';
import { checkAdverseEventEscalation } from '@/lib/monitoring';
import { trackEvent } from '@/lib/events';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    const session = await requireSession();
    const { orderId } = await params;
    const body = await req.json();

    const patient = await prisma.patient.findUnique({
      where: { userId: session.userId },
      select: { id: true },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    const order = await prisma.manufacturingOrder.findFirst({
      where: { id: orderId, patientId: patient.id },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (!order.administeredAt) {
      return NextResponse.json({ error: 'Vaccine has not been administered yet' }, { status: 400 });
    }

    // Calculate days post-administration
    const adminDate = new Date(order.administeredAt);
    const now = new Date();
    const daysPost = Math.round((now.getTime() - adminDate.getTime()) / (1000 * 60 * 60 * 24));

    const report = await prisma.postAdministrationReport.create({
      data: {
        orderId,
        reportType: body.reportType,
        daysPostAdministration: daysPost,
        hasAdverseEvents: body.hasAdverseEvents ?? false,
        adverseEvents: body.adverseEvents ?? null,
        temperature: body.temperature ?? null,
        bloodPressure: body.bloodPressure ?? null,
        heartRate: body.heartRate ?? null,
        labResults: body.labResults ?? null,
        imagingResults: body.imagingResults ?? null,
        tumorResponse: body.tumorResponse ?? null,
        narrative: body.narrative ?? null,
        qualityOfLifeScore: body.qualityOfLifeScore ?? null,
        status: 'submitted',
      },
    });

    // Check for AE escalation
    let escalation = null;
    if (body.hasAdverseEvents && body.adverseEvents?.length > 0) {
      escalation = checkAdverseEventEscalation(body.adverseEvents);
    }

    await trackEvent(session.userId, 'monitoring_report_submitted', {
      orderId,
      reportType: body.reportType,
      hasAdverseEvents: body.hasAdverseEvents ?? false,
    });

    return NextResponse.json({ report, escalation });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('Submit monitoring report error:', err);
    return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 });
  }
}
