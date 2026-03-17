import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import { openExternalUrl } from '../utils';
import { useGetManufacturingPartnerQuery } from '../generated/graphql';

export function ManufacturingPartnerDetailScreen({ partnerId }: { partnerId: string }) {
  const { data, loading, error } = useGetManufacturingPartnerQuery({
    variables: { id: partnerId },
  });

  const partner = data?.manufacturingPartner;

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !partner) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ color: 'red600' }}>{error?.message ?? 'Partner not found'}</Text>
        <Link href="/manufacture/partners">
          <Text sx={{ mt: '$4', fontSize: '$sm', color: 'blue600' }}>Back to partners</Text>
        </Link>
      </View>
    );
  }

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Link href="/manufacture/partners">
          <Text sx={{ fontSize: '$sm', color: 'blue600', mb: '$6' }}>&larr; All partners</Text>
        </Link>

        <Text sx={{ fontSize: '$2xl', fontWeight: '700', color: 'gray900' }}>{partner.name}</Text>
        <View sx={{ flexDirection: 'row', gap: 8, mt: '$2', flexWrap: 'wrap' }}>
          <View sx={{ bg: 'blue50', borderRadius: 9999, px: '$2', py: 2 }}>
            <Text sx={{ fontSize: 11, color: 'blue600' }}>{partner.type.toUpperCase()}</Text>
          </View>
          <View sx={{ bg: 'gray100', borderRadius: 9999, px: '$2', py: 2 }}>
            <Text sx={{ fontSize: 11, color: 'gray600' }}>{partner.country}</Text>
          </View>
          <View sx={{ bg: 'gray100', borderRadius: 9999, px: '$2', py: 2 }}>
            <Text sx={{ fontSize: 11, color: 'gray600' }}>{partner.capacityTier} capacity</Text>
          </View>
        </View>

        {partner.description && (
          <Text sx={{ mt: '$4', color: 'gray700' }}>{partner.description}</Text>
        )}

        {/* Key Metrics */}
        <View sx={{ mt: '$6', borderWidth: 1, borderColor: 'gray200', borderRadius: '$xl', p: '$5' }}>
          <Text sx={{ fontWeight: '600', color: 'gray900', mb: '$3' }}>Key Metrics</Text>
          <View sx={{ gap: 16 }}>
            {partner.costRangeMin != null && partner.costRangeMax != null && (
              <View>
                <Text sx={{ fontSize: 11, color: 'gray500' }}>Cost Range</Text>
                <Text sx={{ fontSize: '$lg', fontWeight: '700', color: 'gray900' }}>
                  ${(partner.costRangeMin / 1000).toFixed(0)}K — ${(partner.costRangeMax / 1000).toFixed(0)}K
                </Text>
              </View>
            )}
            {partner.turnaroundWeeksMin != null && partner.turnaroundWeeksMax != null && (
              <View>
                <Text sx={{ fontSize: 11, color: 'gray500' }}>Turnaround Time</Text>
                <Text sx={{ fontSize: '$lg', fontWeight: '700', color: 'gray900' }}>
                  {partner.turnaroundWeeksMin} — {partner.turnaroundWeeksMax} weeks
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Capabilities */}
        {partner.capabilities.length > 0 && (
          <View sx={{ mt: '$6', borderWidth: 1, borderColor: 'gray200', borderRadius: '$xl', p: '$5' }}>
            <Text sx={{ fontWeight: '600', color: 'gray900', mb: '$3' }}>Capabilities</Text>
            <View sx={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              {partner.capabilities.map((cap) => (
                <View key={cap} sx={{ bg: 'blue50', borderRadius: 9999, px: '$3', py: '$1' }}>
                  <Text sx={{ fontSize: '$sm', color: 'blue700' }}>{cap.replace(/_/g, ' ')}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Certifications */}
        {partner.certifications.length > 0 && (
          <View sx={{ mt: '$6', borderWidth: 1, borderColor: 'gray200', borderRadius: '$xl', p: '$5' }}>
            <Text sx={{ fontWeight: '600', color: 'gray900', mb: '$3' }}>Certifications</Text>
            <View sx={{ gap: 8 }}>
              {partner.certifications.map((cert) => (
                <View key={cert} sx={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text sx={{ color: 'green600' }}>&#10003;</Text>
                  <Text sx={{ fontSize: '$sm', color: 'gray700' }}>{cert}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Regulatory Support */}
        {partner.regulatorySupport.length > 0 && (
          <View sx={{ mt: '$6', borderWidth: 1, borderColor: 'gray200', borderRadius: '$xl', p: '$5' }}>
            <Text sx={{ fontWeight: '600', color: 'gray900', mb: '$3' }}>Regulatory Support</Text>
            <View sx={{ gap: 8 }}>
              {partner.regulatorySupport.map((reg) => (
                <Text key={reg} sx={{ fontSize: '$sm', color: 'gray700' }}>
                  &#x2022; {reg.replace(/_/g, ' ')}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Contact */}
        {partner.contactUrl && (
          <Pressable onPress={() => openExternalUrl(partner.contactUrl!)} sx={{ mt: '$8' }}>
            <View sx={{ bg: 'blue600', borderRadius: '$lg', px: '$6', py: '$3', alignItems: 'center' }}>
              <Text sx={{ fontSize: '$sm', fontWeight: '600', color: 'white' }}>Contact Partner</Text>
            </View>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}
