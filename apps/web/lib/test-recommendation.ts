import { prisma } from './db';
import { redis } from './redis';
import type { PatientProfile, TestRecommendation, SequencingProviderDetails } from '@oncovax/shared';

const CACHE_TTL = 24 * 60 * 60; // 24 hours

interface TestRecommendationInput {
  profile: PatientProfile;
  patientId: string;
  tissueAvailable?: boolean;
  preferComprehensive?: boolean;
}

export async function generateTestRecommendation(
  input: TestRecommendationInput,
): Promise<TestRecommendation> {
  const { profile, patientId, tissueAvailable = true, preferComprehensive = false } = input;

  const cacheKey = `test-rec:${patientId}:${tissueAvailable ? 't' : 'l'}:${preferComprehensive ? 'c' : 's'}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached) as TestRecommendation;
  }

  // Load all providers
  const providers = await prisma.sequencingProvider.findMany();

  // Find key providers by name pattern
  const foundation = providers.find(p => p.name.toLowerCase().includes('foundation'));
  const guardant = providers.find(p => p.name.toLowerCase().includes('guardant'));
  const tempus = providers.find(p => p.name.toLowerCase().includes('tempus'));

  // Determine primary and alternatives based on flags
  let primary: typeof providers[number] | undefined;
  let alternatives: typeof providers[number][] = [];

  if (!tissueAvailable && guardant) {
    // No tissue → liquid biopsy
    primary = guardant;
    alternatives = [foundation, tempus].filter((p): p is NonNullable<typeof p> => p != null);
  } else if (preferComprehensive && tempus) {
    // Max comprehensiveness → Tempus (648 genes)
    primary = tempus;
    alternatives = [foundation, guardant].filter((p): p is NonNullable<typeof p> => p != null);
  } else if (foundation) {
    // Default → Foundation Medicine (FDA-approved, broadest insurance)
    primary = foundation;
    alternatives = [tempus, guardant].filter((p): p is NonNullable<typeof p> => p != null);
  } else {
    // Fallback to first available
    primary = providers[0];
    alternatives = providers.slice(1, 3);
  }

  if (!primary) {
    throw new Error('No sequencing providers available');
  }

  const primaryDetails = primary.details as unknown as SequencingProviderDetails;
  const cancerType = (profile.cancerType ?? profile.cancerTypeNormalized ?? 'your cancer type').toLowerCase();

  // Build reasoning
  let reasoning: string;
  let whyThisTest: string;

  if (!tissueAvailable) {
    reasoning = `Since tissue is not currently available, a liquid biopsy (blood-based test) is the best option. ${primary.name}'s test can detect key mutations from a simple blood draw.`;
    whyThisTest = `Blood-based test — no tissue biopsy needed. Detects key mutations in ${cancerType} from circulating tumor DNA.`;
  } else if (preferComprehensive) {
    reasoning = `For the most comprehensive analysis, ${primary.name} offers the broadest panel at ${primaryDetails.geneCount} genes, giving the widest view of potential actionable mutations.`;
    whyThisTest = `Most comprehensive panel available (${primaryDetails.geneCount} genes). Maximizes chances of finding actionable mutations for ${cancerType}.`;
  } else {
    reasoning = `${primary.name} is the most widely used and FDA-approved comprehensive genomic profiling test. It has the broadest insurance coverage and is specifically recommended in NCCN guidelines for ${cancerType}.`;
    whyThisTest = `FDA-approved, broadest insurance coverage, and specifically recommended by NCCN guidelines for ${cancerType}. Trusted by oncologists nationwide.`;
  }

  // Determine primary sample type and test type
  const sampleType = !tissueAvailable ? 'Blood draw' : 'Tissue (FFPE)';
  const testType = !tissueAvailable ? 'liquid_biopsy' : 'comprehensive_genomic_profiling';

  const recommendation: TestRecommendation = {
    primary: {
      providerId: primary.id,
      providerName: primary.name,
      testName: primaryDetails.testNames[0] ?? `${primary.name} CGP`,
      testType,
      geneCount: primaryDetails.geneCount,
      whyThisTest,
      sampleType,
      turnaroundDays: primaryDetails.turnaroundDays.max,
      fdaApproved: primaryDetails.fdaApproved,
    },
    alternatives: alternatives.map(alt => {
      const altDetails = alt.details as unknown as SequencingProviderDetails;
      let tradeoff: string;

      if (alt === guardant || alt.name.toLowerCase().includes('guardant')) {
        tradeoff = 'Blood-based (no tissue needed), but may miss some mutations detectable only in tissue';
      } else if (alt === tempus || alt.name.toLowerCase().includes('tempus')) {
        tradeoff = `Broader panel (${altDetails.geneCount} genes) but less insurance coverage than Foundation Medicine`;
      } else if (alt === foundation || alt.name.toLowerCase().includes('foundation')) {
        tradeoff = 'FDA-approved with broadest insurance coverage, requires tissue sample';
      } else {
        tradeoff = `${altDetails.geneCount} genes, ${altDetails.turnaroundDays.min}-${altDetails.turnaroundDays.max} day turnaround`;
      }

      return {
        providerId: alt.id,
        providerName: alt.name,
        testName: altDetails.testNames[0] ?? `${alt.name} Panel`,
        geneCount: altDetails.geneCount,
        tradeoff,
      };
    }),
    reasoning,
    generatedAt: new Date().toISOString(),
  };

  await redis.set(cacheKey, JSON.stringify(recommendation), 'EX', CACHE_TTL);

  return recommendation;
}
