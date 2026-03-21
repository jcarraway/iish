import { config } from 'dotenv';
import { resolve } from 'path';

// Load env from apps/web/.env
config({ path: resolve(__dirname, '../apps/web/.env') });

import { PrismaClient } from '@oncovax/db/generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const CURATED_TRIALS = [
  {
    nctId: 'NCT04674306',
    trialCategory: 'preventive_vaccine',
    curatedSummary:
      'Cleveland Clinic trial testing an alpha-lactalbumin vaccine to prevent triple-negative breast cancer (TNBC) in healthy women at high risk. Alpha-lactalbumin is a protein found in most TNBC tumors but not in healthy adult breast tissue, making it an ideal vaccine target.',
    targetPopulation: 'Healthy women aged 25-65 with high risk for TNBC (BRCA1 carriers, strong family history, prior TNBC in remission)',
    vaccineTarget: 'Alpha-lactalbumin protein',
    mechanism:
      'Trains the immune system to recognize and attack cells expressing alpha-lactalbumin. Since healthy adult breast tissue does not express this protein, the vaccine targets pre-cancerous and cancerous cells selectively.',
    keyResults:
      'Phase I trial demonstrated safety and immune response in participants. Strong T-cell activation observed against alpha-lactalbumin-expressing cells. Phase II planning underway.',
    matchingCriteria: {
      requiresBRCA: false,
      requiresFamilyHistory: false,
      requiresHighRisk: true,
      ageRange: [25, 65],
      priorCancerAllowed: true,
      specificSubtype: 'tnbc',
    },
    editorNote:
      'Groundbreaking approach — first vaccine specifically targeting TNBC prevention. Particularly relevant for BRCA1 carriers (70%+ of BRCA1 cancers are TNBC).',
  },
  {
    nctId: 'NCT05455658',
    trialCategory: 'recurrence_prevention',
    curatedSummary:
      'Washington University personalized neoantigen vaccine trial for TNBC survivors. Uses each patient\'s own tumor mutations to create a custom mRNA vaccine designed to prevent recurrence by training the immune system to recognize residual cancer cells.',
    targetPopulation: 'TNBC survivors who completed standard treatment within 12 months, with available tumor tissue for neoantigen identification',
    vaccineTarget: 'Patient-specific neoantigens (personalized)',
    mechanism:
      'Tumor DNA/RNA sequencing identifies mutations unique to the patient\'s cancer. An mRNA vaccine encoding these neoantigens is manufactured to prime T-cells against any remaining cancer cells.',
    keyResults:
      'Early results show strong neoantigen-specific T-cell responses. Combination with pembrolizumab being evaluated. Personalized approach allows targeting each patient\'s unique tumor profile.',
    matchingCriteria: {
      requiresBRCA: false,
      requiresFamilyHistory: false,
      requiresHighRisk: false,
      ageRange: [18, 75],
      priorCancerAllowed: true,
      specificSubtype: 'tnbc',
    },
    editorNote:
      'Patients with existing genomic profiles from OncoVax pipeline may have an advantage — neoantigen identification could be accelerated.',
  },
  {
    nctId: 'NCT05142189',
    trialCategory: 'preventive_vaccine',
    curatedSummary:
      'BioNTech BNT116 mRNA vaccine program investigating cancer prevention and immunotherapy across multiple tumor types including breast cancer. Uses individualized mRNA to target shared tumor-associated antigens.',
    targetPopulation: 'Adults at elevated risk for breast cancer, select tumor types',
    vaccineTarget: 'Tumor-associated antigens (shared)',
    mechanism:
      'mRNA platform delivers instructions for tumor-associated antigens, priming both humoral and cellular immune responses. Platform allows rapid modification as new targets are identified.',
    keyResults:
      'Platform validated in non-small cell lung cancer studies. Breast cancer cohort enrollment ongoing. mRNA platform enables rapid manufacturing.',
    matchingCriteria: {
      requiresBRCA: false,
      requiresFamilyHistory: false,
      requiresHighRisk: false,
      ageRange: [18, 80],
      priorCancerAllowed: true,
      specificSubtype: null,
    },
    editorNote:
      'BioNTech\'s mRNA expertise (from COVID vaccine development) being applied to cancer. Broad applicability across breast cancer subtypes.',
  },
  {
    nctId: 'NCT03897881',
    trialCategory: 'recurrence_prevention',
    curatedSummary:
      'Moderna\'s mRNA-4157 (V940) individualized neoantigen therapy in combination with pembrolizumab for adjuvant treatment of high-risk cancers. While primarily therapeutic, this trial has significant implications for recurrence prevention in breast cancer.',
    targetPopulation: 'High-risk breast cancer patients post-surgery, with tumor tissue available for neoantigen identification',
    vaccineTarget: 'Patient-specific neoantigens (up to 34 per vaccine)',
    mechanism:
      'mRNA-4157 encodes up to 34 patient-specific neoantigens. Combined with pembrolizumab (anti-PD-1), the vaccine trains the immune system while checkpoint inhibition removes the "brakes" on immune response.',
    keyResults:
      'KEYNOTE-942 trial showed 49% reduction in recurrence/death risk for melanoma. Breast cancer cohort results pending. FDA Breakthrough Therapy designation received.',
    matchingCriteria: {
      requiresBRCA: false,
      requiresFamilyHistory: false,
      requiresHighRisk: false,
      ageRange: [18, 85],
      priorCancerAllowed: true,
      specificSubtype: null,
    },
    editorNote:
      'Moderna\'s most advanced cancer vaccine program. 49% recurrence reduction in melanoma is a landmark result. Watching breast cancer cohort closely.',
  },
  {
    nctId: 'NCT06109207',
    trialCategory: 'preventive_vaccine',
    curatedSummary:
      'Multi-center trial evaluating a preventive vaccine strategy for BRCA1/2 mutation carriers. Targets early molecular changes that occur before clinical cancer develops in BRCA carriers.',
    targetPopulation: 'Women aged 25-55 with confirmed BRCA1 or BRCA2 pathogenic variants who have not been diagnosed with breast cancer',
    vaccineTarget: 'BRCA-pathway antigens',
    mechanism:
      'Targets proteins overexpressed in BRCA-deficient pre-malignant cells. Aims to eliminate cells with compromised DNA repair before they become cancerous.',
    keyResults:
      'Preclinical data shows selective elimination of BRCA-deficient cells in animal models. Phase I safety and immunogenicity trial in progress.',
    matchingCriteria: {
      requiresBRCA: true,
      requiresFamilyHistory: false,
      requiresHighRisk: true,
      ageRange: [25, 55],
      priorCancerAllowed: false,
      specificSubtype: null,
    },
    editorNote:
      'Directly relevant for BRCA carriers considering prophylactic surgery. Could offer an alternative to preventive mastectomy for some patients.',
  },
];

async function main() {
  console.log('Seeding curated preventive trials...');

  for (const trial of CURATED_TRIALS) {
    await prisma.curatedPreventiveTrial.upsert({
      where: { nctId: trial.nctId },
      create: trial,
      update: {
        trialCategory: trial.trialCategory,
        curatedSummary: trial.curatedSummary,
        targetPopulation: trial.targetPopulation,
        vaccineTarget: trial.vaccineTarget,
        mechanism: trial.mechanism,
        keyResults: trial.keyResults,
        matchingCriteria: trial.matchingCriteria,
        editorNote: trial.editorNote,
      },
    });
    console.log(`  ✓ ${trial.nctId} — ${trial.vaccineTarget ?? trial.trialCategory}`);
  }

  console.log(`\nSeeded ${CURATED_TRIALS.length} curated preventive trials.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
