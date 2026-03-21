import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import {
  useGetSecondOpinionCentersQuery,
  useSelectSecondOpinionCenterMutation,
  GetSecondOpinionRequestDocument,
} from '../generated/graphql';
import { Picker } from '../components/Picker';

// ============================================================================
// Constants
// ============================================================================

const SUBSPECIALTY_OPTIONS = [
  { label: 'All Subspecialties', value: '' },
  { label: 'Breast', value: 'breast' },
  { label: 'Lung', value: 'lung' },
  { label: 'Colorectal', value: 'colorectal' },
  { label: 'Hematologic', value: 'hematologic' },
];

const NCI_COLORS: Record<string, { bg: string; fg: string }> = {
  comprehensive: { bg: '#EDE9FE', fg: '#7C3AED' },
  designated: { bg: '#DBEAFE', fg: '#1E40AF' },
};

// ============================================================================
// Component
// ============================================================================

export function SecondOpinionCentersScreen() {
  const [virtualOnly, setVirtualOnly] = useState(false);
  const [subspecialty, setSubspecialty] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, loading } = useGetSecondOpinionCentersQuery({
    variables: {
      virtual: virtualOnly || undefined,
      subspecialty: subspecialty || undefined,
    },
    errorPolicy: 'ignore',
  });

  const [selectCenter, { loading: selecting }] = useSelectSecondOpinionCenterMutation({
    refetchQueries: [{ query: GetSecondOpinionRequestDocument }],
    onCompleted: (result) => {
      if (result?.selectSecondOpinionCenter?.id) {
        setSelectedId(result.selectSecondOpinionCenter.centerId ?? null);
      }
    },
  });

  const centers = data?.secondOpinionCenters ?? [];

  if (loading && centers.length === 0) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          Second Opinion Centers
        </Text>
        <View sx={{ mt: '$8', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <ActivityIndicator size="small" />
          <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>Finding cancer centers near you...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          Second Opinion Centers
        </Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
          NCI-designated cancer centers and virtual consultation options
        </Text>

        {/* ============================================================= */}
        {/* Filters */}
        {/* ============================================================= */}
        <View sx={{ mt: '$5', gap: '$3' }}>
          {/* Virtual toggle pill */}
          <View sx={{ flexDirection: 'row', flexWrap: 'wrap', gap: '$2', alignItems: 'center' }}>
            <Pressable onPress={() => setVirtualOnly(v => !v)}>
              <View sx={{
                borderRadius: 20,
                px: '$3',
                py: '$2',
                borderWidth: 1,
                borderColor: virtualOnly ? 'blue600' : '$border',
                backgroundColor: virtualOnly ? '#DBEAFE' : 'transparent',
              }}>
                <Text sx={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: virtualOnly ? '#1E40AF' : '$mutedForeground',
                }}>
                  Virtual Available
                </Text>
              </View>
            </Pressable>
          </View>

          {/* Subspecialty picker */}
          <View sx={{ maxWidth: 280 }}>
            <Picker
              value={subspecialty}
              onValueChange={setSubspecialty}
              options={SUBSPECIALTY_OPTIONS}
            />
          </View>
        </View>

        {loading && (
          <View sx={{ mt: '$4', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <ActivityIndicator size="small" />
            <Text sx={{ fontSize: 13, color: '$mutedForeground' }}>Updating results...</Text>
          </View>
        )}

        {/* ============================================================= */}
        {/* No Results */}
        {/* ============================================================= */}
        {!loading && centers.length === 0 && (
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
              No centers match your filters
            </Text>
            <Text sx={{ mt: '$2', fontSize: 13, color: '$mutedForeground', textAlign: 'center' }}>
              Try adjusting your filters to see more results
            </Text>
            <Pressable onPress={() => { setVirtualOnly(false); setSubspecialty(''); }}>
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
          </View>
        )}

        {/* ============================================================= */}
        {/* Center Cards */}
        {/* ============================================================= */}
        <View sx={{ mt: '$4', gap: '$4' }}>
          {centers.map((center: any) => {
            const nciColors = NCI_COLORS[center.nciDesignation] ?? NCI_COLORS.designated;
            const isSelected = selectedId === center.id;

            return (
              <View key={center.id} sx={{
                borderWidth: 1,
                borderColor: isSelected ? '#BBF7D0' : '$border',
                backgroundColor: isSelected ? '#F0FDF4' : undefined,
                borderRadius: 12,
                p: '$5',
              }}>
                {/* Header */}
                <View sx={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}>
                  <View sx={{ flex: 1, mr: '$3' }}>
                    <Text sx={{ fontSize: 16, fontWeight: '600', color: '$foreground' }}>
                      {center.name}
                    </Text>
                    <Text sx={{ mt: '$1', fontSize: 13, color: '$mutedForeground' }}>
                      {center.city}, {center.state}
                    </Text>
                  </View>
                  {center.distance != null && (
                    <View sx={{
                      backgroundColor: '#DBEAFE',
                      borderRadius: 12,
                      px: '$2',
                      py: 3,
                    }}>
                      <Text sx={{ fontSize: 11, fontWeight: '600', color: '#1E40AF' }}>
                        {center.distance.toFixed(1)} mi
                      </Text>
                    </View>
                  )}
                </View>

                {/* Badges row */}
                <View sx={{ mt: '$3', flexDirection: 'row', flexWrap: 'wrap', gap: '$1' }}>
                  {/* NCI designation */}
                  {center.nciDesignation && (
                    <View sx={{
                      backgroundColor: nciColors.bg,
                      borderRadius: 6,
                      px: 6,
                      py: 2,
                    }}>
                      <Text sx={{ fontSize: 10, fontWeight: '600', color: nciColors.fg }}>
                        NCI {center.nciDesignation}
                      </Text>
                    </View>
                  )}
                  {/* Virtual badge */}
                  {center.offersVirtual && (
                    <View sx={{
                      backgroundColor: '#DCFCE7',
                      borderRadius: 6,
                      px: 6,
                      py: 2,
                    }}>
                      <Text sx={{ fontSize: 10, fontWeight: '600', color: '#166534' }}>
                        Virtual Available
                      </Text>
                    </View>
                  )}
                  {/* Pathology re-review */}
                  {center.pathologyReReview && (
                    <View sx={{
                      backgroundColor: '#F0F9FF',
                      borderRadius: 6,
                      px: 6,
                      py: 2,
                    }}>
                      <Text sx={{ fontSize: 10, fontWeight: '600', color: '#0C4A6E' }}>
                        {'\u2713'} Pathology Re-Review
                      </Text>
                    </View>
                  )}
                  {/* Financial assistance */}
                  {center.financialAssistance && (
                    <View sx={{
                      backgroundColor: '#FEF3C7',
                      borderRadius: 6,
                      px: 6,
                      py: 2,
                    }}>
                      <Text sx={{ fontSize: 10, fontWeight: '600', color: '#92400E' }}>
                        Financial Assistance
                      </Text>
                    </View>
                  )}
                </View>

                {/* Details */}
                <View sx={{ mt: '$3', gap: '$1' }}>
                  {center.offersVirtual && center.virtualPlatform && (
                    <Text sx={{ fontSize: 12, color: '#166534' }}>
                      Virtual platform: {center.virtualPlatform}
                    </Text>
                  )}
                  {center.averageWaitDays != null && (
                    <Text sx={{ fontSize: 12, color: '$mutedForeground' }}>
                      ~{center.averageWaitDays} days average wait
                    </Text>
                  )}
                </View>

                {/* Contact */}
                <View sx={{ mt: '$3', gap: '$1' }}>
                  {center.phone && (
                    <Text sx={{ fontSize: 13, color: 'blue600' }}>
                      {center.phone}
                    </Text>
                  )}
                  {center.website && (
                    <Text sx={{ fontSize: 12, color: '$mutedForeground' }}>
                      {center.website}
                    </Text>
                  )}
                </View>

                {/* Select button */}
                {isSelected ? (
                  <View sx={{
                    mt: '$3',
                    backgroundColor: '#DCFCE7',
                    borderRadius: 8,
                    py: '$3',
                    alignItems: 'center',
                  }}>
                    <Text sx={{ fontSize: 13, fontWeight: '600', color: '#166534' }}>
                      {'\u2713'} Center selected
                    </Text>
                  </View>
                ) : (
                  <Pressable
                    onPress={() => {
                      selectCenter({
                        variables: {
                          input: {
                            centerId: center.id,
                            isVirtual: center.offersVirtual ?? false,
                          },
                        },
                      });
                    }}
                    disabled={selecting}
                  >
                    <View sx={{
                      mt: '$3',
                      backgroundColor: selecting ? '#9CA3AF' : 'blue600',
                      borderRadius: 8,
                      py: '$3',
                      alignItems: 'center',
                    }}>
                      <Text sx={{ fontSize: 13, fontWeight: '600', color: 'white' }}>
                        {selecting ? 'Selecting...' : 'Select this center'}
                      </Text>
                    </View>
                  </Pressable>
                )}
              </View>
            );
          })}
        </View>

        {/* ============================================================= */}
        {/* Navigation */}
        {/* ============================================================= */}
        <View sx={{ mt: '$6', flexDirection: 'row', flexWrap: 'wrap', gap: '$3' }}>
          <Link href="/second-opinion">
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
          <Link href="/second-opinion/packet">
            <View sx={{
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '$border',
              px: '$4',
              py: '$3',
            }}>
              <Text sx={{ fontSize: 13, fontWeight: '500', color: '$foreground' }}>
                Record Packet {'\u2192'}
              </Text>
            </View>
          </Link>
        </View>

        {/* ============================================================= */}
        {/* Disclaimer */}
        {/* ============================================================= */}
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
            Center listings are for informational purposes. IISH does not endorse specific
            centers or providers. Always verify insurance acceptance, wait times, and availability
            directly with the center.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
