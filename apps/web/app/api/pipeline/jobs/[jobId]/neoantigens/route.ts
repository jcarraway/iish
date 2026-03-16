import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/session';

const ALLOWED_SORT_FIELDS = ['compositeScore', 'bindingAffinityNm', 'immunogenicityScore', 'rank', 'gene', 'vaf', 'clonality'] as const;
const ALLOWED_CONFIDENCE = ['high', 'medium', 'low'] as const;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const session = await requireSession();
    const { jobId } = await params;
    const url = req.nextUrl.searchParams;

    const patient = await prisma.patient.findUnique({
      where: { userId: session.userId },
      select: { id: true },
    });
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    const job = await prisma.pipelineJob.findUnique({
      where: { id: jobId },
      select: { id: true, patientId: true, status: true },
    });

    if (!job || job.patientId !== patient.id) {
      return NextResponse.json({ error: 'Pipeline job not found' }, { status: 404 });
    }

    if (job.status !== 'complete') {
      return NextResponse.json({ error: 'Job is not yet complete' }, { status: 400 });
    }

    // Parse query params
    const sortField = url.get('sort') ?? 'rank';
    const sortOrder = url.get('order') === 'desc' ? 'desc' : 'asc';
    const confidence = url.get('confidence');
    const gene = url.get('gene');
    const page = Math.max(1, parseInt(url.get('page') ?? '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(url.get('limit') ?? '50', 10)));

    // Build where clause
    const where: Record<string, unknown> = { jobId };
    if (confidence && (ALLOWED_CONFIDENCE as readonly string[]).includes(confidence)) {
      where.confidence = confidence;
    }
    if (gene) {
      where.gene = { contains: gene, mode: 'insensitive' };
    }

    // Build orderBy
    const orderByField = (ALLOWED_SORT_FIELDS as readonly string[]).includes(sortField) ? sortField : 'rank';
    const orderBy = { [orderByField]: sortOrder };

    const [neoantigens, total] = await Promise.all([
      prisma.neoantigenCandidate.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.neoantigenCandidate.count({ where }),
    ]);

    return NextResponse.json({
      neoantigens,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Neoantigen query error:', err);
    return NextResponse.json({ error: 'Failed to fetch neoantigens' }, { status: 500 });
  }
}
