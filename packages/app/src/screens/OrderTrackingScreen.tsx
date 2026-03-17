import { View, Text, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import { useGetManufacturingOrderQuery } from '../generated/graphql';

export function OrderTrackingScreen({ orderId }: { orderId: string }) {
  const { data, loading } = useGetManufacturingOrderQuery({ variables: { id: orderId } });
  const order = data?.manufacturingOrder;

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!order) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ color: 'gray600' }}>Order not found.</Text>
      </View>
    );
  }

  const steps = [
    { label: 'Shipped', date: order.shippedAt, done: !!order.shippedAt },
    { label: 'In Transit', date: null, done: !!order.shippedAt && !order.deliveredAt },
    { label: 'Delivered', date: order.deliveredAt, done: !!order.deliveredAt },
  ];

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Link href={`/manufacture/orders/${orderId}`}>
          <Text sx={{ fontSize: '$sm', color: 'blue600' }}>&larr; Back to order</Text>
        </Link>

        <Text sx={{ mt: '$4', fontSize: '$3xl', fontWeight: '700', color: 'gray900' }}>
          Shipment Tracking
        </Text>

        {/* Tracking number */}
        {order.trackingNumber && (
          <View sx={{ mt: '$6', borderWidth: 1, borderColor: 'gray200', borderRadius: '$xl', p: '$5' }}>
            <Text sx={{ fontSize: 11, color: 'gray500' }}>Tracking Number</Text>
            <Text sx={{ fontSize: '$lg', fontFamily: 'monospace', fontWeight: '700', color: 'gray900' }}>
              {order.trackingNumber}
            </Text>
            {order.shippingCarrier && (
              <Text sx={{ mt: '$1', fontSize: '$sm', color: 'gray600' }}>
                Carrier: {order.shippingCarrier}
              </Text>
            )}
          </View>
        )}

        {/* Timeline */}
        <View sx={{ mt: '$6', borderWidth: 1, borderColor: 'gray200', borderRadius: '$xl', p: '$5' }}>
          <Text sx={{ fontWeight: '600', color: 'gray900', mb: '$4' }}>Shipment Status</Text>
          <View sx={{ gap: 24 }}>
            {steps.map((step, idx) => (
              <View key={idx} sx={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    bg: step.done ? 'green600' : 'gray200',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {step.done && (
                    <Text sx={{ color: 'white', fontSize: 12, fontWeight: '700' }}>&#10003;</Text>
                  )}
                </View>
                <View sx={{ flex: 1 }}>
                  <Text sx={{ fontWeight: '500', color: step.done ? 'gray900' : 'gray400' }}>
                    {step.label}
                  </Text>
                  {step.date && (
                    <Text sx={{ fontSize: 11, color: 'gray500' }}>
                      {new Date(step.date).toLocaleDateString()}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Storage conditions */}
        {order.shippingConditions && (
          <View sx={{ mt: '$6', borderWidth: 1, borderColor: 'amber200', bg: 'amber50', borderRadius: '$lg', p: '$4' }}>
            <Text sx={{ fontWeight: '600', color: 'amber900' }}>Storage Conditions</Text>
            <Text sx={{ mt: '$1', fontSize: '$sm', color: 'amber800' }}>
              {order.shippingConditions}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
