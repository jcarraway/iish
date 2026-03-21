import { View, Text, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import { useGetRecurrencePreventionTrialsQuery } from '../generated/graphql';

const STRENGTH_COLORS: Record<string, { bg: string; fg: string; border: string }> = {
  strong: { bg: '#DCFCE7', fg: '#166534', border: '#BBF7D0' },
  possible: { bg: '#DBEAFE', fg: '#1E40AF', border: '#93C5FD' },
  worth_discussing: { bg: '#FEF3C7', fg: '#92400E', border: '#FDE68A' },
};

export function RecurrencePreventionScreen() {
  const { data, loading } = useGetRecurrencePreventionTrialsQuery({ errorPolicy: 'ignore' });

  const trials = data?.recurrencePreventionTrials ?? [];
  const hasGenomicNote = trials.some((m: any) =>
    m.matchReason?.includes('genomic') || m.matchReason?.includes('tumor')
  );

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          Recurrence Prevention
        </Text>
        <View sx={{ mt: '$8', flexDirection: 'row', alignItems: 'center', gap: '$3' }}>
          <ActivityIndicator size="small" />
          <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>Loading prevention trials...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          Vaccine Trials for Recurrence Prevention
        </Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground', lineHeight: 22 }}>
          New vaccines are being developed to train your immune system to prevent your cancer from returning.
          These trials are specifically for people who have completed treatment.
        </Text>

        {/* Genomic profile note */}
        {hasGenomicNote && (
          <View sx={{
            mt: '$6', p: '$5', borderRadius: 12,
            backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#BBF7D0',
          }}>
            <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$2' }}>
              <Text sx={{ fontSize: 16 }}>{'🧬'}</Text>
              <Text sx={{ fontSize: 15, fontWeight: '600', color: '#166534' }}>
                Personalized vaccine advantage
              </Text>
            </View>
            <Text sx={{ mt: '$2', fontSize: 13, color: '#166534', lineHeight: 20 }}>
              Because we have your tumor's genetic profile, you may be eligible for personalized
              neoantigen vaccine trials. These create a custom vaccine based on your tumor's unique
              mutations — potentially the most targeted approach to preventing recurrence.
            </Text>
          </View>
        )}

        {/* Matched trials */}
        <View sx={{ mt: '$6' }}>
          {trials.length === 0 ? (
            <View sx={{
              p: '$6', borderRadius: 12,
              borderWidth: 2, borderStyle: 'dashed', borderColor: '$border',
              alignItems: 'center',
            }}>
              <Text sx={{ fontSize: 36 }}>{'💉'}</Text>
              <Text sx={{ mt: '$3', fontSize: 15, fontWeight: '600', color: '$foreground', textAlign: 'center' }}>
                No recurrence prevention trials match your profile yet
              </Text>
              <Text sx={{ mt: '$2', fontSize: 13, color: '$mutedForeground', textAlign: 'center', maxWidth: 400 }}>
                This is a rapidly growing field. We'll notify you when new trials open that match your cancer type and treatment history.
              </Text>
              <Link href="/matches">
                <View sx={{
                  mt: '$4', px: '$6', py: '$3',
                  borderRadius: 8, borderWidth: 1, borderColor: 'blue600',
                }}>
                  <Text sx={{ fontSize: 14, fontWeight: '500', color: 'blue600' }}>
                    View all trial matches
                  </Text>
                </View>
              </Link>
            </View>
          ) : (
            <View sx={{ gap: '$3' }}>
              {trials.map((match: any) => {
                const colors = STRENGTH_COLORS[match.matchStrength] ?? STRENGTH_COLORS.possible;
                return (
                  <View key={match.trial.nctId} sx={{
                    borderRadius: 12, borderWidth: 1, borderColor: colors.border,
                    backgroundColor: colors.bg, p: '$5',
                  }}>
                    <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$2', flexWrap: 'wrap' }}>
                      <View sx={{
                        px: '$2', py: '$1', borderRadius: 6,
                        backgroundColor: colors.border,
                      }}>
                        <Text sx={{ fontSize: 11, fontWeight: '600', color: colors.fg }}>
                          {match.matchStrength.replace('_', ' ').toUpperCase()}
                        </Text>
                      </View>
                      {match.trial.phase && (
                        <Text sx={{ fontSize: 11, color: '$mutedForeground' }}>{match.trial.phase}</Text>
                      )}
                      <Text sx={{ fontSize: 11, color: '$mutedForeground' }}>{match.trial.nctId}</Text>
                    </View>
                    <Text sx={{ mt: '$2', fontSize: 15, fontWeight: '600', color: '$foreground' }}>
                      {match.trial.title}
                    </Text>
                    {match.trial.vaccineTarget && (
                      <Text sx={{ mt: '$1', fontSize: 12, color: colors.fg }}>
                        Target: {match.trial.vaccineTarget}
                      </Text>
                    )}
                    {match.trial.mechanism && (
                      <Text sx={{ mt: '$2', fontSize: 13, color: '$foreground', lineHeight: 20 }}>
                        {match.trial.mechanism}
                      </Text>
                    )}
                    <Text sx={{ mt: '$2', fontSize: 13, color: '$foreground', lineHeight: 20 }}>
                      {match.matchReason}
                    </Text>
                    {match.trial.keyResults && (
                      <View sx={{
                        mt: '$3', p: '$3', borderRadius: 8,
                        backgroundColor: 'rgba(255,255,255,0.6)',
                      }}>
                        <Text sx={{ fontSize: 12, fontWeight: '500', color: '$foreground' }}>
                          Key results
                        </Text>
                        <Text sx={{ mt: '$1', fontSize: 12, color: '$mutedForeground', lineHeight: 18 }}>
                          {match.trial.keyResults}
                        </Text>
                      </View>
                    )}
                    <Text sx={{ mt: '$3', fontSize: 13, color: '$mutedForeground', fontStyle: 'italic' }}>
                      {match.nextSteps}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Link to full matches */}
        <View sx={{ mt: '$8' }}>
          <Link href="/matches">
            <View sx={{
              p: '$5', borderRadius: 12,
              borderWidth: 1, borderColor: '#93C5FD', backgroundColor: '#EFF6FF',
            }}>
              <Text sx={{ fontSize: 15, fontWeight: '600', color: '#1E40AF' }}>
                View all your trial matches
              </Text>
              <Text sx={{ mt: '$1', fontSize: 13, color: '#1E40AF' }}>
                See therapeutic trials, including personalized vaccine candidates
              </Text>
              <Text sx={{ mt: '$2', fontSize: 12, fontWeight: '600', color: '#1E40AF' }}>
                View matches {'\u2192'}
              </Text>
            </View>
          </Link>
        </View>

        {/* Disclaimer */}
        <Text sx={{ mt: '$8', fontSize: 11, color: '$mutedForeground', lineHeight: 18 }}>
          This information is for educational purposes only and does not constitute medical advice.
          Discuss all trial options with your oncologist. Trial eligibility is determined by
          trial investigators. Results from early-phase trials may not predict outcomes in larger studies.
        </Text>
      </View>
    </ScrollView>
  );
}
