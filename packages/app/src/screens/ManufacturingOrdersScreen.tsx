import { View, Text, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import { OrderStatusCard } from '../components';
import { useGetManufacturingOrdersQuery } from '../generated/graphql';

export function ManufacturingOrdersScreen() {
  const { data, loading } = useGetManufacturingOrdersQuery();
  const orders = data?.manufacturingOrders ?? [];

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <View sx={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', mb: '$6' }}>
          <Text sx={{ fontSize: '$3xl', fontWeight: '700', color: 'gray900' }}>Your Orders</Text>
          <Link href="/manufacture/orders/new">
            <View sx={{ bg: 'blue600', borderRadius: '$lg', px: '$4', py: '$2' }}>
              <Text sx={{ fontSize: '$sm', fontWeight: '500', color: 'white' }}>New order</Text>
            </View>
          </Link>
        </View>

        {orders.length === 0 ? (
          <View sx={{ alignItems: 'center', py: '$16', bg: 'gray50', borderRadius: '$xl' }}>
            <Text sx={{ fontWeight: '500', color: 'gray900' }}>No orders yet</Text>
            <Text sx={{ mt: '$2', fontSize: '$sm', color: 'gray500', textAlign: 'center', px: '$4' }}>
              Start by selecting a manufacturing partner and submitting your vaccine blueprint.
            </Text>
            <Link href="/manufacture/orders/new">
              <View sx={{ mt: '$4', bg: 'blue600', borderRadius: '$lg', px: '$6', py: '$3' }}>
                <Text sx={{ fontSize: '$sm', fontWeight: '600', color: 'white' }}>Create your first order</Text>
              </View>
            </Link>
          </View>
        ) : (
          <View sx={{ gap: '$4' }}>
            {orders.map((order) => (
              <OrderStatusCard
                key={order.id}
                order={{
                  id: order.id,
                  status: order.status,
                  partnerName: order.partnerName ?? 'Unknown',
                  createdAt: order.createdAt,
                  updatedAt: order.updatedAt ?? order.createdAt,
                  quotePrice: order.quotePrice ?? null,
                  quoteCurrency: order.quoteCurrency ?? null,
                  quoteTurnaroundWeeks: order.quoteTurnaroundWeeks ?? null,
                  totalCost: order.totalCost ?? null,
                  batchNumber: order.batchNumber ?? null,
                  trackingNumber: order.trackingNumber ?? null,
                }}
              />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
