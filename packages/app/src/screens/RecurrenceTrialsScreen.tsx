import { View, Text, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import { useGetMatchesQuery } from '../generated/graphql';

export function RecurrenceTrialsScreen() {
  const { data, loading } = useGetMatchesQuery({ errorPolicy: 'ignore' });
  const matches = data?.matches ?? [];

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 640, px: '$6', py: '$16', width: '100%' }}>
        <View sx={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <ActivityIndicator size="small" />
          <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>
            Loading updated trial matches...
          </Text>
        </View>
      </View>
    );
  }

  // Categorize matches
  const vaccineTrials = matches.filter(
    m => m.trial?.title?.toLowerCase().includes('vaccine') ||
      m.trial?.title?.toLowerCase().includes('neoantigen'),
  );
  const compassionateUse = matches.filter(
    m => m.trial?.title?.toLowerCase().includes('compassionate') ||
      m.trial?.title?.toLowerCase().includes('expanded access'),
  );
  const otherTrials = matches.filter(
    m => !vaccineTrials.includes(m) && !compassionateUse.includes(m),
  );

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 640, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 28, fontWeight: 'bold', color: '$foreground' }}>
          Updated Trial Matches
        </Text>
        <Text sx={{ mt: '$3', fontSize: 16, color: '$mutedForeground', lineHeight: 26 }}>
          {matches.length > 0
            ? `We found ${matches.length} trial${matches.length === 1 ? '' : 's'} for your updated situation.`
            : 'Trial matching is being updated. Check back shortly.'}
        </Text>

        {matches.length === 0 && (
          <View sx={{
            mt: '$8', borderRadius: 12, borderWidth: 2, borderStyle: 'dashed',
            borderColor: '$border', p: '$8', alignItems: 'center',
          }}>
            <Text sx={{ fontSize: 36 }}>{'🔍'}</Text>
            <Text sx={{ mt: '$4', fontSize: 14, color: '$mutedForeground', textAlign: 'center' }}>
              We're searching for clinical trials that match your updated profile.
              This process may take a few minutes.
            </Text>
          </View>
        )}

        {/* Vaccine trials */}
        {vaccineTrials.length > 0 && (
          <View sx={{ mt: '$8' }}>
            <View sx={{
              borderRadius: 8, backgroundColor: '#F0FDF4', px: '$4', py: '$2',
              alignSelf: 'flex-start',
            }}>
              <Text sx={{ fontSize: 12, fontWeight: '700', color: '#166534' }}>
                PERSONALIZED VACCINE TRIALS
              </Text>
            </View>
            <View sx={{ mt: '$3', gap: '$3' }}>
              {vaccineTrials.map(m => (
                <TrialCard key={m.id} match={m} />
              ))}
            </View>
          </View>
        )}

        {/* Compassionate use */}
        {compassionateUse.length > 0 && (
          <View sx={{ mt: '$8' }}>
            <View sx={{
              borderRadius: 8, backgroundColor: '#FEF3C7', px: '$4', py: '$2',
              alignSelf: 'flex-start',
            }}>
              <Text sx={{ fontSize: 12, fontWeight: '700', color: '#92400E' }}>
                COMPASSIONATE USE / EXPANDED ACCESS
              </Text>
            </View>
            <View sx={{ mt: '$3', gap: '$3' }}>
              {compassionateUse.map(m => (
                <TrialCard key={m.id} match={m} />
              ))}
            </View>
          </View>
        )}

        {/* Other trials */}
        {otherTrials.length > 0 && (
          <View sx={{ mt: '$8' }}>
            <Text sx={{ fontSize: 18, fontWeight: '600', color: '$foreground' }}>
              All Matches ({otherTrials.length})
            </Text>
            <View sx={{ mt: '$3', gap: '$3' }}>
              {otherTrials.slice(0, 10).map(m => (
                <TrialCard key={m.id} match={m} />
              ))}
            </View>
            {otherTrials.length > 10 && (
              <Link href="/matches">
                <Text sx={{ mt: '$4', fontSize: 14, color: 'blue600' }}>
                  View all {otherTrials.length} matches
                </Text>
              </Link>
            )}
          </View>
        )}

        <Link href="/survive/recurrence/status">
          <Text sx={{ mt: '$8', fontSize: 14, color: 'blue600' }}>
            Back to cascade status
          </Text>
        </Link>
      </View>
    </ScrollView>
  );
}

function TrialCard({ match }: { match: any }) {
  const trial = match.trial;
  if (!trial) return null;

  return (
    <Link href={`/matches/${match.id}`}>
      <View sx={{
        borderRadius: 12, borderWidth: 1, borderColor: '$border', p: '$4',
      }}>
        <View sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text sx={{ fontSize: 12, color: '$mutedForeground' }}>{trial.nctId}</Text>
          <View sx={{
            borderRadius: 6, backgroundColor: '#DBEAFE', px: '$2', py: 2,
          }}>
            <Text sx={{ fontSize: 11, fontWeight: '600', color: 'blue600' }}>
              {Math.round(match.matchScore * 100)}% match
            </Text>
          </View>
        </View>
        <Text sx={{ mt: '$2', fontSize: 14, fontWeight: '600', color: '$foreground' }} numberOfLines={2}>
          {trial.title}
        </Text>
        {trial.phase && (
          <Text sx={{ mt: '$1', fontSize: 12, color: '$mutedForeground' }}>
            Phase {trial.phase}
            {trial.sponsor ? ` · ${trial.sponsor}` : ''}
          </Text>
        )}
      </View>
    </Link>
  );
}
