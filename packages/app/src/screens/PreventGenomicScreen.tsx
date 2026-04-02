import { View, Text, ScrollView } from 'dripsy';
import { useState, useRef, useCallback } from 'react';
import { ActivityIndicator, Platform, Pressable } from 'react-native';
import { Link } from 'solito/link';
import {
  useGetPreventGenomicProfileQuery,
  useGetTestingRecommendationsQuery,
  useRequestGenotypeUploadMutation,
  useParseGenotypeFileMutation,
  useCalculatePrsMutation,
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
  const { data: genomicData, loading: genomicLoading, refetch: refetchGenomicProfile } = useGetPreventGenomicProfileQuery({ errorPolicy: 'ignore' });
  const { data: testingData, loading: testingLoading } = useGetTestingRecommendationsQuery({ errorPolicy: 'ignore' });
  const [requestUpload] = useRequestGenotypeUploadMutation();
  const [parseFile] = useParseGenotypeFileMutation();
  const [recalculatePrs, { loading: recalculating }] = useCalculatePrsMutation();

  const genomicProfile = genomicData?.preventGenomicProfile as any;
  const testingRecs = testingData?.testingRecommendations;

  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'parsing' | 'complete' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    setUploadState('uploading');
    setUploadProgress(0);
    setUploadError(null);

    try {
      // 1. Request presigned upload URL
      const { data: uploadData } = await requestUpload({
        variables: {
          input: {
            filename: file.name,
            contentType: file.type || 'text/plain',
            fileSize: file.size,
          },
        },
      });

      if (!uploadData?.requestGenotypeUpload) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadUrl, s3Key, documentUploadId } = uploadData.requestGenotypeUpload;

      // 2. Upload file to S3 via XMLHttpRequest (for progress tracking)
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`Upload failed with status ${xhr.status}`));
        };
        xhr.onerror = () => reject(new Error('Upload failed'));
        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', file.type || 'text/plain');
        xhr.send(file);
      });

      // 3. Parse the uploaded file
      setUploadState('parsing');
      await parseFile({
        variables: { s3Key, documentUploadId },
      });

      setUploadState('complete');
      refetchGenomicProfile();
    } catch (err) {
      setUploadState('error');
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    }
  }, [requestUpload, parseFile, refetchGenomicProfile]);

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
        {/* Upload Raw Genotype Data                                         */}
        {/* ================================================================ */}
        <View sx={{ mt: '$8' }}>
          <SectionHeader title="Upload raw genotype data" />

          {genomicProfile?.parsingStatus === 'complete' ? (
            <View sx={{
              mt: '$4', backgroundColor: '#F0FDF4', borderWidth: 1,
              borderColor: '#BBF7D0', borderRadius: 12, p: '$5',
            }}>
              <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$3' }}>
                <View sx={{
                  backgroundColor: '#166534', borderRadius: 12, px: '$3', py: 4,
                }}>
                  <Text sx={{ fontSize: 12, fontWeight: '600', color: 'white' }}>
                    {genomicProfile.dataSource ?? 'Uploaded'}
                  </Text>
                </View>
                <Text sx={{ fontSize: 14, fontWeight: '600', color: '#166534' }}>
                  Genotype data loaded
                </Text>
              </View>
              <Text sx={{ mt: '$2', fontSize: 13, color: '#14532D', lineHeight: 20 }}>
                {genomicProfile.snpCount?.toLocaleString() ?? '—'} SNPs analyzed
                {genomicProfile.prsSnpCount ? ` · ${genomicProfile.prsSnpCount} PRS SNPs found` : ''}
                {genomicProfile.extractedAt ? ` · Processed ${new Date(genomicProfile.extractedAt).toLocaleDateString()}` : ''}
              </Text>
            </View>
          ) : uploadState === 'complete' ? (
            <View sx={{
              mt: '$4', backgroundColor: '#F0FDF4', borderWidth: 1,
              borderColor: '#BBF7D0', borderRadius: 12, p: '$5',
            }}>
              <Text sx={{ fontSize: 14, fontWeight: '600', color: '#166534' }}>
                Analysis complete
              </Text>
              <Text sx={{ mt: '$2', fontSize: 13, color: '#14532D', lineHeight: 20 }}>
                Your genotype data has been processed. Results are shown below.
              </Text>
            </View>
          ) : uploadState === 'uploading' ? (
            <View sx={{
              mt: '$4', borderWidth: 1, borderColor: '#C7D2FE',
              borderRadius: 12, p: '$5',
            }}>
              <View sx={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <ActivityIndicator size="small" />
                <Text sx={{ fontSize: 14, fontWeight: '600', color: '#3730A3' }}>
                  Uploading... {uploadProgress}%
                </Text>
              </View>
              <View sx={{
                mt: '$3', height: 6, borderRadius: 3, backgroundColor: '#E0E7FF',
              }}>
                <View sx={{
                  height: 6, borderRadius: 3, backgroundColor: '#4338CA',
                  width: `${uploadProgress}%` as any,
                }} />
              </View>
            </View>
          ) : uploadState === 'parsing' ? (
            <View sx={{
              mt: '$4', borderWidth: 1, borderColor: '#C7D2FE',
              borderRadius: 12, p: '$5',
            }}>
              <View sx={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <ActivityIndicator size="small" />
                <Text sx={{ fontSize: 14, fontWeight: '600', color: '#3730A3' }}>
                  Analyzing your genotype data...
                </Text>
              </View>
              <Text sx={{ mt: '$2', fontSize: 13, color: '#4338CA', lineHeight: 20 }}>
                Checking for pathogenic variants and extracting PRS-relevant SNPs.
              </Text>
            </View>
          ) : uploadState === 'error' ? (
            <View sx={{
              mt: '$4', backgroundColor: '#FEF2F2', borderWidth: 1,
              borderColor: '#FECACA', borderRadius: 12, p: '$5',
            }}>
              <Text sx={{ fontSize: 14, fontWeight: '600', color: '#991B1B' }}>
                Upload failed
              </Text>
              <Text sx={{ mt: '$2', fontSize: 13, color: '#7F1D1D', lineHeight: 20 }}>
                {uploadError ?? 'Something went wrong. Please try again.'}
              </Text>
              {Platform.OS === 'web' && (
                <Pressable
                  onPress={() => {
                    setUploadState('idle');
                    setUploadError(null);
                  }}
                  style={{ marginTop: 12, alignSelf: 'flex-start' }}
                >
                  <View sx={{
                    backgroundColor: '#991B1B', borderRadius: 8, px: '$4', py: '$2',
                  }}>
                    <Text sx={{ fontSize: 13, fontWeight: '600', color: 'white' }}>
                      Try again
                    </Text>
                  </View>
                </Pressable>
              )}
            </View>
          ) : (
            <View sx={{
              mt: '$4', borderWidth: 2, borderStyle: 'dashed', borderColor: '$border',
              borderRadius: 12, p: '$5',
            }}>
              <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground' }}>
                Upload your raw genotype file
              </Text>
              <Text sx={{ mt: '$2', fontSize: 13, color: '$mutedForeground', lineHeight: 20 }}>
                Upload raw data from 23andMe, AncestryDNA, or a clinical VCF file. We will scan for
                breast cancer-related pathogenic variants and extract data for polygenic risk scoring.
              </Text>

              <View sx={{ mt: '$3', gap: '$2' }}>
                <Text sx={{ fontSize: 12, color: '$mutedForeground' }}>Supported formats:</Text>
                <View sx={{ flexDirection: 'row', gap: '$2', flexWrap: 'wrap' }}>
                  {['23andMe (.txt)', 'AncestryDNA (.txt)', 'VCF (.vcf)'].map((fmt, i) => (
                    <View key={i} sx={{
                      backgroundColor: '#F1F5F9', borderRadius: 8, px: '$2', py: 4,
                    }}>
                      <Text sx={{ fontSize: 12, fontWeight: '500', color: '#475569' }}>{fmt}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {Platform.OS === 'web' ? (
                <>
                  <Pressable
                    onPress={() => fileInputRef.current?.click()}
                    style={{ marginTop: 16, alignSelf: 'flex-start' }}
                  >
                    <View sx={{
                      backgroundColor: 'blue600', borderRadius: 8, px: '$5', py: '$3',
                    }}>
                      <Text sx={{ fontSize: 13, fontWeight: '600', color: 'white' }}>
                        Choose file
                      </Text>
                    </View>
                  </Pressable>
                  {/* Hidden file input (web only) */}
                  <input
                    ref={fileInputRef as any}
                    type="file"
                    accept=".txt,.csv,.tsv,.vcf"
                    style={{ display: 'none' }}
                    onChange={(e: any) => {
                      const file = e.target?.files?.[0];
                      if (file) handleFileSelect(file);
                    }}
                  />
                </>
              ) : (
                <View sx={{
                  mt: '$4', backgroundColor: '#FEF3C7', borderWidth: 1,
                  borderColor: '#FDE68A', borderRadius: 10, p: '$4',
                }}>
                  <Text sx={{ fontSize: 13, fontWeight: '600', color: '#92400E' }}>
                    Web upload required
                  </Text>
                  <Text sx={{ mt: '$1', fontSize: 12, color: '#78350F', lineHeight: 18 }}>
                    Genotype file upload is available on the web version. Visit the website on your
                    computer to upload your raw data file.
                  </Text>
                </View>
              )}

              <View sx={{
                mt: '$4', backgroundColor: '#F0F9FF', borderRadius: 10, p: '$3',
              }}>
                <Text sx={{ fontSize: 12, color: '#0C4A6E', lineHeight: 18 }}>
                  Your genotype data is encrypted in transit and at rest. We only extract breast
                  cancer-relevant variants — your full raw data is not stored long-term.
                </Text>
              </View>
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

          {genomicProfile?.prsPercentile != null ? (
            <View sx={{ mt: '$4' }}>
              {/* Percentile display */}
              <View sx={{
                borderWidth: 2, borderColor: '#C7D2FE', backgroundColor: '#EEF2FF',
                borderRadius: 12, p: '$5',
              }}>
                <View sx={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text sx={{ fontSize: 14, fontWeight: '600', color: '#3730A3' }}>
                    Your PRS percentile
                  </Text>
                  {genomicProfile.prsConfidence && (
                    <View sx={{
                      px: '$2', py: 2, borderRadius: 6,
                      backgroundColor: genomicProfile.prsConfidence === 'high' ? '#DCFCE7'
                        : genomicProfile.prsConfidence === 'moderate' ? '#FEF3C7' : '#FEE2E2',
                    }}>
                      <Text sx={{
                        fontSize: 11, fontWeight: '600',
                        color: genomicProfile.prsConfidence === 'high' ? '#166534'
                          : genomicProfile.prsConfidence === 'moderate' ? '#92400E' : '#991B1B',
                      }}>
                        {genomicProfile.prsConfidence.toUpperCase()} CONFIDENCE
                      </Text>
                    </View>
                  )}
                </View>
                <Text sx={{ mt: '$2', fontSize: 28, fontWeight: 'bold', color: '#3730A3' }}>
                  {genomicProfile.prsPercentile}th percentile
                </Text>
                <Text sx={{ mt: '$2', fontSize: 13, color: '#4338CA', lineHeight: 20 }}>
                  Your polygenic risk score places you at the {genomicProfile.prsPercentile}th percentile
                  compared to the general population. This score considers the combined effect of
                  many common genetic variants on breast cancer risk.
                </Text>

                {/* SNP coverage + risk multiplier */}
                <View sx={{ mt: '$3', flexDirection: 'row', gap: '$3' }}>
                  {genomicProfile.prsSnpCount != null && (
                    <View sx={{ flex: 1, backgroundColor: '#E0E7FF', borderRadius: 8, p: '$3' }}>
                      <Text sx={{ fontSize: 11, fontWeight: '600', color: '#3730A3' }}>SNP Coverage</Text>
                      <Text sx={{ fontSize: 13, color: '#4338CA', mt: 2 }}>
                        {genomicProfile.prsSnpCount} model SNPs
                      </Text>
                    </View>
                  )}
                  {genomicProfile.prsRiskMultiplier != null && (
                    <View sx={{ flex: 1, backgroundColor: '#E0E7FF', borderRadius: 8, p: '$3' }}>
                      <Text sx={{ fontSize: 11, fontWeight: '600', color: '#3730A3' }}>Risk Multiplier</Text>
                      <Text sx={{ fontSize: 13, color: '#4338CA', mt: 2 }}>
                        {genomicProfile.prsRiskMultiplier}x baseline
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Elevated risk warning */}
              {genomicProfile.prsPercentile >= 80 && (
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

              {/* Low confidence warning */}
              {genomicProfile.prsConfidence === 'low' && (
                <View sx={{
                  mt: '$3', backgroundColor: '#FEE2E2', borderWidth: 1,
                  borderColor: '#FECACA', borderRadius: 10, p: '$4',
                }}>
                  <Text sx={{ fontSize: 13, fontWeight: '600', color: '#991B1B' }}>
                    Limited SNP coverage
                  </Text>
                  <Text sx={{ mt: '$1', fontSize: 12, color: '#7F1D1D', lineHeight: 18 }}>
                    Your genotype file contained fewer than 60% of the model's SNPs. For a more
                    accurate polygenic risk score, consider clinical-grade PRS testing through your
                    healthcare provider.
                  </Text>
                </View>
              )}

              {/* Ancestry disclosure */}
              {genomicProfile.prsAncestryCalibration && genomicProfile.prsAncestryCalibration !== 'european' && genomicProfile.prsAncestryCalibration !== 'white' && (
                <View sx={{
                  mt: '$3', backgroundColor: '#F0F9FF', borderWidth: 1,
                  borderColor: '#BAE6FD', borderRadius: 10, p: '$4',
                }}>
                  <Text sx={{ fontSize: 13, fontWeight: '600', color: '#0C4A6E' }}>
                    Ancestry calibration note
                  </Text>
                  <Text sx={{ mt: '$1', fontSize: 12, color: '#0C4A6E', lineHeight: 18 }}>
                    PRS models are most accurate for women of European ancestry. Your score has been
                    calibrated for {genomicProfile.prsAncestryCalibration} ancestry using the best
                    available data, but the confidence interval is wider. We display this uncertainty
                    clearly in your risk estimate.
                  </Text>
                </View>
              )}

              {/* Recalculate button */}
              <Pressable
                onPress={async () => {
                  await recalculatePrs();
                  refetchGenomicProfile();
                }}
                disabled={recalculating}
                style={{ marginTop: 12 }}
              >
                <View sx={{
                  borderWidth: 1, borderColor: '$border', borderRadius: 8,
                  p: '$3', alignItems: 'center',
                  opacity: recalculating ? 0.6 : 1,
                }}>
                  {recalculating ? (
                    <ActivityIndicator size="small" />
                  ) : (
                    <Text sx={{ fontSize: 13, color: '$mutedForeground' }}>
                      Recalculate PRS
                    </Text>
                  )}
                </View>
              </Pressable>

              {/* Model info */}
              {genomicProfile.prsModelVersion && (
                <Text sx={{ mt: '$2', fontSize: 11, color: '$mutedForeground', textAlign: 'center' }}>
                  Model: Mavaddat et al. 2019 (313-SNP) · OR per SD: 1.61
                </Text>
              )}
            </View>
          ) : genomicProfile?.parsingStatus === 'complete' && !genomicProfile?.prsSnpCount ? (
            <View sx={{
              mt: '$4', p: '$5', borderRadius: 12,
              borderWidth: 2, borderStyle: 'dashed', borderColor: '$border',
            }}>
              <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground' }}>
                No PRS data available
              </Text>
              <Text sx={{ mt: '$2', fontSize: 13, color: '$mutedForeground', lineHeight: 20 }}>
                Your genotype file did not contain enough PRS-relevant SNPs for score calculation.
                This can happen with older genotyping arrays. Consider clinical-grade PRS testing
                for a comprehensive polygenic risk assessment.
              </Text>
            </View>
          ) : (
            <View sx={{
              mt: '$4', p: '$5', borderRadius: 12,
              borderWidth: 2, borderStyle: 'dashed', borderColor: '$border',
            }}>
              <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground' }}>
                Upload genotype data to calculate PRS
              </Text>
              <Text sx={{ mt: '$2', fontSize: 13, color: '$mutedForeground', lineHeight: 20 }}>
                Polygenic risk scores analyze hundreds of common genetic variants to estimate breast
                cancer risk. Upload your raw genotype file (23andMe, AncestryDNA, or VCF) above to
                calculate your PRS automatically.
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
