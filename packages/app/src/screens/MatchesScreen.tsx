import { useState } from 'react';
import { View, Text, Pressable } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { MatchCard } from '../components';
import type { MatchBreakdownItem } from '@oncovax/shared';
import {
  useGetMatchesQuery,
  useUpdateMatchStatusMutation,
  useGenerateMatchesMutation,
} from '../generated/graphql';

type FilterTab = 'all' | 'saved' | 'dismissed';

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All Matches' },
  { key: 'saved', label: 'Saved' },
  { key: 'dismissed', label: 'Dismissed' },
];

export function MatchesScreen() {
  const { data, loading, error, refetch } = useGetMatchesQuery();
  const [updateStatus] = useUpdateMatchStatusMutation();
  const [generateMatches, { loading: generating }] = useGenerateMatchesMutation();
  const [filter, setFilter] = useState<FilterTab>('all');

  const matches = data?.matches ?? [];

  const handleStatusChange = async (matchId: string, status: string) => {
    try {
      await updateStatus({ variables: { matchId, status } });
      refetch();
    } catch {
      // User can retry
    }
  };

  const handleRegenerate = async () => {
    try {
      await generateMatches();
      refetch();
    } catch {
      // Error shown via query error
    }
  };

  const filtered = matches.filter((m) => {
    if (filter === 'all') return m.status !== 'dismissed';
    if (filter === 'saved') return m.status === 'saved';
    if (filter === 'dismissed') return m.status === 'dismissed';
    return true;
  });

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', alignSelf: 'center', width: '100%', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text sx={{ mt: '$4', color: '$mutedForeground' }}>Loading your matches...</Text>
      </View>
    );
  }

  return (
    <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', alignSelf: 'center', width: '100%' }}>
      <View sx={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', mb: '$8' }}>
        <View sx={{ flex: 1 }}>
          <Text sx={{ fontSize: '$3xl', fontWeight: '700', color: 'gray900' }}>Your Trial Matches</Text>
          <Text sx={{ mt: '$2', color: 'gray500' }}>
            {matches.length > 0
              ? `${matches.length} clinical trials ranked by compatibility with your profile.`
              : 'No matches found yet.'}
          </Text>
        </View>
        <Pressable
          onPress={handleRegenerate}
          disabled={generating}
          sx={{ bg: 'gray900', borderRadius: '$lg', px: '$4', py: '$2', opacity: generating ? 0.5 : 1 }}
        >
          <Text sx={{ fontSize: '$sm', color: 'white' }}>
            {generating ? 'Generating...' : 'Refresh matches'}
          </Text>
        </Pressable>
      </View>

      {error && (
        <View sx={{ mb: '$6', p: '$4', bg: 'red50', borderWidth: 1, borderColor: 'red200', borderRadius: '$lg' }}>
          <Text sx={{ fontSize: '$sm', color: 'red700' }}>{error.message}</Text>
        </View>
      )}

      {matches.length > 0 && (
        <View sx={{ flexDirection: 'row', gap: 4, mb: '$6', bg: 'gray100', borderRadius: '$lg', p: 4 }}>
          {TABS.map((tab) => (
            <Pressable
              key={tab.key}
              onPress={() => setFilter(tab.key)}
              sx={{
                flex: 1,
                py: '$2',
                borderRadius: '$md',
                alignItems: 'center',
                bg: filter === tab.key ? 'white' : 'transparent',
                ...(filter === tab.key
                  ? { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }
                  : {}),
              }}
            >
              <Text
                sx={{
                  fontSize: '$sm',
                  color: filter === tab.key ? 'gray900' : 'gray500',
                  fontWeight: filter === tab.key ? '500' : '400',
                }}
              >
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {matches.length === 0 && !error && (
        <View sx={{ alignItems: 'center', py: '$16', bg: 'gray50', borderRadius: '$xl' }}>
          <Text sx={{ color: 'gray500', mb: '$4', textAlign: 'center', px: '$4' }}>
            No matches have been generated yet. This might mean your profile is still being processed,
            or no trials are currently in our database.
          </Text>
          <Pressable
            onPress={handleRegenerate}
            disabled={generating}
            sx={{ bg: 'gray900', borderRadius: '$lg', px: '$4', py: '$2', opacity: generating ? 0.5 : 1 }}
          >
            <Text sx={{ fontSize: '$sm', color: 'white' }}>
              {generating ? 'Generating...' : 'Generate matches now'}
            </Text>
          </Pressable>
        </View>
      )}

      <View sx={{ gap: '$4' }}>
        {filtered.map((match) => (
          <MatchCard
            key={match.id}
            matchId={match.id}
            trialId={match.trialId}
            nctId={match.trial?.nctId ?? ''}
            title={match.trial?.title ?? 'Unknown trial'}
            phase={match.trial?.phase ?? null}
            sponsor={match.trial?.sponsor ?? null}
            interventionName={null}
            matchScore={match.matchScore}
            matchBreakdown={{ items: match.matchBreakdown as MatchBreakdownItem[] }}
            potentialBlockers={match.potentialBlockers}
            status={match.status}
            onStatusChange={handleStatusChange}
          />
        ))}

        {filtered.length === 0 && matches.length > 0 && (
          <Text sx={{ textAlign: 'center', py: '$8', color: 'gray400' }}>
            No matches in this category.
          </Text>
        )}
      </View>
    </View>
  );
}
