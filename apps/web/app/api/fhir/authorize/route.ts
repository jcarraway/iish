import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/session';
import { redis } from '@/lib/redis';
import { prisma } from '@/lib/db';
import { discoverEndpoints, buildAuthorizeUrl } from '@/lib/fhir/smart-auth';
import { FHIR_SCOPES } from '@oncovax/shared';

const EPIC_CLIENT_ID = process.env.EPIC_CLIENT_ID ?? 'oncovax-dev';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export async function GET(req: NextRequest) {
  try {
    const session = await requireSession();
    const healthSystemId = req.nextUrl.searchParams.get('healthSystemId');

    if (!healthSystemId) {
      return NextResponse.json({ error: 'healthSystemId required' }, { status: 400 });
    }

    // Look up health system
    const healthSystem = await prisma.healthSystem.findUnique({
      where: { id: healthSystemId },
    });

    if (!healthSystem) {
      return NextResponse.json({ error: 'Health system not found' }, { status: 404 });
    }

    // Discover SMART endpoints
    const endpoints = await discoverEndpoints(healthSystem.fhirBaseUrl);

    // Generate state param and store in Redis (5 min TTL)
    const state = crypto.randomUUID();
    await redis.setex(
      `fhir_state:${state}`,
      300,
      JSON.stringify({
        userId: session.userId,
        healthSystemId,
        healthSystemName: healthSystem.name,
        fhirBaseUrl: healthSystem.fhirBaseUrl,
        tokenUrl: endpoints.tokenUrl,
      }),
    );

    const redirectUri = `${APP_URL}/api/fhir/callback`;
    const authorizeUrl = buildAuthorizeUrl(endpoints, EPIC_CLIENT_ID, redirectUri, state, FHIR_SCOPES);

    return NextResponse.json({ authorizeUrl });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('FHIR authorize error:', err);
    return NextResponse.json({ error: 'Failed to initiate FHIR authorization' }, { status: 500 });
  }
}
