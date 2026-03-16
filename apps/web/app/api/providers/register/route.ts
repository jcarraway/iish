import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { geocodeAddress } from '@/lib/mapbox';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2),
  type: z.enum(['academic_medical_center', 'community_oncology', 'infusion_center', 'hospital']),
  contactName: z.string().min(2),
  contactEmail: z.string().email(),
  contactPhone: z.string().optional(),
  website: z.string().url().optional(),
  address: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  zip: z.string().min(5),
  country: z.string().default('United States'),
  canAdministerMrna: z.boolean().default(false),
  hasInfusionCenter: z.boolean().default(false),
  hasEmergencyResponse: z.boolean().default(false),
  hasMonitoringCapacity: z.boolean().default(false),
  investigationalExp: z.boolean().default(false),
  irbAffiliation: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    // Geocode the address
    const coords = await geocodeAddress({
      city: data.city,
      state: data.state,
      country: data.country,
    });

    const site = await prisma.administrationSite.create({
      data: {
        ...data,
        lat: coords?.lat ?? null,
        lng: coords?.lng ?? null,
        verified: false,
        willingToAdminister: true,
      },
    });

    return NextResponse.json({
      site: { id: site.id, name: site.name },
      message: 'Registration received. Your facility will be verified by our team.',
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: err.issues }, { status: 400 });
    }
    console.error('Provider registration error:', err);
    return NextResponse.json({ error: 'Failed to register site' }, { status: 500 });
  }
}
