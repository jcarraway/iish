import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import {
  useGetRecurrenceEventQuery,
  useRegenerateTranslatorMutation,
} from '../generated/graphql';

export function RecurrenceTreatmentScreen() {
  const { data: eventData, loading: eventLoading } = useGetRecurrenceEventQuery({ errorPolicy: 'ignore' });
  const event = eventData?.recurrenceEvent;

  const [regenerate, { loading: regenLoading, data: regenData }] =
    useRegenerateTranslatorMutation();

  const isAcknowledged = !!event?.acknowledgedAt;
  const isRegenerated = event?.cascadeStatus?.translatorRegenerated ?? false;

  if (eventLoading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 640, px: '$6', py: '$16', width: '100%' }}>
        <View sx={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <ActivityIndicator size="small" />
          <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>Loading...</Text>
        </View>
      </View>
    );
  }

  const handleRegenerate = async () => {
    if (!event) return;
    try {
      await regenerate({
        variables: { recurrenceEventId: event.id },
      });
    } catch {
      // Error handled by Apollo
    }
  };

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 640, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 28, fontWeight: 'bold', color: '$foreground' }}>
          Updated Treatment Landscape
        </Text>
        <Text sx={{ mt: '$3', fontSize: 16, color: '$mutedForeground', lineHeight: 26 }}>
          Your Treatment Translator can be regenerated to reflect second-line options,
          updated side effect profiles, and the current financial landscape for recurrent cancer.
        </Text>

        {!isAcknowledged && (
          <View sx={{
            mt: '$8', borderRadius: 12, backgroundColor: '#FEF3C7', p: '$5',
          }}>
            <Text sx={{ fontSize: 15, fontWeight: '600', color: '#92400E' }}>
              Acknowledgment Required
            </Text>
            <Text sx={{ mt: '$2', fontSize: 14, color: '#92400E', lineHeight: 22 }}>
              Before we can regenerate your treatment translation, please acknowledge
              your recurrence report. This ensures we have your consent to update your
              treatment information.
            </Text>
            <Link href="/survive/recurrence">
              <View sx={{
                mt: '$4', borderRadius: 8, backgroundColor: '#F59E0B',
                px: '$5', py: '$3', alignSelf: 'flex-start',
              }}>
                <Text sx={{ fontSize: 14, fontWeight: '600', color: 'white' }}>
                  Go to recurrence page
                </Text>
              </View>
            </Link>
          </View>
        )}

        {isAcknowledged && !isRegenerated && !regenData && (
          <View sx={{ mt: '$8' }}>
            <View sx={{
              borderRadius: 12, borderWidth: 1, borderColor: '$border', p: '$6',
              alignItems: 'center',
            }}>
              <Text sx={{ fontSize: 48 }}>{'📊'}</Text>
              <Text sx={{ mt: '$4', fontSize: 16, fontWeight: '600', color: '$foreground' }}>
                Generate your updated treatment landscape
              </Text>
              <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground', textAlign: 'center' }}>
                This will analyze your updated situation including prior treatments,
                new genomic data (if available), and current clinical trial options.
              </Text>
              <Pressable onPress={handleRegenerate} disabled={regenLoading}>
                <View sx={{
                  mt: '$5', borderRadius: 8, backgroundColor: regenLoading ? '#D1D5DB' : 'blue600',
                  px: '$6', py: '$3', flexDirection: 'row', alignItems: 'center', gap: '$2',
                }}>
                  {regenLoading && <ActivityIndicator size="small" color="white" />}
                  <Text sx={{ fontSize: 14, fontWeight: '600', color: 'white' }}>
                    {regenLoading ? 'Generating...' : 'Generate translation'}
                  </Text>
                </View>
              </Pressable>
            </View>
          </View>
        )}

        {(isRegenerated || regenData) && (
          <View sx={{ mt: '$8' }}>
            <View sx={{
              borderRadius: 12, backgroundColor: '#F0FDF4', p: '$5',
            }}>
              <Text sx={{ fontSize: 16, fontWeight: '600', color: '#166534' }}>
                Translation Updated
              </Text>
              <Text sx={{ mt: '$2', fontSize: 14, color: '#166534', lineHeight: 22 }}>
                Your Treatment Translator has been regenerated with your updated clinical
                profile. View it to see second-line treatment options, updated side effects,
                and the financial landscape.
              </Text>
            </View>

            <Link href="/translate">
              <View sx={{
                mt: '$4', borderRadius: 8, backgroundColor: 'blue600',
                px: '$6', py: '$3', alignSelf: 'flex-start',
              }}>
                <Text sx={{ fontSize: 14, fontWeight: '600', color: 'white' }}>
                  View Treatment Translation
                </Text>
              </View>
            </Link>
          </View>
        )}

        {/* What's included */}
        <View sx={{ mt: '$8' }}>
          <Text sx={{ fontSize: 18, fontWeight: '600', color: '$foreground' }}>
            What the updated translation covers
          </Text>
          <View sx={{ mt: '$4', gap: '$3' }}>
            {[
              { title: 'Second-line treatment options', desc: 'Therapies typically used after initial treatment, including newer approaches' },
              { title: 'Resistance-informed recommendations', desc: 'Options that account for why your previous treatment may have stopped working' },
              { title: 'Updated side effect profiles', desc: 'What to expect from treatments when you have prior treatment history' },
              { title: 'Financial landscape', desc: 'Updated cost information and financial assistance for recurrent cancer treatments' },
            ].map((item, i) => (
              <View key={i} sx={{
                borderRadius: 8, borderWidth: 1, borderColor: '$border', p: '$4',
              }}>
                <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground' }}>
                  {item.title}
                </Text>
                <Text sx={{ mt: '$1', fontSize: 13, color: '$mutedForeground' }}>
                  {item.desc}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <Link href="/survive/recurrence/status">
          <Text sx={{ mt: '$8', fontSize: 14, color: 'blue600' }}>
            Back to cascade status
          </Text>
        </Link>
      </View>
    </ScrollView>
  );
}
