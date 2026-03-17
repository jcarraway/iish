import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import { openExternalUrl } from '../utils';
import { useGetNeoantigenTrialsQuery } from '../generated/graphql';

const PHASE_COLORS: Record<string, { bg: string; fg: string }> = {
  'Phase 1': { bg: '#DBEAFE', fg: '#1E40AF' },
  'Phase 2': { bg: '#DCFCE7', fg: '#166534' },
  'Phase 3': { bg: '#F3E8FF', fg: '#6B21A8' },
  'Phase 1/Phase 2': { bg: '#CCFBF1', fg: '#115E59' },
  'Phase 2/Phase 3': { bg: '#E0E7FF', fg: '#3730A3' },
};

function ScoreBar({ score }: { score: number }) {
  const color = score >= 70 ? '#22C55E' : score >= 40 ? '#EAB308' : '#9CA3AF';
  return (
    <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$2' }}>
      <View sx={{ width: 80, height: 8, borderRadius: 4, bg: '#E5E7EB' }}>
        <View sx={{ height: 8, borderRadius: 4, bg: color, width: `${Math.min(100, score)}%` as any }} />
      </View>
      <Text sx={{ fontSize: 12, fontWeight: '500', color: 'gray600' }}>{score}</Text>
    </View>
  );
}

export function PipelineTrialsScreen({ jobId }: { jobId: string }) {
  const { data, loading, error } = useGetNeoantigenTrialsQuery({
    variables: { pipelineJobId: jobId },
  });
  const matches = data?.neoantigenTrials ?? [];

  return (
    <ScrollView>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <View sx={{ mb: '$6' }}>
          <Link href={`/pipeline/jobs/${jobId}`}>
            <Text sx={{ fontSize: 13, color: 'gray500', mb: '$1' }}>{'<'} Back to Job</Text>
          </Link>
          <Text sx={{ fontSize: 22, fontWeight: '700', color: 'gray900' }}>Clinical Trial Cross-Reference</Text>
          <Text sx={{ fontSize: 13, color: 'gray500' }}>Trials matched to your neoantigen profile</Text>
        </View>

        {loading && (
          <View sx={{ py: '$12', alignItems: 'center' }}>
            <ActivityIndicator size="large" />
            <Text sx={{ mt: '$4', color: 'gray500' }}>Analyzing trial relevance with AI...</Text>
            <Text sx={{ fontSize: 12, color: '#9CA3AF', mt: '$1' }}>This may take 10-20 seconds</Text>
          </View>
        )}

        {error && (
          <View sx={{ borderRadius: 12, borderWidth: 1, borderColor: '#FECACA', bg: '#FEF2F2', p: '$6', alignItems: 'center' }}>
            <Text sx={{ color: '#B91C1C' }}>{error.message}</Text>
          </View>
        )}

        {!loading && !error && matches.length === 0 && (
          <View sx={{ borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', p: '$12', alignItems: 'center' }}>
            <Text sx={{ mt: '$4', fontSize: 18, fontWeight: '500', color: 'gray900' }}>No Relevant Trials Found</Text>
            <Text sx={{ mt: '$2', fontSize: 14, color: 'gray500', textAlign: 'center' }}>
              No clinical trials in our database currently match your neoantigen profile. Check back as new trials are added regularly.
            </Text>
          </View>
        )}

        {!loading && matches.length > 0 && (
          <View sx={{ gap: '$4' }}>
            {matches.map((match) => {
              const phase = match.phase ?? '';
              const phaseColor = PHASE_COLORS[phase] ?? { bg: '#F3F4F6', fg: '#374151' };
              return (
                <View key={match.trialId} sx={{ borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', p: '$6' }}>
                  <View sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', mb: '$3' }}>
                    <View sx={{ flex: 1 }}>
                      <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$2', mb: '$1', flexWrap: 'wrap' }}>
                        <Pressable onPress={() => openExternalUrl(`https://clinicaltrials.gov/study/${match.nctId}`)}>
                          <Text sx={{ fontSize: 13, fontFamily: 'monospace', color: '#7C3AED' }}>{match.nctId}</Text>
                        </Pressable>
                        {phase !== '' && (
                          <View sx={{ bg: phaseColor.bg, borderRadius: 12, px: 8, py: 2 }}>
                            <Text sx={{ fontSize: 11, fontWeight: '500', color: phaseColor.fg }}>{phase}</Text>
                          </View>
                        )}
                      </View>
                      <Text sx={{ fontWeight: '500', color: 'gray900', fontSize: 14 }}>{match.title}</Text>
                    </View>
                    <ScoreBar score={match.relevanceScore} />
                  </View>

                  <Text sx={{ fontSize: 14, color: 'gray600', mb: '$3' }}>{match.relevanceExplanation}</Text>

                  {match.matchedNeoantigens.length > 0 && (
                    <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$2', flexWrap: 'wrap' }}>
                      <Text sx={{ fontSize: 12, color: '#9CA3AF' }}>Matched genes:</Text>
                      {match.matchedNeoantigens.map((g) => (
                        <View key={g} sx={{ bg: '#F3E8FF', borderRadius: 4, px: 8, py: 2 }}>
                          <Text sx={{ fontSize: 12, fontWeight: '500', color: '#6B21A8' }}>{g}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
