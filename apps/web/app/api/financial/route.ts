import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/session';
import { matchFinancialPrograms } from '@/lib/financial-matcher';

export async function GET() {
  try {
    const session = await requireSession();

    const patient = await prisma.patient.findUnique({
      where: { userId: session.userId },
      select: { id: true },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 });
    }

    // Check for existing matches
    const existingMatches = await prisma.financialMatch.findMany({
      where: { patientId: patient.id },
    });

    let results;
    if (existingMatches.length === 0) {
      // Run matching engine
      results = await matchFinancialPrograms(patient.id);
    } else {
      // Load existing matches with program data
      const matches = await prisma.financialMatch.findMany({
        where: { patientId: patient.id, matchStatus: { not: 'ineligible' } },
        include: { program: true },
        orderBy: { matchStatus: 'asc' },
      });

      results = matches.map(m => ({
        programId: m.programId,
        programName: m.program.name,
        organization: m.program.organization,
        type: m.program.type,
        matchStatus: m.matchStatus as 'eligible' | 'likely_eligible' | 'check_eligibility' | 'ineligible',
        estimatedBenefit: m.estimatedBenefit,
        matchReasoning: m.matchReasoning ?? '',
        missingInfo: (m.missingInfo as string[]) ?? [],
        status: m.program.status,
        maxBenefitAmount: m.program.maxBenefitAmount,
        benefitDescription: m.program.benefitDescription,
        applicationProcess: m.program.applicationProcess,
        applicationUrl: m.program.applicationUrl,
        website: m.program.website,
        assistanceCategories: m.program.assistanceCategories,
      }));
    }

    // Calculate estimated total
    const totalEstimated = results.reduce((sum, r) => sum + (r.maxBenefitAmount ?? 0), 0);

    // Group by category
    const grouped: Record<string, typeof results> = {};
    for (const result of results) {
      for (const cat of result.assistanceCategories) {
        if (!grouped[cat]) grouped[cat] = [];
        // Avoid duplicates in same category
        if (!grouped[cat].some(r => r.programId === result.programId)) {
          grouped[cat].push(result);
        }
      }
    }

    return NextResponse.json({
      matches: results,
      grouped,
      totalEstimated,
      matchCount: results.length,
      eligibleCount: results.filter(r => r.matchStatus === 'eligible').length,
    });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('Financial matching error:', err);
    return NextResponse.json({ error: 'Failed to load financial matches' }, { status: 500 });
  }
}
