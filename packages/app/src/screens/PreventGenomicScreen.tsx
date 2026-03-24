import { View, Text, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import {
  useGetPreventGenomicProfileQuery,
  useGetTestingRecommendationsQuery,
} from '../generated/graphql';

// ============================================================================
// Constants
// ============================================================================

const URGENCY_COLORS: Record<string, { bg: string; fg: string }> = {
  high: { bg: '#FEE2E2', fg: '#991B1B' },
  moderate: { bg: '#FEF3C7', fg: '#92400E' },
  low: { bg: '#DCFCE7', fg: '#166534' },
  routine: { bg: '#F1F5F9', fg: '#64748B' },
};

const COUNSELOR_RESOURCES = [
  {
    name: 'National Society of Genetic Counselors',
    url: 'https://findageneticcounselor.nsgc.org',
    description: 'Find a board-certified genetic counselor near you. The NSGC directory includes counselors specializing in cancer genetics who can help interpret your family history and guide testing decisions.',
  },
  {
    name: 'InformedDNA',
    url: 'https://www.informeddna.com',
    description: 'Telehealth genetic counseling available nationwide. Offers pre- and post-test counseling for hereditary cancer syndromes, often covered by insurance.',
  },
  {
    name: 'FORCE (Facing Our Risk of Cancer Empowered)',
    url: 'https://www.facingourrisk.org',
    description: 'Peer support and education for people with hereditary cancer risk. Provides helpline, support groups, and resources for BRCA and other high-risk gene carriers.',
  },
];

// ============================================================================
// Component
// ============================================================================

export function PreventGenomicScreen() {
  const { data: genomicData, loading: genomicLoading } = useGetPreventGenomicProfileQuery({ errorPolicy: 'ignore' });
  const { data: testingData, loading: testingLoading } = useGetTestingRecommendationsQuery({ errorPolicy: 'ignore' });

  const genomicProfile = genomicData?.preventGenomicProfile as any;
  const testingRecs = testingData?.testingRecommendations;

  const loading = genomicLoading || testingLoading;

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          Genetic Testing & Genomics
        </Text>
        <View sx={{ mt: '$8', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <ActivityIndicator size="small" />
          <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>Loading genomic information...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Link href="/prevent/risk">
          <Text sx={{ fontSize: 13, color: 'blue600', mb: '$4' }}>
            {'\u2190'} Back to Risk Assessment
          </Text>
        </Link>

        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          Genetic Testing & Genomics
        </Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground', lineHeight: 22 }}>
          Understand your genetic risk factors and whether testing is recommended for you
        </Text>

        {/* ================================================================ */}
        {/* Testing Recommendations                                          */}
        {/* ================================================================ */}
        <View sx={{ mt: '$8' }}>
          <SectionHeader title="Testing recommendations" />

          {testingRecs ? (
            <View sx={{ mt: '$4', gap: '$4' }}>
              {/* Recommended badge */}
              <View sx={{
                flexDirection: 'row', alignItems: 'center', gap: '$3',
              }}>
                <View sx={{
                  backgroundColor: testingRecs.recommended ? '#DCFCE7' : '#F1F5F9',
                  borderRadius: 20, px: '$4', py: '$2',
                }}>
                  <Text sx={{
                    fontSize: 14, fontWeight: 'bold',
                    color: testingRecs.recommended ? '#166534' : '#64748B',
                    textTransform: 'uppercase',
                  }}>
                    {testingRecs.recommended ? 'Recommended' : 'Not required'}
                  </Text>
                </View>
                {testingRecs.urgency && (
                  <View sx={{
                    backgroundColor: (URGENCY_COLORS[testingRecs.urgency] ?? URGENCY_COLORS.routine).bg,
                    borderRadius: 12, px: '$3', py: 4,
                  }}>
                    <Text sx={{
                      fontSize: 12, fontWeight: '600',
                      color: (URGENCY_COLORS[testingRecs.urgency] ?? URGENCY_COLORS.routine).fg,
                    }}>
                      {testingRecs.urgency} urgency
                    </Text>
                  </View>
                )}
              </View>

              {/* Rationale */}
              {testingRecs.rationale && (
                <View sx={{
                  backgroundColor: '#EEF2FF', borderWidth: 1,
                  borderColor: '#C7D2FE', borderRadius: 12, p: '$5',
                }}>
                  <Text sx={{ fontSize: 13, fontWeight: '600', color: '#3730A3' }}>
                    Rationale
                  </Text>
                  <Text sx={{ mt: '$2', fontSize: 13, color: '#3730A3', lineHeight: 20 }}>
                    {testingRecs.rationale}
                  </Text>
                </View>
              )}

              {/* Recommended tests */}
              {testingRecs.recommendedTests && testingRecs.recommendedTests.length > 0 && (
                <View>
                  <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground' }}>
                    Recommended tests
                  </Text>
                  <View sx={{ mt: '$3', gap: '$2' }}>
                    {testingRecs.recommendedTests.map((test: string, i: number) => (
                      <View key={i} sx={{
                        borderWidth: 1, borderColor: '$border', borderRadius: 10, p: '$3',
                        flexDirection: 'row', alignItems: 'center', gap: '$3',
                      }}>
                        <View sx={{
                          width: 32, height: 32, borderRadius: 8,
                          backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Text sx={{ fontSize: 14, fontWeight: '700', color: '#4338CA' }}>
                            {test.charAt(0)}
                          </Text>
                        </View>
                        <View sx={{ flex: 1 }}>
                          <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground' }}>
                            {test}
                          </Text>
                          <Text sx={{ fontSize: 12, color: '$mutedForeground' }}>
                            {getGeneDescription(test)}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Criteria that triggered recommendation */}
              {testingRecs.criteria && testingRecs.criteria.length > 0 && (
                <View sx={{
                  backgroundColor: '#F8FAFC', borderWidth: 1,
                  borderColor: '$border', borderRadius: 12, p: '$4',
                }}>
                  <Text sx={{ fontSize: 13, fontWeight: '600', color: '$foreground' }}>
                    Criteria that triggered this recommendation
                  </Text>
                  <View sx={{ mt: '$2', gap: '$2' }}>
                    {testingRecs.criteria.map((criterion: string, i: number) => (
                      <View key={i} sx={{ flexDirection: 'row', gap: '$2', alignItems: 'flex-start' }}>
                        <View sx={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#4338CA', mt: 7 }} />
                        <Text sx={{ fontSize: 13, color: '$foreground', lineHeight: 20, flex: 1 }}>
                          {criterion}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          ) : (
            <View sx={{
              mt: '$4', p: '$5', borderRadius: 12,
              borderWidth: 1, borderColor: '$border',
            }}>
              <Text sx={{ fontSize: 14, color: '$mutedForeground', lineHeight: 22 }}>
                Complete your family history and risk assessment to receive personalized testing
                recommendations.
              </Text>
              <Link href="/prevent/risk/family">
                <View sx={{
                  mt: '$3', backgroundColor: 'blue600', borderRadius: 8,
                  px: '$5', py: '$3', alignSelf: 'flex-start',
                }}>
                  <Text sx={{ fontSize: 13, fontWeight: '600', color: 'white' }}>
                    Update family history {'\u2192'}
                  </Text>
                </View>
              </Link>
            </View>
          )}
        </View>

        {/* ================================================================ */}
        {/* Known Variants                                                   */}
        {/* ================================================================ */}
        {genomicProfile && (
          <View sx={{ mt: '$8' }}>
            <SectionHeader title="Your genomic profile" />

            {/* Pathogenic variants */}
            {genomicProfile.pathogenicVariants && genomicProfile.pathogenicVariants.length > 0 && (
              <View sx={{ mt: '$4' }}>
                <Text sx={{ fontSize: 14, fontWeight: '600', color: '#991B1B' }}>
                  Pathogenic variants
                </Text>
                <View sx={{ mt: '$2', gap: '$2' }}>
                  {genomicProfile.pathogenicVariants.map((variant: any, i: number) => (
                    <View key={i} sx={{
                      borderWidth: 2, borderColor: '#FECACA', backgroundColor: '#FEF2F2',
                      borderRadius: 10, p: '$4',
                    }}>
                      <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$2' }}>
                        <View sx={{
                          backgroundColor: '#991B1B', borderRadius: 12, px: '$2', py: 2,
                        }}>
                          <Text sx={{ fontSize: 11, fontWeight: '600', color: 'white' }}>
                            PATHOGENIC
                          </Text>
                        </View>
                        <Text sx={{ fontSize: 15, fontWeight: '700', color: '#991B1B' }}>
                          {variant.gene}
                        </Text>
                      </View>
                      {variant.variant && (
                        <Text sx={{ mt: '$2', fontSize: 13, color: '#7F1D1D' }}>
                          Variant: {variant.variant}
                        </Text>
                      )}
                      {variant.significance && (
                        <Text sx={{ mt: '$1', fontSize: 12, color: '#7F1D1D', lineHeight: 18 }}>
                          {variant.significance}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* VUS variants */}
            {genomicProfile.vusVariants && genomicProfile.vusVariants.length > 0 && (
              <View sx={{ mt: '$4' }}>
                <Text sx={{ fontSize: 14, fontWeight: '600', color: '#92400E' }}>
                  Variants of uncertain significance (VUS)
                </Text>
                <View sx={{ mt: '$2', gap: '$2' }}>
                  {genomicProfile.vusVariants.map((variant: any, i: number) => (
                    <View key={i} sx={{
                      borderWidth: 1, borderColor: '#FDE68A', backgroundColor: '#FFFBEB',
                      borderRadius: 10, p: '$4',
                    }}>
                      <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$2' }}>
                        <View sx={{
                          backgroundColor: '#92400E', borderRadius: 12, px: '$2', py: 2,
                        }}>
                          <Text sx={{ fontSize: 11, fontWeight: '600', color: 'white' }}>
                            VUS
                          </Text>
                        </View>
                        <Text sx={{ fontSize: 15, fontWeight: '700', color: '#92400E' }}>
                          {variant.gene}
                        </Text>
                      </View>
                      {variant.variant && (
                        <Text sx={{ mt: '$2', fontSize: 13, color: '#78350F' }}>
                          Variant: {variant.variant}
                        </Text>
                      )}
                      <Text sx={{ mt: '$1', fontSize: 12, color: '#78350F', lineHeight: 18 }}>
                        A VUS means this variant has not been definitively classified as harmful or
                        benign. No clinical action is typically taken based on a VUS, but it may be
                        reclassified as more data becomes available.
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Genes tested */}
            {genomicProfile.genesTested && genomicProfile.genesTested.length > 0 && (
              <View sx={{ mt: '$4' }}>
                <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground' }}>
                  Genes tested
                </Text>
                <View sx={{ mt: '$2', flexDirection: 'row', gap: '$2', flexWrap: 'wrap' }}>
                  {genomicProfile.genesTested.map((gene: string, i: number) => (
                    <View key={i} sx={{
                      backgroundColor: '#F1F5F9', borderRadius: 8, px: '$2', py: 4,
                    }}>
                      <Text sx={{ fontSize: 12, fontWeight: '500', color: '#475569' }}>
                        {gene}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* No variants found — reassuring message */}
            {(!genomicProfile.pathogenicVariants || genomicProfile.pathogenicVariants.length === 0) &&
             (!genomicProfile.vusVariants || genomicProfile.vusVariants.length === 0) &&
             genomicProfile.genesTested && genomicProfile.genesTested.length > 0 && (
              <View sx={{
                mt: '$4', backgroundColor: '#F0FDF4', borderWidth: 1,
                borderColor: '#BBF7D0', borderRadius: 12, p: '$5',
              }}>
                <Text sx={{ fontSize: 14, fontWeight: '600', color: '#166534' }}>
                  No pathogenic variants found
                </Text>
                <Text sx={{ mt: '$2', fontSize: 13, color: '#14532D', lineHeight: 20 }}>
                  Your genetic testing did not identify any known pathogenic variants in the genes
                  tested. This is reassuring, though it does not eliminate all genetic risk. Some
                  cancer-predisposing variants may exist in genes not included in your panel, and
                  our understanding of genetic risk continues to evolve.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* ================================================================ */}
        {/* PRS Section                                                      */}
        {/* ================================================================ */}
        <View sx={{ mt: '$8' }}>
          <SectionHeader title="Polygenic Risk Score (PRS)" />

          {genomicProfile?.prsValue != null ? (
            <View sx={{ mt: '$4' }}>
              <View sx={{
                borderWidth: 2, borderColor: '#C7D2FE', backgroundColor: '#EEF2FF',
                borderRadius: 12, p: '$5',
              }}>
                <Text sx={{ fontSize: 14, fontWeight: '600', color: '#3730A3' }}>
                  Your PRS percentile
                </Text>
                <Text sx={{ mt: '$2', fontSize: 28, fontWeight: 'bold', color: '#3730A3' }}>
                  {genomicProfile.prsValue}th percentile
                </Text>
                <Text sx={{ mt: '$2', fontSize: 13, color: '#4338CA', lineHeight: 20 }}>
                  Your polygenic risk score places you at the {genomicProfile.prsValue}th percentile
                  compared to the general population. This score considers the combined effect of
                  many common genetic variants on breast cancer risk.
                </Text>
              </View>
              {genomicProfile.prsValue >= 80 && (
                <View sx={{
                  mt: '$3', backgroundColor: '#FEF3C7', borderWidth: 1,
                  borderColor: '#FDE68A', borderRadius: 10, p: '$4',
                }}>
                  <Text sx={{ fontSize: 13, fontWeight: '600', color: '#92400E' }}>
                    Elevated polygenic risk
                  </Text>
                  <Text sx={{ mt: '$1', fontSize: 12, color: '#78350F', lineHeight: 18 }}>
                    A PRS above the 80th percentile may warrant enhanced screening. Discuss with
                    your healthcare provider whether additional imaging or earlier screening is
                    appropriate for your situation.
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <View sx={{
              mt: '$4', p: '$5', borderRadius: 12,
              borderWidth: 2, borderStyle: 'dashed', borderColor: '$border',
            }}>
              <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground' }}>
                Coming soon
              </Text>
              <Text sx={{ mt: '$2', fontSize: 13, color: '$mutedForeground', lineHeight: 20 }}>
                Polygenic risk scores analyze hundreds of common genetic variants to estimate breast
                cancer risk. PRS integration is coming soon and will provide an additional layer of
                risk stratification beyond single-gene testing.
              </Text>
              <View sx={{
                mt: '$3', backgroundColor: '#F0F9FF', borderRadius: 10, p: '$3',
              }}>
                <Text sx={{ fontSize: 12, color: '#0C4A6E', lineHeight: 18 }}>
                  PRS is different from BRCA testing. While BRCA tests look for rare, high-impact
                  mutations, PRS assesses the cumulative effect of many common, low-impact variants.
                  Together they provide a more complete picture of genetic risk.
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* ================================================================ */}
        {/* Genetic Counselor Resources                                      */}
        {/* ================================================================ */}
        <View sx={{ mt: '$8' }}>
          <SectionHeader title="Genetic counselor resources" />
          <Text sx={{ mt: '$2', fontSize: 13, color: '$mutedForeground' }}>
            A genetic counselor can help you interpret results, understand your risk, and make
            informed decisions about screening and prevention.
          </Text>

          <View sx={{ mt: '$4', gap: '$3' }}>
            {COUNSELOR_RESOURCES.map((resource, i) => (
              <View key={i} sx={{
                borderWidth: 1, borderColor: '$border', borderRadius: 12, p: '$5',
              }}>
                <Text sx={{ fontSize: 15, fontWeight: '600', color: '$foreground' }}>
                  {resource.name}
                </Text>
                <Text sx={{ mt: '$2', fontSize: 13, color: '$mutedForeground', lineHeight: 20 }}>
                  {resource.description}
                </Text>
                <Text sx={{ mt: '$2', fontSize: 13, color: 'blue600' }}>
                  {resource.url}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ================================================================ */}
        {/* Disclaimer                                                       */}
        {/* ================================================================ */}
        <View sx={{
          mt: '$8',
          backgroundColor: '#FFFBEB',
          borderWidth: 1,
          borderColor: '#FDE68A',
          borderRadius: 12,
          p: '$5',
        }}>
          <Text sx={{ fontSize: 13, fontWeight: '600', color: '#92400E' }}>
            Important disclaimer
          </Text>
          <Text sx={{ mt: '$2', fontSize: 12, color: '#78350F', lineHeight: 18 }}>
            Genetic testing information on this platform is for educational purposes only. Testing
            recommendations are generated based on your risk profile and published guidelines (NCCN,
            ASCO). Actual testing decisions should be made in consultation with a genetic counselor
            or healthcare provider who can consider your complete medical and family history.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function SectionHeader({ title }: { title: string }) {
  return (
    <View sx={{ borderBottomWidth: 1, borderBottomColor: '$border', pb: '$3' }}>
      <Text sx={{ fontSize: 20, fontWeight: 'bold', color: '$foreground' }}>{title}</Text>
    </View>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function getGeneDescription(gene: string): string {
  const descriptions: Record<string, string> = {
    BRCA1: 'High-penetrance gene. Mutations carry 55-72% lifetime breast cancer risk.',
    BRCA2: 'High-penetrance gene. Mutations carry 45-69% lifetime breast cancer risk.',
    PALB2: 'Moderate-to-high penetrance. Mutations carry 33-58% lifetime breast cancer risk.',
    ATM: 'Moderate penetrance. Mutations carry 15-40% lifetime breast cancer risk.',
    CHEK2: 'Moderate penetrance. Mutations carry 15-30% lifetime breast cancer risk.',
  };
  return descriptions[gene] ?? 'Gene associated with hereditary cancer risk.';
}
