import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/session';
import { prisma } from '@/lib/db';
import type { PatientProfile } from '@iish/shared';

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
    if (!connection) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
    }

    // Clear tokens and mark as revoked
    await prisma.fhirConnection.update({
      where: { id: connection.id },
      data: {
        accessTokenEnc: null,
        refreshTokenEnc: null,
        tokenExpiresAt: null,
        syncStatus: 'revoked',
      },
    });

    // Clear FHIR-sourced fields from patient profile
    const existingProfile = (patient.profile as PatientProfile | null) ?? {};
    const existingFieldSources = (patient.fieldSources as Record<string, string> | null) ?? {};

    const cleanedProfile = { ...existingProfile } as Record<string, unknown>;
    const cleanedFieldSources = { ...existingFieldSources };

    for (const [key, source] of Object.entries(existingFieldSources)) {
      if (source === 'fhir') {
        delete cleanedProfile[key];
        delete cleanedFieldSources[key];
      }
    }

    await prisma.patient.update({
      where: { id: patient.id },
      data: {
        profile: JSON.parse(JSON.stringify(cleanedProfile)),
        fieldSources: JSON.parse(JSON.stringify(cleanedFieldSources)),
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('FHIR revoke error:', err);
    return NextResponse.json({ error: 'Failed to revoke access' }, { status: 500 });
  }
}
