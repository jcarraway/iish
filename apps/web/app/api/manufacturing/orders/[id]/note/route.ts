import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/session';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireSession();
    const { id } = await params;
    const { note, noteType } = await req.json();

    if (!note || !noteType) {
      return NextResponse.json({ error: 'note and noteType are required' }, { status: 400 });
    }

    if (!['patient', 'physician', 'system'].includes(noteType)) {
      return NextResponse.json({ error: 'noteType must be patient, physician, or system' }, { status: 400 });
    }

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

    const existingNotes = (order.notes as { type: string; text: string; at: string }[]) ?? [];
    const newNote = { type: noteType, text: note, at: new Date().toISOString() };

    const updated = await prisma.manufacturingOrder.update({
      where: { id },
      data: { notes: [...existingNotes, newNote] },
    });

    return NextResponse.json({ notes: updated.notes });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('Add note error:', err);
    return NextResponse.json({ error: 'Failed to add note' }, { status: 500 });
  }
}
