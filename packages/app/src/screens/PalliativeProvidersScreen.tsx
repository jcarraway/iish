import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import { useGetPalliativeCareProvidersQuery } from '../generated/graphql';

const TYPE_OPTIONS = [
  { key: '', label: 'All Types' },
  { key: 'palliative_team', label: 'Palliative Team' },
  { key: 'individual', label: 'Individual' },
  { key: 'np', label: 'Nurse Practitioner' },
  { key: 'social_worker', label: 'Social Worker' },
];

const SETTING_OPTIONS = [
  { key: '', label: 'All Settings' },
  { key: 'hospital', label: 'Hospital' },
  { key: 'outpatient', label: 'Outpatient' },
  { key: 'home', label: 'Home-Based' },
  { key: 'telehealth', label: 'Telehealth' },
];

export function PalliativeProvidersScreen() {
  const [typeFilter, setTypeFilter] = useState('');
  const [settingFilter, setSettingFilter] = useState('');
  const [telehealthOnly, setTelehealthOnly] = useState(false);

  const filters: any = {};
  if (typeFilter) filters.type = typeFilter;
  if (settingFilter) filters.setting = settingFilter;
  if (telehealthOnly) filters.telehealth = true;

  const { data, loading } = useGetPalliativeCareProvidersQuery({
    variables: { filters: Object.keys(filters).length > 0 ? filters : undefined },
    errorPolicy: 'ignore',
  });

  const providers = data?.palliativeCareProviders ?? [];

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$10', width: '100%' }}>
        <Link href="/palliative">
          <Text sx={{ fontSize: 14, color: 'blue600', mb: '$4' }}>← Back to Palliative Care</Text>
        </Link>
        <Text sx={{ fontSize: 28, fontWeight: 'bold', color: '$foreground' }}>
          Palliative Care Providers
        </Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
          Find palliative care specialists near you
        </Text>

        {/* Filters */}
        <View sx={{ mt: '$6', gap: '$3' }}>
          <Text sx={{ fontSize: 13, fontWeight: '600', color: '$foreground' }}>Type</Text>
          <View sx={{ flexDirection: 'row', flexWrap: 'wrap', gap: '$2' }}>
            {TYPE_OPTIONS.map(opt => (
              <Pressable key={opt.key} onPress={() => setTypeFilter(opt.key)}>
                <View sx={{
                  px: '$3',
                  py: '$1',
                  borderRadius: 20,
                  backgroundColor: typeFilter === opt.key ? 'blue600' : 'transparent',
                  borderWidth: 1,
                  borderColor: typeFilter === opt.key ? 'blue600' : '$border',
                }}>
                  <Text sx={{
                    fontSize: 13,
                    color: typeFilter === opt.key ? 'white' : '$foreground',
                  }}>
                    {opt.label}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>

          <Text sx={{ fontSize: 13, fontWeight: '600', color: '$foreground', mt: '$2' }}>Setting</Text>
          <View sx={{ flexDirection: 'row', flexWrap: 'wrap', gap: '$2' }}>
            {SETTING_OPTIONS.map(opt => (
              <Pressable key={opt.key} onPress={() => setSettingFilter(opt.key)}>
                <View sx={{
                  px: '$3',
                  py: '$1',
                  borderRadius: 20,
                  backgroundColor: settingFilter === opt.key ? 'blue600' : 'transparent',
                  borderWidth: 1,
                  borderColor: settingFilter === opt.key ? 'blue600' : '$border',
                }}>
                  <Text sx={{
                    fontSize: 13,
                    color: settingFilter === opt.key ? 'white' : '$foreground',
                  }}>
                    {opt.label}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>

          <Pressable onPress={() => setTelehealthOnly(!telehealthOnly)}>
            <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$2', mt: '$1' }}>
              <View sx={{
                width: 20,
                height: 20,
                borderRadius: 4,
                borderWidth: 1,
                borderColor: telehealthOnly ? 'blue600' : '$border',
                backgroundColor: telehealthOnly ? 'blue600' : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {telehealthOnly && <Text sx={{ fontSize: 12, color: 'white' }}>✓</Text>}
              </View>
              <Text sx={{ fontSize: 13, color: '$foreground' }}>Telehealth available</Text>
            </View>
          </Pressable>
        </View>

        {loading ? (
          <View sx={{ mt: '$8', flexDirection: 'row', alignItems: 'center', gap: '$3' }}>
            <ActivityIndicator size="small" />
            <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>Finding providers...</Text>
          </View>
        ) : providers.length === 0 ? (
          <View sx={{ mt: '$8', p: '$5', borderRadius: 12, borderWidth: 1, borderColor: '$border' }}>
            <Text sx={{ fontSize: 15, color: '$mutedForeground' }}>
              No providers found matching your filters. Try adjusting your criteria.
            </Text>
          </View>
        ) : (
          <View sx={{ mt: '$6', gap: '$4' }}>
            <Text sx={{ fontSize: 13, color: '$mutedForeground' }}>
              {providers.length} provider{providers.length !== 1 ? 's' : ''} found
            </Text>
            {providers.map((p: any) => (
              <View key={p.id} sx={{ borderRadius: 12, borderWidth: 1, borderColor: '$border', p: '$5' }}>
                <View sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View sx={{ flex: 1 }}>
                    <Text sx={{ fontSize: 16, fontWeight: '600', color: '$foreground' }}>{p.name}</Text>
                    <Text sx={{ mt: '$1', fontSize: 13, color: '$mutedForeground' }}>
                      {p.type.replace(/_/g, ' ')} · {p.setting}
                    </Text>
                  </View>
                  {p.distance != null && (
                    <View sx={{ backgroundColor: '#EFF6FF', borderRadius: 8, px: '$2', py: '$1' }}>
                      <Text sx={{ fontSize: 12, fontWeight: '600', color: '#1E40AF' }}>
                        {Math.round(p.distance)} mi
                      </Text>
                    </View>
                  )}
                </View>

                {p.affiliatedHospital && (
                  <Text sx={{ mt: '$2', fontSize: 13, color: '$foreground' }}>
                    {p.affiliatedHospital}
                  </Text>
                )}

                {p.address && (
                  <Text sx={{ mt: '$1', fontSize: 13, color: '$mutedForeground' }}>
                    {p.address}, {p.city}, {p.state} {p.zipCode}
                  </Text>
                )}

                <View sx={{ flexDirection: 'row', flexWrap: 'wrap', gap: '$2', mt: '$3' }}>
                  {p.offersTelehealth && (
                    <View sx={{ backgroundColor: '#DCFCE7', borderRadius: 6, px: '$2', py: 2 }}>
                      <Text sx={{ fontSize: 11, fontWeight: '600', color: '#166534' }}>Telehealth</Text>
                    </View>
                  )}
                  {p.acceptsMedicare && (
                    <View sx={{ backgroundColor: '#DBEAFE', borderRadius: 6, px: '$2', py: 2 }}>
                      <Text sx={{ fontSize: 11, fontWeight: '600', color: '#1E40AF' }}>Medicare</Text>
                    </View>
                  )}
                  {p.averageWaitDays != null && (
                    <View sx={{ backgroundColor: '#FEF3C7', borderRadius: 6, px: '$2', py: 2 }}>
                      <Text sx={{ fontSize: 11, fontWeight: '600', color: '#92400E' }}>
                        ~{p.averageWaitDays}d wait
                      </Text>
                    </View>
                  )}
                  {p.referralRequired && (
                    <View sx={{ backgroundColor: '#FEE2E2', borderRadius: 6, px: '$2', py: 2 }}>
                      <Text sx={{ fontSize: 11, fontWeight: '600', color: '#991B1B' }}>Referral needed</Text>
                    </View>
                  )}
                </View>

                {p.servicesOffered.length > 0 && (
                  <Text sx={{ mt: '$3', fontSize: 12, color: '$mutedForeground' }}>
                    Services: {p.servicesOffered.join(', ')}
                  </Text>
                )}

                {p.phone && (
                  <Text sx={{ mt: '$2', fontSize: 13, color: 'blue600' }}>
                    {p.phone}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
