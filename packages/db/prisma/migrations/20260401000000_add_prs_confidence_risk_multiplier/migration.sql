-- AlterTable
ALTER TABLE "genomic_profiles" ADD COLUMN "prs_confidence" VARCHAR(20);
ALTER TABLE "genomic_profiles" ADD COLUMN "prs_risk_multiplier" DOUBLE PRECISION;
