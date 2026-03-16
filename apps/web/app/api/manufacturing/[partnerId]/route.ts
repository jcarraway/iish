import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ partnerId: string }> },
) {
  try {
    const { partnerId } = await params;

    const partner = await prisma.manufacturingPartner.findUnique({
      where: { id: partnerId },
    });

    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    return NextResponse.json({ partner });
  } catch (err) {
    console.error('Manufacturing partner detail error:', err);
    return NextResponse.json({ error: 'Failed to load partner' }, { status: 500 });
  }
}
