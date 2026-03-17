import { View, Text, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import { OrderProgressBar } from '../components';
import { useGetSequencingOrdersQuery, useGetWaitingContentLazyQuery } from '../generated/graphql';
import { useEffect } from 'react';

const STATUS_BADGE: Record<string, { bg: string; fg: string }> = {
  pending: { bg: '#F3F4F6', fg: '#374151' },
  insurance_check: { bg: '#DBEAFE', fg: '#1E40AF' },
  prior_auth: { bg: '#FEF3C7', fg: '#92400E' },
  sample_needed: { bg: '#FFEDD5', fg: '#9A3412' },
  sample_received: { bg: '#E0E7FF', fg: '#3730A3' },
  processing: { bg: '#F3E8FF', fg: '#6B21A8' },
  results_ready: { bg: '#DCFCE7', fg: '#166534' },
  completed: { bg: '#DCFCE7', fg: '#14532D' },
  cancelled: { bg: '#FEE2E2', fg: '#991B1B' },
};

export function SequencingOrdersScreen() {
  const { data, loading, error, refetch } = useGetSequencingOrdersQuery();
  const [fetchWaiting, { data: waitingData }] = useGetWaitingContentLazyQuery();

  const orders = data?.sequencingOrders ?? [];
  const waitingContent = waitingData?.waitingContent;

  useEffect(() => {
    const hasWaiting = orders.some(
      (o) => o.status === 'sample_received' || o.status === 'processing',
    );
    if (hasWaiting) fetchWaiting();
  }, [orders]);

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 768, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 28, fontWeight: '700' }}>Sequencing Orders</Text>
        <View sx={{ mt: '$8', flexDirection: 'row', alignItems: 'center', gap: '$3' }}>
          <ActivityIndicator size="small" />
          <Text sx={{ fontSize: 14, color: 'gray600' }}>Loading orders...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 768, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 28, fontWeight: '700' }}>Sequencing Orders</Text>
        <Text sx={{ mt: '$4', fontSize: 14, color: '#DC2626' }}>{error.message}</Text>
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 768, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 28, fontWeight: '700' }}>Sequencing Orders</Text>
        <View sx={{ mt: '$8', borderRadius: 12, borderWidth: 2, borderStyle: 'dashed', borderColor: '#D1D5DB', p: '$8', alignItems: 'center' }}>
          <Text sx={{ color: 'gray600' }}>No sequencing orders yet.</Text>
          <Text sx={{ mt: '$1', fontSize: 14, color: 'gray500' }}>Take our guided assessment to find the right test for you.</Text>
          <Link href="/sequencing/guide">
            <View sx={{ mt: '$4', bg: '#2563EB', borderRadius: 8, px: '$6', py: '$2' }}>
              <Text sx={{ color: 'white', fontSize: 14, fontWeight: '600' }}>Start sequencing guide</Text>
            </View>
          </Link>
        </View>
      </View>
    );
  }

  return (
    <ScrollView>
      <View sx={{ mx: 'auto', maxWidth: 768, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 28, fontWeight: '700' }}>Sequencing Orders</Text>
        <Text sx={{ mt: '$1', fontSize: 14, color: 'gray500' }}>
          {orders.length} order{orders.length !== 1 ? 's' : ''}
        </Text>

        <View sx={{ mt: '$8', gap: '$4' }}>
          {orders.map((order) => {
            const badge = STATUS_BADGE[order.status] ?? STATUS_BADGE.pending;
            return (
              <Link key={order.id} href={`/sequencing/orders/${order.id}`}>
                <View sx={{ borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', p: '$5' }}>
                  <View sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View>
                      <Text sx={{ fontWeight: '600', color: 'gray900' }}>{order.provider?.name ?? 'Provider'}</Text>
                      <Text sx={{ fontSize: 14, color: 'gray500' }}>{order.testType.replace(/_/g, ' ')}</Text>
                    </View>
                    <View sx={{ bg: badge.bg, borderRadius: 12, px: 10, py: 2 }}>
                      <Text sx={{ fontSize: 12, fontWeight: '500', color: badge.fg }}>
                        {order.status.replace(/_/g, ' ')}
                      </Text>
                    </View>
                  </View>
                  <View sx={{ mt: '$4' }}>
                    <OrderProgressBar currentStatus={order.status} />
                  </View>
                  <Text sx={{ mt: '$3', fontSize: 12, color: '#9CA3AF' }}>
                    Created {new Date(order.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </Link>
            );
          })}
        </View>

        {/* While You Wait */}
        {waitingContent && (
          <View sx={{ mt: '$10' }}>
            <Text sx={{ fontSize: 20, fontWeight: '700', color: 'gray900' }}>While You Wait</Text>
            <Text sx={{ mt: '$1', fontSize: 14, color: 'gray500' }}>Learn about what your results might show</Text>

            <View sx={{ mt: '$4', borderRadius: 12, borderWidth: 1, borderColor: '#C7D2FE', bg: '#EEF2FF', p: '$5' }}>
              <Text sx={{ fontWeight: '600', color: '#312E81' }}>
                Common mutations in {waitingContent.cancerType}
              </Text>
              <View sx={{ mt: '$3', gap: '$3' }}>
                {waitingContent.commonMutations.slice(0, 4).map((mut, i) => (
                  <View key={i} sx={{ borderRadius: 8, bg: 'white', p: '$3' }}>
                    <View sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text sx={{ fontWeight: '500', color: 'gray900' }}>{mut.name}</Text>
                      <Text sx={{ fontSize: 12, color: 'gray500' }}>{mut.frequency}</Text>
                    </View>
                    <Text sx={{ mt: '$1', fontSize: 14, color: 'gray600' }}>{mut.significance}</Text>
                    {mut.drugs.length > 0 && (
                      <Text sx={{ mt: '$1', fontSize: 12, color: '#4338CA' }}>
                        Targeted therapies: {mut.drugs.join(', ')}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            </View>

            <View sx={{ mt: '$4', borderRadius: 8, bg: '#F9FAFB', p: '$5' }}>
              <Text sx={{ fontWeight: '600', color: 'gray900' }}>Timeline expectations</Text>
              <Text sx={{ mt: '$2', fontSize: 14, color: 'gray700', lineHeight: 22 }}>
                {waitingContent.timelineExpectations}
              </Text>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
