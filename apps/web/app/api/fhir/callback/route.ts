import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { prisma } from '@/lib/db';
import { exchangeCodeForTokens, encryptToken } from '@/lib/fhir/smart-auth';
import { FHIR_SCOPES } from '@oncovax/shared';

const EPIC_CLIENT_ID = process.env.EPIC_CLIENT_ID ?? 'oncovax-dev';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get('code');
    const state = req.nextUrl.searchParams.get('state');
    const error = req.nextUrl.searchParams.get('error');

    // Handle OAuth denial
    if (error) {
      return NextResponse.redirect(`${APP_URL}/start/mychart?error=denied`);
    }

    if (!code || !state) {
      return NextResponse.redirect(`${APP_URL}/start/mychart?error=missing_params`);
    }

    // Validate state
    const stateData = await redis.get(`fhir_state:${state}`);
    if (!stateData) {
      return NextResponse.redirect(`${APP_URL}/start/mychart?error=invalid_state`);
    }
    await redis.del(`fhir_state:${state}`);

    const { userId, healthSystemId, healthSystemName, fhirBaseUrl, tokenUrl } = JSON.parse(stateData);

    // Exchange code for tokens
    const redirectUri = `${APP_URL}/api/fhir/callback`;
    const tokens = await exchangeCodeForTokens(
      { authorizeUrl: '', tokenUrl, fhirBaseUrl },
      code,
      EPIC_CLIENT_ID,
      redirectUri,
    );

    // Encrypt tokens for storage
    const accessTokenEnc = await encryptToken(tokens.accessToken);
    const refreshTokenEnc = tokens.refreshToken ? await encryptToken(tokens.refreshToken) : null;

    // Ensure patient record exists
    const patient = await prisma.patient.findFirst({ where: { userId } });
    if (!patient) {
      return NextResponse.redirect(`${APP_URL}/start/mychart?error=no_patient`);
    }

    // Create or update FhirConnection
    const existing = await prisma.fhirConnection.findFirst({
      where: { patientId: patient.id, healthSystemId },
    });

    const connectionData = {
      healthSystemId,
      healthSystemName,
      fhirBaseUrl,
      providerSystem: 'epic_mychart',
      accessTokenEnc,
      refreshTokenEnc,
      tokenExpiresAt: tokens.expiresIn
        ? new Date(Date.now() + tokens.expiresIn * 1000)
        : null,
      scopesGranted: tokens.scope ? tokens.scope.split(' ') : [...FHIR_SCOPES],
      syncStatus: 'connected',
      consentGiven: true,
      consentAt: new Date(),
      consentScopes: [...FHIR_SCOPES],
    };

    let connectionId: string;
    if (existing) {
      await prisma.fhirConnection.update({
        where: { id: existing.id },
        data: connectionData,
      });
      connectionId = existing.id;
    } else {
      const conn = await prisma.fhirConnection.create({
        data: { patientId: patient.id, ...connectionData },
      });
      connectionId = conn.id;
    }

    // Update patient intake path
    await prisma.patient.update({
      where: { id: patient.id },
      data: { intakePath: 'mychart' },
    });

    return NextResponse.redirect(
      `${APP_URL}/start/mychart?connected=true&connectionId=${connectionId}`,
    );
  } catch (err) {
    console.error('FHIR callback error:', err);
    return NextResponse.redirect(`${APP_URL}/start/mychart?error=token_exchange_failed`);
  }
}
