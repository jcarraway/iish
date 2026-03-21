import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/session';
import { trackEvent } from '@/lib/events';
import { generateMatchesForPatient } from '@/lib/matcher';
import { patientProfileSchema, INTAKE_PATHS, EVENT_NAMES, DOCUMENT_TYPES } from '@iish/shared';
import { z } from 'zod';

const createPatientSchema = z.object({
  profile: patientProfileSchema,
  fieldSources: z.record(z.string()).optional(),
  fieldConfidence: z.record(z.number()).optional(),
  intakePath: z.enum([INTAKE_PATHS.UPLOAD, INTAKE_PATHS.MYCHART, INTAKE_PATHS.MANUAL]),
  zipCode: z.string().optional(),
  documents: z.array(z.object({
    s3Key: z.string(),
    mimeType: z.string(),
    fileSize: z.number(),
    filename: z.string(),
  })).optional(),
  claudeApiCost: z.number().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();

    const body = await req.json();
    const data = createPatientSchema.parse(body);

    const result = await prisma.$transaction(async (tx) => {
      const patient = await tx.patient.upsert({
        where: { userId: session.userId },
        create: {
          userId: session.userId,
          intakePath: data.intakePath,
          profile: JSON.parse(JSON.stringify(data.profile)),
          fieldSources: data.fieldSources ? JSON.parse(JSON.stringify(data.fieldSources)) : undefined,
          fieldConfidence: data.fieldConfidence ? JSON.parse(JSON.stringify(data.fieldConfidence)) : undefined,
          zipCode: data.zipCode ?? data.profile.zipCode,
        },
        update: {
          intakePath: data.intakePath,
          profile: JSON.parse(JSON.stringify(data.profile)),
          fieldSources: data.fieldSources ? JSON.parse(JSON.stringify(data.fieldSources)) : undefined,
          fieldConfidence: data.fieldConfidence ? JSON.parse(JSON.stringify(data.fieldConfidence)) : undefined,
          zipCode: data.zipCode ?? data.profile.zipCode,
        },
      });

      // Create document records if any
      if (data.documents && data.documents.length > 0) {
        await tx.documentUpload.createMany({
          data: data.documents.map((doc) => ({
            patientId: patient.id,
            documentType: DOCUMENT_TYPES.UNKNOWN,
            s3Key: doc.s3Key,
            s3Bucket: process.env.AWS_S3_BUCKET ?? '',
            storagePaths: [doc.s3Key],
            fileCount: 1,
            mimeType: doc.mimeType,
            extractionStatus: 'completed',
            claudeApiCost: data.claudeApiCost
              ? data.claudeApiCost / data.documents!.length
              : null,
          })),
        });
      }

      return patient;
    });

    await trackEvent(session.userId, EVENT_NAMES.ANALYSIS_COMPLETED, {
      intakePath: data.intakePath,
      documentCount: data.documents?.length ?? 0,
    });

    // Fire-and-forget: generate matches in the background
    generateMatchesForPatient(result.id).catch((err) => {
      console.error('Background match generation failed:', err);
    });

    return NextResponse.json({ patientId: result.id });
  } catch (err) {
    if (err instanceof Error && err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: err.issues }, { status: 400 });
    }
    console.error('Create patient error:', err);
    return NextResponse.json({ error: 'Failed to save patient' }, { status: 500 });
  }
}
