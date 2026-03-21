import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/session';
import type { PatientProfile, GenomicAlteration, GenomicBiomarkers, GermlineFinding } from '@iish/shared';

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    const body = await req.json();
    const { genomicResultId, edits } = body as {
      genomicResultId: string;
      edits?: { alterations?: GenomicAlteration[]; biomarkers?: GenomicBiomarkers };
    };

    if (!genomicResultId) {
      return NextResponse.json({ error: 'genomicResultId is required' }, { status: 400 });
    }

    const patient = await prisma.patient.findUnique({
      where: { userId: session.userId },
      select: { id: true, profile: true },
    });
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Load genomic result
    const genomicResult = await prisma.genomicResult.findUnique({
      where: { id: genomicResultId },
    });
    if (!genomicResult || genomicResult.patientId !== patient.id) {
      return NextResponse.json({ error: 'Genomic result not found' }, { status: 404 });
    }

    // Apply optional edits
    const alterations = (edits?.alterations ?? genomicResult.alterations) as unknown as GenomicAlteration[];
    const biomarkers = (edits?.biomarkers ?? genomicResult.biomarkers) as unknown as GenomicBiomarkers;
    const germlineFindings = genomicResult.germlineFindings as unknown as GermlineFinding[] | null;

    // Update genomic result as confirmed
    await prisma.genomicResult.update({
      where: { id: genomicResultId },
      data: {
        patientConfirmed: true,
        alterations: edits?.alterations ? JSON.parse(JSON.stringify(edits.alterations)) : undefined,
        biomarkers: edits?.biomarkers ? JSON.parse(JSON.stringify(edits.biomarkers)) : undefined,
      },
    });

    // Merge genomic data into Patient profile
    const currentProfile = (patient.profile as unknown as PatientProfile) ?? {};

    // Build genomicData for profile
    const genomicData = {
      testProvider: genomicResult.provider,
      testName: genomicResult.testName,
      testDate: genomicResult.reportDate?.toISOString().split('T')[0] ?? null,
      alterations,
      biomarkers,
      germlineFindings,
    };

    // Also merge key biomarkers into profile.biomarkers for existing matcher compatibility
    const profileBiomarkers = { ...currentProfile.biomarkers };
    if (biomarkers.tmb) {
      profileBiomarkers['TMB'] = `${biomarkers.tmb.value} ${biomarkers.tmb.unit} (${biomarkers.tmb.status})`;
    }
    if (biomarkers.msi) {
      profileBiomarkers['MSI'] = biomarkers.msi.status;
    }
    if (biomarkers.pdl1) {
      if (biomarkers.pdl1.tps !== null) profileBiomarkers['PD-L1 TPS'] = `${biomarkers.pdl1.tps}%`;
      if (biomarkers.pdl1.cps !== null) profileBiomarkers['PD-L1 CPS'] = `${biomarkers.pdl1.cps}`;
    }
    // Add mutation names as biomarkers
    for (const alt of alterations) {
      if (alt.clinicalSignificance === 'Pathogenic' || alt.clinicalSignificance === 'Likely pathogenic') {
        profileBiomarkers[alt.gene] = `${alt.alteration} (${alt.clinicalSignificance})`;
      }
    }

    const updatedProfile: PatientProfile = {
      ...currentProfile,
      genomicData,
      biomarkers: profileBiomarkers,
    };

    await prisma.patient.update({
      where: { id: patient.id },
      data: { profile: JSON.parse(JSON.stringify(updatedProfile)) },
    });

    return NextResponse.json({
      confirmed: true,
      genomicResultId,
      genomicData,
    });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Genomic confirm error:', err);
    return NextResponse.json({ error: 'Failed to confirm genomic results' }, { status: 500 });
  }
}
