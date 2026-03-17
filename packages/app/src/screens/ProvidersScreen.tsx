import { useState, useMemo } from 'react';
import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { SequencingProviderCard, Picker } from '../components';
import type { PickerOption } from '../components';
import { useGetProvidersQuery } from '../generated/graphql';

const TYPE_OPTIONS: PickerOption[] = [
  { value: '', label: 'All types' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'academic', label: 'Academic' },
  { value: 'emerging', label: 'Emerging' },
];

const TEST_OPTIONS: PickerOption[] = [
  { value: '', label: 'All tests' },
  { value: 'comprehensive_genomic_profiling', label: 'Comprehensive (CGP)' },
  { value: 'liquid_biopsy', label: 'Liquid biopsy' },
  { value: 'targeted_panel', label: 'Targeted panel' },
  { value: 'rna_sequencing', label: 'RNA sequencing' },
  { value: 'whole_exome_sequencing', label: 'Whole exome' },
];

const SAMPLE_OPTIONS: PickerOption[] = [
  { value: '', label: 'All sample types' },
  { value: 'tissue', label: 'Tissue (FFPE)' },
  { value: 'blood', label: 'Blood / Liquid biopsy' },
];

export function ProvidersScreen() {
  const { data, loading, error, refetch } = useGetProvidersQuery();
  const [typeFilter, setTypeFilter] = useState('');
  const [testFilter, setTestFilter] = useState('');
  const [sampleFilter, setSampleFilter] = useState('');
  const [compareMode, setCompareMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const providers = data?.sequencingProviders ?? [];

  const filtered = useMemo(() => {
    let result = providers;
    if (typeFilter) {
      result = result.filter((p) => p.type === typeFilter);
    }
    if (testFilter) {
      result = result.filter((p) =>
        p.testNames.some((t) => t.toLowerCase().includes(testFilter.replace(/_/g, ' '))),
      );
    }
    if (sampleFilter) {
      result = result.filter((p) => {
        if (sampleFilter === 'tissue')
          return p.sampleTypes.some((s) => s.toLowerCase().includes('tissue') || s.toLowerCase().includes('ffpe'));
        if (sampleFilter === 'blood')
          return p.sampleTypes.some((s) => s.toLowerCase().includes('blood') || s.toLowerCase().includes('liquid'));
        return true;
      });
    }
    return result;
  }, [providers, typeFilter, testFilter, sampleFilter]);

  const selectedProviders = filtered.filter((p) => selectedIds.has(p.id));

  const toggleCompare = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < 3) {
        next.add(id);
      }
      return next;
    });
  };

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', alignSelf: 'center', width: '100%' }}>
        <Text sx={{ fontSize: '$3xl', fontWeight: '700', color: '$foreground' }}>Sequencing Providers</Text>
        <View sx={{ mt: '$8', flexDirection: 'row', alignItems: 'center', gap: '$3' }}>
          <ActivityIndicator size="small" />
          <Text sx={{ fontSize: '$sm', color: 'gray600' }}>Loading providers...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', alignSelf: 'center', width: '100%' }}>
        <Text sx={{ fontSize: '$3xl', fontWeight: '700', color: '$foreground' }}>Sequencing Providers</Text>
        <Text sx={{ mt: '$4', fontSize: '$sm', color: 'red600' }}>{error.message}</Text>
        <Pressable
          onPress={() => refetch()}
          sx={{ mt: '$4', borderRadius: '$lg', bg: 'blue600', px: '$4', py: '$2', alignSelf: 'flex-start' }}
        >
          <Text sx={{ fontSize: '$sm', color: 'white' }}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView sx={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', alignSelf: 'center', width: '100%' }}>
        <View sx={{ mb: '$6', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <View>
            <Text sx={{ fontSize: '$3xl', fontWeight: '700', color: '$foreground' }}>Sequencing Providers</Text>
            <Text sx={{ mt: '$1', fontSize: '$sm', color: 'gray500' }}>
              {filtered.length} provider{filtered.length !== 1 ? 's' : ''} available
            </Text>
          </View>
          <Pressable
            onPress={() => {
              setCompareMode(!compareMode);
              setSelectedIds(new Set());
            }}
            sx={{
              borderRadius: '$lg',
              px: '$3',
              py: 6,
              ...(compareMode
                ? { bg: 'blue600' }
                : { borderWidth: 1, borderColor: 'gray300' }),
            }}
          >
            <Text sx={{ fontSize: '$sm', fontWeight: '500', color: compareMode ? 'white' : 'gray700' }}>
              {compareMode ? 'Exit compare' : 'Compare'}
            </Text>
          </Pressable>
        </View>

        {/* Filters */}
        <View sx={{ mb: '$6', flexDirection: 'row', flexWrap: 'wrap', gap: '$3' }}>
          <View sx={{ minWidth: 140 }}>
            <Picker value={typeFilter} onValueChange={setTypeFilter} options={TYPE_OPTIONS} placeholder="All types" />
          </View>
          <View sx={{ minWidth: 180 }}>
            <Picker value={testFilter} onValueChange={setTestFilter} options={TEST_OPTIONS} placeholder="All tests" />
          </View>
          <View sx={{ minWidth: 180 }}>
            <Picker value={sampleFilter} onValueChange={setSampleFilter} options={SAMPLE_OPTIONS} placeholder="All sample types" />
          </View>
        </View>

        {/* Comparison table */}
        {compareMode && selectedProviders.length >= 2 && (
          <View sx={{ mb: '$8', borderRadius: '$lg', borderWidth: 1, borderColor: 'blue200', bg: 'blue50', overflow: 'hidden' }}>
            {/* Header row */}
            <View sx={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: 'blue200', p: '$3' }}>
              <View sx={{ width: 100 }}>
                <Text sx={{ color: 'gray500', fontWeight: '500', fontSize: '$sm' }}>Feature</Text>
              </View>
              {selectedProviders.map((p) => (
                <View key={p.id} sx={{ flex: 1, px: '$2' }}>
                  <Text sx={{ fontWeight: '600', color: 'gray900', fontSize: '$sm' }}>{p.name}</Text>
                </View>
              ))}
            </View>
            {/* Data rows */}
            {[
              { label: 'Gene count', getValue: (p: typeof selectedProviders[0]) => String(p.geneCount) },
              { label: 'Test names', getValue: (p: typeof selectedProviders[0]) => p.testNames.join(', ') },
              { label: 'Sample types', getValue: (p: typeof selectedProviders[0]) => p.sampleTypes.join(', ') },
              { label: 'Turnaround', getValue: (p: typeof selectedProviders[0]) => `${p.turnaroundDaysMin}-${p.turnaroundDaysMax} days` },
              {
                label: 'Cost range',
                getValue: (p: typeof selectedProviders[0]) =>
                  p.costRangeMin === 0 && p.costRangeMax === 0
                    ? 'Included'
                    : `$${p.costRangeMin.toLocaleString()}-$${p.costRangeMax.toLocaleString()}`,
              },
              { label: 'FDA approved', getValue: (p: typeof selectedProviders[0]) => (p.fdaApproved ? 'Yes' : 'No') },
            ].map((row, i) => (
              <View
                key={row.label}
                sx={{
                  flexDirection: 'row',
                  p: '$3',
                  borderBottomWidth: i < 5 ? 1 : 0,
                  borderColor: 'blue100',
                }}
              >
                <View sx={{ width: 100 }}>
                  <Text sx={{ color: 'gray500', fontSize: '$sm' }}>{row.label}</Text>
                </View>
                {selectedProviders.map((p) => (
                  <View key={p.id} sx={{ flex: 1, px: '$2' }}>
                    <Text sx={{ fontSize: '$sm', color: 'gray900' }}>{row.getValue(p)}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Provider cards */}
        <View sx={{ gap: '$3' }}>
          {filtered.map((provider) => (
            <SequencingProviderCard
              key={provider.id}
              providerId={provider.id}
              name={provider.name}
              type={provider.type}
              details={{
                testNames: provider.testNames,
                geneCount: provider.geneCount,
                sampleTypes: provider.sampleTypes,
                turnaroundDays: { min: provider.turnaroundDaysMin, max: provider.turnaroundDaysMax },
                costRange: { min: provider.costRangeMin, max: provider.costRangeMax },
                fdaApproved: provider.fdaApproved,
                orderingProcess: provider.orderingProcess ?? '',
                reportFormat: provider.reportFormat ?? '',
                clinicalUtility: '',
              }}
              compareMode={compareMode}
              isSelected={selectedIds.has(provider.id)}
              onToggleCompare={toggleCompare}
            />
          ))}
        </View>

        {filtered.length === 0 && (
          <View sx={{ mt: '$8', borderRadius: '$lg', borderWidth: 2, borderStyle: 'dashed', borderColor: 'gray300', p: '$8', alignItems: 'center' }}>
            <Text sx={{ color: 'gray600' }}>No providers match your filters.</Text>
            <Pressable
              onPress={() => {
                setTypeFilter('');
                setTestFilter('');
                setSampleFilter('');
              }}
            >
              <Text sx={{ mt: '$3', fontSize: '$sm', color: 'blue600' }}>Clear filters</Text>
            </Pressable>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
