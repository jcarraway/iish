import { View, Text, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import {
  useGetPreservationOptionsQuery,
  useGetFertilityAssessmentQuery,
} from '../generated/graphql';

// ============================================================================
// Component
// ============================================================================

export function FertilityOptionsScreen() {
  const { data: optionsData, loading: optionsLoading } = useGetPreservationOptionsQuery({ errorPolicy: 'ignore' });
  const { data: assessmentData, loading: assessmentLoading } = useGetFertilityAssessmentQuery({ errorPolicy: 'ignore' });

  const loading = optionsLoading || assessmentLoading;
  const options = optionsData?.preservationOptions ?? [];
  const assessment = assessmentData?.fertilityAssessment;
  const windowClosed = assessment?.windowStatus === 'closed';

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          Preservation Options
        </Text>
        <View sx={{ mt: '$8', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <ActivityIndicator size="small" />
          <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>Loading options...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          Preservation Options
        </Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
          Compare fertility preservation methods based on your situation
        </Text>

        {/* Window closed message */}
        {windowClosed && (
          <View sx={{
            mt: '$6',
            borderRadius: 12,
            borderWidth: 2,
            borderColor: '#FCA5A5',
            backgroundColor: '#FEF2F2',
            p: '$5',
          }}>
            <Text sx={{ fontSize: 15, fontWeight: '600', color: '#991B1B' }}>
              While the stimulation window has passed, talk to your oncologist about GnRH agonist
              and future options
            </Text>
            <Text sx={{ mt: '$2', fontSize: 13, color: '#B91C1C', lineHeight: 20 }}>
              Some options like GnRH agonist can still be used during treatment to protect
              ovarian function. Post-treatment fertility may also be possible depending on
              your specific situation.
            </Text>
          </View>
        )}

        {/* Options comparison cards */}
        <View sx={{ mt: '$6', gap: '$4' }}>
          {options.map((option) => (
            <View key={option.key} sx={{
              borderWidth: 1,
              borderColor: option.available ? '$border' : '#E5E7EB',
              borderRadius: 12,
              overflow: 'hidden',
              opacity: option.available ? 1 : 0.7,
            }}>
              {/* Header with availability */}
              <View sx={{
                backgroundColor: option.available ? '#F8FAFC' : '#F3F4F6',
                p: '$4',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottomWidth: 1,
                borderBottomColor: '$border',
              }}>
                <Text sx={{ fontSize: 16, fontWeight: 'bold', color: '$foreground', flex: 1 }}>
                  {option.label}
                </Text>
                <View sx={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: '$2',
                }}>
                  <View sx={{
                    width: 20, height: 20, borderRadius: 10,
                    backgroundColor: option.available ? '#DCFCE7' : '#FEE2E2',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Text sx={{
                      fontSize: 12,
                      fontWeight: 'bold',
                      color: option.available ? '#166534' : '#991B1B',
                    }}>
                      {option.available ? '\u2713' : '\u2717'}
                    </Text>
                  </View>
                  <Text sx={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: option.available ? '#166534' : '#991B1B',
                  }}>
                    {option.available ? 'Available' : 'Not available'}
                  </Text>
                </View>
              </View>

              {/* Details */}
              <View sx={{ p: '$5' }}>
                <View sx={{ gap: '$4' }}>
                  {/* Timing */}
                  <DetailRow
                    label="Timing"
                    value={option.timing}
                    icon="clock"
                  />

                  {/* Cost */}
                  <DetailRow
                    label="Estimated Cost"
                    value={option.cost}
                    icon="dollar"
                  />

                  {/* Success Rate */}
                  <DetailRow
                    label="Success Rate"
                    value={option.successRate}
                    icon="chart"
                  />

                  {/* Contraindications */}
                  {option.contraindications.length > 0 && (
                    <View>
                      <Text sx={{ fontSize: 12, fontWeight: '600', color: '$mutedForeground', mb: '$2' }}>
                        Contraindications
                      </Text>
                      <View sx={{ gap: '$1' }}>
                        {option.contraindications.map((ci, i) => (
                          <View key={i} sx={{ flexDirection: 'row', gap: '$2', alignItems: 'flex-start' }}>
                            <View sx={{
                              width: 6, height: 6, borderRadius: 3,
                              backgroundColor: '#F59E0B', mt: 6,
                            }} />
                            <Text sx={{ fontSize: 13, color: '$foreground', lineHeight: 20, flex: 1 }}>
                              {ci}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* ER+ Note */}
                  {option.erPositiveNote && (
                    <View sx={{
                      backgroundColor: '#FDF2F8',
                      borderWidth: 1,
                      borderColor: '#FBCFE8',
                      borderRadius: 8,
                      p: '$3',
                    }}>
                      <Text sx={{ fontSize: 12, fontWeight: '600', color: '#9D174D' }}>
                        ER+ Note
                      </Text>
                      <Text sx={{ mt: '$1', fontSize: 12, color: '#831843', lineHeight: 18 }}>
                        {option.erPositiveNote}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* GnRH agonist note */}
        <View sx={{
          mt: '$6',
          backgroundColor: '#EEF2FF',
          borderWidth: 1,
          borderColor: '#C7D2FE',
          borderRadius: 12,
          p: '$5',
        }}>
          <Text sx={{ fontSize: 14, fontWeight: '600', color: '#3730A3' }}>
            About GnRH Agonist
          </Text>
          <Text sx={{ mt: '$2', fontSize: 13, color: '#4338CA', lineHeight: 20 }}>
            GnRH agonist (such as Lupron) is used ALONGSIDE other preservation methods, not as a
            replacement. It puts the ovaries into a temporary dormant state during chemotherapy to
            help protect them. It can be started even on the day treatment begins, making it an
            option when the stimulation window has passed.
          </Text>
          <Text sx={{ mt: '$2', fontSize: 12, color: '#6366F1', lineHeight: 18 }}>
            Discuss with your oncologist whether adding GnRH agonist is appropriate for your
            treatment plan.
          </Text>
        </View>

        {/* No options state */}
        {options.length === 0 && (
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
              No preservation options available yet
            </Text>
            <Text sx={{ mt: '$2', fontSize: 13, color: '$mutedForeground', textAlign: 'center', maxWidth: 360 }}>
              Complete your fertility risk assessment first to see personalized preservation options.
            </Text>
            <Link href="/fertility">
              <View sx={{
                mt: '$4',
                backgroundColor: 'blue600',
                borderRadius: 8,
                px: '$4',
                py: '$3',
              }}>
                <Text sx={{ fontSize: 13, fontWeight: '600', color: 'white' }}>
                  Go to assessment
                </Text>
              </View>
            </Link>
          </View>
        )}

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
          <Link href="/fertility/providers">
            <View sx={{
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '$border',
              px: '$4',
              py: '$3',
            }}>
              <Text sx={{ fontSize: 13, fontWeight: '500', color: '$foreground' }}>
                Find Providers {'\u2192'}
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
            Costs, success rates, and timelines are estimates and can vary significantly based on
            your location, provider, and individual circumstances. Always discuss options and costs
            directly with a reproductive endocrinologist.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function DetailRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: 'clock' | 'dollar' | 'chart';
}) {
  const iconMap: Record<string, string> = {
    clock: '\u23F0',
    dollar: '\uD83D\uDCB0',
    chart: '\uD83D\uDCC8',
  };

  return (
    <View sx={{ flexDirection: 'row', alignItems: 'flex-start', gap: '$3' }}>
      <Text sx={{ fontSize: 14, mt: 1 }}>{iconMap[icon]}</Text>
      <View sx={{ flex: 1 }}>
        <Text sx={{ fontSize: 12, fontWeight: '600', color: '$mutedForeground' }}>
          {label}
        </Text>
        <Text sx={{ fontSize: 14, color: '$foreground', mt: 2, lineHeight: 20 }}>
          {value}
        </Text>
      </View>
    </View>
  );
}
