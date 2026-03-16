import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const site = await prisma.administrationSite.findUnique({
      where: { id },
    });

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    return NextResponse.json({ site });
  } catch (err) {
    console.error('Provider detail error:', err);
    return NextResponse.json({ error: 'Failed to load site' }, { status: 500 });
  }
}
