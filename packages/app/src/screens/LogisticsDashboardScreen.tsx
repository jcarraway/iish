import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import { useGetTrialLogisticsAssessmentsQuery } from '../generated/graphql';

// ============================================================================
// Constants
// ============================================================================

const FEASIBILITY_COLORS: Record<string, { bg: string; fg: string; label: string }> = {
  straightforward: { bg: '#DCFCE7', fg: '#166534', label: 'Straightforward' },
  manageable: { bg: '#FEF3C7', fg: '#92400E', label: 'Manageable' },
  challenging: { bg: '#FED7AA', fg: '#C2410C', label: 'Challenging' },
  very_challenging: { bg: '#FEE2E2', fg: '#991B1B', label: 'Very Challenging' },
};

// ============================================================================
// Component
// ============================================================================

export function LogisticsDashboardScreen() {
  const { data, loading } = useGetTrialLogisticsAssessmentsQuery({ errorPolicy: 'ignore' });
  const assessments = data?.trialLogisticsAssessments ?? [];

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          Trial Logistics
        </Text>
        <View sx={{ mt: '$8', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <ActivityIndicator size="small" />
          <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>Loading your logistics assessments...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          Trial Logistics
        </Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
          Understand the practical costs and logistics of participating in clinical trials
        </Text>

        {/* Quick links */}
        <View sx={{ mt: '$6', flexDirection: 'row', flexWrap: 'wrap', gap: '$3' }}>
          <Link href="/logistics/programs">
            <View sx={{
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '$border',
              px: '$4',
              py: '$3',
              flexDirection: 'row',
              alignItems: 'center',
              gap: '$2',
            }}>
              <Text sx={{ fontSize: 13, fontWeight: '500', color: '$foreground' }}>
                Assistance Programs
              </Text>
            </View>
          </Link>
          <Link href="/logistics/applications">
            <View sx={{
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '$border',
              px: '$4',
              py: '$3',
              flexDirection: 'row',
              alignItems: 'center',
              gap: '$2',
            }}>
              <Text sx={{ fontSize: 13, fontWeight: '500', color: '$foreground' }}>
                My Applications
              </Text>
            </View>
          </Link>
        </View>

        {/* Empty state */}
        {assessments.length === 0 && (
          <View sx={{
            mt: '$8',
            borderWidth: 2,
            borderStyle: 'dashed',
            borderColor: '$border',
            borderRadius: 16,
            p: '$8',
            alignItems: 'center',
          }}>
            <Text sx={{ fontSize: 36 }}>{'\uD83D\uDE8C'}</Text>
            <Text sx={{ mt: '$3', fontSize: 20, fontWeight: '600', color: '$foreground', textAlign: 'center' }}>
              Assess logistics for your trial matches
            </Text>
            <Text sx={{
              mt: '$3',
              fontSize: 14,
              color: '$mutedForeground',
              textAlign: 'center',
              maxWidth: 480,
              lineHeight: 22,
            }}>
              Understanding the practical side of trial participation — travel, lodging, costs, and
              assistance programs — can make the difference between enrolling and not. Get a full
              logistics assessment for any of your matched trials.
            </Text>
            <Link href="/matches">
              <View sx={{
                mt: '$5',
                backgroundColor: 'blue600',
                borderRadius: 8,
                px: '$6',
                py: '$3',
              }}>
                <Text sx={{ fontSize: 14, fontWeight: '600', color: 'white' }}>
                  View your matches to get started
                </Text>
              </View>
            </Link>
          </View>
        )}

        {/* Assessed trials list */}
        {assessments.length > 0 && (
          <View sx={{ mt: '$6' }}>
            <SectionHeader title="Assessed Trials" />

            <View sx={{ mt: '$4', gap: '$3' }}>
              {assessments.map((assessment) => {
                const feasibility = FEASIBILITY_COLORS[assessment.feasibilityScore] ?? FEASIBILITY_COLORS.manageable;
                const truncatedId = assessment.matchId.length > 12
                  ? assessment.matchId.slice(0, 12) + '...'
                  : assessment.matchId;

                const estimatedOop = assessment.estimatedOutOfPocket != null
                  ? `$${Number(assessment.estimatedOutOfPocket).toLocaleString()}`
                  : null;

                let barrierCount = 0;
                try {
                  const barriers = typeof assessment.barriers === 'string'
                    ? JSON.parse(assessment.barriers)
                    : assessment.barriers;
                  if (Array.isArray(barriers)) {
                    barrierCount = barriers.length;
                  }
                } catch {
                  // ignore parse errors
                }

                return (
                  <Link key={assessment.matchId} href={`/logistics/assessment/${assessment.matchId}`}>
                    <View sx={{
                      borderWidth: 1,
                      borderColor: '$border',
                      borderRadius: 12,
                      p: '$5',
                    }}>
                      <View sx={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                      }}>
                        <View sx={{ flex: 1, mr: '$3' }}>
                          <Text sx={{ fontSize: 16, fontWeight: '600', color: '$foreground' }}>
                            Trial {truncatedId}
                          </Text>
                          <View sx={{ mt: '$2', gap: '$1' }}>
                            {assessment.distanceMiles != null && (
                              <Text sx={{ fontSize: 13, color: '$mutedForeground' }}>
                                {assessment.distanceMiles} miles away
                                {assessment.distanceMiles > 200 ? ' (fly)' : ' (drive)'}
                              </Text>
                            )}
                            {estimatedOop && (
                              <Text sx={{ fontSize: 13, color: '$mutedForeground' }}>
                                Est. out-of-pocket: {estimatedOop}
                              </Text>
                            )}
                            {barrierCount > 0 && (
                              <Text sx={{ fontSize: 13, color: '#C2410C' }}>
                                {barrierCount} barrier{barrierCount !== 1 ? 's' : ''} identified
                              </Text>
                            )}
                          </View>
                        </View>
                        <View sx={{
                          backgroundColor: feasibility.bg,
                          borderRadius: 12,
                          px: '$3',
                          py: 4,
                        }}>
                          <Text sx={{
                            fontSize: 11,
                            fontWeight: 'bold',
                            color: feasibility.fg,
                            textTransform: 'uppercase',
                          }}>
                            {feasibility.label}
                          </Text>
                        </View>
                      </View>

                      <Text sx={{ mt: '$3', fontSize: 12, color: 'blue600' }}>
                        View details {'\u2192'}
                      </Text>
                    </View>
                  </Link>
                );
              })}
            </View>
          </View>
        )}

        {/* Disclaimer */}
        <View sx={{
          mt: '$8',
          backgroundColor: '#FFFBEB',
          borderWidth: 1,
          borderColor: '#FDE68A',
          borderRadius: 12,
          p: '$5',
        }}>
          <Text sx={{ fontSize: 13, fontWeight: '600', color: '#92400E' }}>
            Estimates are approximate
          </Text>
          <Text sx={{ mt: '$2', fontSize: 12, color: '#78350F', lineHeight: 18 }}>
            All cost estimates, distances, and logistics assessments are approximate and based on
            available information. Actual costs may vary. Contact trial sites and assistance
            programs directly to verify details before making decisions.
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
