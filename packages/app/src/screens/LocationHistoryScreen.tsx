import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'dripsy';
import { TextInput, ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import {
  useGetLocationHistoryQuery,
  useSaveLocationHistoryMutation,
  GetLocationHistoryDocument,
} from '../generated/graphql';

// ============================================================================
// Constants
// ============================================================================

const RESIDENCE_TYPES = [
  { label: 'House', value: 'house' },
  { label: 'Apartment', value: 'apartment' },
  { label: 'Condo', value: 'condo' },
];

const WATER_SOURCES = [
  { label: 'Municipal', value: 'municipal' },
  { label: 'Well', value: 'well' },
  { label: 'Spring', value: 'spring' },
  { label: 'Unknown', value: 'unknown' },
];

const LIFE_STAGES = [
  { label: 'Childhood', value: 'childhood' },
  { label: 'Adolescence', value: 'adolescence' },
  { label: 'Young Adult', value: 'young_adult' },
  { label: 'Adult', value: 'adult' },
];

// ============================================================================
// Component
// ============================================================================

export function LocationHistoryScreen() {
  const { data, loading } = useGetLocationHistoryQuery({ errorPolicy: 'ignore' });
  const [saveLocation, { loading: saving }] = useSaveLocationHistoryMutation({
    refetchQueries: [{ query: GetLocationHistoryDocument }],
  });

  // Form state
  const [zipCode, setZipCode] = useState('');
  const [state, setState] = useState('');
  const [residenceType, setResidenceType] = useState<string | null>(null);
  const [waterSource, setWaterSource] = useState<string | null>(null);
  const [agriculturalProximity, setAgriculturalProximity] = useState(false);
  const [selectedLifeStages, setSelectedLifeStages] = useState<string[]>([]);
  const [durationMonths, setDurationMonths] = useState('');
  const [moveInDate, setMoveInDate] = useState('');
  const [moveOutDate, setMoveOutDate] = useState('');
  const [nearbyIndustry, setNearbyIndustry] = useState('');

  const locations = data?.locationHistory ?? [];

  const toggleLifeStage = (stage: string) => {
    setSelectedLifeStages((prev) =>
      prev.includes(stage) ? prev.filter((s) => s !== stage) : [...prev, stage]
    );
  };

  const canSubmit = zipCode.trim().length >= 5 && state.trim().length === 2;

  const handleSave = () => {
    if (!canSubmit || saving) return;
    saveLocation({
      variables: {
        locations: [{
          zipCode: zipCode.trim(),
          state: state.trim().toUpperCase(),
          residenceType: residenceType ?? undefined,
          waterSource: waterSource ?? undefined,
          agriculturalProximity,
          lifeStages: selectedLifeStages.length > 0 ? selectedLifeStages : undefined,
          durationMonths: durationMonths ? parseInt(durationMonths, 10) : undefined,
          moveInDate: moveInDate.trim() || undefined,
          moveOutDate: moveOutDate.trim() || undefined,
          nearbyIndustry: nearbyIndustry.trim() ? [nearbyIndustry.trim()] : undefined,
        }],
      },
    }).then(() => {
      setZipCode('');
      setState('');
      setResidenceType(null);
      setWaterSource(null);
      setAgriculturalProximity(false);
      setSelectedLifeStages([]);
      setDurationMonths('');
      setMoveInDate('');
      setMoveOutDate('');
      setNearbyIndustry('');
    }).catch(() => {
      // Error handled by Apollo
    });
  };

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          Location History
        </Text>
        <View sx={{ mt: '$8', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <ActivityIndicator size="small" />
          <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>Loading location history...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        {/* Back link */}
        <Link href="/prevent/risk">
          <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$2', mb: '$4' }}>
            <Text sx={{ fontSize: 14, color: 'blue600' }}>{'\u2190'} Back to Risk Assessment</Text>
          </View>
        </Link>

        {/* Header */}
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          Location History
        </Text>
        <Text sx={{ mt: '$2', fontSize: 16, color: '$mutedForeground', lineHeight: 24 }}>
          Help us understand your environmental exposure history
        </Text>

        {/* ================================================================ */}
        {/* Why we ask */}
        {/* ================================================================ */}
        <View sx={{
          mt: '$6',
          backgroundColor: '#F0F9FF',
          borderWidth: 1,
          borderColor: '#BAE6FD',
          borderRadius: 12,
          p: '$5',
        }}>
          <Text sx={{ fontSize: 15, fontWeight: '600', color: '#0C4A6E' }}>
            Why we ask about location
          </Text>
          <Text sx={{ mt: '$2', fontSize: 13, color: '#075985', lineHeight: 20 }}>
            Where you have lived can influence your environmental exposures over time.
            Factors like water quality, proximity to industrial facilities, agricultural
            chemical use, and regional pollution levels have been studied as potential
            contributors to cancer risk. By understanding your residential history, we
            can provide more complete risk modeling.
          </Text>
          <View sx={{
            mt: '$3',
            borderTopWidth: 1,
            borderTopColor: '#BAE6FD',
            pt: '$3',
          }}>
            <Text sx={{ fontSize: 12, color: '#0369A1', fontWeight: '500' }}>
              Your privacy is protected
            </Text>
            <Text sx={{ mt: '$1', fontSize: 12, color: '#075985', lineHeight: 18 }}>
              Location data is stored securely and never shared in identifiable form.
              We use ZIP codes (not exact addresses) and only analyze aggregate
              environmental data for the area. You can delete any entry at any time.
            </Text>
          </View>
        </View>

        {/* ================================================================ */}
        {/* Add Location Form */}
        {/* ================================================================ */}
        <View sx={{
          mt: '$8',
          borderWidth: 1,
          borderColor: '$border',
          borderRadius: 16,
          p: '$6',
          backgroundColor: '#FAFAFA',
        }}>
          <Text sx={{ fontSize: 18, fontWeight: '600', color: '$foreground' }}>
            Add a location
          </Text>
          <Text sx={{ mt: '$1', fontSize: 13, color: '$mutedForeground' }}>
            Add each place you have lived for 6 months or more
          </Text>

          <View sx={{ mt: '$5', gap: '$5' }}>
            {/* ZIP Code + State row */}
            <View sx={{ flexDirection: 'row', gap: '$3' }}>
              <View sx={{ flex: 2 }}>
                <FormField label="ZIP Code *">
                  <TextInput
                    value={zipCode}
                    onChangeText={setZipCode}
                    placeholder="e.g. 44195"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="number-pad"
                    maxLength={5}
                    style={inputStyle}
                  />
                </FormField>
              </View>
              <View sx={{ flex: 1 }}>
                <FormField label="State *">
                  <TextInput
                    value={state}
                    onChangeText={(v) => setState(v.toUpperCase())}
                    placeholder="OH"
                    placeholderTextColor="#9CA3AF"
                    maxLength={2}
                    autoCapitalize="characters"
                    style={inputStyle}
                  />
                </FormField>
              </View>
            </View>

            {/* Move-in / Move-out dates */}
            <View sx={{ flexDirection: 'row', gap: '$3' }}>
              <View sx={{ flex: 1 }}>
                <FormField label="Move-in date">
                  <TextInput
                    value={moveInDate}
                    onChangeText={setMoveInDate}
                    placeholder="e.g. 1995 or Jan 1995"
                    placeholderTextColor="#9CA3AF"
                    style={inputStyle}
                  />
                </FormField>
              </View>
              <View sx={{ flex: 1 }}>
                <FormField label="Move-out date">
                  <TextInput
                    value={moveOutDate}
                    onChangeText={setMoveOutDate}
                    placeholder="e.g. 2003 or current"
                    placeholderTextColor="#9CA3AF"
                    style={inputStyle}
                  />
                </FormField>
              </View>
            </View>

            {/* Duration months */}
            <FormField label="Duration (months)">
              <TextInput
                value={durationMonths}
                onChangeText={setDurationMonths}
                placeholder="e.g. 48"
                placeholderTextColor="#9CA3AF"
                keyboardType="number-pad"
                style={inputStyle}
              />
            </FormField>

            {/* Residence type */}
            <View>
              <Text sx={{ fontSize: 13, fontWeight: '600', color: '$foreground', mb: '$2' }}>
                Residence type
              </Text>
              <View sx={{ flexDirection: 'row', gap: '$2', flexWrap: 'wrap' }}>
                {RESIDENCE_TYPES.map((opt) => (
                  <Pressable key={opt.value} onPress={() => setResidenceType(opt.value)}>
                    <View sx={{
                      px: '$4',
                      py: '$2',
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: residenceType === opt.value ? 'blue600' : '$border',
                      backgroundColor: residenceType === opt.value ? '#EFF6FF' : 'white',
                    }}>
                      <Text sx={{
                        fontSize: 14,
                        color: residenceType === opt.value ? 'blue600' : '$foreground',
                      }}>
                        {opt.label}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Water source */}
            <View>
              <Text sx={{ fontSize: 13, fontWeight: '600', color: '$foreground', mb: '$2' }}>
                Water source
              </Text>
              <View sx={{ flexDirection: 'row', gap: '$2', flexWrap: 'wrap' }}>
                {WATER_SOURCES.map((opt) => (
                  <Pressable key={opt.value} onPress={() => setWaterSource(opt.value)}>
                    <View sx={{
                      px: '$4',
                      py: '$2',
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: waterSource === opt.value ? 'blue600' : '$border',
                      backgroundColor: waterSource === opt.value ? '#EFF6FF' : 'white',
                    }}>
                      <Text sx={{
                        fontSize: 14,
                        color: waterSource === opt.value ? 'blue600' : '$foreground',
                      }}>
                        {opt.label}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Nearby industry hint */}
            <FormField label="Nearby industry (optional)">
              <TextInput
                value={nearbyIndustry}
                onChangeText={setNearbyIndustry}
                placeholder="e.g. chemical plant, oil refinery, agriculture"
                placeholderTextColor="#9CA3AF"
                style={inputStyle}
              />
              <Text sx={{ mt: '$1', fontSize: 11, color: '$mutedForeground' }}>
                List any industrial facilities, factories, or known pollution sources near this residence
              </Text>
            </FormField>

            {/* Agricultural proximity toggle */}
            <View sx={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View sx={{ flex: 1, mr: '$3' }}>
                <Text sx={{ fontSize: 13, fontWeight: '600', color: '$foreground' }}>
                  Near agricultural land
                </Text>
                <Text sx={{ fontSize: 12, color: '$mutedForeground', mt: 2 }}>
                  Within 1 mile of farms, orchards, or areas with pesticide/herbicide use
                </Text>
              </View>
              <Pressable onPress={() => setAgriculturalProximity(!agriculturalProximity)}>
                <View sx={{
                  width: 52,
                  height: 30,
                  borderRadius: 15,
                  backgroundColor: agriculturalProximity ? '#3B82F6' : '#D1D5DB',
                  justifyContent: 'center',
                  px: 3,
                }}>
                  <View sx={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: 'white',
                    alignSelf: agriculturalProximity ? 'flex-end' : 'flex-start',
                  }} />
                </View>
              </Pressable>
            </View>

            {/* Life stages multi-select */}
            <View>
              <Text sx={{ fontSize: 13, fontWeight: '600', color: '$foreground', mb: '$2' }}>
                Life stage(s) at this location
              </Text>
              <Text sx={{ fontSize: 12, color: '$mutedForeground', mb: '$2' }}>
                Select all that apply
              </Text>
              <View sx={{ flexDirection: 'row', gap: '$2', flexWrap: 'wrap' }}>
                {LIFE_STAGES.map((stage) => {
                  const selected = selectedLifeStages.includes(stage.value);
                  return (
                    <Pressable key={stage.value} onPress={() => toggleLifeStage(stage.value)}>
                      <View sx={{
                        px: '$4',
                        py: '$2',
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: selected ? '#7C3AED' : '$border',
                        backgroundColor: selected ? '#F5F3FF' : 'white',
                      }}>
                        <Text sx={{
                          fontSize: 14,
                          color: selected ? '#7C3AED' : '$foreground',
                        }}>
                          {stage.label}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Submit */}
            <Pressable onPress={handleSave} disabled={!canSubmit || saving}>
              <View sx={{
                backgroundColor: canSubmit && !saving ? 'blue600' : '#9CA3AF',
                borderRadius: 8,
                py: '$3',
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: '$2',
              }}>
                {saving && <ActivityIndicator size="small" color="white" />}
                <Text sx={{ fontSize: 14, fontWeight: '600', color: 'white' }}>
                  {saving ? 'Saving...' : 'Add Location'}
                </Text>
              </View>
            </Pressable>
          </View>
        </View>

        {/* ================================================================ */}
        {/* Existing locations */}
        {/* ================================================================ */}
        {locations.length > 0 && (
          <View sx={{ mt: '$8' }}>
            <SectionHeader title="Your Locations" />
            <View sx={{ mt: '$4', gap: '$3' }}>
              {locations.map((loc: any, i: number) => (
                <View key={loc.id ?? i} sx={{
                  borderWidth: 1,
                  borderColor: '$border',
                  borderRadius: 12,
                  p: '$4',
                }}>
                  <View sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text sx={{ fontSize: 16, fontWeight: '600', color: '$foreground' }}>
                      {loc.zipCode}, {loc.state}
                    </Text>
                    {loc.durationMonths && (
                      <View sx={{
                        backgroundColor: '#EFF6FF',
                        borderRadius: 12,
                        px: '$3',
                        py: 4,
                      }}>
                        <Text sx={{ fontSize: 12, fontWeight: '500', color: 'blue600' }}>
                          {loc.durationMonths < 12
                            ? `${loc.durationMonths} mo`
                            : `${Math.round(loc.durationMonths / 12)} yr`}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Metadata row */}
                  <View sx={{ mt: '$2', flexDirection: 'row', gap: '$2', flexWrap: 'wrap' }}>
                    {loc.residenceType && (
                      <View sx={{
                        backgroundColor: '#F3F4F6',
                        borderRadius: 6,
                        px: '$2',
                        py: 2,
                      }}>
                        <Text sx={{ fontSize: 11, color: '#4B5563' }}>
                          {loc.residenceType}
                        </Text>
                      </View>
                    )}
                    {loc.waterSource && (
                      <View sx={{
                        backgroundColor: '#F3F4F6',
                        borderRadius: 6,
                        px: '$2',
                        py: 2,
                      }}>
                        <Text sx={{ fontSize: 11, color: '#4B5563' }}>
                          {loc.waterSource} water
                        </Text>
                      </View>
                    )}
                    {loc.agriculturalProximity && (
                      <View sx={{
                        backgroundColor: '#FEF3C7',
                        borderRadius: 6,
                        px: '$2',
                        py: 2,
                      }}>
                        <Text sx={{ fontSize: 11, color: '#92400E' }}>
                          Near agriculture
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Life stages as pills */}
                  {loc.lifeStages && loc.lifeStages.length > 0 && (
                    <View sx={{ mt: '$2', flexDirection: 'row', gap: '$2', flexWrap: 'wrap' }}>
                      {loc.lifeStages.map((stage: string) => (
                        <View key={stage} sx={{
                          backgroundColor: '#F5F3FF',
                          borderRadius: 6,
                          px: '$2',
                          py: 2,
                        }}>
                          <Text sx={{ fontSize: 11, color: '#7C3AED' }}>
                            {stage.replace(/_/g, ' ')}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Date range */}
                  {(loc.moveInDate || loc.moveOutDate) && (
                    <Text sx={{ mt: '$2', fontSize: 12, color: '$mutedForeground' }}>
                      {loc.moveInDate ?? '?'} {'\u2014'} {loc.moveOutDate ?? 'present'}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ================================================================ */}
        {/* Privacy assurance */}
        {/* ================================================================ */}
        <View sx={{
          mt: '$8',
          backgroundColor: '#ECFDF5',
          borderWidth: 1,
          borderColor: '#A7F3D0',
          borderRadius: 12,
          p: '$5',
        }}>
          <Text sx={{ fontSize: 14, fontWeight: '600', color: '#065F46' }}>
            How we protect your location data
          </Text>
          <View sx={{ mt: '$3', gap: '$2' }}>
            {[
              'ZIP codes only — we never collect or store exact addresses',
              'Data is encrypted at rest and in transit',
              'Environmental analysis uses publicly available EPA and census data',
              'You can delete any location entry at any time',
              'Location data is never sold or shared in identifiable form',
            ].map((item, i) => (
              <View key={i} sx={{ flexDirection: 'row', gap: '$2', alignItems: 'flex-start' }}>
                <View sx={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#059669', mt: 7 }} />
                <Text sx={{ fontSize: 13, color: '#065F46', lineHeight: 20, flex: 1 }}>
                  {item}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ================================================================ */}
        {/* Disclaimer */}
        {/* ================================================================ */}
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
            Environmental exposure analysis is an emerging area of research. The presence of
            environmental factors does not mean they caused or contributed to any health condition.
            This information is used solely to provide a more complete picture as part of overall
            risk assessment and is not a substitute for professional medical advice.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function SectionHeader({ title }: { title: string }) {
  return (
    <View sx={{ borderBottomWidth: 1, borderBottomColor: '$border', pb: '$3' }}>
      <Text sx={{ fontSize: 20, fontWeight: 'bold', color: '$foreground' }}>{title}</Text>
    </View>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View>
      <Text sx={{ fontSize: 13, fontWeight: '600', color: '$foreground', mb: '$2' }}>
        {label}
      </Text>
      {children}
    </View>
  );
}

const inputStyle = {
  borderWidth: 1,
  borderColor: '#D1D5DB',
  borderRadius: 8,
  paddingHorizontal: 12,
  paddingVertical: 8,
  fontSize: 14,
  color: '#111827',
} as const;
