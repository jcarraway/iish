import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator, TextInput } from 'react-native';
import { useRouter } from 'solito/router';
import { Picker } from '../components';
import {
  useGetManufacturingPartnersQuery,
  useGetPipelineJobsQuery,
  useCreateManufacturingOrderMutation,
} from '../generated/graphql';

export function NewManufacturingOrderScreen() {
  const router = useRouter();
  const { data: partnerData, loading: l1 } = useGetManufacturingPartnersQuery();
  const { data: jobData, loading: l2 } = useGetPipelineJobsQuery();
  const [createOrder, { loading: submitting }] = useCreateManufacturingOrderMutation();

  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');

  const loading = l1 || l2;
  const partners = partnerData?.manufacturingPartners ?? [];
  const jobs = (jobData?.pipelineJobs ?? []).filter((j) => j.status === 'complete');

  const handleSubmit = async () => {
    if (!selectedPartnerId || !selectedJobId || !consent) return;
    setError('');
    try {
      const { data } = await createOrder({
        variables: { partnerId: selectedPartnerId, pipelineJobId: selectedJobId },
      });
      if (data?.createManufacturingOrder?.id) {
        router.push(`/manufacture/orders/${data.createManufacturingOrder.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 672, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: '$3xl', fontWeight: '700', color: 'gray900' }}>
          New Manufacturing Order
        </Text>
        <View sx={{ mt: '$8', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <ActivityIndicator size="small" />
          <Text sx={{ fontSize: '$sm', color: 'gray600' }}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (jobs.length === 0) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 672, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: '$3xl', fontWeight: '700', color: 'gray900' }}>
          New Manufacturing Order
        </Text>
        <View sx={{ mt: '$8', borderRadius: '$lg', borderWidth: 1, borderColor: 'amber200', bg: 'amber50', p: '$5' }}>
          <Text sx={{ fontWeight: '500', color: 'amber900' }}>No completed vaccine blueprint found</Text>
          <Text sx={{ mt: '$2', fontSize: '$sm', color: 'amber800' }}>
            A completed neoantigen pipeline job is required before placing a manufacturing order.
            The pipeline generates your personalized vaccine blueprint that manufacturers need.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 672, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: '$3xl', fontWeight: '700', color: 'gray900' }}>
          New Manufacturing Order
        </Text>
        <Text sx={{ mt: '$2', color: 'gray600' }}>
          Send your vaccine blueprint to a manufacturing partner
        </Text>

        <View sx={{ mt: '$8', gap: 24 }}>
          {/* Select partner */}
          <View>
            <Text sx={{ fontSize: '$sm', fontWeight: '500', color: 'gray900' }}>
              Manufacturing Partner
            </Text>
            <Picker
              value={selectedPartnerId}
              onValueChange={setSelectedPartnerId}
              options={[
                { label: 'Select a partner...', value: '' },
                ...partners.map((p) => ({
                  label: `${p.name}${p.costRangeMin && p.costRangeMax ? ` ($${(p.costRangeMin / 1000).toFixed(0)}K — $${(p.costRangeMax / 1000).toFixed(0)}K)` : ''}`,
                  value: p.id,
                })),
              ]}
            />
          </View>

          {/* Select pipeline job */}
          <View>
            <Text sx={{ fontSize: '$sm', fontWeight: '500', color: 'gray900' }}>
              Vaccine Blueprint
            </Text>
            <Picker
              value={selectedJobId}
              onValueChange={setSelectedJobId}
              options={[
                { label: 'Select a blueprint...', value: '' },
                ...jobs.map((j) => ({
                  label: `Pipeline #${j.id.slice(0, 8)} — ${j.neoantigenCount ?? '?'} neoantigens${j.completedAt ? ` (${new Date(j.completedAt).toLocaleDateString()})` : ''}`,
                  value: j.id,
                })),
              ]}
            />
          </View>

          {/* Message */}
          <View>
            <Text sx={{ fontSize: '$sm', fontWeight: '500', color: 'gray900' }}>
              Message to manufacturer (optional)
            </Text>
            <TextInput
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={3}
              placeholder="Any special requirements, timelines, or questions..."
              style={{
                marginTop: 8,
                borderWidth: 1,
                borderColor: '#e5e7eb',
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 10,
                fontSize: 14,
                minHeight: 80,
                textAlignVertical: 'top',
              }}
            />
          </View>

          {/* Consent */}
          <Pressable
            onPress={() => setConsent(!consent)}
            sx={{ borderRadius: '$lg', borderWidth: 1, borderColor: 'amber200', bg: 'amber50', p: '$4' }}
          >
            <View sx={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
              <View
                sx={{
                  width: 20,
                  height: 20,
                  borderRadius: 4,
                  borderWidth: 1,
                  borderColor: consent ? 'blue600' : 'gray300',
                  bg: consent ? 'blue600' : 'white',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mt: 2,
                }}
              >
                {consent && <Text sx={{ color: 'white', fontSize: 12, fontWeight: '700' }}>&#10003;</Text>}
              </View>
              <Text sx={{ flex: 1, fontSize: '$sm', color: 'amber800' }}>
                I understand that my anonymized vaccine blueprint will be shared with the selected
                manufacturing partner. No personally identifiable information will be included. The
                blueprint contains molecular specifications (mRNA sequences, epitopes, formulation
                parameters) needed for production.
              </Text>
            </View>
          </Pressable>

          {error ? <Text sx={{ fontSize: '$sm', color: 'red600' }}>{error}</Text> : null}

          <Pressable
            onPress={handleSubmit}
            disabled={submitting || !selectedPartnerId || !selectedJobId || !consent}
            sx={{ opacity: submitting || !selectedPartnerId || !selectedJobId || !consent ? 0.5 : 1 }}
          >
            <View sx={{ bg: 'blue600', borderRadius: '$lg', px: '$4', py: '$3', alignItems: 'center' }}>
              <Text sx={{ fontSize: '$sm', fontWeight: '600', color: 'white' }}>
                {submitting ? 'Creating order...' : 'Submit Order'}
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
