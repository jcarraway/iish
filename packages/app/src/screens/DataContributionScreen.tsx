import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import {
  useGetDataConsentQuery,
  useUpdateDataConsentMutation,
  GetDataConsentDocument,
} from '../generated/graphql';

// ============================================================================
// Constants
// ============================================================================

interface ConsentLevel {
  level: number;
  title: string;
  description: string;
  borderColor: string;
  activeBg: string;
  activeFg: string;
  included: string[];
  notIncluded: string[];
}

const CONSENT_LEVELS: ConsentLevel[] = [
  {
    level: 1,
    title: 'Personal Use Only',
    description: 'Your data stays on your account only. No data is shared with anyone for any purpose.',
    borderColor: '#9CA3AF',
    activeBg: '#F9FAFB',
    activeFg: '#374151',
    included: [
      'Risk assessment results visible only to you',
      'Location history used only for your personal risk model',
      'All data deletable at any time',
    ],
    notIncluded: [
      'No aggregate statistics shared',
      'No research contribution',
      'No environmental research use',
    ],
  },
  {
    level: 2,
    title: 'Anonymized Statistics',
    description: 'Aggregate statistics only — no individual data is ever shared. Helps improve platform accuracy for everyone.',
    borderColor: '#3B82F6',
    activeBg: '#EFF6FF',
    activeFg: '#1E40AF',
    included: [
      'Everything in Level 1',
      'Anonymized risk factor counts (e.g., "X users have BRCA1")',
      'De-identified age and demographic distributions',
      'Platform accuracy improvement through aggregate trends',
    ],
    notIncluded: [
      'No individual data shared',
      'No research data exports',
      'No location data shared',
    ],
  },
  {
    level: 3,
    title: 'Research Contribution',
    description: 'De-identified data shared with approved academic researchers studying breast cancer prevention.',
    borderColor: '#7C3AED',
    activeBg: '#F5F3FF',
    activeFg: '#5B21B6',
    included: [
      'Everything in Level 2',
      'De-identified risk profiles shared with approved researchers',
      'Genetic risk factors (without identifying information)',
      'Treatment history patterns (anonymized)',
      'All research must pass IRB review',
    ],
    notIncluded: [
      'No location data shared',
      'No direct contact by researchers',
      'Your identity is never disclosed',
    ],
  },
  {
    level: 4,
    title: 'Full Contribution',
    description: 'De-identified data including location history for environmental exposure research. Maximum research impact.',
    borderColor: '#059669',
    activeBg: '#ECFDF5',
    activeFg: '#065F46',
    included: [
      'Everything in Level 3',
      'De-identified ZIP code data for environmental mapping',
      'Water source and industrial proximity patterns',
      'Agricultural exposure correlations',
      'Supports EPA and environmental health studies',
    ],
    notIncluded: [
      'Exact addresses are never shared (ZIP code only)',
      'Your identity is never disclosed',
      'You can downgrade or delete data at any time',
    ],
  },
];

// ============================================================================
// Component
// ============================================================================

export function DataContributionScreen() {
  const { data, loading } = useGetDataConsentQuery({ errorPolicy: 'ignore' });
  const [updateConsent, { loading: saving }] = useUpdateDataConsentMutation({
    refetchQueries: [{ query: GetDataConsentDocument }],
  });

  const currentLevel = data?.dataConsent?.consentLevel ?? 1;
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  // Use server value until user selects something
  const activeLevel = selectedLevel ?? currentLevel;

  const hasChanges = selectedLevel !== null && selectedLevel !== currentLevel;

  const handleSave = () => {
    if (!hasChanges || saving) return;
    updateConsent({
      variables: {
        level: activeLevel,
      },
    }).then(() => {
      setSelectedLevel(null);
    }).catch(() => {
      // Error handled by Apollo
    });
  };

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          Data Contribution
        </Text>
        <View sx={{ mt: '$8', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <ActivityIndicator size="small" />
          <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>Loading preferences...</Text>
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
          Data Contribution
        </Text>
        <Text sx={{ mt: '$2', fontSize: 16, color: '$mutedForeground', lineHeight: 24 }}>
          Choose how your data can help advance breast cancer prevention research
        </Text>

        {/* ================================================================ */}
        {/* Consent Level Cards */}
        {/* ================================================================ */}
        <View sx={{ mt: '$8', gap: '$4' }}>
          {CONSENT_LEVELS.map((level) => {
            const isSelected = activeLevel === level.level;
            return (
              <Pressable key={level.level} onPress={() => setSelectedLevel(level.level)}>
                <View sx={{
                  borderWidth: 2,
                  borderColor: isSelected ? level.borderColor : '$border',
                  backgroundColor: isSelected ? level.activeBg : undefined,
                  borderRadius: 16,
                  p: '$5',
                }}>
                  {/* Header row */}
                  <View sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$3' }}>
                      <View sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: isSelected ? level.borderColor : '#E5E7EB',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <Text sx={{
                          fontSize: 14,
                          fontWeight: 'bold',
                          color: isSelected ? 'white' : '#6B7280',
                        }}>
                          {level.level}
                        </Text>
                      </View>
                      <Text sx={{
                        fontSize: 16,
                        fontWeight: '600',
                        color: isSelected ? level.activeFg : '$foreground',
                      }}>
                        {level.title}
                      </Text>
                    </View>
                    {isSelected && (
                      <View sx={{
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        backgroundColor: level.borderColor,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <Text sx={{ fontSize: 14, color: 'white', fontWeight: 'bold' }}>
                          {'\u2713'}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Description */}
                  <Text sx={{
                    mt: '$3',
                    fontSize: 14,
                    color: isSelected ? level.activeFg : '$mutedForeground',
                    lineHeight: 22,
                  }}>
                    {level.description}
                  </Text>

                  {/* Data breakdown */}
                  <View sx={{ mt: '$4', gap: '$2' }}>
                    <Text sx={{ fontSize: 12, fontWeight: '600', color: isSelected ? level.activeFg : '$foreground' }}>
                      What is included:
                    </Text>
                    {level.included.map((item, i) => (
                      <View key={i} sx={{ flexDirection: 'row', gap: '$2', alignItems: 'flex-start' }}>
                        <Text sx={{ fontSize: 12, color: '#059669', mt: 1 }}>{'\u2713'}</Text>
                        <Text sx={{ fontSize: 12, color: isSelected ? level.activeFg : '$foreground', lineHeight: 18, flex: 1 }}>
                          {item}
                        </Text>
                      </View>
                    ))}
                  </View>

                  <View sx={{ mt: '$3', gap: '$2' }}>
                    <Text sx={{ fontSize: 12, fontWeight: '600', color: '$mutedForeground' }}>
                      What is not included:
                    </Text>
                    {level.notIncluded.map((item, i) => (
                      <View key={i} sx={{ flexDirection: 'row', gap: '$2', alignItems: 'flex-start' }}>
                        <Text sx={{ fontSize: 12, color: '#9CA3AF', mt: 1 }}>{'\u2014'}</Text>
                        <Text sx={{ fontSize: 12, color: '$mutedForeground', lineHeight: 18, flex: 1 }}>
                          {item}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* ================================================================ */}
        {/* Save Button */}
        {/* ================================================================ */}
        <Pressable onPress={handleSave} disabled={!hasChanges || saving}>
          <View sx={{
            mt: '$6',
            backgroundColor: hasChanges && !saving ? 'blue600' : '#9CA3AF',
            borderRadius: 8,
            py: '$3',
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: '$2',
          }}>
            {saving && <ActivityIndicator size="small" color="white" />}
            <Text sx={{ fontSize: 14, fontWeight: '600', color: 'white' }}>
              {saving ? 'Saving...' : hasChanges ? 'Save Preference' : 'No Changes'}
            </Text>
          </View>
        </Pressable>

        {/* ================================================================ */}
        {/* Contribution Impact */}
        {/* ================================================================ */}
        <View sx={{
          mt: '$8',
          backgroundColor: '#F5F3FF',
          borderWidth: 1,
          borderColor: '#DDD6FE',
          borderRadius: 12,
          p: '$5',
          alignItems: 'center',
        }}>
          <Text sx={{ fontSize: 16, fontWeight: '600', color: '#5B21B6' }}>
            Your contribution matters
          </Text>
          <Text sx={{
            mt: '$2',
            fontSize: 14,
            color: '#7C3AED',
            textAlign: 'center',
            lineHeight: 22,
          }}>
            Join others contributing to breast cancer prevention research.
            Every data point helps researchers understand risk patterns and develop
            better prevention strategies.
          </Text>
          <View sx={{ mt: '$3', flexDirection: 'row', gap: '$6' }}>
            <View sx={{ alignItems: 'center' }}>
              <Text sx={{ fontSize: 24, fontWeight: 'bold', color: '#5B21B6' }}>--</Text>
              <Text sx={{ fontSize: 11, color: '#7C3AED' }}>Contributors</Text>
            </View>
            <View sx={{ alignItems: 'center' }}>
              <Text sx={{ fontSize: 24, fontWeight: 'bold', color: '#5B21B6' }}>--</Text>
              <Text sx={{ fontSize: 11, color: '#7C3AED' }}>Studies Supported</Text>
            </View>
          </View>
        </View>

        {/* ================================================================ */}
        {/* Privacy Policy Link */}
        {/* ================================================================ */}
        <View sx={{
          mt: '$6',
          borderWidth: 1,
          borderColor: '$border',
          borderRadius: 12,
          p: '$4',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <View sx={{ flex: 1 }}>
            <Text sx={{ fontSize: 14, fontWeight: '500', color: '$foreground' }}>
              Full Privacy Policy
            </Text>
            <Text sx={{ fontSize: 12, color: '$mutedForeground', mt: 2 }}>
              Read our complete data handling and privacy practices
            </Text>
          </View>
          <Text sx={{ fontSize: 14, color: 'blue600' }}>{'\u2192'}</Text>
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
            You can change your consent level or delete your data at any time. Changes
            take effect immediately for future data use. De-identified data already included
            in published aggregate studies cannot be individually removed, as it contains no
            identifying information. This platform is not a medical device and does not
            provide medical advice.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
