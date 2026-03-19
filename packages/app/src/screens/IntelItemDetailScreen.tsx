import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator, Linking } from 'react-native';
import { Link } from 'solito/link';
import { useGetResearchItemQuery } from '../generated/graphql';

// ============================================================================
// Constants
// ============================================================================

const TIER_INFO: Record<string, { label: string; description: string; color: string; bg: string }> = {
  T1: { label: 'Practice-Changing', description: 'FDA approved or guideline change', color: '#16A34A', bg: '#DCFCE7' },
  T2: { label: 'Phase 3 Positive', description: 'Large RCT with positive primary endpoint', color: '#0D9488', bg: '#CCFBF1' },
  T3: { label: 'Promising', description: 'Phase 2 or early positive results', color: '#2563EB', bg: '#DBEAFE' },
  T4: { label: 'Early Research', description: 'Preclinical, animal models, or proof-of-concept', color: '#D97706', bg: '#FEF3C7' },
  T5: { label: 'Hypothesis / Review', description: 'Expert opinion, review, or hypothesis-generating', color: '#6B7280', bg: '#F3F4F6' },
};

const EVIDENCE_INFO: Record<string, string> = {
  L1: 'Systematic review / meta-analysis',
  L2: 'Randomized controlled trial',
  L3: 'Controlled study without randomization',
  L4: 'Case series / cohort',
  L5: 'Expert opinion',
  L6: 'Preclinical / in-vitro',
};

const IMPACT_INFO: Record<string, { label: string; color: string }> = {
  practice_changing: { label: 'Practice-Changing', color: '#DC2626' },
  informative: { label: 'Informative', color: '#2563EB' },
  hypothesis_generating: { label: 'Hypothesis-Generating', color: '#7C3AED' },
  confirmatory: { label: 'Confirmatory', color: '#059669' },
  incremental: { label: 'Incremental', color: '#6B7280' },
};

// ============================================================================
// Screen
// ============================================================================

interface Props {
  id: string;
}

export function IntelItemDetailScreen({ id }: Props) {
  const { data, loading, error } = useGetResearchItemQuery({ variables: { id } });
  const [showClinician, setShowClinician] = useState(false);

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$10', width: '100%' }}>
        <ActivityIndicator size="small" />
        <Text sx={{ mt: '$3', fontSize: 14, color: '$mutedForeground' }}>Loading research item...</Text>
      </View>
    );
  }

  if (error || !data?.researchItem) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$10', width: '100%' }}>
        <Text sx={{ fontSize: 16, fontWeight: '600', color: '$foreground' }}>Research item not found</Text>
        <Link href="/intel">
          <Text sx={{ mt: '$2', fontSize: 14, color: '#2563EB' }}>← Back to feed</Text>
        </Link>
      </View>
    );
  }

  const item = data.researchItem;
  const tier = TIER_INFO[item.maturityTier || ''] || TIER_INFO.T5;
  const evidence = EVIDENCE_INFO[item.evidenceLevel || ''] || item.evidenceLevel;
  const impact = IMPACT_INFO[item.practiceImpact || ''];
  const clinician = item.clinicianSummary;
  const authors = item.authors || [];
  const displayAuthors = authors.length > 5
    ? [...authors.slice(0, 5), `+${authors.length - 5} more`].join(', ')
    : authors.join(', ');

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$10', width: '100%' }}>
        {/* Breadcrumbs */}
        <View sx={{ flexDirection: 'row', gap: '$2', mb: '$4' }}>
          <Link href="/intel">
            <Text sx={{ fontSize: 13, color: '#2563EB' }}>Research</Text>
          </Link>
          <Text sx={{ fontSize: 13, color: '$mutedForeground' }}>›</Text>
          <Text sx={{ fontSize: 13, color: '$mutedForeground' }} numberOfLines={1}>
            {item.title.slice(0, 50)}...
          </Text>
        </View>

        {/* Badges */}
        <View sx={{ flexDirection: 'row', gap: '$2', flexWrap: 'wrap', mb: '$3' }}>
          <View sx={{ backgroundColor: tier.bg, borderRadius: 16, px: '$3', py: '$1' }}>
            <Text sx={{ fontSize: 12, fontWeight: '700', color: tier.color }}>
              {item.maturityTier} · {tier.label}
            </Text>
          </View>
          {item.evidenceLevel && (
            <View sx={{ backgroundColor: '#F3F4F6', borderRadius: 16, px: '$3', py: '$1' }}>
              <Text sx={{ fontSize: 12, fontWeight: '600', color: '#374151' }}>
                {item.evidenceLevel} · {evidence}
              </Text>
            </View>
          )}
          {impact && (
            <View sx={{ backgroundColor: impact.color + '15', borderRadius: 16, px: '$3', py: '$1' }}>
              <Text sx={{ fontSize: 12, fontWeight: '600', color: impact.color }}>
                {impact.label}
              </Text>
            </View>
          )}
          {item.industrySponsored && (
            <View sx={{ backgroundColor: '#FEF3C7', borderRadius: 16, px: '$3', py: '$1' }}>
              <Text sx={{ fontSize: 12, fontWeight: '600', color: '#92400E' }}>Industry Sponsored</Text>
            </View>
          )}
        </View>

        {/* Title */}
        <Text sx={{ fontSize: 22, fontWeight: 'bold', color: '$foreground', lineHeight: 30 }}>
          {item.title}
        </Text>

        {/* Journal, date, authors */}
        <Text sx={{ mt: '$2', fontSize: 13, color: '$mutedForeground' }}>
          {item.journalName}
          {item.publishedAt ? ` · ${new Date(item.publishedAt).toLocaleDateString()}` : ''}
        </Text>
        {displayAuthors && (
          <Text sx={{ mt: '$1', fontSize: 12, color: '$mutedForeground', lineHeight: 18 }}>
            {displayAuthors}
          </Text>
        )}

        {/* Maturity context */}
        <View sx={{ mt: '$4', p: '$3', backgroundColor: tier.bg, borderRadius: 8 }}>
          <Text sx={{ fontSize: 12, fontWeight: '600', color: tier.color }}>
            Maturity: {tier.description}
          </Text>
        </View>

        {/* Patient Summary */}
        <View sx={{ mt: '$6' }}>
          <Text sx={{ fontSize: 16, fontWeight: '700', color: '$foreground', mb: '$2' }}>
            What This Means for You
          </Text>
          {item.patientSummary ? (
            <Text sx={{ fontSize: 15, color: '$foreground', lineHeight: 24 }}>
              {item.patientSummary}
            </Text>
          ) : (
            <Text sx={{ fontSize: 14, color: '$mutedForeground', fontStyle: 'italic' }}>
              Summary is being generated...
            </Text>
          )}
        </View>

        {/* Clinician Summary (collapsible) */}
        {clinician && (
          <View sx={{ mt: '$6' }}>
            <Pressable onPress={() => setShowClinician(!showClinician)}>
              <View sx={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: '$3',
                backgroundColor: '#F9FAFB',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '$border',
              }}>
                <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground' }}>
                  Clinical Details
                </Text>
                <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>
                  {showClinician ? '▲' : '▼'}
                </Text>
              </View>
            </Pressable>
            {showClinician && (
              <View sx={{ mt: '$2', p: '$4', borderWidth: 1, borderColor: '$border', borderRadius: 8 }}>
                <Text sx={{ fontSize: 15, fontWeight: '600', color: '$foreground', mb: '$2' }}>
                  {clinician.headline}
                </Text>

                {clinician.studyDesign && (
                  <View sx={{ mb: '$3' }}>
                    <Text sx={{ fontSize: 12, fontWeight: '600', color: '$mutedForeground', mb: '$1' }}>STUDY DESIGN</Text>
                    <Text sx={{ fontSize: 14, color: '$foreground', lineHeight: 20 }}>{clinician.studyDesign}</Text>
                  </View>
                )}

                {clinician.keyEndpoints?.length > 0 && (
                  <View sx={{ mb: '$3' }}>
                    <Text sx={{ fontSize: 12, fontWeight: '600', color: '$mutedForeground', mb: '$1' }}>KEY ENDPOINTS</Text>
                    {clinician.keyEndpoints.map((ep: string, i: number) => (
                      <Text key={i} sx={{ fontSize: 14, color: '$foreground', lineHeight: 20, mb: '$1' }}>
                        • {ep}
                      </Text>
                    ))}
                  </View>
                )}

                {clinician.context && (
                  <View sx={{ mb: '$3' }}>
                    <Text sx={{ fontSize: 12, fontWeight: '600', color: '$mutedForeground', mb: '$1' }}>CONTEXT</Text>
                    <Text sx={{ fontSize: 14, color: '$foreground', lineHeight: 20 }}>{clinician.context}</Text>
                  </View>
                )}

                {clinician.practiceImplication && (
                  <View sx={{ mb: '$3' }}>
                    <Text sx={{ fontSize: 12, fontWeight: '600', color: '$mutedForeground', mb: '$1' }}>PRACTICE IMPLICATION</Text>
                    <Text sx={{ fontSize: 14, color: '$foreground', lineHeight: 20 }}>{clinician.practiceImplication}</Text>
                  </View>
                )}

                {clinician.limitations?.length > 0 && (
                  <View sx={{ mb: '$3' }}>
                    <Text sx={{ fontSize: 12, fontWeight: '600', color: '$mutedForeground', mb: '$1' }}>LIMITATIONS</Text>
                    {clinician.limitations.map((lim: string, i: number) => (
                      <Text key={i} sx={{ fontSize: 14, color: '$foreground', lineHeight: 20, mb: '$1' }}>
                        • {lim}
                      </Text>
                    ))}
                  </View>
                )}

                <View sx={{ flexDirection: 'row', gap: '$2' }}>
                  <View sx={{ backgroundColor: '#F3F4F6', borderRadius: 12, px: '$2', py: 2 }}>
                    <Text sx={{ fontSize: 11, fontWeight: '600', color: '#374151' }}>
                      Grade: {clinician.grade}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Drug names */}
        {item.drugNames?.length > 0 && (
          <View sx={{ mt: '$5' }}>
            <Text sx={{ fontSize: 12, fontWeight: '600', color: '$mutedForeground', mb: '$2' }}>DRUGS MENTIONED</Text>
            <View sx={{ flexDirection: 'row', gap: '$2', flexWrap: 'wrap' }}>
              {(item.drugNames as string[]).map((drug: string) => (
                <View key={drug} sx={{ backgroundColor: '#EDE9FE', borderRadius: 12, px: '$3', py: '$1' }}>
                  <Text sx={{ fontSize: 13, color: '#5B21B6' }}>{drug}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Biomarkers */}
        {item.biomarkerRelevance?.length > 0 && (
          <View sx={{ mt: '$4' }}>
            <Text sx={{ fontSize: 12, fontWeight: '600', color: '$mutedForeground', mb: '$2' }}>BIOMARKERS</Text>
            <View sx={{ flexDirection: 'row', gap: '$2', flexWrap: 'wrap' }}>
              {(item.biomarkerRelevance as string[]).map((bm: string) => (
                <View key={bm} sx={{ backgroundColor: '#DBEAFE', borderRadius: 12, px: '$3', py: '$1' }}>
                  <Text sx={{ fontSize: 13, color: '#1E40AF' }}>{bm}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Hype assessment */}
        {item.hypeScore != null && item.hypeScore > 0.5 && (
          <View sx={{ mt: '$5', p: '$3', backgroundColor: '#FEF3C7', borderRadius: 8 }}>
            <Text sx={{ fontSize: 13, fontWeight: '600', color: '#92400E' }}>
              Hype Check: This research may contain inflated claims
            </Text>
            {item.hypeFlags?.length > 0 && (
              <View sx={{ mt: '$1' }}>
                {(item.hypeFlags as string[]).map((flag: string, i: number) => (
                  <Text key={i} sx={{ fontSize: 12, color: '#92400E', lineHeight: 18 }}>• {flag}</Text>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Source links */}
        <View sx={{ mt: '$6', gap: '$2' }}>
          {item.sourceUrl && (
            <Pressable onPress={() => Linking.openURL(item.sourceUrl!)}>
              <Text sx={{ fontSize: 14, color: '#2563EB' }}>View on PubMed →</Text>
            </Pressable>
          )}
          {item.doi && (
            <Pressable onPress={() => Linking.openURL(`https://doi.org/${item.doi}`)}>
              <Text sx={{ fontSize: 14, color: '#2563EB' }}>DOI: {item.doi} →</Text>
            </Pressable>
          )}
        </View>

        {/* Disclaimer */}
        <View sx={{ mt: '$6', p: '$4', backgroundColor: '#FFFBEB', borderRadius: 8 }}>
          <Text sx={{ fontSize: 12, color: '#92400E', lineHeight: 18 }}>
            This summary was generated by AI and is for informational purposes only. It does not constitute
            medical advice. Always discuss research findings with your oncologist before making treatment decisions.
          </Text>
        </View>

        <View sx={{ mt: '$4' }}>
          <Link href="/intel">
            <Text sx={{ fontSize: 14, color: '#2563EB' }}>← Back to Research Feed</Text>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}
