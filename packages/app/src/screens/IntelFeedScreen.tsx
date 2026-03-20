import { useState, useCallback } from 'react';
import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator, TextInput } from 'react-native';
import { Link } from 'solito/link';
import { useGetResearchItemsQuery, useSearchResearchQuery } from '../generated/graphql';

// ============================================================================
// Constants
// ============================================================================

const MATURITY_TIERS = [
  { key: 'T1', label: 'T1 · Practice-Changing', color: '#16A34A', bg: '#DCFCE7' },
  { key: 'T2', label: 'T2 · Phase 3', color: '#0D9488', bg: '#CCFBF1' },
  { key: 'T3', label: 'T3 · Promising', color: '#2563EB', bg: '#DBEAFE' },
  { key: 'T4', label: 'T4 · Early', color: '#D97706', bg: '#FEF3C7' },
  { key: 'T5', label: 'T5 · Hypothesis', color: '#6B7280', bg: '#F3F4F6' },
];

const DOMAIN_OPTIONS = [
  'treatment', 'detection', 'prevention', 'survivorship',
  'quality_of_life', 'genetics', 'ai_technology', 'epidemiology', 'basic_science',
];

const IMPACT_OPTIONS = [
  { key: 'practice_changing', label: 'Practice-Changing', color: '#DC2626' },
  { key: 'practice_informing', label: 'Practice-Informing', color: '#2563EB' },
  { key: 'incremental', label: 'Incremental', color: '#059669' },
  { key: 'hypothesis_generating', label: 'Hypothesis', color: '#7C3AED' },
  { key: 'negative', label: 'Negative', color: '#991B1B' },
  { key: 'safety_alert', label: 'Safety Alert', color: '#B91C1C' },
];

function getTierStyle(tier: string | null | undefined) {
  const t = MATURITY_TIERS.find(m => m.key === tier);
  return t || { key: tier || '?', label: tier || 'Unknown', color: '#6B7280', bg: '#F3F4F6' };
}

function getImpactStyle(impact: string | null | undefined) {
  return IMPACT_OPTIONS.find(i => i.key === impact);
}

const SOURCE_BADGES: Record<string, { label: string; color: string; bg: string }> = {
  pubmed: { label: 'PubMed', color: '#374151', bg: '#F3F4F6' },
  fda: { label: 'FDA', color: '#166534', bg: '#DCFCE7' },
  preprint: { label: 'Preprint', color: '#92400E', bg: '#FEF3C7' },
  clinicaltrials: { label: 'Trial', color: '#0D9488', bg: '#CCFBF1' },
  institution: { label: 'News', color: '#6B21A8', bg: '#F3E8FF' },
  nih_reporter: { label: 'NIH', color: '#166534', bg: '#DCFCE7' },
};

// ============================================================================
// Screen
// ============================================================================

export function IntelFeedScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [selectedTiers, setSelectedTiers] = useState<string[]>([]);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [selectedImpact, setSelectedImpact] = useState<string | null>(null);

  const filters = {
    ...(selectedTiers.length > 0 ? { maturityTiers: selectedTiers } : {}),
    ...(selectedDomains.length > 0 ? { domains: selectedDomains } : {}),
    ...(selectedImpact ? { practiceImpact: selectedImpact } : {}),
    limit: 30,
  };

  const { data: feedData, loading: feedLoading } = useGetResearchItemsQuery({
    variables: { filters },
    skip: activeSearch.length > 0,
  });

  const { data: searchData, loading: searchLoading } = useSearchResearchQuery({
    variables: { query: activeSearch, filters },
    skip: activeSearch.length === 0,
  });

  const loading = feedLoading || searchLoading;
  const items = activeSearch ? (searchData?.searchResearch ?? []) : (feedData?.researchItems ?? []);

  const toggleTier = useCallback((tier: string) => {
    setSelectedTiers(prev =>
      prev.includes(tier) ? prev.filter(t => t !== tier) : [...prev, tier]
    );
  }, []);

  const toggleDomain = useCallback((domain: string) => {
    setSelectedDomains(prev =>
      prev.includes(domain) ? prev.filter(d => d !== domain) : [...prev, domain]
    );
  }, []);

  const handleSearch = useCallback(() => {
    setActiveSearch(searchQuery.trim());
  }, [searchQuery]);

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$10', width: '100%' }}>
        <Text sx={{ fontSize: 28, fontWeight: 'bold', color: '$foreground' }}>
          Research Intelligence
        </Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
          Curated breast cancer research — classified by maturity and practice impact
        </Text>

        {/* Search */}
        <View sx={{ mt: '$6', flexDirection: 'row', gap: '$2' }}>
          <View sx={{ flex: 1, borderWidth: 1, borderColor: '$border', borderRadius: 8, px: '$3', py: '$2' }}>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search research..."
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              style={{ fontSize: 14, color: '#111' }}
            />
          </View>
          <Pressable
            onPress={handleSearch}
            sx={{ backgroundColor: '#7C3AED', borderRadius: 8, px: '$4', justifyContent: 'center' }}
          >
            <Text sx={{ fontSize: 14, fontWeight: '600', color: 'white' }}>Search</Text>
          </Pressable>
          {activeSearch.length > 0 && (
            <Pressable
              onPress={() => { setSearchQuery(''); setActiveSearch(''); }}
              sx={{ borderWidth: 1, borderColor: '$border', borderRadius: 8, px: '$3', justifyContent: 'center' }}
            >
              <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>Clear</Text>
            </Pressable>
          )}
        </View>

        {/* Maturity Tier Pills */}
        <View sx={{ mt: '$4' }}>
          <Text sx={{ fontSize: 12, fontWeight: '600', color: '$mutedForeground', mb: '$2' }}>MATURITY</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View sx={{ flexDirection: 'row', gap: '$2' }}>
              {MATURITY_TIERS.map(tier => {
                const active = selectedTiers.includes(tier.key);
                return (
                  <Pressable
                    key={tier.key}
                    onPress={() => toggleTier(tier.key)}
                    sx={{
                      borderRadius: 20,
                      px: '$3',
                      py: '$1',
                      backgroundColor: active ? tier.bg : 'transparent',
                      borderWidth: 1,
                      borderColor: active ? tier.color : '$border',
                    }}
                  >
                    <Text sx={{ fontSize: 12, fontWeight: active ? '600' : '400', color: active ? tier.color : '$mutedForeground' }}>
                      {tier.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Domain Pills */}
        <View sx={{ mt: '$3' }}>
          <Text sx={{ fontSize: 12, fontWeight: '600', color: '$mutedForeground', mb: '$2' }}>DOMAINS</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View sx={{ flexDirection: 'row', gap: '$2', flexWrap: 'wrap' }}>
              {DOMAIN_OPTIONS.map(domain => {
                const active = selectedDomains.includes(domain);
                return (
                  <Pressable
                    key={domain}
                    onPress={() => toggleDomain(domain)}
                    sx={{
                      borderRadius: 20,
                      px: '$3',
                      py: '$1',
                      backgroundColor: active ? '#DBEAFE' : 'transparent',
                      borderWidth: 1,
                      borderColor: active ? '#2563EB' : '$border',
                    }}
                  >
                    <Text sx={{ fontSize: 12, fontWeight: active ? '600' : '400', color: active ? '#2563EB' : '$mutedForeground' }}>
                      {domain.replace(/_/g, ' ')}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Practice Impact Pills */}
        <View sx={{ mt: '$3' }}>
          <Text sx={{ fontSize: 12, fontWeight: '600', color: '$mutedForeground', mb: '$2' }}>IMPACT</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View sx={{ flexDirection: 'row', gap: '$2' }}>
              {IMPACT_OPTIONS.map(opt => {
                const active = selectedImpact === opt.key;
                return (
                  <Pressable
                    key={opt.key}
                    onPress={() => setSelectedImpact(active ? null : opt.key)}
                    sx={{
                      borderRadius: 20,
                      px: '$3',
                      py: '$1',
                      backgroundColor: active ? opt.color + '15' : 'transparent',
                      borderWidth: 1,
                      borderColor: active ? opt.color : '$border',
                    }}
                  >
                    <Text sx={{ fontSize: 12, fontWeight: active ? '600' : '400', color: active ? opt.color : '$mutedForeground' }}>
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Results */}
        {loading ? (
          <View sx={{ mt: '$8', alignItems: 'center' }}>
            <ActivityIndicator size="small" />
            <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>Loading research...</Text>
          </View>
        ) : items.length === 0 ? (
          <View sx={{ mt: '$8', p: '$6', borderRadius: 12, borderWidth: 1, borderColor: '$border', alignItems: 'center' }}>
            <Text sx={{ fontSize: 16, fontWeight: '600', color: '$foreground' }}>No results found</Text>
            <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground', textAlign: 'center' }}>
              {activeSearch ? 'Try different search terms or broaden your filters.' : 'Research items will appear here once ingested and classified.'}
            </Text>
          </View>
        ) : (
          <View sx={{ mt: '$6', gap: '$3' }}>
            <Text sx={{ fontSize: 12, color: '$mutedForeground' }}>
              {items.length} result{items.length !== 1 ? 's' : ''}
            </Text>
            {items.map((item: any) => {
              const tier = getTierStyle(item.maturityTier);
              const impact = getImpactStyle(item.practiceImpact);
              return (
                <Link key={item.id} href={`/intel/${item.id}`}>
                  <View sx={{
                    borderWidth: item.practiceImpact === 'safety_alert' ? 2 : 1,
                    borderColor: item.practiceImpact === 'safety_alert' ? '#DC2626' : (item.retractionStatus === 'retracted' ? '#DC2626' : '$border'),
                    borderRadius: 12,
                    p: '$4',
                  }}>
                    {/* Top row: tier + impact + retraction badges */}
                    <View sx={{ flexDirection: 'row', gap: '$2', flexWrap: 'wrap', mb: '$2' }}>
                      <View sx={{ backgroundColor: tier.bg, borderRadius: 12, px: '$2', py: 2 }}>
                        <Text sx={{ fontSize: 11, fontWeight: '700', color: tier.color }}>{tier.key}</Text>
                      </View>
                      {impact && (
                        <View sx={{ backgroundColor: impact.color + '15', borderRadius: 12, px: '$2', py: 2 }}>
                          <Text sx={{ fontSize: 11, fontWeight: '600', color: impact.color }}>
                            {impact.label}
                          </Text>
                        </View>
                      )}
                      {item.retractionStatus === 'retracted' && (
                        <View sx={{ backgroundColor: '#FEE2E2', borderRadius: 12, px: '$2', py: 2 }}>
                          <Text sx={{ fontSize: 11, fontWeight: '700', color: '#DC2626' }}>RETRACTED</Text>
                        </View>
                      )}
                      {item.retractionStatus === 'expression_of_concern' && (
                        <View sx={{ backgroundColor: '#FEF3C7', borderRadius: 12, px: '$2', py: 2 }}>
                          <Text sx={{ fontSize: 11, fontWeight: '700', color: '#92400E' }}>CONCERN</Text>
                        </View>
                      )}
                      {item.sourceCredibility === 'tier1_journal' && (
                        <View sx={{ backgroundColor: '#FEF3C7', borderRadius: 12, px: '$2', py: 2 }}>
                          <Text sx={{ fontSize: 11, fontWeight: '600', color: '#92400E' }}>Top Journal</Text>
                        </View>
                      )}
                      {/* Source type badge */}
                      {(() => {
                        const sb = SOURCE_BADGES[item.sourceType as string];
                        return sb ? (
                          <View sx={{ backgroundColor: sb.bg, borderRadius: 12, px: '$2', py: 2 }}>
                            <Text sx={{ fontSize: 11, fontWeight: '600', color: sb.color }}>{sb.label}</Text>
                          </View>
                        ) : null;
                      })()}
                      {/* Preprint warning */}
                      {item.sourceType === 'preprint' && (
                        <View sx={{ backgroundColor: '#FEF3C7', borderRadius: 12, px: '$2', py: 2, borderWidth: 1, borderColor: '#F59E0B' }}>
                          <Text sx={{ fontSize: 11, fontWeight: '700', color: '#92400E' }}>NOT PEER-REVIEWED</Text>
                        </View>
                      )}
                      {/* FDA safety alert */}
                      {item.sourceType === 'fda' && item.practiceImpact === 'safety_alert' && (
                        <View sx={{ backgroundColor: '#FEE2E2', borderRadius: 12, px: '$2', py: 2 }}>
                          <Text sx={{ fontSize: 11, fontWeight: '700', color: '#DC2626' }}>FDA ALERT</Text>
                        </View>
                      )}
                    </View>

                    {/* Title */}
                    <Text sx={{ fontSize: 15, fontWeight: '600', color: '$foreground', lineHeight: 20 }} numberOfLines={2}>
                      {item.title}
                    </Text>

                    {/* Journal + date */}
                    <Text sx={{ mt: '$1', fontSize: 12, color: '$mutedForeground' }}>
                      {item.journalName || 'Unknown journal'}
                      {item.publishedAt ? ` · ${new Date(item.publishedAt).toLocaleDateString()}` : ''}
                    </Text>

                    {/* Patient summary */}
                    {item.patientSummary && (
                      <Text sx={{ mt: '$2', fontSize: 13, color: '$foreground', lineHeight: 19 }} numberOfLines={3}>
                        {item.patientSummary}
                      </Text>
                    )}

                    {/* Domain chips */}
                    {item.domains?.length > 0 && (
                      <View sx={{ mt: '$2', flexDirection: 'row', gap: '$1', flexWrap: 'wrap' }}>
                        {(item.domains as string[]).slice(0, 4).map((d: string) => (
                          <View key={d} sx={{ backgroundColor: '#F3F4F6', borderRadius: 8, px: '$2', py: 1 }}>
                            <Text sx={{ fontSize: 10, color: '#4B5563' }}>{d.replace(/_/g, ' ')}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* Drug name chips */}
                    {item.drugNames?.length > 0 && (
                      <View sx={{ mt: '$1', flexDirection: 'row', gap: '$1', flexWrap: 'wrap' }}>
                        {(item.drugNames as string[]).slice(0, 3).map((drug: string) => (
                          <View key={drug} sx={{ backgroundColor: '#EDE9FE', borderRadius: 8, px: '$2', py: 1 }}>
                            <Text sx={{ fontSize: 10, color: '#5B21B6' }}>{drug}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                </Link>
              );
            })}
          </View>
        )}

        {/* Disclaimer */}
        <View sx={{ mt: '$8', p: '$4', backgroundColor: '#FFFBEB', borderRadius: 8 }}>
          <Text sx={{ fontSize: 12, color: '#92400E', lineHeight: 18 }}>
            Research summaries are AI-generated and for informational purposes only. Always discuss findings
            with your oncologist before making treatment decisions.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
