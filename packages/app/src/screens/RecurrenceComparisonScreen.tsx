import { View, Text, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import { useGetRecurrenceEventQuery, useGetGenomicComparisonQuery } from '../generated/graphql';

export function RecurrenceComparisonScreen() {
  const { data: eventData, loading: eventLoading } = useGetRecurrenceEventQuery({ errorPolicy: 'ignore' });
  const event = eventData?.recurrenceEvent;

  const { data: compData, loading: compLoading } = useGetGenomicComparisonQuery({
    variables: { recurrenceEventId: event?.id ?? '' },
    skip: !event?.id,
    errorPolicy: 'ignore',
  });

  const loading = eventLoading || compLoading;
  const comparison = compData?.genomicComparison;

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 640, px: '$6', py: '$16', width: '100%' }}>
        <View sx={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <ActivityIndicator size="small" />
          <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>Loading genomic comparison...</Text>
        </View>
      </View>
    );
  }

  if (!comparison || !comparison.hasNewData) {
    return (
      <ScrollView sx={{ flex: 1 }}>
        <View sx={{ mx: 'auto', maxWidth: 640, px: '$6', py: '$16', width: '100%' }}>
          <Text sx={{ fontSize: 28, fontWeight: 'bold', color: '$foreground' }}>
            Genomic Comparison
          </Text>

          <View sx={{
            mt: '$8', borderRadius: 12, borderWidth: 2, borderStyle: 'dashed',
            borderColor: '$border', p: '$8', alignItems: 'center',
          }}>
            <Text sx={{ fontSize: 36 }}>{'🧬'}</Text>
            <Text sx={{ mt: '$4', fontSize: 16, fontWeight: '600', color: '$foreground', textAlign: 'center' }}>
              Waiting for new genomic data
            </Text>
            <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground', textAlign: 'center', maxWidth: 400 }}>
              Once genomic testing of your recurrent tumor is complete, we'll compare it
              with your original profile to identify meaningful changes.
            </Text>
            <Link href="/survive/recurrence/sequencing">
              <View sx={{
                mt: '$5', borderRadius: 8, backgroundColor: 'blue600',
                px: '$6', py: '$3',
              }}>
                <Text sx={{ fontSize: 14, fontWeight: '600', color: 'white' }}>
                  Learn about re-sequencing
                </Text>
              </View>
            </Link>
          </View>

          <Link href="/survive/recurrence/status">
            <Text sx={{ mt: '$6', fontSize: 14, color: 'blue600' }}>
              Back to cascade status
            </Text>
          </Link>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 640, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 28, fontWeight: 'bold', color: '$foreground' }}>
          Genomic Comparison
        </Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
          Original tumor vs. recurrent tumor
        </Text>

        {/* Patient-friendly summary */}
        <View sx={{
          mt: '$6', borderRadius: 12, backgroundColor: '#F0FDF4', p: '$5',
        }}>
          <Text sx={{ fontSize: 14, color: '#166534', lineHeight: 22 }}>
            {comparison.patientSummary}
          </Text>
        </View>

        {/* Resistance mutations */}
        {comparison.resistanceMutations.length > 0 && (
          <View sx={{ mt: '$6' }}>
            <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$2' }}>
              <View sx={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#EF4444' }} />
              <Text sx={{ fontSize: 16, fontWeight: '600', color: '$foreground' }}>
                Resistance Mutations
              </Text>
            </View>
            <Text sx={{ mt: '$1', fontSize: 13, color: '$mutedForeground' }}>
              New mutations that may indicate resistance to prior treatments
            </Text>
            <View sx={{ mt: '$3', gap: '$2' }}>
              {comparison.resistanceMutations.map((m, i) => (
                <View key={i} sx={{
                  borderRadius: 8, backgroundColor: '#FEF2F2', px: '$4', py: '$3',
                }}>
                  <Text sx={{ fontSize: 14, color: '#991B1B' }}>{m}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Biomarker changes */}
        {comparison.biomarkerChanges.length > 0 && (
          <View sx={{ mt: '$6' }}>
            <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$2' }}>
              <View sx={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#F59E0B' }} />
              <Text sx={{ fontSize: 16, fontWeight: '600', color: '$foreground' }}>
                Biomarker Changes
              </Text>
            </View>
            <Text sx={{ mt: '$1', fontSize: 13, color: '$mutedForeground' }}>
              Changes in biomarker values between original and recurrent tumor
            </Text>
            <View sx={{ mt: '$3', gap: '$2' }}>
              {comparison.biomarkerChanges.map((c, i) => (
                <View key={i} sx={{
                  borderRadius: 8, backgroundColor: '#FFFBEB', px: '$4', py: '$3',
                }}>
                  <Text sx={{ fontSize: 14, color: '#92400E' }}>{c}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Actionable changes */}
        {comparison.actionableChanges.length > 0 && (
          <View sx={{ mt: '$6' }}>
            <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$2' }}>
              <View sx={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#22C55E' }} />
              <Text sx={{ fontSize: 16, fontWeight: '600', color: '$foreground' }}>
                Actionable Changes
              </Text>
            </View>
            <Text sx={{ mt: '$1', fontSize: 13, color: '$mutedForeground' }}>
              Changes that may open new treatment options
            </Text>
            <View sx={{ mt: '$3', gap: '$2' }}>
              {comparison.actionableChanges.map((a, i) => (
                <View key={i} sx={{
                  borderRadius: 8, backgroundColor: '#F0FDF4', px: '$4', py: '$3',
                }}>
                  <Text sx={{ fontSize: 14, color: '#166534' }}>{a}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View sx={{
          mt: '$8', borderRadius: 12, backgroundColor: '#FEF3C7', p: '$4',
        }}>
          <Text sx={{ fontSize: 12, color: '#92400E', lineHeight: 18 }}>
            This comparison is AI-generated and must be reviewed by your oncologist.
            Genomic data should always be interpreted in the context of your full clinical picture.
          </Text>
        </View>

        <Link href="/survive/recurrence/status">
          <Text sx={{ mt: '$6', fontSize: 14, color: 'blue600' }}>
            Back to cascade status
          </Text>
        </Link>
      </View>
    </ScrollView>
  );
}
