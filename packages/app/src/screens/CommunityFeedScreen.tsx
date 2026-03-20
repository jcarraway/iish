import { useState, useCallback } from 'react';
import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator, TextInput } from 'react-native';
import { Link } from 'solito/link';
import {
  useGetCommunityReportsQuery,
  useGetCommunityInsightsQuery,
} from '../generated/graphql';

// ============================================================================
// Constants
// ============================================================================

const REPORT_TYPES = [
  { key: 'all', label: 'All' },
  { key: 'treatment_experience', label: 'Treatment Experience' },
  { key: 'trial_participation', label: 'Trial Participation' },
  { key: 'side_effect', label: 'Side Effects' },
];

const TYPE_BADGES: Record<string, { label: string; color: string; bg: string }> = {
  treatment_experience: { label: 'Treatment', color: '#2563EB', bg: '#DBEAFE' },
  trial_participation: { label: 'Trial', color: '#0D9488', bg: '#CCFBF1' },
  side_effect: { label: 'Side Effect', color: '#D97706', bg: '#FEF3C7' },
};

// ============================================================================
// Helpers
// ============================================================================

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

function renderStars(rating: number): string {
  const filled = Math.round(Math.max(1, Math.min(5, rating)));
  return '\u2605'.repeat(filled) + '\u2606'.repeat(5 - filled);
}

function getTypeBadge(reportType: string | null | undefined) {
  return TYPE_BADGES[reportType || ''] || { label: reportType || 'Report', color: '#6B7280', bg: '#F3F4F6' };
}

// ============================================================================
// Screen
// ============================================================================

export function CommunityFeedScreen() {
  const [selectedType, setSelectedType] = useState('all');
  const [drugFilter, setDrugFilter] = useState('');

  const { data, loading } = useGetCommunityReportsQuery();

  const drugFilterTrimmed = drugFilter.trim().toLowerCase();

  const { data: insightsData, loading: insightsLoading } = useGetCommunityInsightsQuery({
    variables: { drugName: drugFilterTrimmed },
    skip: drugFilterTrimmed.length === 0,
  });

  const reports = data?.communityReports ?? [];

  // Local filtering (type + drug name)
  const filteredReports = reports.filter((r: any) => {
    if (selectedType !== 'all' && r.reportType !== selectedType) return false;
    if (drugFilterTrimmed) {
      const drug = (r.relatedDrug || '').toLowerCase();
      if (!drug.includes(drugFilterTrimmed)) return false;
    }
    return true;
  });

  const toggleType = useCallback((key: string) => {
    setSelectedType(key);
  }, []);

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$10', width: '100%' }}>
        {/* Header */}
        <Text sx={{ fontSize: 28, fontWeight: 'bold', color: '$foreground' }}>
          Community Intelligence
        </Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
          Treatment experiences and insights shared by patients on this platform.
        </Text>

        {/* Disclaimer banner */}
        <View sx={{ mt: '$4', p: '$3', backgroundColor: '#FFFBEB', borderRadius: 8, borderWidth: 1, borderColor: '#FDE68A' }}>
          <Text sx={{ fontSize: 12, color: '#92400E', lineHeight: 18 }}>
            Community reports are personal experiences, not medical evidence. Always discuss treatment
            decisions with your oncologist.
          </Text>
        </View>

        {/* Share Your Experience button */}
        <View sx={{ mt: '$4' }}>
          <Link href="/intel/community/submit">
            <View sx={{
              backgroundColor: '#7C3AED',
              borderRadius: 8,
              px: '$4',
              py: '$3',
              alignItems: 'center',
            }}>
              <Text sx={{ fontSize: 14, fontWeight: '600', color: 'white' }}>
                Share Your Experience
              </Text>
            </View>
          </Link>
        </View>

        {/* Filter pills */}
        <View sx={{ mt: '$4' }}>
          <Text sx={{ fontSize: 12, fontWeight: '600', color: '$mutedForeground', mb: '$2' }}>REPORT TYPE</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View sx={{ flexDirection: 'row', gap: '$2' }}>
              {REPORT_TYPES.map(type => {
                const active = selectedType === type.key;
                return (
                  <Pressable
                    key={type.key}
                    onPress={() => toggleType(type.key)}
                    sx={{
                      borderRadius: 20,
                      px: '$3',
                      py: '$1',
                      backgroundColor: active ? '#EDE9FE' : 'transparent',
                      borderWidth: 1,
                      borderColor: active ? '#7C3AED' : '$border',
                    }}
                  >
                    <Text sx={{ fontSize: 12, fontWeight: active ? '600' : '400', color: active ? '#7C3AED' : '$mutedForeground' }}>
                      {type.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Drug filter */}
        <View sx={{ mt: '$3' }}>
          <Text sx={{ fontSize: 12, fontWeight: '600', color: '$mutedForeground', mb: '$2' }}>FILTER BY DRUG</Text>
          <View sx={{ borderWidth: 1, borderColor: '$border', borderRadius: 8, px: '$3', py: '$2' }}>
            <TextInput
              value={drugFilter}
              onChangeText={setDrugFilter}
              placeholder="e.g. Trastuzumab, Pembrolizumab..."
              style={{ fontSize: 14, color: '#111' }}
            />
          </View>
        </View>

        {/* Results */}
        {loading ? (
          <View sx={{ mt: '$8', alignItems: 'center' }}>
            <ActivityIndicator size="small" />
            <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>Loading community reports...</Text>
          </View>
        ) : filteredReports.length === 0 ? (
          <View sx={{ mt: '$8', p: '$6', borderRadius: 12, borderWidth: 1, borderColor: '$border', alignItems: 'center' }}>
            <Text sx={{ fontSize: 16, fontWeight: '600', color: '$foreground' }}>
              No community reports yet
            </Text>
            <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground', textAlign: 'center' }}>
              Be the first to share your experience.
            </Text>
          </View>
        ) : (
          <View sx={{ mt: '$6', gap: '$3' }}>
            <Text sx={{ fontSize: 12, color: '$mutedForeground' }}>
              {filteredReports.length} report{filteredReports.length !== 1 ? 's' : ''}
            </Text>
            {filteredReports.map((report: any) => {
              const badge = getTypeBadge(report.reportType);
              const structuredData = report.structuredData || {};
              const rating = structuredData.overallRating || structuredData.rating || null;

              return (
                <View key={report.id} sx={{
                  borderWidth: 1,
                  borderColor: '$border',
                  borderRadius: 12,
                  p: '$4',
                }}>
                  {/* Top row: type badge + verified + date */}
                  <View sx={{ flexDirection: 'row', gap: '$2', flexWrap: 'wrap', mb: '$2', alignItems: 'center' }}>
                    <View sx={{ backgroundColor: badge.bg, borderRadius: 12, px: '$2', py: 2 }}>
                      <Text sx={{ fontSize: 11, fontWeight: '700', color: badge.color }}>
                        {badge.label}
                      </Text>
                    </View>
                    {report.verified && (
                      <View sx={{ backgroundColor: '#DCFCE7', borderRadius: 12, px: '$2', py: 2 }}>
                        <Text sx={{ fontSize: 11, fontWeight: '700', color: '#16A34A' }}>Verified</Text>
                      </View>
                    )}
                    {report.createdAt && (
                      <Text sx={{ fontSize: 11, color: '$mutedForeground' }}>
                        {formatRelativeTime(report.createdAt)}
                      </Text>
                    )}
                  </View>

                  {/* Drug / trial name */}
                  {(report.drugName || report.trialName) && (
                    <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground', mb: '$1' }}>
                      {report.drugName || report.trialName}
                    </Text>
                  )}

                  {/* Rating stars */}
                  {rating != null && (
                    <Text sx={{ fontSize: 16, color: '#D97706', mb: '$1' }}>
                      {renderStars(rating)}
                    </Text>
                  )}

                  {/* Narrative excerpt */}
                  {report.narrative && (
                    <Text sx={{ fontSize: 13, color: '$foreground', lineHeight: 19 }} numberOfLines={3}>
                      {report.narrative}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Drug Insights section */}
        {drugFilterTrimmed.length > 0 && (
          <View sx={{ mt: '$6' }}>
            <Text sx={{ fontSize: 16, fontWeight: '700', color: '$foreground', mb: '$3' }}>
              Drug Insights: {drugFilter.trim()}
            </Text>
            {insightsLoading ? (
              <View sx={{ alignItems: 'center', py: '$4' }}>
                <ActivityIndicator size="small" />
                <Text sx={{ mt: '$2', fontSize: 13, color: '$mutedForeground' }}>Loading insights...</Text>
              </View>
            ) : insightsData?.communityInsights ? (
              <View sx={{ borderWidth: 1, borderColor: '$border', borderRadius: 12, p: '$4' }}>
                <View sx={{ flexDirection: 'row', gap: '$4', flexWrap: 'wrap', mb: '$3' }}>
                  <View>
                    <Text sx={{ fontSize: 12, fontWeight: '600', color: '$mutedForeground' }}>TOTAL REPORTS</Text>
                    <Text sx={{ fontSize: 20, fontWeight: 'bold', color: '$foreground' }}>
                      {insightsData.communityInsights.totalReports}
                    </Text>
                  </View>
                  {insightsData.communityInsights.averageRating != null && (
                    <View>
                      <Text sx={{ fontSize: 12, fontWeight: '600', color: '$mutedForeground' }}>AVG RATING</Text>
                      <Text sx={{ fontSize: 20, fontWeight: 'bold', color: '#D97706' }}>
                        {insightsData.communityInsights.averageRating.toFixed(1)} / 5
                      </Text>
                    </View>
                  )}
                </View>
                {insightsData.communityInsights.commonSideEffects?.length > 0 && (
                  <View>
                    <Text sx={{ fontSize: 12, fontWeight: '600', color: '$mutedForeground', mb: '$2' }}>
                      TOP REPORTED SIDE EFFECTS
                    </Text>
                    <View sx={{ gap: '$1' }}>
                      {insightsData.communityInsights.commonSideEffects.slice(0, 3).map((se: any, i: number) => (
                        <View key={i} sx={{ flexDirection: 'row', alignItems: 'center', gap: '$2' }}>
                          <View sx={{ backgroundColor: '#FEF3C7', borderRadius: 8, px: '$2', py: 1 }}>
                            <Text sx={{ fontSize: 12, color: '#92400E' }}>{i + 1}</Text>
                          </View>
                          <Text sx={{ fontSize: 13, color: '$foreground' }}>
                            {se.effect} ({Math.round(se.reportedByPercent)}%)
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            ) : (
              <View sx={{ p: '$4', borderRadius: 12, borderWidth: 1, borderColor: '$border', alignItems: 'center' }}>
                <Text sx={{ fontSize: 13, color: '$mutedForeground' }}>
                  No insights available for this drug yet.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Disclaimer */}
        <View sx={{ mt: '$8', p: '$4', backgroundColor: '#FFFBEB', borderRadius: 8 }}>
          <Text sx={{ fontSize: 12, color: '#92400E', lineHeight: 18 }}>
            Community reports reflect individual experiences and may not be representative. Treatment outcomes
            vary significantly between patients. This is not medical advice.
          </Text>
        </View>

        {/* Back link */}
        <View sx={{ mt: '$4' }}>
          <Link href="/intel">
            <Text sx={{ fontSize: 14, color: '#2563EB' }}>{'\u2190'} Back to Research Feed</Text>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}
