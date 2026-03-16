import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { geocodeZip, filterByDistance } from '@/lib/providers';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const zip = url.searchParams.get('zip');
    const radiusMiles = parseInt(url.searchParams.get('radius') ?? '50', 10);
    const canAdministerMrna = url.searchParams.get('canAdministerMrna') === 'true';
    const hasInfusionCenter = url.searchParams.get('hasInfusionCenter') === 'true';
    const investigationalExp = url.searchParams.get('investigationalExp') === 'true';

    const where: Record<string, unknown> = { verified: true };
    if (canAdministerMrna) where.canAdministerMrna = true;
    if (hasInfusionCenter) where.hasInfusionCenter = true;
    if (investigationalExp) where.investigationalExp = true;

    const sites = await prisma.administrationSite.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    // If zip provided, geocode and filter by distance
    if (zip) {
      const coords = await geocodeZip(zip);
      if (coords) {
        const filtered = filterByDistance(sites, coords, radiusMiles);
        return NextResponse.json({
          sites: filtered.map((s) => ({ ...s, distance: Math.round(s.distance * 10) / 10 })),
          count: filtered.length,
          origin: coords,
        });
      }
    }

    return NextResponse.json({ sites, count: sites.length });
  } catch (err) {
    console.error('Provider search error:', err);
    return NextResponse.json({ error: 'Failed to search providers' }, { status: 500 });
  }
}
