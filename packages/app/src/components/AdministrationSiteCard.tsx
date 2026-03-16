import { View, Text, Pressable } from 'dripsy';
import { Linking } from 'react-native';

interface AdministrationSiteCardProps {
  site: {
    id: string;
    name: string;
    type: string;
    city: string | null;
    state: string | null;
    distance?: number;
    canAdministerMrna: boolean;
    hasInfusionCenter: boolean;
    hasEmergencyResponse: boolean;
    hasMonitoringCapacity: boolean;
    investigationalExp: boolean;
    irbAffiliation: string | null;
    verified: boolean;
    contactPhone: string | null;
    website: string | null;
  };
  onSelect?: (siteId: string) => void;
}

const TYPE_LABELS: Record<string, string> = {
  academic_medical_center: 'Academic Medical Center',
  community_oncology: 'Community Oncology',
  infusion_center: 'Infusion Center',
  hospital: 'Hospital',
};

const CAPABILITY_BADGES: { key: string; label: string; bg: string; text: string }[] = [
  { key: 'canAdministerMrna', label: 'mRNA', bg: 'purple100', text: 'purple700' },
  { key: 'hasInfusionCenter', label: 'Infusion', bg: 'blue100', text: 'blue700' },
  { key: 'hasEmergencyResponse', label: 'Emergency', bg: 'red100', text: 'red700' },
  { key: 'hasMonitoringCapacity', label: 'Monitoring', bg: 'green100', text: 'green700' },
  { key: 'investigationalExp', label: 'Investigational', bg: 'amber100', text: 'amber700' },
];

export function AdministrationSiteCard({ site, onSelect }: AdministrationSiteCardProps) {
  const activeCapabilities = CAPABILITY_BADGES.filter(
    (cap) => site[cap.key as keyof typeof site] === true,
  );

  return (
    <View sx={{ borderRadius: '$xl', borderWidth: 1, borderColor: 'gray200', p: '$5' }}>
      <View sx={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <View sx={{ flex: 1 }}>
          <Text sx={{ fontWeight: '600', color: 'gray900' }}>{site.name}</Text>
          <Text sx={{ mt: 2, fontSize: '$xs', color: 'gray500' }}>
            {TYPE_LABELS[site.type] ?? site.type}
            {site.city && site.state && ` \u00B7 ${site.city}, ${site.state}`}
          </Text>
        </View>
        {site.distance != null && (
          <View sx={{ borderRadius: '$full', bg: 'gray100', px: 10, py: 2 }}>
            <Text sx={{ fontSize: '$xs', fontWeight: '500', color: 'gray700' }}>
              {site.distance} mi
            </Text>
          </View>
        )}
      </View>

      {activeCapabilities.length > 0 && (
        <View sx={{ mt: '$3', flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {activeCapabilities.map((cap) => (
            <View key={cap.key} sx={{ borderRadius: '$full', bg: cap.bg, px: '$2', py: 2 }}>
              <Text sx={{ fontSize: 11, fontWeight: '500', color: cap.text }}>{cap.label}</Text>
            </View>
          ))}
        </View>
      )}

      {site.irbAffiliation && (
        <Text sx={{ mt: '$2', fontSize: '$xs', color: 'gray500' }}>
          IRB: {site.irbAffiliation}
        </Text>
      )}

      <View sx={{ mt: '$3', flexDirection: 'row', alignItems: 'center', gap: '$3' }}>
        {site.contactPhone && (
          <Text sx={{ fontSize: '$xs', color: 'gray500' }}>{site.contactPhone}</Text>
        )}
        {site.website && (
          <Pressable onPress={() => Linking.openURL(site.website!)}>
            <Text sx={{ fontSize: '$xs', color: 'blue600' }}>Website</Text>
          </Pressable>
        )}
      </View>

      {onSelect && (
        <Pressable
          onPress={() => onSelect(site.id)}
          sx={{
            mt: '$3',
            width: '100%',
            borderRadius: '$lg',
            bg: 'blue600',
            px: '$4',
            py: '$2',
            alignItems: 'center',
          }}
        >
          <Text sx={{ fontSize: '$sm', fontWeight: '500', color: 'white' }}>Select this site</Text>
        </Pressable>
      )}
    </View>
  );
}
