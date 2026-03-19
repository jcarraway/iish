import { useState, useMemo } from 'react';
import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import { useGetArticlesByCategoryQuery } from '../generated/graphql';

// ============================================================================
// Constants
// ============================================================================

const CATEGORY_META: Record<string, { label: string; emoji: string; description: string }> = {
  diagnosis: { label: 'Diagnosis', emoji: '\uD83D\uDD2C', description: 'Understanding your diagnosis, pathology reports, staging, and what it all means' },
  biomarkers: { label: 'Biomarkers', emoji: '\uD83E\uDDEC', description: 'Tumor markers, mutations, receptor status, and how they shape your treatment plan' },
  treatment: { label: 'Treatment', emoji: '\uD83D\uDC8A', description: 'Treatment options, regimens, drug profiles, and what to expect' },
  testing: { label: 'Testing', emoji: '\uD83E\uDDEA', description: 'Genomic testing, diagnostic tests, and understanding your results' },
  decisions: { label: 'Decisions', emoji: '\u2696\uFE0F', description: 'Making informed treatment decisions with your care team' },
  'side-effects': { label: 'Side Effects', emoji: '\u26A1', description: 'Managing and understanding treatment side effects' },
  survivorship: { label: 'Survivorship', emoji: '\uD83C\uDF31', description: 'Life during and after treatment — monitoring, wellness, and thriving' },
  innovation: { label: 'Innovation', emoji: '\uD83D\uDE80', description: 'New treatments, clinical trials, and emerging research' },
};

const AUDIENCE_LEVELS = [
  { label: 'All', value: '' },
  { label: 'Beginner', value: 'beginner' },
  { label: 'Intermediate', value: 'intermediate' },
  { label: 'Advanced', value: 'advanced' },
];

// ============================================================================
// Component
// ============================================================================

export function LearnCategoryScreen({ category }: { category: string }) {
  const [audienceFilter, setAudienceFilter] = useState('');

  const { data, loading } = useGetArticlesByCategoryQuery({
    variables: { category },
    errorPolicy: 'ignore',
  });

  const categoryResult = data?.articlesByCategory;
  const articles = categoryResult?.articles ?? [];
  const meta = CATEGORY_META[category] ?? {
    label: categoryResult?.label ?? category.charAt(0).toUpperCase() + category.slice(1),
    emoji: '\uD83D\uDCDA',
    description: categoryResult?.description ?? '',
  };

  const filteredArticles = useMemo(() => {
    let result = [...articles].sort((a, b) => {
      const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return dateB - dateA;
    });
    if (audienceFilter) {
      result = result.filter(a => a.audienceLevel === audienceFilter);
    }
    return result;
  }, [articles, audienceFilter]);

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          {meta.emoji} {meta.label}
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
        {/* Breadcrumbs */}
        <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$2', mb: '$4' }}>
          <Link href="/learn">
            <Text sx={{ fontSize: 13, color: 'blue600' }}>Learn</Text>
          </Link>
          <Text sx={{ fontSize: 13, color: '$mutedForeground' }}>{'\u203A'}</Text>
          <Text sx={{ fontSize: 13, color: '$mutedForeground' }}>{meta.label}</Text>
        </View>

        {/* Header */}
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          {meta.emoji} {meta.label}
        </Text>
        {meta.description ? (
          <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground', lineHeight: 22 }}>
            {meta.description}
          </Text>
        ) : null}

        {/* Audience filter pills */}
        <View sx={{ mt: '$6', flexDirection: 'row', flexWrap: 'wrap', gap: '$2' }}>
          {AUDIENCE_LEVELS.map(level => {
            const isActive = audienceFilter === level.value;
            return (
              <Pressable key={level.value} onPress={() => setAudienceFilter(level.value)}>
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
                    {level.label}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Articles list */}
        {filteredArticles.length === 0 && (
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
              {audienceFilter ? 'No articles match this filter' : 'No articles yet'}
            </Text>
            <Text sx={{
              mt: '$3',
              fontSize: 14,
              color: '$mutedForeground',
              textAlign: 'center',
              maxWidth: 400,
            }}>
              {audienceFilter
                ? 'Try selecting a different audience level or browse all articles.'
                : 'Articles for this topic are being prepared. Check back soon.'}
            </Text>
          </View>
        )}

        {filteredArticles.length > 0 && (
          <View sx={{ mt: '$4', gap: '$3' }}>
            {filteredArticles.map(article => (
              <Link key={article.id} href={`/learn/${category}/${article.slug}`}>
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
                    {article.audienceLevel && (
                      <View sx={{
                        backgroundColor: '#F3F4F6',
                        borderRadius: 12,
                        px: '$2',
                        py: 3,
                      }}>
                        <Text sx={{
                          fontSize: 10,
                          fontWeight: '600',
                          color: '#6B7280',
                          textTransform: 'capitalize',
                        }}>
                          {article.audienceLevel}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View sx={{ mt: '$3', flexDirection: 'row', alignItems: 'center', gap: '$3' }}>
                    {article.keyTakeaways && article.keyTakeaways.length > 0 && (
                      <Text sx={{ fontSize: 12, color: '$mutedForeground' }}>
                        {article.keyTakeaways.length} takeaway{article.keyTakeaways.length !== 1 ? 's' : ''}
                      </Text>
                    )}
                    {article.viewCount != null && article.viewCount > 0 && (
                      <Text sx={{ fontSize: 12, color: '$mutedForeground' }}>
                        {article.viewCount.toLocaleString()} views
                      </Text>
                    )}
                    {article.publishedAt && (
                      <Text sx={{ fontSize: 12, color: '$mutedForeground' }}>
                        {new Date(article.publishedAt).toLocaleDateString()}
                      </Text>
                    )}
                  </View>

                  <Text sx={{ mt: '$2', fontSize: 12, color: 'blue600' }}>
                    Read article {'\u2192'}
                  </Text>
                </View>
              </Link>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
