import { useState, useEffect, useMemo } from 'react';
import { View, Text, Pressable, ScrollView, TextInput } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import { useRouter } from 'solito/router';
import { useSearchArticlesQuery } from '../generated/graphql';

// ============================================================================
// Constants
// ============================================================================

const CATEGORY_OPTIONS = [
  { label: 'All categories', value: '' },
  { label: 'Diagnosis', value: 'diagnosis' },
  { label: 'Biomarkers', value: 'biomarkers' },
  { label: 'Treatment', value: 'treatment' },
  { label: 'Testing', value: 'testing' },
  { label: 'Decisions', value: 'decisions' },
  { label: 'Side Effects', value: 'side-effects' },
  { label: 'Survivorship', value: 'survivorship' },
  { label: 'Innovation', value: 'innovation' },
];

const CATEGORY_COLORS: Record<string, { bg: string; fg: string }> = {
  diagnosis: { bg: '#DBEAFE', fg: '#1E40AF' },
  biomarkers: { bg: '#DCFCE7', fg: '#166534' },
  treatment: { bg: '#EDE9FE', fg: '#5B21B6' },
  testing: { bg: '#FEF3C7', fg: '#92400E' },
  decisions: { bg: '#FCE7F3', fg: '#9D174D' },
  'side-effects': { bg: '#FEE2E2', fg: '#991B1B' },
  survivorship: { bg: '#CCFBF1', fg: '#115E59' },
  innovation: { bg: '#E0E7FF', fg: '#4338CA' },
};

// ============================================================================
// Component
// ============================================================================

export function LearnSearchScreen({ query: initialQuery }: { query?: string }) {
  const router = useRouter();
  const [searchText, setSearchText] = useState(initialQuery ?? '');
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery ?? '');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchText.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [searchText]);

  const filters = useMemo(() => {
    if (!categoryFilter) return undefined;
    return { category: categoryFilter };
  }, [categoryFilter]);

  const { data, loading } = useSearchArticlesQuery({
    variables: {
      query: debouncedQuery,
      filters: filters ?? null,
    },
    skip: !debouncedQuery,
    errorPolicy: 'ignore',
  });

  const results = data?.searchArticles ?? [];

  const handleSubmit = () => {
    const trimmed = searchText.trim();
    if (trimmed) {
      setDebouncedQuery(trimmed);
      router.replace(`/learn/search?q=${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        {/* Breadcrumbs */}
        <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$2', mb: '$4' }}>
          <Link href="/learn">
            <Text sx={{ fontSize: 13, color: 'blue600' }}>Learn</Text>
          </Link>
          <Text sx={{ fontSize: 13, color: '$mutedForeground' }}>{'\u203A'}</Text>
          <Text sx={{ fontSize: 13, color: '$mutedForeground' }}>Search</Text>
        </View>

        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          Search Articles
        </Text>

        {/* ============================================================= */}
        {/* Search Input */}
        {/* ============================================================= */}
        <View sx={{
          mt: '$6',
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: '$border',
          borderRadius: 12,
          backgroundColor: '$background',
          px: '$4',
        }}>
          <Text sx={{ fontSize: 16, color: '$mutedForeground', mr: '$2' }}>{'\uD83D\uDD0D'}</Text>
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search by topic, term, or keyword..."
            placeholderTextColor="#a3a3a3"
            returnKeyType="search"
            onSubmitEditing={handleSubmit}
            autoFocus
            sx={{
              flex: 1,
              py: '$3',
              fontSize: 14,
              color: '$foreground',
            }}
          />
          {searchText.length > 0 && (
            <Pressable onPress={() => { setSearchText(''); setDebouncedQuery(''); }}>
              <Text sx={{ fontSize: 18, color: '$mutedForeground', px: '$2' }}>{'\u2715'}</Text>
            </Pressable>
          )}
        </View>

        {/* ============================================================= */}
        {/* Category Filter Pills */}
        {/* ============================================================= */}
        <View sx={{ mt: '$4', flexDirection: 'row', flexWrap: 'wrap', gap: '$2' }}>
          {CATEGORY_OPTIONS.map(cat => {
            const isActive = categoryFilter === cat.value;
            return (
              <Pressable key={cat.value} onPress={() => setCategoryFilter(cat.value)}>
                <View sx={{
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: isActive ? 'blue600' : '$border',
                  backgroundColor: isActive ? '#DBEAFE' : 'transparent',
                  px: '$3',
                  py: '$1',
                }}>
                  <Text sx={{
                    fontSize: 13,
                    fontWeight: isActive ? '600' : '400',
                    color: isActive ? '#1E40AF' : '$mutedForeground',
                  }}>
                    {cat.label}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* ============================================================= */}
        {/* Results */}
        {/* ============================================================= */}
        {loading && debouncedQuery && (
          <View sx={{ mt: '$8', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <ActivityIndicator size="small" />
            <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>Searching...</Text>
          </View>
        )}

        {!loading && debouncedQuery && results.length === 0 && (
          <View sx={{
            mt: '$8',
            borderWidth: 2,
            borderStyle: 'dashed',
            borderColor: '$border',
            borderRadius: 16,
            p: '$8',
            alignItems: 'center',
          }}>
            <Text sx={{ fontSize: 20, fontWeight: '600', color: '$foreground', textAlign: 'center' }}>
              No articles match your search
            </Text>
            <Text sx={{
              mt: '$3',
              fontSize: 14,
              color: '$mutedForeground',
              textAlign: 'center',
              maxWidth: 400,
            }}>
              Try different keywords, check your spelling, or browse by category.
            </Text>
            <Link href="/learn">
              <View sx={{
                mt: '$5',
                borderWidth: 1,
                borderColor: '$border',
                borderRadius: 8,
                px: '$4',
                py: '$2',
              }}>
                <Text sx={{ fontSize: 14, fontWeight: '500', color: '$foreground' }}>
                  Browse all topics
                </Text>
              </View>
            </Link>
          </View>
        )}

        {!loading && !debouncedQuery && (
          <View sx={{
            mt: '$8',
            p: '$8',
            alignItems: 'center',
          }}>
            <Text sx={{ fontSize: 36 }}>{'\uD83D\uDD0D'}</Text>
            <Text sx={{
              mt: '$3',
              fontSize: 16,
              color: '$mutedForeground',
              textAlign: 'center',
              maxWidth: 400,
            }}>
              Start typing to search for articles, topics, or medical terms
            </Text>
          </View>
        )}

        {!loading && results.length > 0 && (
          <View sx={{ mt: '$6' }}>
            <Text sx={{ fontSize: 14, color: '$mutedForeground', mb: '$4' }}>
              {results.length} result{results.length !== 1 ? 's' : ''} for "{debouncedQuery}"
            </Text>

            <View sx={{ gap: '$3' }}>
              {results.map(article => {
                const catColor = CATEGORY_COLORS[article.category ?? ''] ?? { bg: '#F3F4F6', fg: '#6B7280' };
                return (
                  <Link key={article.id} href={`/learn/${article.category}/${article.slug}`}>
                    <View sx={{
                      borderWidth: 1,
                      borderColor: '$border',
                      borderRadius: 12,
                      p: '$5',
                    }}>
                      <View sx={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                      }}>
                        <View sx={{ flex: 1, mr: '$3' }}>
                          <Text sx={{ fontSize: 16, fontWeight: '600', color: '$foreground' }}>
                            {article.title}
                          </Text>
                          <Text sx={{
                            mt: '$2',
                            fontSize: 13,
                            color: '$mutedForeground',
                            lineHeight: 20,
                          }} numberOfLines={2}>
                            {article.patientSummary}
                          </Text>
                        </View>
                        {article.category && (
                          <View sx={{
                            backgroundColor: catColor.bg,
                            borderRadius: 12,
                            px: '$2',
                            py: 3,
                          }}>
                            <Text sx={{
                              fontSize: 10,
                              fontWeight: '600',
                              color: catColor.fg,
                              textTransform: 'capitalize',
                            }}>
                              {article.category.replace(/-/g, ' ')}
                            </Text>
                          </View>
                        )}
                      </View>

                      <Text sx={{ mt: '$3', fontSize: 12, color: 'blue600' }}>
                        Read article {'\u2192'}
                      </Text>
                    </View>
                  </Link>
                );
              })}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
