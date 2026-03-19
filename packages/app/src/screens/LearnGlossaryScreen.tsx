import { useState, useMemo } from 'react';
import { View, Text, Pressable, ScrollView, TextInput } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import { useGetGlossaryTermsQuery } from '../generated/graphql';

// ============================================================================
// Constants
// ============================================================================

const GLOSSARY_CATEGORIES = [
  { label: 'All', value: '' },
  { label: 'Biomarkers', value: 'biomarkers' },
  { label: 'Treatments', value: 'treatments' },
  { label: 'Tests', value: 'tests' },
  { label: 'Procedures', value: 'procedures' },
  { label: 'Anatomy', value: 'anatomy' },
  { label: 'General', value: 'general' },
];

// ============================================================================
// Component
// ============================================================================

export function LearnGlossaryScreen() {
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const { data, loading } = useGetGlossaryTermsQuery({
    variables: categoryFilter ? { category: categoryFilter } : {},
    errorPolicy: 'ignore',
  });

  const allTerms = data?.glossaryTerms ?? [];

  // Client-side filtering by search text
  const filteredTerms = useMemo(() => {
    if (!searchText.trim()) return allTerms;
    const q = searchText.trim().toLowerCase();
    return allTerms.filter(term => {
      if (term.term.toLowerCase().includes(q)) return true;
      if (term.shortDefinition?.toLowerCase().includes(q)) return true;
      if (term.aliases && term.aliases.some((a: string) => a.toLowerCase().includes(q))) return true;
      return false;
    });
  }, [allTerms, searchText]);

  // Group by first letter
  const groupedTerms = useMemo(() => {
    const groups: Record<string, typeof filteredTerms> = {};
    for (const term of filteredTerms) {
      const firstLetter = term.term.charAt(0).toUpperCase();
      const key = /[A-Z]/.test(firstLetter) ? firstLetter : '#';
      if (!groups[key]) groups[key] = [];
      groups[key].push(term);
    }
    // Sort terms within each group
    for (const key of Object.keys(groups)) {
      groups[key].sort((a, b) => a.term.localeCompare(b.term));
    }
    return groups;
  }, [filteredTerms]);

  const sortedLetters = useMemo(() => {
    return Object.keys(groupedTerms).sort((a, b) => {
      if (a === '#') return 1;
      if (b === '#') return -1;
      return a.localeCompare(b);
    });
  }, [groupedTerms]);

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>Glossary</Text>
        <View sx={{ mt: '$8', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <ActivityIndicator size="small" />
          <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>Loading glossary...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        {/* Breadcrumbs */}
        <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$2', mb: '$4' }}>
          <Link href="/learn">
            <Text sx={{ fontSize: 13, color: 'blue600' }}>Learn</Text>
          </Link>
          <Text sx={{ fontSize: 13, color: '$mutedForeground' }}>{'\u203A'}</Text>
          <Text sx={{ fontSize: 13, color: '$mutedForeground' }}>Glossary</Text>
        </View>

        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          {'\uD83D\uDCD6'} Glossary
        </Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
          Clear definitions for cancer-related terms you may encounter
        </Text>

        {/* ============================================================= */}
        {/* Search */}
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
            placeholder="Filter terms..."
            placeholderTextColor="#a3a3a3"
            sx={{
              flex: 1,
              py: '$3',
              fontSize: 14,
              color: '$foreground',
            }}
          />
          {searchText.length > 0 && (
            <Pressable onPress={() => setSearchText('')}>
              <Text sx={{ fontSize: 18, color: '$mutedForeground', px: '$2' }}>{'\u2715'}</Text>
            </Pressable>
          )}
        </View>

        {/* ============================================================= */}
        {/* Category Filter Pills */}
        {/* ============================================================= */}
        <View sx={{ mt: '$4', flexDirection: 'row', flexWrap: 'wrap', gap: '$2' }}>
          {GLOSSARY_CATEGORIES.map(cat => {
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
        {/* Alphabet Jump Bar */}
        {/* ============================================================= */}
        {sortedLetters.length > 3 && (
          <View sx={{
            mt: '$4',
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: '$1',
          }}>
            {sortedLetters.map(letter => (
              <View key={letter} sx={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: '#F3F4F6',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Text sx={{ fontSize: 12, fontWeight: '600', color: '#374151' }}>
                  {letter}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* ============================================================= */}
        {/* Terms by Letter */}
        {/* ============================================================= */}
        {filteredTerms.length === 0 && (
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
              No terms found
            </Text>
            <Text sx={{
              mt: '$3',
              fontSize: 14,
              color: '$mutedForeground',
              textAlign: 'center',
              maxWidth: 400,
            }}>
              {searchText
                ? 'Try different keywords or clear the filter.'
                : 'The glossary is being prepared. Check back soon.'}
            </Text>
          </View>
        )}

        {sortedLetters.map(letter => (
          <View key={letter} sx={{ mt: '$6' }}>
            <View sx={{
              backgroundColor: '#F3F4F6',
              borderRadius: 8,
              px: '$3',
              py: '$2',
              alignSelf: 'flex-start',
              mb: '$3',
            }}>
              <Text sx={{ fontSize: 18, fontWeight: 'bold', color: '$foreground' }}>
                {letter}
              </Text>
            </View>

            <View sx={{ gap: '$2' }}>
              {groupedTerms[letter].map(term => (
                <Link key={term.id ?? term.slug} href={`/learn/glossary/${term.slug}`}>
                  <View sx={{
                    borderWidth: 1,
                    borderColor: '$border',
                    borderRadius: 12,
                    p: '$4',
                  }}>
                    <View sx={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}>
                      <View sx={{ flex: 1, mr: '$3' }}>
                        <Text sx={{ fontSize: 15, fontWeight: '600', color: '$foreground' }}>
                          {term.term}
                        </Text>
                        <Text sx={{
                          mt: '$1',
                          fontSize: 13,
                          color: '$mutedForeground',
                          lineHeight: 20,
                        }} numberOfLines={2}>
                          {term.shortDefinition}
                        </Text>
                        {term.aliases && term.aliases.length > 0 && (
                          <Text sx={{ mt: '$1', fontSize: 11, color: '$mutedForeground', fontStyle: 'italic' }}>
                            Also: {term.aliases.join(', ')}
                          </Text>
                        )}
                      </View>
                      <Text sx={{ fontSize: 14, color: '$mutedForeground', mt: 2 }}>{'\u2192'}</Text>
                    </View>
                  </View>
                </Link>
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
