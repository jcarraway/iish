import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/session';
import { prisma } from '@/lib/db';
import { decryptToken } from '@/lib/fhir/smart-auth';
import { FhirClient } from '@/lib/fhir/client';
import { extractFhirResources } from '@/lib/fhir/extract-resources';
import { mapFhirToPatientProfile } from '@/lib/fhir/mapper';
import type { PatientProfile } from '@oncovax/shared';

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    const { connectionId } = await req.json();

    if (!connectionId) {
      return NextResponse.json({ error: 'connectionId required' }, { status: 400 });
    }

    // Load connection + patient
    const patient = await prisma.patient.findFirst({
      where: { userId: session.userId },
    });
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    const connection = await prisma.fhirConnection.findFirst({
      where: { id: connectionId, patientId: patient.id },
    });
    if (!connection) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
    }

    if (!connection.accessTokenEnc || !connection.fhirBaseUrl) {
      return NextResponse.json({ error: 'Connection not authenticated' }, { status: 400 });
    }

    // Check token expiry
    if (connection.tokenExpiresAt && new Date(connection.tokenExpiresAt) < new Date()) {
      return NextResponse.json({ error: 'Token expired', code: 'TOKEN_EXPIRED' }, { status: 401 });
    }

    // Decrypt access token
    const accessToken = await decryptToken(connection.accessTokenEnc);

    // Create FHIR client and extract resources
    const client = new FhirClient(connection.fhirBaseUrl, accessToken);
    const rawData = await extractFhirResources(client, patient.id);

    // Map to PatientProfile
    const result = mapFhirToPatientProfile(rawData, connection.healthSystemName ?? undefined);

    // Merge with existing profile (FHIR data supplements, doesn't overwrite manual entries)
    const existingProfile = (patient.profile as PatientProfile | null) ?? {};
    const existingFieldSources = (patient.fieldSources as Record<string, string> | null) ?? {};

    const mergedProfile: PatientProfile = { ...existingProfile };
    const mergedFieldSources = { ...existingFieldSources };

    for (const [key, value] of Object.entries(result.profile)) {
      if (value !== undefined && value !== null) {
        // FHIR data fills empty fields or replaces extracted data, but not manual entries
        const existingSource = existingFieldSources[key];
        if (!existingSource || existingSource !== 'manual') {
          (mergedProfile as Record<string, unknown>)[key] = value;
          mergedFieldSources[key] = 'fhir';
        }
      }
    }

    // Update patient and connection
    await prisma.patient.update({
      where: { id: patient.id },
      data: {
        profile: JSON.parse(JSON.stringify(mergedProfile)),
        fieldSources: JSON.parse(JSON.stringify(mergedFieldSources)),
        intakePath: 'mychart',
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
    console.error('FHIR extract error:', err);
    return NextResponse.json({ error: 'Failed to extract FHIR resources' }, { status: 500 });
  }
}
