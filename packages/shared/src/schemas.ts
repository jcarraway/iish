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

export const pathologyExtractionSchema = z.object({
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
  specimenDate: z.string().optional(),
  facility: z.string().optional(),
});

export const labExtractionSchema = z.object({
  biomarkers: z.record(z.string()),
  testDate: z.string().optional(),
  labName: z.string().optional(),
});

export const treatmentExtractionSchema = z.object({
  treatments: z.array(z.object({
    name: z.string(),
    type: z.string(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    response: z.string().optional(),
  })),
  ecogStatus: z.number().min(0).max(5).optional(),
});

export const documentExtractionResultSchema = z.object({
  documentType: z.string(),
  extraction: z.union([pathologyExtractionSchema, labExtractionSchema, treatmentExtractionSchema]),
  fieldConfidence: z.record(z.number()),
  needsReview: z.array(z.string()),
  couldNotExtract: z.array(z.string()),
  rawText: z.string(),
  qualityIssues: z.array(z.string()),
});

export const presignedUrlRequestSchema = z.object({
  filename: z.string().min(1),
  contentType: z.string().regex(/^(image\/(jpeg|png|webp|heic)|application\/pdf)$/),
  fileSize: z.number().max(20 * 1024 * 1024), // 20MB max
});

export const extractionRequestSchema = z.object({
  s3Keys: z.array(z.string().min(1)).min(1).max(20),
  mimeTypes: z.array(z.string().min(1)).min(1).max(20),
});

export const financialProfileSchema = z.object({
  insuranceType: z.string().optional(),
  householdSize: z.number().min(1).max(20).optional(),
  householdIncome: z.string().optional(),
  financialConcerns: z.array(z.string()).optional(),
});

export const treatmentTranslationRequestSchema = z.object({
  patientId: z.string().uuid().optional(),
});

export const genomicAlterationSchema = z.object({
  gene: z.string(),
  alteration: z.string(),
  alterationType: z.string(),
  variantAlleleFrequency: z.number().nullable(),
  clinicalSignificance: z.string(),
  therapyImplications: z.object({
    approvedTherapies: z.array(z.string()),
    clinicalTrials: z.array(z.string()),
    resistanceMutations: z.array(z.string()),
  }),
  confidence: z.number().min(0).max(1),
});

export const genomicBiomarkersSchema = z.object({
  tmb: z.object({ value: z.number(), unit: z.string(), status: z.string() }).nullable(),
  msi: z.object({ status: z.string(), score: z.number().nullable() }).nullable(),
  pdl1: z.object({ tps: z.number().nullable(), cps: z.number().nullable() }).nullable(),
  loh: z.object({ status: z.string() }).nullable(),
  hrd: z.object({ score: z.number().nullable(), status: z.string() }).nullable(),
});

export const germlineFindingSchema = z.object({
  gene: z.string(),
  variant: z.string(),
  significance: z.string(),
});

export const genomicReportExtractionSchema = z.object({
  provider: z.string(),
  testName: z.string(),
  reportDate: z.string().nullable(),
  specimenDate: z.string().nullable(),
  specimenType: z.string().nullable(),
  genomicAlterations: z.array(genomicAlterationSchema),
  biomarkers: genomicBiomarkersSchema,
  germlineFindings: z.array(germlineFindingSchema).nullable(),
  reportTherapyMatches: z.array(z.object({
    therapy: z.string(),
    evidence: z.string(),
    gene: z.string(),
  })),
  extractionConfidence: z.number().min(0).max(1),
});

export const pipelineUploadUrlSchema = z.object({
  fileName: z.string().min(1),
  fileSize: z.number().max(50 * 1024 * 1024 * 1024), // 50GB max
  fileType: z.enum(['fastq', 'fastq_gz', 'bam']),
  sampleType: z.enum(['tumor', 'normal', 'rna']),
});

export const pipelineSubmitJobSchema = z.object({
  tumorDataPath: z.string().min(1),
  normalDataPath: z.string().min(1),
  rnaDataPath: z.string().optional(),
  inputFormat: z.enum(['fastq', 'bam']),
  sequencingOrderId: z.string().uuid().optional(),
});

export type MagicLinkRequest = z.infer<typeof magicLinkRequestSchema>;
export type PatientProfileInput = z.infer<typeof patientProfileSchema>;
export type DocumentUploadInput = z.infer<typeof documentUploadSchema>;
export type PresignedUrlRequest = z.infer<typeof presignedUrlRequestSchema>;
export type ExtractionRequest = z.infer<typeof extractionRequestSchema>;
export type FinancialProfileInput = z.infer<typeof financialProfileSchema>;
export type GenomicReportExtractionInput = z.infer<typeof genomicReportExtractionSchema>;
export type PipelineUploadUrlInput = z.infer<typeof pipelineUploadUrlSchema>;
export type PipelineSubmitJobInput = z.infer<typeof pipelineSubmitJobSchema>;
