import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { useRouter } from 'solito/router';
import { Link } from 'solito/link';
import {
  useGetRecurrenceEventQuery,
  useAcknowledgeRecurrenceMutation,
} from '../generated/graphql';

export function RecurrenceAcknowledgeScreen() {
  const router = useRouter();
  const { data, loading, refetch } = useGetRecurrenceEventQuery({ errorPolicy: 'ignore' });
  const [acknowledge, { loading: ackLoading }] = useAcknowledgeRecurrenceMutation();

  const event = data?.recurrenceEvent;

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 640, px: '$6', py: '$16', width: '100%' }}>
        <View sx={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <ActivityIndicator size="small" />
          <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (!event) {
    return (
      <ScrollView sx={{ flex: 1 }}>
        <View sx={{ mx: 'auto', maxWidth: 640, px: '$6', py: '$16', width: '100%' }}>
          <Text sx={{ fontSize: 24, fontWeight: 'bold', color: '$foreground' }}>
            Recurrence Response
          </Text>
          <Text sx={{ mt: '$4', fontSize: 15, color: '$mutedForeground', lineHeight: 24 }}>
            No recurrence event on file. If you need to report a change in your health,
            your care team is here for you.
          </Text>
          <Link href="/survive/recurrence/report">
            <View sx={{
              mt: '$6', borderRadius: 8, borderWidth: 1, borderColor: '$border',
              px: '$6', py: '$3', alignSelf: 'flex-start',
            }}>
              <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground' }}>
                Report a change
              </Text>
            </View>
          </Link>
          <Link href="/survive">
            <Text sx={{ mt: '$4', fontSize: 14, color: 'blue600' }}>
              Back to survivorship dashboard
            </Text>
          </Link>
        </View>
      </ScrollView>
    );
  }

  const isAcknowledged = !!event.acknowledgedAt;

  const handleAcknowledge = async () => {
    try {
      await acknowledge({
        variables: { recurrenceEventId: event.id },
      });
      await refetch();
      router.push('/survive/recurrence/status');
    } catch {
      // Error handled by Apollo
    }
  };

  if (isAcknowledged) {
    // Mini summary for already-acknowledged event
    return (
      <ScrollView sx={{ flex: 1 }}>
        <View sx={{ mx: 'auto', maxWidth: 640, px: '$6', py: '$16', width: '100%' }}>
          <Text sx={{ fontSize: 24, fontWeight: 'bold', color: '$foreground' }}>
            Recurrence Response Active
          </Text>
          <Text sx={{ mt: '$4', fontSize: 15, color: '$mutedForeground', lineHeight: 24 }}>
            Reported on {new Date(event.detectedDate).toLocaleDateString()} via{' '}
            {formatMethod(event.detectionMethod)}.
            {event.recurrenceType && ` Type: ${event.recurrenceType}.`}
          </Text>

          <View sx={{ mt: '$6', gap: '$3' }}>
            <Link href="/survive/recurrence/status">
              <View sx={{
                borderRadius: 8, backgroundColor: 'blue600',
                px: '$6', py: '$3',
              }}>
                <Text sx={{ fontSize: 14, fontWeight: '600', color: 'white' }}>
                  View cascade status
                </Text>
              </View>
            </Link>
            <Link href="/survive/recurrence/support">
              <View sx={{
                borderRadius: 8, borderWidth: 1, borderColor: '$border',
                px: '$6', py: '$3',
              }}>
                <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground' }}>
                  Support resources
                </Text>
              </View>
            </Link>
          </View>

          <Link href="/survive">
            <Text sx={{ mt: '$4', fontSize: 14, color: 'blue600' }}>
              Back to survivorship dashboard
            </Text>
          </Link>
        </View>
      </ScrollView>
    );
  }

  // Unacknowledged — emotional landing
  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 640, px: '$6', py: '$20', width: '100%' }}>
        <Text sx={{ fontSize: 32, fontWeight: 'bold', color: '$foreground', lineHeight: 40 }}>
          We're here with you.
        </Text>

        <Text sx={{
          mt: '$6', fontSize: 17, color: '$mutedForeground', lineHeight: 28,
        }}>
          A recurrence diagnosis is devastating — there's no way around that.
        </Text>

        <Text sx={{
          mt: '$4', fontSize: 17, color: '$mutedForeground', lineHeight: 28,
        }}>
          But here's what's also true: you've navigated this before, and the
          treatment landscape has likely changed since your first diagnosis.
        </Text>

        <Text sx={{
          mt: '$4', fontSize: 17, color: '$foreground', fontWeight: '600', lineHeight: 28,
        }}>
          We're already working to find your options.
        </Text>

        <View sx={{ mt: '$10', gap: '$4' }}>
          <Pressable onPress={handleAcknowledge} disabled={ackLoading}>
            <View sx={{
              borderRadius: 12, backgroundColor: 'blue600',
              px: '$6', py: '$4', alignItems: 'center',
              flexDirection: 'row', justifyContent: 'center', gap: '$2',
            }}>
              {ackLoading && <ActivityIndicator size="small" color="white" />}
              <Text sx={{ fontSize: 16, fontWeight: '600', color: 'white' }}>
                See what we're doing for you
              </Text>
            </View>
          </Pressable>

          <Link href="/survive/recurrence/support">
            <View sx={{
              borderRadius: 12, borderWidth: 2, borderColor: '#F59E0B',
              backgroundColor: '#FFFBEB',
              px: '$6', py: '$4', alignItems: 'center',
            }}>
              <Text sx={{ fontSize: 16, fontWeight: '600', color: '#92400E' }}>
                I need to talk to someone now
              </Text>
            </View>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}

function formatMethod(method: string): string {
  const labels: Record<string, string> = {
    doctor_reported: 'doctor report',
    imaging: 'imaging results',
    new_symptoms: 'new symptoms',
    ctdna_positive: 'ctDNA positive result',
    biopsy_confirmed: 'biopsy',
  };
  return labels[method] || method;
}
