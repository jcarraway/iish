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

export const parsedEligibilitySchema = z.object({
  cancerTypes: z.array(z.object({
    name: z.string(),
    normalized: z.string(),
  })),
  stages: z.array(z.string()),
  priorTreatments: z.object({
    required: z.array(z.object({ name: z.string(), type: z.string() })),
    excluded: z.array(z.object({ name: z.string(), type: z.string() })),
  }),
  biomarkers: z.object({
    required: z.array(z.object({ name: z.string(), condition: z.string() })),
    excluded: z.array(z.object({ name: z.string(), condition: z.string() })),
  }),
  ageRange: z.object({
    min: z.number().nullable(),
    max: z.number().nullable(),
  }),
  ecogRange: z.object({
    min: z.number().nullable(),
    max: z.number().nullable(),
  }),
  surgicalStatus: z.enum(['pre_surgery', 'post_surgery', 'either', 'unknown']),
  priorLinesOfTherapy: z.object({
    min: z.number().nullable(),
    max: z.number().nullable(),
  }),
  organFunction: z.object({
    requirements: z.array(z.object({
      organ: z.string(),
      metric: z.string(),
      condition: z.string(),
    })),
  }),
  geographicRestrictions: z.array(z.string()),
  exclusionConditions: z.array(z.string()),
  otherKeyRequirements: z.array(z.string()),
  confidenceScore: z.number().min(0).max(1),
});

export const documentUploadSchema = z.object({
  documentType: z.string(),
  s3Key: z.string(),
  s3Bucket: z.string(),
});

export type MagicLinkRequest = z.infer<typeof magicLinkRequestSchema>;
export type PatientProfileInput = z.infer<typeof patientProfileSchema>;
export type DocumentUploadInput = z.infer<typeof documentUploadSchema>;
