import { useState, useMemo } from 'react';
import { View, Text, Pressable, ScrollView, TextInput } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import { useRouter } from 'solito/router';
import {
  useGetArticlesQuery,
  useGetReadingPlanQuery,
} from '../generated/graphql';

// ============================================================================
// Constants
// ============================================================================

const CATEGORIES: { key: string; label: string; emoji: string; description: string }[] = [
  { key: 'diagnosis', label: 'Diagnosis', emoji: '\uD83D\uDD2C', description: 'Understanding your diagnosis' },
  { key: 'biomarkers', label: 'Biomarkers', emoji: '\uD83E\uDDEC', description: 'Tumor markers and mutations' },
  { key: 'treatment', label: 'Treatment', emoji: '\uD83D\uDC8A', description: 'Treatment options and regimens' },
  { key: 'testing', label: 'Testing', emoji: '\uD83E\uDDEA', description: 'Genomic and diagnostic testing' },
  { key: 'decisions', label: 'Decisions', emoji: '\u2696\uFE0F', description: 'Treatment decision support' },
  { key: 'side-effects', label: 'Side Effects', emoji: '\u26A1', description: 'Managing treatment effects' },
  { key: 'survivorship', label: 'Survivorship', emoji: '\uD83C\uDF31', description: 'Life after treatment' },
  { key: 'innovation', label: 'Innovation', emoji: '\uD83D\uDE80', description: 'New treatments and research' },
];

// ============================================================================
// Component
// ============================================================================

export function LearnHubScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');

  const { data: articlesData, loading: articlesLoading } = useGetArticlesQuery({
    errorPolicy: 'ignore',
  });
  const { data: planData } = useGetReadingPlanQuery({
    errorPolicy: 'ignore',
  });

  const articles = articlesData?.articles ?? [];
  const readingPlan = planData?.readingPlan;

  const featuredArticles = useMemo(() => {
    return [...articles]
      .sort((a, b) => {
        const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 3);
  }, [articles]);

  const readNowItems = useMemo(() => {
    if (!readingPlan?.readNow) return [];
    return readingPlan.readNow.slice(0, 3);
  }, [readingPlan]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const article of articles) {
      if (article.category) {
        counts[article.category] = (counts[article.category] ?? 0) + 1;
      }
    }
    return counts;
  }, [articles]);

  const handleSearch = () => {
    const trimmed = searchText.trim();
    if (trimmed) {
      router.push(`/learn/search?q=${encodeURIComponent(trimmed)}`);
    }
  };

  if (articlesLoading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          Learn
        </Text>
        <View sx={{ mt: '$8', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <ActivityIndicator size="small" />
          <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>Loading articles...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          Learn
        </Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
          Evidence-based educational content about cancer, treatment, and your journey
        </Text>

        {/* ============================================================= */}
        {/* Search Bar */}
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
            placeholder="Search articles, terms, topics..."
            placeholderTextColor="#a3a3a3"
            returnKeyType="search"
            onSubmitEditing={handleSearch}
            sx={{
              flex: 1,
              py: '$3',
              fontSize: 14,
              color: '$foreground',
            }}
          />
          {searchText.length > 0 && (
            <Pressable onPress={handleSearch}>
              <View sx={{
                backgroundColor: 'blue600',
                borderRadius: 8,
                px: '$3',
                py: '$1',
              }}>
                <Text sx={{ fontSize: 13, fontWeight: '600', color: 'white' }}>
                  Search
                </Text>
              </View>
            </Pressable>
          )}
        </View>

        {/* ============================================================= */}
        {/* Featured Articles */}
        {/* ============================================================= */}
        {featuredArticles.length > 0 && (
          <View sx={{ mt: '$8' }}>
            <SectionHeader title="Featured" />

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              sx={{ mt: '$4' }}
              contentContainerStyle={{ gap: 12 }}
            >
              {featuredArticles.map(article => (
                <Link key={article.id} href={`/learn/${article.category}/${article.slug}`}>
                  <View sx={{
                    width: 260,
                    borderWidth: 1,
                    borderColor: '$border',
                    borderRadius: 12,
                    p: '$5',
                    backgroundColor: '$card',
                  }}>
                    <View sx={{
                      backgroundColor: '#EFF6FF',
                      borderRadius: 8,
                      px: '$2',
                      py: 3,
                      alignSelf: 'flex-start',
                      mb: '$3',
                    }}>
                      <Text sx={{ fontSize: 11, fontWeight: '600', color: '#1E40AF', textTransform: 'capitalize' }}>
                        {article.category}
                      </Text>
                    </View>
                    <Text sx={{ fontSize: 15, fontWeight: '600', color: '$foreground' }} numberOfLines={2}>
                      {article.title}
                    </Text>
                    <Text sx={{ mt: '$2', fontSize: 13, color: '$mutedForeground', lineHeight: 20 }} numberOfLines={3}>
                      {article.patientSummary}
                    </Text>
                    <View sx={{ mt: '$3', flexDirection: 'row', alignItems: 'center', gap: '$2' }}>
                      {article.keyTakeaways && article.keyTakeaways.length > 0 && (
                        <Text sx={{ fontSize: 11, color: '$mutedForeground' }}>
                          {article.keyTakeaways.length} key takeaway{article.keyTakeaways.length !== 1 ? 's' : ''}
                        </Text>
                      )}
                      {article.viewCount != null && article.viewCount > 0 && (
                        <Text sx={{ fontSize: 11, color: '$mutedForeground' }}>
                          {'\u00B7'} {article.viewCount.toLocaleString()} views
                        </Text>
                      )}
                    </View>
                  </View>
                </Link>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ============================================================= */}
        {/* For You (logged-in with reading plan) */}
        {/* ============================================================= */}
        {readNowItems.length > 0 && (
          <View sx={{ mt: '$8' }}>
            <SectionHeader title="For You" />

            <View sx={{ mt: '$4', gap: '$3' }}>
              {readNowItems.map((item, idx) => (
                <Link key={item.articleSlug} href={`/learn/${item.articleSlug}`}>
                  <View sx={{
                    borderWidth: 1,
                    borderColor: '$border',
                    borderRadius: 12,
                    p: '$4',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: '$3',
                  }}>
                    <View sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: '#DBEAFE',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Text sx={{ fontSize: 14, fontWeight: 'bold', color: '#1E40AF' }}>
                        {idx + 1}
                      </Text>
                    </View>
                    <View sx={{ flex: 1 }}>
                      <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground' }}>
                        {item.articleTitle}
                      </Text>
                      <Text sx={{ mt: 2, fontSize: 12, color: '$mutedForeground' }} numberOfLines={1}>
                        {item.reason}
                      </Text>
                    </View>
                    <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>{'\u2192'}</Text>
                  </View>
                </Link>
              ))}
            </View>
          </View>
        )}

        {/* ============================================================= */}
        {/* Category Grid */}
        {/* ============================================================= */}
        <View sx={{ mt: '$8' }}>
          <SectionHeader title="Browse by Topic" />

          <View sx={{
            mt: '$4',
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: '$3',
          }}>
            {CATEGORIES.map(cat => {
              const count = categoryCounts[cat.key] ?? 0;
              return (
                <Link key={cat.key} href={`/learn/${cat.key}`}>
                  <View sx={{
                    width: ['48%', '48%', '23%'],
                    minWidth: 150,
                    borderWidth: 1,
                    borderColor: '$border',
                    borderRadius: 12,
                    p: '$4',
                    backgroundColor: '$card',
                  }}>
                    <Text sx={{ fontSize: 24 }}>{cat.emoji}</Text>
                    <Text sx={{ mt: '$2', fontSize: 15, fontWeight: '600', color: '$foreground' }}>
                      {cat.label}
                    </Text>
                    <Text sx={{ mt: '$1', fontSize: 12, color: '$mutedForeground' }}>
                      {cat.description}
                    </Text>
                    {count > 0 && (
                      <Text sx={{ mt: '$2', fontSize: 11, color: 'blue600' }}>
                        {count} article{count !== 1 ? 's' : ''}
                      </Text>
                    )}
                  </View>
                </Link>
              );
            })}
          </View>
        </View>

        {/* ============================================================= */}
        {/* Quick Links */}
        {/* ============================================================= */}
        <View sx={{ mt: '$8', flexDirection: 'row', flexWrap: 'wrap', gap: '$3' }}>
          <Link href="/learn/glossary">
            <View sx={{
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '$border',
              px: '$4',
              py: '$3',
              flexDirection: 'row',
              alignItems: 'center',
              gap: '$2',
            }}>
              <Text sx={{ fontSize: 16 }}>{'\uD83D\uDCD6'}</Text>
              <Text sx={{ fontSize: 13, fontWeight: '500', color: '$foreground' }}>
                Glossary
              </Text>
            </View>
          </Link>
          <Link href="/learn/reading-plan">
            <View sx={{
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '$border',
              px: '$4',
              py: '$3',
              flexDirection: 'row',
              alignItems: 'center',
              gap: '$2',
            }}>
              <Text sx={{ fontSize: 16 }}>{'\uD83D\uDCCB'}</Text>
              <Text sx={{ fontSize: 13, fontWeight: '500', color: '$foreground' }}>
                Reading Plan
              </Text>
            </View>
          </Link>
        </View>

        {/* ============================================================= */}
        {/* Disclaimer */}
        {/* ============================================================= */}
        <View sx={{
          mt: '$8',
          backgroundColor: '#FFFBEB',
          borderWidth: 1,
          borderColor: '#FDE68A',
          borderRadius: 12,
          p: '$5',
        }}>
          <Text sx={{ fontSize: 13, fontWeight: '600', color: '#92400E' }}>
            Educational content only
          </Text>
          <Text sx={{ mt: '$2', fontSize: 12, color: '#78350F', lineHeight: 18 }}>
            All articles are for informational purposes only and are not a substitute for professional
            medical advice, diagnosis, or treatment. Always consult your oncologist or healthcare team
            for guidance specific to your situation.
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
