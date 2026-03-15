import { z } from 'zod';

export const magicLinkRequestSchema = z.object({
  email: z.string().email(),
});

export const patientProfileSchema = z.object({
  cancerType: z.string().optional(),
  cancerTypeNormalized: z.string().optional(),
  stage: z.string().optional(),
  histologicalGrade: z.string().optional(),
  receptorStatus: z.object({
    er: z.object({ status: z.string(), percentage: z.number().optional() }).optional(),
    pr: z.object({ status: z.string(), percentage: z.number().optional() }).optional(),
    her2: z.object({ status: z.string(), method: z.string().optional() }).optional(),
  }).optional(),
  biomarkers: z.record(z.string()).optional(),
  priorTreatments: z.array(z.object({
    name: z.string(),
    type: z.string(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    response: z.string().optional(),
  })).optional(),
  ecogStatus: z.number().min(0).max(5).optional(),
  age: z.number().min(0).max(150).optional(),
  zipCode: z.string().optional(),
});

export const documentUploadSchema = z.object({
  documentType: z.string(),
  s3Key: z.string(),
  s3Bucket: z.string(),
});

export type MagicLinkRequest = z.infer<typeof magicLinkRequestSchema>;
export type PatientProfileInput = z.infer<typeof patientProfileSchema>;
export type DocumentUploadInput = z.infer<typeof documentUploadSchema>;
