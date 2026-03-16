import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/session';
import { trackEvent } from '@/lib/events';

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    const { partnerId, message, pipelineJobId } = await req.json();

    if (!partnerId) {
      return NextResponse.json({ error: 'partnerId is required' }, { status: 400 });
    }

    const patient = await prisma.patient.findUnique({
      where: { userId: session.userId },
      select: { id: true },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 });
    }

    const partner = await prisma.manufacturingPartner.findUnique({
      where: { id: partnerId },
      select: { id: true, name: true, contactUrl: true, contactEmail: true },
    });

    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    // Track the inquiry event
    await trackEvent(session.userId, 'manufacturing_inquiry', {
      partnerId,
      partnerName: partner.name,
      hasPipelineJob: !!pipelineJobId,
      hasMessage: !!message,
    });

    return NextResponse.json({
      success: true,
      partner: {
        name: partner.name,
        contactUrl: partner.contactUrl,
        contactEmail: partner.contactEmail,
      },
      message: 'Inquiry logged. Please contact the manufacturer directly using the provided contact information.',
    });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('Manufacturing inquire error:', err);
    return NextResponse.json({ error: 'Failed to submit inquiry' }, { status: 500 });
  }
}
