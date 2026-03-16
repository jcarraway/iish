import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const capability = url.searchParams.get('capability');
    const type = url.searchParams.get('type');
    const country = url.searchParams.get('country');
    const maxCost = url.searchParams.get('maxCost');
    const certification = url.searchParams.get('certification');

    const where: Record<string, unknown> = { status: 'active' };

    if (type) where.type = type;
    if (country) where.country = country;
    if (capability) where.capabilities = { has: capability };
    if (certification) where.certifications = { has: certification };
    if (maxCost) where.costRangeMin = { lte: parseFloat(maxCost) };

    const partners = await prisma.manufacturingPartner.findMany({
      where,
      orderBy: [{ capacityTier: 'asc' }, { name: 'asc' }],
    });

    return NextResponse.json({ partners, count: partners.length });
  } catch (err) {
    console.error('Manufacturing list error:', err);
    return NextResponse.json({ error: 'Failed to load manufacturing partners' }, { status: 500 });
  }
}
