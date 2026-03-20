import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import {
  useGetLandscapeOverviewQuery,
  useGetSubtypeLandscapeQuery,
  useGenerateStandardOfCareMutation,
} from '../generated/graphql';

const TIER_COLORS: Record<string, string> = {
  T1: '#16A34A',
  T2: '#0D9488',
  T3: '#2563EB',
  T4: '#D97706',
  T5: '#9CA3AF',
};

const TIER_LABELS: Record<string, string> = {
  T1: 'FDA Approved / Guideline Change',
  T2: 'Phase 3 Positive',
  T3: 'Phase 2 Promising',
  T4: 'Preclinical',
  T5: 'Hypothesis / Review',
};

const SUBTYPES = [
  'er_positive_her2_negative', 'her2_positive', 'her2_low', 'her2_ultralow',
  'triple_negative', 'inflammatory', 'dcis', 'lobular', 'all_subtypes', 'not_specified',
] as const;

const SUBTYPE_LABELS: Record<string, string> = {
  er_positive_her2_negative: 'ER+/HER2-',
  her2_positive: 'HER2+',
  her2_low: 'HER2-Low',
  her2_ultralow: 'HER2-Ultralow',
  triple_negative: 'TNBC',
  inflammatory: 'Inflammatory',
  dcis: 'DCIS',
  lobular: 'Lobular',
  all_subtypes: 'All Subtypes',
  not_specified: 'Not Specified',
};

export function IntelLandscapeScreen({ subtype }: { subtype?: string } = {}) {
  if (subtype) {
    return <SubtypeDetailView subtype={subtype} />;
  }
  return <OverviewView />;
}

// ============================================================================
// Overview Mode
// ============================================================================

function OverviewView() {
  const { data, loading, error } = useGetLandscapeOverviewQuery({ errorPolicy: 'ignore' });
  const overview = data?.landscapeOverview;

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 28, fontWeight: 'bold', color: '$foreground' }}>Research Landscape</Text>
        <View sx={{ mt: '$8', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <ActivityIndicator size="small" />
          <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>Loading landscape data...</Text>
        </View>
      </View>
    );
  }

  if (error || !overview) {
    return (
      <ScrollView sx={{ flex: 1 }}>
        <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
          <Text sx={{ fontSize: 28, fontWeight: 'bold', color: '$foreground' }}>Research Landscape</Text>
          <Text sx={{ mt: '$4', fontSize: 14, color: '$mutedForeground' }}>
            Unable to load landscape data. Please try again later.
          </Text>
          <View sx={{ mt: '$4' }}>
            <Link href="/intel"><Text sx={{ fontSize: 14, color: '#2563EB' }}>{'<-'} Back to Research Feed</Text></Link>
          </View>
        </View>
      </ScrollView>
    );
  }

  const maturityDist = overview.maturityDistribution as Record<string, number>;
  const subtypeDist = overview.subtypeDistribution as Record<string, number>;
  const treatmentClassDist = overview.treatmentClassDistribution as Record<string, number>;
  const totalForBar = Object.values(maturityDist).reduce((a, b) => a + b, 0) || 1;

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$10', width: '100%' }}>
        {/* Header */}
        <Text sx={{ fontSize: 28, fontWeight: 'bold', color: '$foreground' }}>Research Landscape</Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
          Aggregated view of {overview.totalItems.toLocaleString()} classified research items
        </Text>
        <Text sx={{ fontSize: 12, color: '$mutedForeground' }}>
          Last updated {new Date(overview.lastUpdated).toLocaleString()}
        </Text>

        {/* Maturity distribution bar */}
        <View sx={{ mt: '$8' }}>
          <Text sx={{ fontSize: 16, fontWeight: '600', color: '$foreground', mb: '$3' }}>
            Maturity Distribution
          </Text>
          <View sx={{ flexDirection: 'row', height: 28, borderRadius: 6, overflow: 'hidden' }}>
            {(['T1', 'T2', 'T3', 'T4', 'T5'] as const).map(tier => {
              const count = maturityDist[tier] ?? 0;
              const pct = (count / totalForBar) * 100;
              if (pct < 1) return null;
              return (
                <View
                  key={tier}
                  sx={{ width: `${pct}%`, backgroundColor: TIER_COLORS[tier], justifyContent: 'center', alignItems: 'center' }}
                >
                  {pct > 8 && (
                    <Text sx={{ fontSize: 11, fontWeight: '600', color: 'white' }}>{tier}</Text>
                  )}
                </View>
              );
            })}
          </View>
          <View sx={{ flexDirection: 'row', flexWrap: 'wrap', gap: '$3', mt: '$3' }}>
            {(['T1', 'T2', 'T3', 'T4', 'T5'] as const).map(tier => (
              <View key={tier} sx={{ flexDirection: 'row', alignItems: 'center', gap: '$1' }}>
                <View sx={{ width: 10, height: 10, borderRadius: 2, backgroundColor: TIER_COLORS[tier] }} />
                <Text sx={{ fontSize: 12, color: '$mutedForeground' }}>
                  {tier}: {maturityDist[tier] ?? 0} ({TIER_LABELS[tier]})
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Subtype grid */}
        <View sx={{ mt: '$8' }}>
          <Text sx={{ fontSize: 16, fontWeight: '600', color: '$foreground', mb: '$3' }}>
            Browse by Subtype
          </Text>
          <View sx={{ flexDirection: 'row', flexWrap: 'wrap', gap: '$3' }}>
            {SUBTYPES.filter(s => (subtypeDist[s] ?? 0) > 0).map(s => (
              <Link key={s} href={`/intel/landscape/${s}`}>
                <View sx={{
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: '$border',
                  px: '$4',
                  py: '$3',
                  minWidth: 140,
                }}>
                  <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground' }}>
                    {SUBTYPE_LABELS[s] ?? s}
                  </Text>
                  <Text sx={{ fontSize: 12, color: '$mutedForeground', mt: '$1' }}>
                    {(subtypeDist[s] ?? 0).toLocaleString()} items
                  </Text>
                </View>
              </Link>
            ))}
          </View>
        </View>

        {/* Treatment pipeline summary */}
        <View sx={{ mt: '$8' }}>
          <Text sx={{ fontSize: 16, fontWeight: '600', color: '$foreground', mb: '$3' }}>
            Top Treatment Classes
          </Text>
          <View sx={{ gap: '$2' }}>
            {Object.entries(treatmentClassDist)
              .sort(([, a], [, b]) => (b as number) - (a as number))
              .slice(0, 10)
              .map(([cls, count]) => (
                <View key={cls} sx={{ flexDirection: 'row', justifyContent: 'space-between', py: '$2', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
                  <Text sx={{ fontSize: 13, color: '$foreground' }}>
                    {cls.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </Text>
                  <Text sx={{ fontSize: 13, fontWeight: '600', color: '$foreground' }}>
                    {(count as number).toLocaleString()}
                  </Text>
                </View>
              ))}
          </View>
        </View>

        {/* Recent highlights */}
        {overview.recentHighlights.length > 0 && (
          <View sx={{ mt: '$8' }}>
            <Text sx={{ fontSize: 16, fontWeight: '600', color: '$foreground', mb: '$3' }}>
              Recent Highlights (T1/T2)
            </Text>
            <View sx={{ gap: '$3' }}>
              {overview.recentHighlights.map(item => (
                <Link key={item.id} href={`/intel/${item.id}`}>
                  <View sx={{
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: '$border',
                    p: '$4',
                  }}>
                    <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$2', mb: '$2' }}>
                      <View sx={{
                        px: '$2', py: 2, borderRadius: 4,
                        backgroundColor: TIER_COLORS[item.maturityTier ?? 'T5'] + '20',
                      }}>
                        <Text sx={{ fontSize: 11, fontWeight: '700', color: TIER_COLORS[item.maturityTier ?? 'T5'] }}>
                          {item.maturityTier}
                        </Text>
                      </View>
                      {item.publishedAt && (
                        <Text sx={{ fontSize: 11, color: '$mutedForeground' }}>
                          {new Date(item.publishedAt).toLocaleDateString()}
                        </Text>
                      )}
                    </View>
                    <Text sx={{ fontSize: 14, fontWeight: '500', color: '$foreground', lineHeight: 20 }}>
                      {item.title}
                    </Text>
                    {item.drugNames.length > 0 && (
                      <View sx={{ flexDirection: 'row', flexWrap: 'wrap', gap: '$1', mt: '$2' }}>
                        {item.drugNames.slice(0, 3).map(d => (
                          <View key={d} sx={{ px: '$2', py: 2, borderRadius: 4, backgroundColor: '#EFF6FF' }}>
                            <Text sx={{ fontSize: 11, color: '#1D4ED8' }}>{d}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                </Link>
              ))}
            </View>
          </View>
        )}

        {/* Back link */}
        <View sx={{ mt: '$8' }}>
          <Link href="/intel">
            <Text sx={{ fontSize: 14, color: '#2563EB' }}>{'<-'} Back to Research Feed</Text>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}

// ============================================================================
// Subtype Detail Mode
// ============================================================================

function SubtypeDetailView({ subtype }: { subtype: string }) {
  const { data, loading, error } = useGetSubtypeLandscapeQuery({
    variables: { subtype },
    errorPolicy: 'ignore',
  });
  const [generateSOC, { loading: socLoading }] = useGenerateStandardOfCareMutation();
  const [socData, setSocData] = useState<{
    currentSOC: string;
    whatsChanging: string;
    whatsComing: string;
    whatsBeingExplored: string;
  } | null>(null);

  const landscape = data?.subtypeLandscape;

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 28, fontWeight: 'bold', color: '$foreground' }}>Loading...</Text>
        <View sx={{ mt: '$8', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <ActivityIndicator size="small" />
          <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>Loading subtype landscape...</Text>
        </View>
      </View>
    );
  }

  if (error || !landscape) {
    return (
      <ScrollView sx={{ flex: 1 }}>
        <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
          <Text sx={{ fontSize: 28, fontWeight: 'bold', color: '$foreground' }}>Subtype Landscape</Text>
          <Text sx={{ mt: '$4', fontSize: 14, color: '$mutedForeground' }}>
            Unable to load data for this subtype.
          </Text>
          <View sx={{ mt: '$4' }}>
            <Link href="/intel/landscape"><Text sx={{ fontSize: 14, color: '#2563EB' }}>{'<-'} Back to Landscape</Text></Link>
          </View>
        </View>
      </ScrollView>
    );
  }

  const maturityDist = landscape.maturityDistribution as Record<string, number>;
  const totalForBar = Object.values(maturityDist).reduce((a, b) => a + b, 0) || 1;
  const soc = socData ?? landscape.standardOfCare;

  const handleGenerateSOC = async () => {
    try {
      const { data: result } = await generateSOC({ variables: { subtype } });
      if (result?.generateStandardOfCare) {
        setSocData(result.generateStandardOfCare);
      }
    } catch {
      // Silently fail — user can retry
    }
  };

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$10', width: '100%' }}>
        {/* Header */}
        <Link href="/intel/landscape">
          <Text sx={{ fontSize: 14, color: '#2563EB', mb: '$3' }}>{'<-'} Back to Landscape</Text>
        </Link>
        <Text sx={{ fontSize: 28, fontWeight: 'bold', color: '$foreground' }}>
          {landscape.subtypeLabel}
        </Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
          {landscape.totalItems.toLocaleString()} classified research items
        </Text>

        {/* Standard of care card */}
        <View sx={{ mt: '$8' }}>
          <Text sx={{ fontSize: 16, fontWeight: '600', color: '$foreground', mb: '$3' }}>
            Standard of Care
          </Text>
          {soc ? (
            <SOCCard soc={soc} />
          ) : (
            <Pressable onPress={handleGenerateSOC} disabled={socLoading}>
              <View sx={{
                borderRadius: 10, borderWidth: 1, borderColor: '$border',
                borderStyle: 'dashed', p: '$5', alignItems: 'center',
              }}>
                {socLoading ? (
                  <View sx={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <ActivityIndicator size="small" />
                    <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>Generating summary...</Text>
                  </View>
                ) : (
                  <>
                    <Text sx={{ fontSize: 14, fontWeight: '500', color: '#2563EB' }}>
                      Generate Standard of Care Summary
                    </Text>
                    <Text sx={{ mt: '$1', fontSize: 12, color: '$mutedForeground' }}>
                      AI-generated overview of current treatment standards
                    </Text>
                  </>
                )}
              </View>
            </Pressable>
          )}
        </View>

        {/* Maturity distribution */}
        <View sx={{ mt: '$8' }}>
          <Text sx={{ fontSize: 16, fontWeight: '600', color: '$foreground', mb: '$3' }}>
            Maturity Distribution
          </Text>
          <View sx={{ flexDirection: 'row', height: 28, borderRadius: 6, overflow: 'hidden' }}>
            {(['T1', 'T2', 'T3', 'T4', 'T5'] as const).map(tier => {
              const count = maturityDist[tier] ?? 0;
              const pct = (count / totalForBar) * 100;
              if (pct < 1) return null;
              return (
                <View
                  key={tier}
                  sx={{ width: `${pct}%`, backgroundColor: TIER_COLORS[tier], justifyContent: 'center', alignItems: 'center' }}
                >
                  {pct > 8 && (
                    <Text sx={{ fontSize: 11, fontWeight: '600', color: 'white' }}>{tier}: {count}</Text>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Tier sections */}
        <TierSection title="Available Now" tier="T1" items={landscape.availableNow} />
        <TierSection title="Expected Soon" tier="T2" items={landscape.expectedSoon} />
        <TierSection title="In Trials" tier="T3" items={landscape.inTrials} />
        <TierSection title="Early Research" tier="T4/T5" items={landscape.earlyResearch} />

        {/* Treatment pipeline */}
        {landscape.topDrugs.length > 0 && (
          <View sx={{ mt: '$8' }}>
            <Text sx={{ fontSize: 16, fontWeight: '600', color: '$foreground', mb: '$3' }}>
              Treatment Pipeline
            </Text>
            <View sx={{ gap: '$2' }}>
              {landscape.topDrugs.slice(0, 10).map(drug => (
                <Link key={drug.drugName} href={`/intel/${drug.latestItemId}`}>
                  <View sx={{
                    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                    py: '$3', borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
                  }}>
                    <View sx={{ flex: 1 }}>
                      <Text sx={{ fontSize: 14, fontWeight: '500', color: '$foreground' }}>{drug.drugName}</Text>
                      <Text sx={{ fontSize: 12, color: '$mutedForeground' }}>
                        {drug.treatmentClass.replace(/_/g, ' ')} · {drug.itemCount} items
                      </Text>
                    </View>
                    <View sx={{
                      px: '$2', py: 2, borderRadius: 4,
                      backgroundColor: TIER_COLORS[drug.maturityTier] + '20',
                    }}>
                      <Text sx={{ fontSize: 11, fontWeight: '700', color: TIER_COLORS[drug.maturityTier] }}>
                        {drug.maturityTier}
                      </Text>
                    </View>
                  </View>
                </Link>
              ))}
            </View>
          </View>
        )}

        {/* Browse all items for this subtype */}
        <View sx={{ mt: '$8' }}>
          <Link href={`/intel?subtype=${subtype}`}>
            <View sx={{
              borderRadius: 8, borderWidth: 1, borderColor: '$border',
              px: '$6', py: '$3', alignItems: 'center',
            }}>
              <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground' }}>
                Browse all {landscape.subtypeLabel} research
              </Text>
            </View>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}

// ============================================================================
// Shared sub-components
// ============================================================================

function SOCCard({ soc }: { soc: { currentSOC: string; whatsChanging: string; whatsComing: string; whatsBeingExplored: string; generatedAt?: string } }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <View sx={{ borderRadius: 10, borderWidth: 1, borderColor: '#BBF7D0', backgroundColor: '#F0FDF4', p: '$4' }}>
      <Pressable onPress={() => setExpanded(!expanded)}>
        <View sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text sx={{ fontSize: 14, fontWeight: '600', color: '#166534' }}>
            Current Standard of Care
          </Text>
          <Text sx={{ fontSize: 12, color: '#166534' }}>{expanded ? 'Collapse' : 'Expand'}</Text>
        </View>
      </Pressable>
      {expanded && (
        <View sx={{ mt: '$3', gap: '$4' }}>
          <View>
            <Text sx={{ fontSize: 13, fontWeight: '600', color: '#166534' }}>Current SOC</Text>
            <Text sx={{ mt: '$1', fontSize: 13, color: '#374151', lineHeight: 20 }}>{soc.currentSOC}</Text>
          </View>
          {soc.whatsChanging ? (
            <View>
              <Text sx={{ fontSize: 13, fontWeight: '600', color: '#166534' }}>What's Changing</Text>
              <Text sx={{ mt: '$1', fontSize: 13, color: '#374151', lineHeight: 20 }}>{soc.whatsChanging}</Text>
            </View>
          ) : null}
          {soc.whatsComing ? (
            <View>
              <Text sx={{ fontSize: 13, fontWeight: '600', color: '#166534' }}>What's Coming</Text>
              <Text sx={{ mt: '$1', fontSize: 13, color: '#374151', lineHeight: 20 }}>{soc.whatsComing}</Text>
            </View>
          ) : null}
          {soc.whatsBeingExplored ? (
            <View>
              <Text sx={{ fontSize: 13, fontWeight: '600', color: '#166534' }}>What's Being Explored</Text>
              <Text sx={{ mt: '$1', fontSize: 13, color: '#374151', lineHeight: 20 }}>{soc.whatsBeingExplored}</Text>
            </View>
          ) : null}
          {soc.generatedAt && (
            <Text sx={{ fontSize: 11, color: '$mutedForeground', fontStyle: 'italic' }}>
              AI-generated summary. Last updated {new Date(soc.generatedAt).toLocaleDateString()}.
              Not medical advice — discuss with your oncologist.
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

function TierSection({ title, tier, items }: {
  title: string;
  tier: string;
  items: Array<{ id: string; title: string; maturityTier?: string | null; practiceImpact?: string | null; patientSummary?: string | null; drugNames: string[]; publishedAt?: string | null }>;
}) {
  const [expanded, setExpanded] = useState(true);

  if (items.length === 0) return null;

  const color = TIER_COLORS[tier.replace('/T5', '')] ?? '#9CA3AF';

  return (
    <View sx={{ mt: '$6' }}>
      <Pressable onPress={() => setExpanded(!expanded)}>
        <View sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', mb: '$3' }}>
          <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$2' }}>
            <View sx={{ width: 10, height: 10, borderRadius: 2, backgroundColor: color }} />
            <Text sx={{ fontSize: 15, fontWeight: '600', color: '$foreground' }}>
              {title} ({items.length})
            </Text>
          </View>
          <Text sx={{ fontSize: 12, color: '#2563EB' }}>{expanded ? 'Collapse' : 'Expand'}</Text>
        </View>
      </Pressable>
      {expanded && (
        <View sx={{ gap: '$3' }}>
          {items.map(item => (
            <Link key={item.id} href={`/intel/${item.id}`}>
              <View sx={{
                borderRadius: 8, borderWidth: 1, borderColor: '$border', p: '$3',
                borderLeftWidth: 3, borderLeftColor: color,
              }}>
                <Text sx={{ fontSize: 13, fontWeight: '500', color: '$foreground', lineHeight: 18 }}>
                  {item.title}
                </Text>
                {item.patientSummary && (
                  <Text sx={{ mt: '$2', fontSize: 12, color: '$mutedForeground', lineHeight: 18 }} numberOfLines={2}>
                    {item.patientSummary}
                  </Text>
                )}
                {item.drugNames.length > 0 && (
                  <View sx={{ flexDirection: 'row', flexWrap: 'wrap', gap: '$1', mt: '$2' }}>
                    {item.drugNames.slice(0, 3).map(d => (
                      <View key={d} sx={{ px: '$2', py: 1, borderRadius: 4, backgroundColor: '#EFF6FF' }}>
                        <Text sx={{ fontSize: 10, color: '#1D4ED8' }}>{d}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </Link>
          ))}
        </View>
      )}
    </View>
  );
}
