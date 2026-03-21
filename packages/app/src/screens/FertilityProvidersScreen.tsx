import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import {
  useGetFertilityProvidersQuery,
  useRequestFertilityReferralMutation,
  useGetFertilityAssessmentQuery,
} from '../generated/graphql';

// ============================================================================
// Constants
// ============================================================================

interface FilterDef {
  key: string;
  label: string;
}

const FILTER_OPTIONS: FilterDef[] = [
  { key: 'oncologyExperience', label: 'Oncology Experience' },
  { key: 'randomStartProtocol', label: 'Random-Start' },
  { key: 'letrozoleProtocol', label: 'Letrozole' },
  { key: 'weekendAvailability', label: 'Weekend' },
  { key: 'livestrongPartner', label: 'Livestrong' },
];

// ============================================================================
// Component
// ============================================================================

export function FertilityProvidersScreen() {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [referralSent, setReferralSent] = useState<string | null>(null);

  // Build filters JSON
  const filtersVar = activeFilters.length > 0
    ? JSON.stringify(Object.fromEntries(activeFilters.map(f => [f, true])))
    : undefined;

  const { data, loading, refetch } = useGetFertilityProvidersQuery({
    variables: { filters: filtersVar },
    errorPolicy: 'ignore',
  });

  const { data: assessmentData } = useGetFertilityAssessmentQuery({ errorPolicy: 'ignore' });
  const assessment = assessmentData?.fertilityAssessment;

  const [requestReferral, { loading: requesting }] = useRequestFertilityReferralMutation({
    onCompleted: (result) => {
      setReferralSent(result.requestFertilityReferral.providerId ?? null);
    },
  });

  const providers = data?.fertilityProviders ?? [];

  function toggleFilter(key: string) {
    setActiveFilters(prev =>
      prev.includes(key)
        ? prev.filter(f => f !== key)
        : [...prev, key]
    );
  }

  if (loading && providers.length === 0) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          Oncofertility Providers
        </Text>
        <View sx={{ mt: '$8', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <ActivityIndicator size="small" />
          <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>Finding providers near you...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          Oncofertility Providers
        </Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
          Reproductive specialists experienced with cancer patients
        </Text>

        {/* ============================================================= */}
        {/* Filter Pills */}
        {/* ============================================================= */}
        <View sx={{ mt: '$5', flexDirection: 'row', flexWrap: 'wrap', gap: '$2' }}>
          {FILTER_OPTIONS.map(filter => {
            const isActive = activeFilters.includes(filter.key);
            return (
              <Pressable key={filter.key} onPress={() => toggleFilter(filter.key)}>
                <View sx={{
                  borderRadius: 20,
                  px: '$3',
                  py: '$2',
                  borderWidth: 1,
                  borderColor: isActive ? 'blue600' : '$border',
                  backgroundColor: isActive ? '#DBEAFE' : 'transparent',
                }}>
                  <Text sx={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: isActive ? '#1E40AF' : '$mutedForeground',
                  }}>
                    {filter.label}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        {loading && (
          <View sx={{ mt: '$4', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <ActivityIndicator size="small" />
            <Text sx={{ fontSize: 13, color: '$mutedForeground' }}>Updating results...</Text>
          </View>
        )}

        {/* ============================================================= */}
        {/* Provider Cards */}
        {/* ============================================================= */}
        {!loading && providers.length === 0 && (
          <View sx={{
            mt: '$6',
            borderWidth: 2,
            borderStyle: 'dashed',
            borderColor: '$border',
            borderRadius: 12,
            p: '$6',
            alignItems: 'center',
          }}>
            <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground', textAlign: 'center' }}>
              No providers match your filters
            </Text>
            <Text sx={{ mt: '$2', fontSize: 13, color: '$mutedForeground', textAlign: 'center' }}>
              Try removing some filters to see more results
            </Text>
            {activeFilters.length > 0 && (
              <Pressable onPress={() => setActiveFilters([])}>
                <View sx={{
                  mt: '$3',
                  borderWidth: 1,
                  borderColor: '$border',
                  borderRadius: 8,
                  px: '$4',
                  py: '$2',
                }}>
                  <Text sx={{ fontSize: 13, color: '$mutedForeground' }}>Clear all filters</Text>
                </View>
              </Pressable>
            )}
          </View>
        )}

        <View sx={{ mt: '$4', gap: '$4' }}>
          {providers.map(provider => {
            const hasReferral = referralSent === provider.id || assessment?.providerId === provider.id;

            return (
              <View key={provider.id} sx={{
                borderWidth: 1,
                borderColor: '$border',
                borderRadius: 12,
                p: '$5',
              }}>
                {/* Header */}
                <View sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View sx={{ flex: 1 }}>
                    <Text sx={{ fontSize: 16, fontWeight: '600', color: '$foreground' }}>
                      {provider.name}
                    </Text>
                    <Text sx={{ mt: '$1', fontSize: 13, color: '$mutedForeground' }}>
                      {provider.type}
                    </Text>
                  </View>
                  {provider.distance != null && (
                    <View sx={{
                      backgroundColor: '#DBEAFE',
                      borderRadius: 12,
                      px: '$2',
                      py: 3,
                    }}>
                      <Text sx={{ fontSize: 11, fontWeight: '600', color: '#1E40AF' }}>
                        {provider.distance.toFixed(1)} mi
                      </Text>
                    </View>
                  )}
                </View>

                {/* Location */}
                <Text sx={{ mt: '$2', fontSize: 13, color: '$mutedForeground' }}>
                  {provider.city}, {provider.state} {provider.zipCode}
                </Text>

                {/* Capabilities badges */}
                <View sx={{ mt: '$3', flexDirection: 'row', flexWrap: 'wrap', gap: '$1' }}>
                  {provider.oncologyExperience && (
                    <CapabilityBadge label="Oncology" bg="#DCFCE7" fg="#166534" />
                  )}
                  {provider.randomStartProtocol && (
                    <CapabilityBadge label="Random-Start" bg="#EDE9FE" fg="#5B21B6" />
                  )}
                  {provider.letrozoleProtocol && (
                    <CapabilityBadge label="Letrozole" bg="#FCE7F3" fg="#9D174D" />
                  )}
                  {provider.weekendAvailability && (
                    <CapabilityBadge label="Weekends" bg="#FEF3C7" fg="#92400E" />
                  )}
                  {provider.livestrongPartner && (
                    <CapabilityBadge label="Livestrong" bg="#DBEAFE" fg="#1E40AF" />
                  )}
                  {provider.servicesOffered.map((s, i) => (
                    <CapabilityBadge key={i} label={s} bg="#F1F5F9" fg="#64748B" />
                  ))}
                </View>

                {/* Coordinator */}
                {provider.oncofertilityCoordinator && (
                  <Text sx={{ mt: '$2', fontSize: 12, color: '$mutedForeground' }}>
                    Oncofertility coordinator: {provider.oncofertilityCoordinator}
                  </Text>
                )}

                {/* Contact */}
                <View sx={{ mt: '$3', gap: '$1' }}>
                  {provider.phone && (
                    <Text sx={{ fontSize: 13, color: 'blue600' }}>
                      {provider.phone}
                    </Text>
                  )}
                  {provider.urgentPhone && (
                    <Text sx={{ fontSize: 13, color: '#B91C1C' }}>
                      Urgent: {provider.urgentPhone}
                    </Text>
                  )}
                  {provider.website && (
                    <Text sx={{ fontSize: 12, color: '$mutedForeground' }}>
                      {provider.website}
                    </Text>
                  )}
                </View>

                {/* Referral button */}
                {assessment && !hasReferral && (
                  <Pressable
                    onPress={() => {
                      requestReferral({
                        variables: {
                          input: {
                            assessmentId: assessment.id,
                            providerId: provider.id,
                          },
                        },
                      });
                    }}
                    disabled={requesting}
                  >
                    <View sx={{
                      mt: '$3',
                      backgroundColor: requesting ? '#9CA3AF' : 'blue600',
                      borderRadius: 8,
                      py: '$3',
                      alignItems: 'center',
                    }}>
                      <Text sx={{ fontSize: 13, fontWeight: '600', color: 'white' }}>
                        {requesting ? 'Requesting...' : 'Request Referral'}
                      </Text>
                    </View>
                  </Pressable>
                )}
                {hasReferral && (
                  <View sx={{
                    mt: '$3',
                    backgroundColor: '#DCFCE7',
                    borderRadius: 8,
                    py: '$3',
                    alignItems: 'center',
                  }}>
                    <Text sx={{ fontSize: 13, fontWeight: '600', color: '#166534' }}>
                      {'\u2713'} Referral requested
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Navigation */}
        <View sx={{ mt: '$6', flexDirection: 'row', flexWrap: 'wrap', gap: '$3' }}>
          <Link href="/fertility">
            <View sx={{
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '$border',
              px: '$4',
              py: '$3',
            }}>
              <Text sx={{ fontSize: 13, fontWeight: '500', color: '$foreground' }}>
                {'\u2190'} Dashboard
              </Text>
            </View>
          </Link>
          <Link href="/fertility/guide">
            <View sx={{
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '$border',
              px: '$4',
              py: '$3',
            }}>
              <Text sx={{ fontSize: 13, fontWeight: '500', color: '$foreground' }}>
                Discussion Guide {'\u2192'}
              </Text>
            </View>
          </Link>
        </View>

        {/* Disclaimer */}
        <View sx={{
          mt: '$6',
          backgroundColor: '#FFFBEB',
          borderWidth: 1,
          borderColor: '#FDE68A',
          borderRadius: 12,
          p: '$5',
        }}>
          <Text sx={{ fontSize: 13, fontWeight: '600', color: '#92400E' }}>
            Important disclaimer
          </Text>
          <Text sx={{ mt: '$2', fontSize: 12, color: '#78350F', lineHeight: 18 }}>
            Provider listings are for informational purposes. IISH does not endorse specific
            providers. Always verify credentials, insurance acceptance, and availability directly
            with the provider.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function CapabilityBadge({ label, bg, fg }: { label: string; bg: string; fg: string }) {
  return (
    <View sx={{ backgroundColor: bg, borderRadius: 6, px: 6, py: 2 }}>
      <Text sx={{ fontSize: 10, fontWeight: '600', color: fg }}>{label}</Text>
    </View>
  );
}
