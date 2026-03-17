import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import { openExternalUrl } from '../utils';
import {
  useGetAdministrationSiteQuery,
  useGetManufacturingOrdersQuery,
  useConnectSiteMutation,
} from '../generated/graphql';

export function AdministrationSiteDetailScreen({ siteId }: { siteId: string }) {
  const { data, loading, error } = useGetAdministrationSiteQuery({
    variables: { id: siteId },
  });
  const { data: ordersData } = useGetManufacturingOrdersQuery();
  const [connectSite, { loading: connecting }] = useConnectSiteMutation();

  const site = data?.administrationSite;
  const eligibleOrders = (ordersData?.manufacturingOrders ?? []).filter(
    (o) => ['delivered', 'ready_for_administration'].includes(o.status) && !o.administeredAt,
  );

  const handleConnect = async (orderId: string) => {
    try {
      await connectSite({ variables: { orderId, siteId } });
    } catch {}
  };

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !site) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ color: 'red600' }}>{error?.message ?? 'Site not found'}</Text>
      </View>
    );
  }

  const capabilities = [
    { label: 'mRNA Administration', value: site.canAdministerMrna },
    { label: 'Infusion Center', value: site.hasInfusionCenter },
    { label: 'Emergency Response', value: site.hasEmergencyResponse },
    { label: 'Monitoring Capacity', value: site.hasMonitoringCapacity },
    { label: 'Investigational Experience', value: site.investigationalExp },
  ];

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Link href="/manufacture/providers">
          <Text sx={{ fontSize: '$sm', color: 'blue600', mb: '$6' }}>&larr; All sites</Text>
        </Link>

        <View sx={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Text sx={{ fontSize: '$2xl', fontWeight: '700', color: 'gray900' }}>{site.name}</Text>
          {site.verified && (
            <View sx={{ bg: 'green100', borderRadius: 9999, px: '$2', py: 2 }}>
              <Text sx={{ fontSize: 11, fontWeight: '500', color: 'green700' }}>Verified</Text>
            </View>
          )}
        </View>
        <Text sx={{ mt: '$1', fontSize: '$sm', color: 'gray500' }}>
          {site.type.replace(/_/g, ' ')}
        </Text>

        {/* Location */}
        <View sx={{ mt: '$6', borderWidth: 1, borderColor: 'gray200', borderRadius: '$xl', p: '$5' }}>
          <Text sx={{ fontWeight: '600', color: 'gray900', mb: '$3' }}>Location</Text>
          {site.address && <Text sx={{ fontSize: '$sm', color: 'gray700' }}>{site.address}</Text>}
          <Text sx={{ fontSize: '$sm', color: 'gray700' }}>
            {[site.city, site.state, site.zip].filter(Boolean).join(', ')}
          </Text>
          {site.country && (
            <Text sx={{ fontSize: '$sm', color: 'gray500' }}>{site.country}</Text>
          )}
        </View>

        {/* Capabilities */}
        <View sx={{ mt: '$6', borderWidth: 1, borderColor: 'gray200', borderRadius: '$xl', p: '$5' }}>
          <Text sx={{ fontWeight: '600', color: 'gray900', mb: '$3' }}>Capabilities</Text>
          <View sx={{ gap: 12 }}>
            {capabilities.map((cap) => (
              <View key={cap.label} sx={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text sx={{ color: cap.value ? 'green600' : 'gray300' }}>
                  {cap.value ? '&#10003;' : '&#x2715;'}
                </Text>
                <Text sx={{ fontSize: '$sm', color: cap.value ? 'gray900' : 'gray400' }}>
                  {cap.label}
                </Text>
              </View>
            ))}
          </View>
          {site.irbAffiliation && (
            <Text sx={{ mt: '$3', fontSize: '$sm', color: 'gray600' }}>
              IRB Affiliation: {site.irbAffiliation}
            </Text>
          )}
        </View>

        {/* Contact */}
        <View sx={{ mt: '$6', borderWidth: 1, borderColor: 'gray200', borderRadius: '$xl', p: '$5' }}>
          <Text sx={{ fontWeight: '600', color: 'gray900', mb: '$3' }}>Contact Information</Text>
          {site.contactName && (
            <Text sx={{ fontSize: '$sm', color: 'gray700' }}>{site.contactName}</Text>
          )}
          {site.contactEmail && (
            <Text sx={{ fontSize: '$sm', color: 'gray700' }}>{site.contactEmail}</Text>
          )}
          {site.contactPhone && (
            <Text sx={{ fontSize: '$sm', color: 'gray700' }}>{site.contactPhone}</Text>
          )}
          {site.website && (
            <Pressable onPress={() => openExternalUrl(site.website!)} sx={{ mt: '$2' }}>
              <Text sx={{ fontSize: '$sm', color: 'blue600' }}>{site.website}</Text>
            </Pressable>
          )}
        </View>

        {/* Select for order */}
        {eligibleOrders.length > 0 && (
          <View sx={{ mt: '$6', borderWidth: 1, borderColor: 'gray200', borderRadius: '$xl', p: '$5' }}>
            <Text sx={{ fontWeight: '600', color: 'gray900', mb: '$3' }}>Select for Your Order</Text>
            <View sx={{ gap: 8 }}>
              {eligibleOrders.map((order) => (
                <Pressable
                  key={order.id}
                  onPress={() => handleConnect(order.id)}
                  disabled={connecting}
                >
                  <View sx={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', p: '$3', bg: 'gray50', borderRadius: '$lg' }}>
                    <Text sx={{ fontSize: '$sm', color: 'gray700' }}>
                      Order #{order.id.slice(0, 8)} — {order.partnerName}
                    </Text>
                    <Text sx={{ fontSize: '$sm', fontWeight: '500', color: 'purple600' }}>
                      {connecting ? 'Connecting...' : 'Select'}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
