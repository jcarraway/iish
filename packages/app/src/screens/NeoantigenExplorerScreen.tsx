import { useState, useCallback } from 'react';
import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator, TextInput } from 'react-native';
import { Link } from 'solito/link';
import { Picker } from '../components';
import { openExternalUrl } from '../utils';
import { useGetNeoantigensQuery } from '../generated/graphql';

const CONFIDENCE_COLORS: Record<string, { bg: string; fg: string }> = {
  high: { bg: '#DCFCE7', fg: '#166534' },
  medium: { bg: '#FEF9C3', fg: '#854D0E' },
  low: { bg: '#FEE2E2', fg: '#991B1B' },
};

const SORT_OPTIONS = [
  { label: 'Rank (ascending)', value: 'rank:asc' },
  { label: 'Score (highest)', value: 'compositeScore:desc' },
  { label: 'Binding Affinity (strongest)', value: 'bindingAffinityNm:asc' },
  { label: 'Immunogenicity (highest)', value: 'immunogenicityScore:desc' },
  { label: 'VAF (highest)', value: 'vaf:desc' },
];

export function NeoantigenExplorerScreen({ jobId }: { jobId: string }) {
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState('rank');
  const [sortOrder, setSortOrder] = useState<string>('asc');
  const [confidence, setConfidence] = useState('');
  const [gene, setGene] = useState('');
  const [geneInput, setGeneInput] = useState('');

  const { data, loading } = useGetNeoantigensQuery({
    variables: {
      pipelineJobId: jobId,
      sort: sortField,
      order: sortOrder,
      confidence: confidence || undefined,
      gene: gene || undefined,
      page,
      limit: 50,
    },
  });

  const neoantigens = data?.neoantigens.neoantigens ?? [];
  const total = data?.neoantigens.total ?? 0;
  const totalPages = data?.neoantigens.totalPages ?? 0;

  const handleSortChange = useCallback((val: string) => {
    const [f, o] = val.split(':');
    setSortField(f);
    setSortOrder(o);
    setPage(1);
  }, []);

  const handleGeneSearch = useCallback(() => {
    setGene(geneInput);
    setPage(1);
  }, [geneInput]);

  return (
    <ScrollView>
      <View sx={{ mx: 'auto', maxWidth: 1152, px: '$6', py: '$16', width: '100%' }}>
        {/* Header */}
        <View sx={{ mb: '$6' }}>
          <Link href={`/pipeline/jobs/${jobId}`}>
            <Text sx={{ fontSize: 13, color: 'gray500', mb: '$1' }}>{'<'} Back to Job</Text>
          </Link>
          <View sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text sx={{ fontSize: 22, fontWeight: '700', color: 'gray900' }}>Neoantigen Explorer</Text>
              <Text sx={{ fontSize: 13, color: 'gray500' }}>{total} total candidates</Text>
            </View>
            <Pressable onPress={() => openExternalUrl(`/api/pipeline/jobs/${jobId}/neoantigens?sort=${sortField}&order=${sortOrder}&limit=10000${confidence ? `&confidence=${confidence}` : ''}${gene ? `&gene=${gene}` : ''}`)}>
              <View sx={{ borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, px: '$4', py: '$2' }}>
                <Text sx={{ fontSize: 14, fontWeight: '500', color: 'gray700' }}>Export JSON</Text>
              </View>
            </Pressable>
          </View>
        </View>

        {/* Filter bar */}
        <View sx={{ flexDirection: 'row', flexWrap: 'wrap', gap: '$3', mb: '$6', alignItems: 'center' }}>
          <View sx={{ width: 160 }}>
            <Picker
              value={confidence}
              onValueChange={(v) => { setConfidence(v); setPage(1); }}
              options={[
                { label: 'All Confidence', value: '' },
                { label: 'High', value: 'high' },
                { label: 'Medium', value: 'medium' },
                { label: 'Low', value: 'low' },
              ]}
            />
          </View>

          <View sx={{ flexDirection: 'row', gap: '$2', alignItems: 'center' }}>
            <TextInput
              value={geneInput}
              onChangeText={setGeneInput}
              placeholder="Search gene..."
              onSubmitEditing={handleGeneSearch}
              style={{ borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14, width: 140 }}
            />
            <Pressable onPress={handleGeneSearch}>
              <View sx={{ bg: '#7C3AED', borderRadius: 8, px: '$3', py: '$2' }}>
                <Text sx={{ fontSize: 14, fontWeight: '500', color: 'white' }}>Search</Text>
              </View>
            </Pressable>
            {gene !== '' && (
              <Pressable onPress={() => { setGene(''); setGeneInput(''); setPage(1); }}>
                <View sx={{ borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, px: '$3', py: '$2' }}>
                  <Text sx={{ fontSize: 14, color: 'gray500' }}>Clear</Text>
                </View>
              </Pressable>
            )}
          </View>

          <View sx={{ width: 220 }}>
            <Picker
              value={`${sortField}:${sortOrder}`}
              onValueChange={handleSortChange}
              options={SORT_OPTIONS}
            />
          </View>
        </View>

        {/* Table */}
        <View sx={{ borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', p: '$4' }}>
          {loading ? (
            <View sx={{ py: '$8', alignItems: 'center' }}>
              <ActivityIndicator size="large" />
            </View>
          ) : neoantigens.length === 0 ? (
            <Text sx={{ textAlign: 'center', color: 'gray500', py: '$8' }}>No neoantigens found matching filters.</Text>
          ) : (
            <>
              {/* Header row */}
              <View sx={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: '#E5E7EB', pb: '$2', mb: '$1' }}>
                <Text sx={{ width: 35, fontSize: 11, color: 'gray500' }}>#</Text>
                <Text sx={{ flex: 1, fontSize: 11, color: 'gray500' }}>Gene</Text>
                <Text sx={{ flex: 1, fontSize: 11, color: 'gray500' }}>Mutation</Text>
                <Text sx={{ flex: 1.5, fontSize: 11, color: 'gray500' }}>Peptide</Text>
                <Text sx={{ flex: 1, fontSize: 11, color: 'gray500' }}>HLA</Text>
                <Text sx={{ width: 55, fontSize: 11, color: 'gray500' }}>Score</Text>
                <Text sx={{ width: 55, fontSize: 11, color: 'gray500' }}>Binding</Text>
                <Text sx={{ width: 45, fontSize: 11, color: 'gray500' }}>VAF</Text>
                <Text sx={{ width: 60, fontSize: 11, color: 'gray500' }}>Conf.</Text>
              </View>
              {neoantigens.map((neo) => {
                const cc = CONFIDENCE_COLORS[neo.confidence] ?? { bg: '#F3F4F6', fg: '#374151' };
                return (
                  <View key={neo.id} sx={{ flexDirection: 'row', alignItems: 'center', py: 6, borderBottomWidth: 1, borderColor: '#F3F4F6' }}>
                    <Text sx={{ width: 35, fontSize: 12, color: '#9CA3AF' }}>{neo.rank}</Text>
                    <Text sx={{ flex: 1, fontSize: 12, fontWeight: '500' }}>{neo.gene}</Text>
                    <Text sx={{ flex: 1, fontSize: 12, color: 'gray600' }}>{neo.mutation}</Text>
                    <Text sx={{ flex: 1.5, fontSize: 10, fontFamily: 'monospace' }}>{neo.mutantPeptide}</Text>
                    <Text sx={{ flex: 1, fontSize: 12, color: 'gray600' }}>{neo.hlaAllele}</Text>
                    <Text sx={{ width: 55, fontSize: 12, fontWeight: '500' }}>{neo.compositeScore.toFixed(2)}</Text>
                    <Text sx={{ width: 55, fontSize: 12, color: 'gray600' }}>{neo.bindingAffinityNm.toFixed(0)}</Text>
                    <Text sx={{ width: 45, fontSize: 12, color: 'gray600' }}>{neo.vaf != null ? (neo.vaf * 100).toFixed(0) + '%' : '-'}</Text>
                    <View sx={{ width: 60 }}>
                      <View sx={{ bg: cc.bg, borderRadius: 12, px: 6, py: 1, alignSelf: 'flex-start' }}>
                        <Text sx={{ fontSize: 10, fontWeight: '500', color: cc.fg }}>{neo.confidence}</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </>
          )}
        </View>

        {/* Pagination */}
        {totalPages > 1 && (
          <View sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', mt: '$4' }}>
            <Text sx={{ fontSize: 13, color: 'gray500' }}>Page {page} of {totalPages}</Text>
            <View sx={{ flexDirection: 'row', gap: '$2' }}>
              <Pressable onPress={() => setPage(page - 1)} disabled={page <= 1}>
                <View sx={{ borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, px: '$3', py: 6, opacity: page <= 1 ? 0.5 : 1 }}>
                  <Text sx={{ fontSize: 13 }}>Previous</Text>
                </View>
              </Pressable>
              <Pressable onPress={() => setPage(page + 1)} disabled={page >= totalPages}>
                <View sx={{ borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, px: '$3', py: 6, opacity: page >= totalPages ? 0.5 : 1 }}>
                  <Text sx={{ fontSize: 13 }}>Next</Text>
                </View>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
