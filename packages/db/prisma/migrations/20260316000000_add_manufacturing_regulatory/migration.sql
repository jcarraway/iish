-- CreateTable
CREATE TABLE "manufacturing_partners" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "capabilities" TEXT[],
    "certifications" TEXT[],
    "capacity_tier" VARCHAR(20) NOT NULL,
    "cost_range_min" DOUBLE PRECISION,
    "cost_range_max" DOUBLE PRECISION,
    "turnaround_weeks_min" INTEGER,
    "turnaround_weeks_max" INTEGER,
    "country" VARCHAR(100) NOT NULL,
    "regulatory_support" TEXT[],
    "description" TEXT,
    "contact_email" TEXT,
    "contact_url" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "manufacturing_partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regulatory_pathway_assessments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "patient_id" UUID NOT NULL,
    "pipeline_job_id" UUID,
    "cancer_type" TEXT,
    "cancer_stage" TEXT,
    "prior_treatments_failed" INTEGER,
    "has_physician" BOOLEAN NOT NULL DEFAULT false,
    "physician_name" TEXT,
    "physician_email" TEXT,
    "physician_institution" TEXT,
    "is_life_threatening" BOOLEAN NOT NULL DEFAULT false,
    "has_exhausted_options" BOOLEAN NOT NULL DEFAULT false,
    "state_of_residence" VARCHAR(100),
    "recommended_pathway" VARCHAR(50),
    "pathway_rationale" TEXT,
    "alternative_pathways" JSONB,
    "estimated_cost_min" DOUBLE PRECISION,
    "estimated_cost_max" DOUBLE PRECISION,
    "estimated_timeline_weeks" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "regulatory_pathway_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regulatory_documents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "assessment_id" UUID NOT NULL,
    "document_type" VARCHAR(50) NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "template_version" VARCHAR(20) NOT NULL DEFAULT '1.0',
    "model_used" TEXT,
    "patient_data_snapshot" JSONB,
    "status" VARCHAR(30) NOT NULL DEFAULT 'draft',
    "review_notes" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "reviewed_by" TEXT,
    "pdf_path" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "regulatory_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "manufacturing_partners_slug_key" ON "manufacturing_partners"("slug");

-- CreateIndex
CREATE INDEX "manufacturing_partners_type_idx" ON "manufacturing_partners"("type");

-- CreateIndex
CREATE INDEX "manufacturing_partners_country_idx" ON "manufacturing_partners"("country");

-- CreateIndex
CREATE INDEX "manufacturing_partners_status_idx" ON "manufacturing_partners"("status");

-- CreateIndex
CREATE INDEX "regulatory_pathway_assessments_patient_id_created_at_idx" ON "regulatory_pathway_assessments"("patient_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "regulatory_documents_assessment_id_document_type_idx" ON "regulatory_documents"("assessment_id", "document_type");

-- CreateIndex
CREATE INDEX "regulatory_documents_status_idx" ON "regulatory_documents"("status");

-- AddForeignKey
ALTER TABLE "regulatory_pathway_assessments" ADD CONSTRAINT "regulatory_pathway_assessments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "regulatory_pathway_assessments" ADD CONSTRAINT "regulatory_pathway_assessments_pipeline_job_id_fkey" FOREIGN KEY ("pipeline_job_id") REFERENCES "pipeline_jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "regulatory_documents" ADD CONSTRAINT "regulatory_documents_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "regulatory_pathway_assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
