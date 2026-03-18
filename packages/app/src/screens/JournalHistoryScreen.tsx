import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import {
  useGetJournalTrendsQuery,
} from '../generated/graphql';
import { FeedbackPrompt } from '../components/FeedbackPrompt';

export function JournalHistoryScreen() {
  const { data, loading } = useGetJournalTrendsQuery({
    variables: { days: 14 },
    errorPolicy: 'ignore',
  });

  const trends = data?.journalTrends;
  const entries = trends?.entries ?? [];
  const todayStr = new Date().toISOString().split('T')[0];
  const hasToday = entries.some((e) => e.entryDate.split('T')[0] === todayStr);

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>Symptom Journal</Text>
        <View sx={{ mt: '$8', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <ActivityIndicator size="small" />
          <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>Loading journal...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <View sx={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>Symptom Journal</Text>
            {trends && trends.streak > 0 && (
              <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$2', mt: '$1' }}>
                <View sx={{
                  backgroundColor: '#FEF3C7',
                  borderRadius: 12,
                  px: '$3',
                  py: 4,
                }}>
                  <Text sx={{ fontSize: 12, fontWeight: '600', color: '#92400E' }}>
                    {trends.streak} day streak
                  </Text>
                </View>
              </View>
            )}
          </View>
          {!hasToday && (
            <Link href="/survive/journal/entry">
              <View sx={{
                backgroundColor: 'blue600',
                borderRadius: 8,
                px: '$5',
                py: '$2',
              }}>
                <Text sx={{ fontSize: 14, fontWeight: '600', color: 'white' }}>Log today</Text>
              </View>
            </Link>
          )}
        </View>

        {/* Trends overview */}
        {trends && trends.totalEntries > 0 && (
          <View sx={{ mt: '$6', gap: '$3' }}>
            <Text sx={{ fontSize: 16, fontWeight: '600', color: '$foreground' }}>This week vs last week</Text>
            <View sx={{ flexDirection: 'row', flexWrap: 'wrap', gap: '$3' }}>
              <TrendCard
                label="Energy"
                average={trends.averageEnergy}
                delta={trends.energyDelta}
                higherIsBetter
              />
              <TrendCard
                label="Pain"
                average={trends.averagePain}
                delta={trends.painDelta}
                higherIsBetter={false}
              />
              <TrendCard
                label="Mood"
                average={trends.averageMood}
                delta={trends.moodDelta}
                higherIsBetter
              />
              <TrendCard
                label="Sleep"
                average={trends.averageSleep}
                delta={trends.sleepDelta}
                higherIsBetter
              />
            </View>
          </View>
        )}

        {/* Empty state */}
        {(!trends || trends.totalEntries === 0) && (
          <View sx={{
            mt: '$8',
            borderWidth: 2,
            borderStyle: 'dashed',
            borderColor: '$border',
            borderRadius: 16,
            p: '$8',
            alignItems: 'center',
          }}>
            <Text sx={{ fontSize: 36 }}>{'📓'}</Text>
            <Text sx={{ mt: '$3', fontWeight: '600', color: '$foreground', textAlign: 'center' }}>
              Start your symptom journal
            </Text>
            <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground', textAlign: 'center', maxWidth: 400 }}>
              Track how you feel each day. It takes less than 60 seconds and helps you and your care team spot patterns.
            </Text>
            <Link href="/survive/journal/entry">
              <View sx={{
                mt: '$5',
                backgroundColor: 'blue600',
                borderRadius: 8,
                px: '$6',
                py: '$3',
              }}>
                <Text sx={{ fontSize: 14, fontWeight: '600', color: 'white' }}>Log your first entry</Text>
              </View>
            </Link>
          </View>
        )}

        {/* Feedback prompt after 90+ entries */}
        {trends && trends.totalEntries >= 90 && (
          <View sx={{ mt: '$6' }}>
            <FeedbackPrompt
              feedbackType="journal_3month"
              title="You've logged 90+ entries!"
              description="How has the symptom journal been working for you?"
              context={{ totalEntries: trends.totalEntries }}
            />
          </View>
        )}

        {/* Recent entries */}
        {entries.length > 0 && (
          <View sx={{ mt: '$6', gap: '$3' }}>
            <Text sx={{ fontSize: 16, fontWeight: '600', color: '$foreground' }}>Recent entries</Text>
            {entries.map((entry) => {
              const dateStr = entry.entryDate.split('T')[0];
              return (
                <Link key={entry.id} href={`/survive/journal/entry?date=${dateStr}`}>
                  <View sx={{
                    borderWidth: 1,
                    borderColor: '$border',
                    borderRadius: 12,
                    p: '$4',
                  }}>
                    <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground' }}>
                      {formatDate(dateStr)}
                    </Text>
                    <View sx={{ mt: '$2', flexDirection: 'row', flexWrap: 'wrap', gap: '$2' }}>
                      {entry.energy != null && (
                        <DimensionChip label="Energy" value={entry.energy} max={5} />
                      )}
                      {entry.pain != null && (
                        <DimensionChip label="Pain" value={entry.pain} max={5} invert />
                      )}
                      {entry.mood != null && (
                        <DimensionChip label="Mood" value={entry.mood} max={5} />
                      )}
                      {entry.sleepQuality != null && (
                        <DimensionChip label="Sleep" value={entry.sleepQuality} max={5} />
                      )}
                    </View>
                    {entry.notes && (
                      <Text sx={{ mt: '$2', fontSize: 12, color: '$mutedForeground' }} numberOfLines={1}>
                        {entry.notes}
                      </Text>
                    )}
                  </View>
                </Link>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function TrendCard({
  label,
  average,
  delta,
  higherIsBetter,
}: {
  label: string;
  average: number | null | undefined;
  delta: number | null | undefined;
  higherIsBetter: boolean;
}) {
  const isPositive = delta != null && (higherIsBetter ? delta > 0 : delta < 0);
  const isNegative = delta != null && (higherIsBetter ? delta < 0 : delta > 0);
  const deltaColor = isPositive ? '#16A34A' : isNegative ? '#DC2626' : '$mutedForeground';
  const deltaPrefix = delta != null && delta > 0 ? '+' : '';

  return (
    <View sx={{
      flex: 1,
      minWidth: 140,
      borderWidth: 1,
      borderColor: '$border',
      borderRadius: 12,
      p: '$4',
    }}>
      <Text sx={{ fontSize: 12, color: '$mutedForeground' }}>{label}</Text>
      <Text sx={{ mt: '$1', fontSize: 22, fontWeight: 'bold', color: '$foreground' }}>
        {average != null ? average.toFixed(1) : '--'}
      </Text>
      {delta != null && (
        <Text sx={{ mt: 2, fontSize: 12, fontWeight: '600', color: deltaColor }}>
          {deltaPrefix}{delta.toFixed(1)} vs last week
        </Text>
      )}
    </View>
  );
}

function DimensionChip({
  label,
  value,
  max,
  invert,
}: {
  label: string;
  value: number;
  max: number;
  invert?: boolean;
}) {
  const ratio = value / max;
  const effectiveRatio = invert ? 1 - ratio : ratio;
  let bg = '#DCFCE7';
  let fg = '#166534';
  if (effectiveRatio < 0.4) {
    bg = '#FEE2E2';
    fg = '#991B1B';
  } else if (effectiveRatio < 0.7) {
    bg = '#FEF3C7';
    fg = '#92400E';
  }

  return (
    <View sx={{ backgroundColor: bg, borderRadius: 12, px: '$2', py: 3, flexDirection: 'row', gap: 4 }}>
      <Text sx={{ fontSize: 11, color: fg }}>{label}</Text>
      <Text sx={{ fontSize: 11, fontWeight: '700', color: fg }}>{value}/{max}</Text>
    </View>
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}
