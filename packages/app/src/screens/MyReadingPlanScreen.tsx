import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import {
  useGetReadingPlanQuery,
  useGenerateReadingPlanMutation,
} from '../generated/graphql';

// ============================================================================
// Constants
// ============================================================================

const TIER_CONFIG: Record<string, { title: string; color: string; bg: string; border: string }> = {
  readNow: { title: 'Read Now', color: '#166534', bg: '#DCFCE7', border: '#BBF7D0' },
  readSoon: { title: 'Read Soon', color: '#1E40AF', bg: '#DBEAFE', border: '#BFDBFE' },
  whenReady: { title: 'When You\'re Ready', color: '#6B7280', bg: '#F3F4F6', border: '#E5E7EB' },
};

// ============================================================================
// Screen
// ============================================================================

export function MyReadingPlanScreen() {
  const { data, loading } = useGetReadingPlanQuery({ errorPolicy: 'ignore' });
  const [generatePlan, { loading: generating }] = useGenerateReadingPlanMutation({
    refetchQueries: ['GetReadingPlan'],
  });

  const plan = data?.readingPlan;

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$10', width: '100%' }}>
        {/* Header */}
        <View sx={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', mb: '$2' }}>
          <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
            Your Reading Plan
          </Text>
          <Pressable onPress={() => generatePlan()} disabled={generating}>
            <View sx={{
              backgroundColor: generating ? '#9CA3AF' : '#4F46E5',
              borderRadius: 8,
              px: '$4',
              py: '$2',
            }}>
              {generating ? (
                <View sx={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <ActivityIndicator color="white" size="small" />
                  <Text sx={{ fontSize: 13, fontWeight: '600', color: 'white' }}>Refreshing...</Text>
                </View>
              ) : (
                <Text sx={{ fontSize: 13, fontWeight: '600', color: 'white' }}>Refresh Plan</Text>
              )}
            </View>
          </Pressable>
        </View>
        <Text sx={{ fontSize: 14, color: '$mutedForeground', mb: '$6' }}>
          Personalized article recommendations based on your journey.
        </Text>

        {/* Loading */}
        {loading && (
          <View sx={{ alignItems: 'center', py: '$16' }}>
            <ActivityIndicator size="small" />
            <Text sx={{ mt: '$3', fontSize: 14, color: '$mutedForeground' }}>
              Building your personalized reading plan...
            </Text>
          </View>
        )}

        {/* Plan sections */}
        {plan && (
          <View sx={{ gap: '$6' }}>
            <PlanSection items={plan.readNow} tier="readNow" />
            <PlanSection items={plan.readSoon} tier="readSoon" />
            <PlanSection items={plan.whenReady} tier="whenReady" />
          </View>
        )}

        {/* Empty state */}
        {!loading && !plan && (
          <View sx={{
            borderWidth: 1,
            borderColor: '$border',
            borderRadius: 12,
            p: '$8',
            alignItems: 'center',
          }}>
            <Text sx={{ fontSize: 18, fontWeight: '600', color: '$foreground', mb: '$2' }}>
              No reading plan yet
            </Text>
            <Text sx={{ fontSize: 14, color: '$mutedForeground', textAlign: 'center', mb: '$4' }}>
              Complete your patient profile to get personalized reading recommendations.
            </Text>
            <Link href="/learn">
              <Text sx={{ fontSize: 14, color: '#4F46E5' }}>Browse articles instead</Text>
            </Link>
          </View>
        )}

        {/* Back link */}
        <View sx={{ mt: '$6' }}>
          <Link href="/learn">
            <Text sx={{ fontSize: 14, color: '#2563EB' }}>{'\u2190'} Back to Learn</Text>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function PlanSection({ items, tier }: {
  items: Array<{ articleSlug: string; articleTitle: string; reason: string; priority: string }>;
  tier: string;
}) {
  if (!items || items.length === 0) return null;
  const config = TIER_CONFIG[tier] ?? TIER_CONFIG.whenReady;

  return (
    <View>
      <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$2', mb: '$3' }}>
        <View sx={{
          backgroundColor: config.bg,
          borderRadius: 8,
          px: '$2',
          py: 3,
        }}>
          <Text sx={{ fontSize: 12, fontWeight: '600', color: config.color }}>
            {config.title}
          </Text>
        </View>
        <Text sx={{ fontSize: 13, color: '$mutedForeground' }}>
          {items.length} {items.length === 1 ? 'article' : 'articles'}
        </Text>
      </View>
      <View sx={{ gap: '$3' }}>
        {items.map((item) => (
          <Link key={item.articleSlug} href={`/learn/search?q=${encodeURIComponent(item.articleSlug.replace(/-/g, ' '))}`}>
            <View sx={{
              borderWidth: 1,
              borderColor: config.border,
              borderRadius: 12,
              p: '$4',
            }}>
              <Text sx={{ fontSize: 15, fontWeight: '600', color: '$foreground' }}>
                {item.articleTitle}
              </Text>
              <Text sx={{ mt: '$1', fontSize: 13, color: '$mutedForeground', lineHeight: 20 }}>
                {item.reason}
              </Text>
            </View>
          </Link>
        ))}
      </View>
    </View>
  );
}
