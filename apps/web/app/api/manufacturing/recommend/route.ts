import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    const { pipelineJobId } = await req.json();

    if (!pipelineJobId) {
      return NextResponse.json({ error: 'pipelineJobId is required' }, { status: 400 });
    }

    // Verify patient owns this pipeline job
    const patient = await prisma.patient.findUnique({
      where: { userId: session.userId },
      select: { id: true },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 });
    }

    const job = await prisma.pipelineJob.findFirst({
      where: { id: pipelineJobId, patientId: patient.id },
      select: { vaccineBlueprint: true, status: true },
    });

    if (!job) {
      return NextResponse.json({ error: 'Pipeline job not found' }, { status: 404 });
    }

    const blueprint = job.vaccineBlueprint as Record<string, unknown> | null;

    // Get all active partners
    const partners = await prisma.manufacturingPartner.findMany({
      where: { status: 'active' },
    });

    // Score partners based on blueprint requirements
    const scored = partners.map(partner => {
      let score = 0;
      const reasons: string[] = [];

      // mRNA synthesis is essential
      if (partner.capabilities.includes('mRNA_synthesis')) {
        score += 30;
        reasons.push('mRNA synthesis capability');
      }

      // LNP formulation is highly desirable
      if (partner.capabilities.includes('lnp_formulation')) {
        score += 20;
        reasons.push('LNP formulation capability');
      }

      // GMP certification is critical
      if (partner.certifications.includes('GMP')) {
        score += 20;
        reasons.push('GMP certified');
      }

      // FDA registration adds confidence
      if (partner.certifications.includes('FDA_registered')) {
        score += 10;
        reasons.push('FDA registered');
      }

      // Regulatory support
      if (partner.regulatorySupport.includes('ind_filing')) {
        score += 10;
        reasons.push('IND filing support');
      }

      // Fill+finish for complete service
      if (partner.capabilities.includes('fill_finish')) {
        score += 5;
        reasons.push('Fill and finish capability');
      }

      // Quality control
      if (partner.capabilities.includes('quality_control')) {
        score += 5;
        reasons.push('Quality control services');
      }

      return {
        partnerId: partner.id,
        name: partner.name,
        slug: partner.slug,
        type: partner.type,
        score,
        reasons,
        costRangeMin: partner.costRangeMin,
        costRangeMax: partner.costRangeMax,
        turnaroundWeeksMin: partner.turnaroundWeeksMin,
        turnaroundWeeksMax: partner.turnaroundWeeksMax,
        country: partner.country,
        capabilities: partner.capabilities,
        certifications: partner.certifications,
      };
    });

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    return NextResponse.json({
      recommendations: scored,
      blueprintAvailable: !!blueprint,
      jobStatus: job.status,
    });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('Manufacturing recommend error:', err);
    return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 });
  }
}
