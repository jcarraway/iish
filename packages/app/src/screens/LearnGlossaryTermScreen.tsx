import { View, Text, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import { useGetGlossaryTermQuery } from '../generated/graphql';

// ============================================================================
// Component
// ============================================================================

export function LearnGlossaryTermScreen({ slug }: { slug: string }) {
  const { data, loading } = useGetGlossaryTermQuery({
    variables: { slug },
    errorPolicy: 'ignore',
  });

  const term = data?.glossaryTerm;

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <View sx={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <ActivityIndicator size="small" />
          <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>Loading term...</Text>
        </View>
      </View>
    );
  }

  if (!term) {
    return (
      <ScrollView sx={{ flex: 1 }}>
        <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
          <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
            Term not found
          </Text>
          <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
            This glossary term may have been moved or is no longer available.
          </Text>
          <Link href="/learn/glossary">
            <View sx={{ mt: '$4' }}>
              <Text sx={{ fontSize: 14, color: 'blue600' }}>{'\u2190'} Back to Glossary</Text>
            </View>
          </Link>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        {/* Breadcrumbs */}
        <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$2', mb: '$4', flexWrap: 'wrap' }}>
          <Link href="/learn">
            <Text sx={{ fontSize: 13, color: 'blue600' }}>Learn</Text>
          </Link>
          <Text sx={{ fontSize: 13, color: '$mutedForeground' }}>{'\u203A'}</Text>
          <Link href="/learn/glossary">
            <Text sx={{ fontSize: 13, color: 'blue600' }}>Glossary</Text>
          </Link>
          <Text sx={{ fontSize: 13, color: '$mutedForeground' }}>{'\u203A'}</Text>
          <Text sx={{ fontSize: 13, color: '$mutedForeground' }}>{term.term}</Text>
        </View>

        {/* ============================================================= */}
        {/* Term Name */}
        {/* ============================================================= */}
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          {term.term}
        </Text>

        {/* Category badge */}
        {term.category && (
          <View sx={{
            mt: '$3',
            backgroundColor: '#F3F4F6',
            borderRadius: 12,
            px: '$3',
            py: 4,
            alignSelf: 'flex-start',
          }}>
            <Text sx={{
              fontSize: 12,
              fontWeight: '600',
              color: '#6B7280',
              textTransform: 'capitalize',
            }}>
              {term.category}
            </Text>
          </View>
        )}

        {/* ============================================================= */}
        {/* Short Definition (prominent) */}
        {/* ============================================================= */}
        <View sx={{
          mt: '$6',
          backgroundColor: '#F0F9FF',
          borderWidth: 1,
          borderColor: '#BAE6FD',
          borderRadius: 12,
          p: '$5',
        }}>
          <Text sx={{ fontSize: 13, fontWeight: '600', color: '#0C4A6E', mb: '$2' }}>
            Definition
          </Text>
          <Text sx={{ fontSize: 16, color: '#075985', lineHeight: 26 }}>
            {term.shortDefinition}
          </Text>
        </View>

        {/* ============================================================= */}
        {/* Full Definition */}
        {/* ============================================================= */}
        {term.fullDefinition && (
          <View sx={{ mt: '$6' }}>
            <View sx={{ borderBottomWidth: 1, borderBottomColor: '$border', pb: '$3' }}>
              <Text sx={{ fontSize: 20, fontWeight: 'bold', color: '$foreground' }}>
                More Detail
              </Text>
            </View>
            <Text sx={{ mt: '$4', fontSize: 14, color: '$foreground', lineHeight: 24 }}>
              {term.fullDefinition}
            </Text>
          </View>
        )}

        {/* ============================================================= */}
        {/* Aliases */}
        {/* ============================================================= */}
        {term.aliases && term.aliases.length > 0 && (
          <View sx={{ mt: '$6' }}>
            <View sx={{ borderBottomWidth: 1, borderBottomColor: '$border', pb: '$3' }}>
              <Text sx={{ fontSize: 20, fontWeight: 'bold', color: '$foreground' }}>
                Also Known As
              </Text>
            </View>
            <View sx={{ mt: '$4', flexDirection: 'row', flexWrap: 'wrap', gap: '$2' }}>
              {term.aliases.map((alias: string, idx: number) => (
                <View key={idx} sx={{
                  backgroundColor: '#F3F4F6',
                  borderRadius: 8,
                  px: '$3',
                  py: '$2',
                }}>
                  <Text sx={{ fontSize: 14, color: '$foreground' }}>{alias}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ============================================================= */}
        {/* Full Article Link */}
        {/* ============================================================= */}
        {term.fullArticleSlug && (
          <View sx={{ mt: '$6' }}>
            <Link href={`/learn/search?q=${encodeURIComponent(term.fullArticleSlug.replace(/-/g, ' '))}`}>
              <View sx={{
                borderWidth: 1,
                borderColor: '#BAE6FD',
                borderRadius: 12,
                p: '$5',
                backgroundColor: '#EFF6FF',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '$3',
              }}>
                <View sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  backgroundColor: '#DBEAFE',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Text sx={{ fontSize: 18 }}>{'\uD83D\uDCDA'}</Text>
                </View>
                <View sx={{ flex: 1 }}>
                  <Text sx={{ fontSize: 15, fontWeight: '600', color: '#1E40AF' }}>
                    Read the full article
                  </Text>
                  <Text sx={{ mt: 2, fontSize: 12, color: '#3B82F6' }}>
                    Get a comprehensive deep-dive on this topic
                  </Text>
                </View>
                <Text sx={{ fontSize: 16, color: '#1E40AF' }}>{'\u2192'}</Text>
              </View>
            </Link>
          </View>
        )}

        {/* ============================================================= */}
        {/* Back to Glossary */}
        {/* ============================================================= */}
        <View sx={{ mt: '$8' }}>
          <Link href="/learn/glossary">
            <Text sx={{ fontSize: 14, color: 'blue600' }}>
              {'\u2190'} Back to Glossary
            </Text>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}
