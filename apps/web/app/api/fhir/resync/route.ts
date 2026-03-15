import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/session';
import { prisma } from '@/lib/db';
import { decryptToken, refreshAccessToken, encryptToken } from '@/lib/fhir/smart-auth';
import { discoverEndpoints } from '@/lib/fhir/smart-auth';
import { FhirClient } from '@/lib/fhir/client';
import { extractFhirResources } from '@/lib/fhir/extract-resources';
import { mapFhirToPatientProfile } from '@/lib/fhir/mapper';
import type { PatientProfile } from '@oncovax/shared';

const EPIC_CLIENT_ID = process.env.EPIC_CLIENT_ID ?? 'oncovax-dev';

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    const { connectionId } = await req.json();

    if (!connectionId) {
      return NextResponse.json({ error: 'connectionId required' }, { status: 400 });
    }

    const patient = await prisma.patient.findFirst({
      where: { userId: session.userId },
    });
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    const connection = await prisma.fhirConnection.findFirst({
      where: { id: connectionId, patientId: patient.id },
    });
    if (!connection || !connection.fhirBaseUrl) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
    }

    if (connection.syncStatus === 'revoked') {
      return NextResponse.json({ error: 'Connection has been revoked' }, { status: 400 });
    }

    if (!connection.accessTokenEnc) {
      return NextResponse.json({ error: 'No access token' }, { status: 400 });
    }

    let accessToken = await decryptToken(connection.accessTokenEnc);

    // Refresh token if expired or about to expire (within 5 min)
    const isExpiring = connection.tokenExpiresAt &&
      new Date(connection.tokenExpiresAt).getTime() - Date.now() < 5 * 60 * 1000;

    if (isExpiring && connection.refreshTokenEnc) {
      const refreshToken = await decryptToken(connection.refreshTokenEnc);
      const endpoints = await discoverEndpoints(connection.fhirBaseUrl);
      const newTokens = await refreshAccessToken(endpoints.tokenUrl, refreshToken, EPIC_CLIENT_ID);

      accessToken = newTokens.accessToken;
      const newAccessEnc = await encryptToken(newTokens.accessToken);
      const newRefreshEnc = newTokens.refreshToken
        ? await encryptToken(newTokens.refreshToken)
        : connection.refreshTokenEnc;

      await prisma.fhirConnection.update({
        where: { id: connection.id },
        data: {
          accessTokenEnc: newAccessEnc,
          refreshTokenEnc: newRefreshEnc,
          tokenExpiresAt: newTokens.expiresIn
            ? new Date(Date.now() + newTokens.expiresIn * 1000)
            : null,
        },
      });
    }

    // Extract and map
    const client = new FhirClient(connection.fhirBaseUrl, accessToken);
    const rawData = await extractFhirResources(client, patient.id);
    const result = mapFhirToPatientProfile(rawData, connection.healthSystemName ?? undefined);

    // Merge — same logic as extract route
    const existingProfile = (patient.profile as PatientProfile | null) ?? {};
    const existingFieldSources = (patient.fieldSources as Record<string, string> | null) ?? {};
    const mergedProfile: Record<string, unknown> = { ...existingProfile };
    const mergedFieldSources = { ...existingFieldSources };

    for (const [key, value] of Object.entries(result.profile)) {
      if (value !== undefined && value !== null) {
        const existingSource = existingFieldSources[key];
        if (!existingSource || existingSource !== 'manual') {
          mergedProfile[key] = value;
          mergedFieldSources[key] = 'fhir';
        }
      }
    }

    await prisma.patient.update({
      where: { id: patient.id },
      data: {
        profile: JSON.parse(JSON.stringify(mergedProfile)),
        fieldSources: JSON.parse(JSON.stringify(mergedFieldSources)),
      },
    });

    await prisma.fhirConnection.update({
      where: { id: connection.id },
      data: {
        lastSyncedAt: new Date(),
        resourcesPulled: JSON.parse(JSON.stringify(result.resourceSummary)),
        syncStatus: 'synced',
      },
    });

    return NextResponse.json({
      completeness: result.completeness,
      missingFields: result.missingFields,
      resourceSummary: result.resourceSummary,
      extractedAt: result.extractedAt,
      errors: rawData.errors,
    });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('FHIR resync error:', err);
    return NextResponse.json({ error: 'Failed to re-sync FHIR resources' }, { status: 500 });
  }
}
