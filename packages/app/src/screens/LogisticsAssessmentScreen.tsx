import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import {
  useGetTrialLogisticsAssessmentQuery,
  useAssessTrialLogisticsMutation,
  useGenerateLogisticsPlanMutation,
  GetTrialLogisticsAssessmentsDocument,
} from '../generated/graphql';

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

export function LogisticsAssessmentScreen({ matchId }: { matchId: string }) {
  const { data, loading, refetch } = useGetTrialLogisticsAssessmentQuery({
    variables: { matchId },
  });
  const [assessLogistics, { loading: assessing }] = useAssessTrialLogisticsMutation({
    refetchQueries: [{ query: GetTrialLogisticsAssessmentsDocument }],
    onCompleted: () => refetch(),
  });
  const [generatePlan, { loading: generatingPlan }] = useGenerateLogisticsPlanMutation({
    onCompleted: () => refetch(),
  });

  const assessment = data?.trialLogisticsAssessment;

  // Collapsible plan sections
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});

  const toggleSection = (index: number) => {
    setExpandedSections((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          Logistics Assessment
        </Text>
        <View sx={{ mt: '$8', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <ActivityIndicator size="small" />
          <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>Loading assessment...</Text>
        </View>
      </View>
    );
  }

  // No assessment yet — offer to assess
  if (!assessment) {
    return (
      <ScrollView sx={{ flex: 1 }}>
        <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
          <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
            Logistics Assessment
          </Text>
          <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
            Understand the practical requirements for participating in this trial
          </Text>

          <View sx={{
            mt: '$8',
            borderWidth: 2,
            borderStyle: 'dashed',
            borderColor: '$border',
            borderRadius: 16,
            p: '$8',
            alignItems: 'center',
          }}>
            <Text sx={{ fontSize: 36 }}>{'\uD83D\uDCCB'}</Text>
            <Text sx={{ mt: '$3', fontWeight: '600', color: '$foreground', textAlign: 'center' }}>
              No logistics assessment yet
            </Text>
            <Text sx={{
              mt: '$2', fontSize: 14, color: '$mutedForeground',
              textAlign: 'center', maxWidth: 400,
            }}>
              We will analyze travel distance, estimated costs, potential barriers, and
              assistance programs you may be eligible for.
            </Text>
            <Pressable
              onPress={() => assessLogistics({ variables: { matchId } })}
              disabled={assessing}
            >
              <View sx={{
                mt: '$5',
                backgroundColor: assessing ? '#9CA3AF' : 'blue600',
                borderRadius: 8,
                px: '$6',
                py: '$3',
              }}>
                {assessing ? (
                  <View sx={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <ActivityIndicator color="white" size="small" />
                    <Text sx={{ fontSize: 14, fontWeight: '600', color: 'white' }}>
                      Analyzing logistics...
                    </Text>
                  </View>
                ) : (
                  <Text sx={{ fontSize: 14, fontWeight: '600', color: 'white' }}>
                    Assess logistics
                  </Text>
                )}
              </View>
            </Pressable>
          </View>

          {/* Navigation */}
          <View sx={{ mt: '$6', flexDirection: 'row', flexWrap: 'wrap', gap: '$3' }}>
            <Link href="/logistics">
              <View sx={{
                borderRadius: 10, borderWidth: 1, borderColor: '$border', px: '$4', py: '$3',
              }}>
                <Text sx={{ fontSize: 13, fontWeight: '500', color: '$foreground' }}>
                  {'\u2190'} Dashboard
                </Text>
              </View>
            </Link>
          </View>
        </View>
      </ScrollView>
    );
  }

  // Parse structured data
  const feasibility = FEASIBILITY_COLORS[assessment.feasibilityScore] ?? FEASIBILITY_COLORS.manageable;

  let costs: Record<string, number> = {};
  try {
    costs = typeof assessment.estimatedCosts === 'string'
      ? JSON.parse(assessment.estimatedCosts)
      : (assessment.estimatedCosts ?? {});
  } catch {
    // ignore
  }

  let barriers: string[] = [];
  try {
    const parsed = typeof assessment.barriers === 'string'
      ? JSON.parse(assessment.barriers)
      : assessment.barriers;
    if (Array.isArray(parsed)) barriers = parsed;
  } catch {
    // ignore
  }

  let matchedPrograms: Array<{ name: string; provider: string; coverage: string; eligible: boolean }> = [];
  try {
    const parsed = typeof assessment.matchedPrograms === 'string'
      ? JSON.parse(assessment.matchedPrograms)
      : assessment.matchedPrograms;
    if (Array.isArray(parsed)) matchedPrograms = parsed;
  } catch {
    // ignore
  }

  let planSections: Array<{ title: string; content: string; tips?: string[] }> = [];
  try {
    if (assessment.logisticsPlan) {
      const parsed = typeof assessment.logisticsPlan === 'string'
        ? JSON.parse(assessment.logisticsPlan)
        : assessment.logisticsPlan;
      if (Array.isArray(parsed)) planSections = parsed;
      else if (parsed?.sections && Array.isArray(parsed.sections)) planSections = parsed.sections;
    }
  } catch {
    // ignore
  }

  const costRows: Array<{ label: string; value: number }> = [];
  const costLabelMap: Record<string, string> = {
    travel: 'Travel',
    lodging: 'Lodging',
    meals: 'Meals',
    parking: 'Parking',
    per_visit: 'Per Visit',
    total: 'Total (est.)',
  };
  for (const [key, val] of Object.entries(costs)) {
    if (key !== 'total' && typeof val === 'number') {
      costRows.push({ label: costLabelMap[key] ?? key, value: val });
    }
  }
  const totalCost = typeof costs.total === 'number' ? costs.total : null;

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          Logistics Assessment
        </Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
          Trial {matchId.length > 16 ? matchId.slice(0, 16) + '...' : matchId}
        </Text>

        {/* ============================================================= */}
        {/* Distance Card */}
        {/* ============================================================= */}
        {assessment.distanceMiles != null && (
          <View sx={{
            mt: '$6',
            borderWidth: 1,
            borderColor: '$border',
            borderRadius: 12,
            p: '$5',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '$4',
          }}>
            <View sx={{
              width: 56, height: 56, borderRadius: 28,
              backgroundColor: '#DBEAFE',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Text sx={{ fontSize: 22, fontWeight: 'bold', color: '#1E40AF' }}>
                {assessment.distanceMiles > 999
                  ? `${(assessment.distanceMiles / 1000).toFixed(1)}k`
                  : assessment.distanceMiles}
              </Text>
            </View>
            <View sx={{ flex: 1 }}>
              <Text sx={{ fontSize: 15, fontWeight: '600', color: '$foreground' }}>
                {assessment.distanceMiles} miles to trial site
              </Text>
              <Text sx={{ fontSize: 13, color: '$mutedForeground', mt: '$1' }}>
                {assessment.distanceMiles > 200
                  ? 'Air travel likely required'
                  : 'Driveable distance'}
              </Text>
            </View>
          </View>
        )}

        {/* ============================================================= */}
        {/* Feasibility Badge */}
        {/* ============================================================= */}
        <View sx={{
          mt: '$4',
          borderRadius: 12,
          borderWidth: 2,
          borderColor: feasibility.bg,
          backgroundColor: feasibility.bg,
          p: '$5',
        }}>
          <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$3' }}>
            <Text sx={{ fontSize: 14, fontWeight: '600', color: feasibility.fg }}>
              Feasibility:
            </Text>
            <View sx={{
              backgroundColor: feasibility.fg,
              borderRadius: 20,
              px: '$4',
              py: '$2',
            }}>
              <Text sx={{ fontSize: 13, fontWeight: 'bold', color: 'white', textTransform: 'uppercase' }}>
                {feasibility.label}
              </Text>
            </View>
          </View>
        </View>

        {/* ============================================================= */}
        {/* Cost Breakdown */}
        {/* ============================================================= */}
        {costRows.length > 0 && (
          <View sx={{ mt: '$6' }}>
            <SectionHeader title="Estimated Costs" />

            <View sx={{
              mt: '$4',
              borderWidth: 1,
              borderColor: '$border',
              borderRadius: 12,
              p: '$5',
            }}>
              <View sx={{ gap: '$3' }}>
                {costRows.map((row) => (
                  <View key={row.label} sx={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <Text sx={{ fontSize: 14, color: '$foreground' }}>{row.label}</Text>
                    <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground' }}>
                      ${row.value.toLocaleString()}
                    </Text>
                  </View>
                ))}
                {totalCost != null && (
                  <View sx={{
                    borderTopWidth: 1,
                    borderTopColor: '$border',
                    pt: '$3',
                    mt: '$1',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <Text sx={{ fontSize: 15, fontWeight: 'bold', color: '$foreground' }}>
                      Estimated Total
                    </Text>
                    <Text sx={{ fontSize: 15, fontWeight: 'bold', color: '$foreground' }}>
                      ${totalCost.toLocaleString()}
                    </Text>
                  </View>
                )}
              </View>
              <Text sx={{ mt: '$3', fontSize: 11, color: '$mutedForeground' }}>
                Per visit estimated costs for the trial duration
              </Text>
            </View>
          </View>
        )}

        {/* ============================================================= */}
        {/* Barriers */}
        {/* ============================================================= */}
        {barriers.length > 0 && (
          <View sx={{ mt: '$6' }}>
            <SectionHeader title="Identified Barriers" />

            <View sx={{ mt: '$4', gap: '$2' }}>
              {barriers.map((barrier, i) => (
                <View key={i} sx={{
                  flexDirection: 'row',
                  gap: '$3',
                  alignItems: 'flex-start',
                  borderWidth: 1,
                  borderColor: '#FED7AA',
                  backgroundColor: '#FFF7ED',
                  borderRadius: 10,
                  p: '$4',
                }}>
                  <View sx={{
                    width: 8, height: 8, borderRadius: 4,
                    backgroundColor: '#C2410C', mt: 6,
                  }} />
                  <Text sx={{ fontSize: 14, color: '#9A3412', lineHeight: 22, flex: 1 }}>
                    {barrier}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ============================================================= */}
        {/* Matched Programs */}
        {/* ============================================================= */}
        {matchedPrograms.length > 0 && (
          <View sx={{ mt: '$6' }}>
            <SectionHeader title="Matched Assistance Programs" />

            <View sx={{ mt: '$4', gap: '$3' }}>
              {matchedPrograms.map((program, i) => (
                <View key={i} sx={{
                  borderWidth: 1,
                  borderColor: program.eligible ? '#BBF7D0' : '$border',
                  borderLeftWidth: program.eligible ? 4 : 1,
                  borderLeftColor: program.eligible ? '#22C55E' : '$border',
                  borderRadius: 12,
                  p: '$4',
                }}>
                  <View sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text sx={{ fontSize: 15, fontWeight: '600', color: '$foreground', flex: 1 }}>
                      {program.name}
                    </Text>
                    {program.eligible && (
                      <View sx={{
                        backgroundColor: '#DCFCE7',
                        borderRadius: 12,
                        px: '$2',
                        py: 3,
                      }}>
                        <Text sx={{ fontSize: 11, fontWeight: '600', color: '#166534' }}>
                          Eligible
                        </Text>
                      </View>
                    )}
                  </View>
                  {program.provider && (
                    <Text sx={{ mt: '$1', fontSize: 13, color: '$mutedForeground' }}>
                      {program.provider}
                    </Text>
                  )}
                  {program.coverage && (
                    <Text sx={{ mt: '$1', fontSize: 13, color: '$foreground' }}>
                      Coverage: {program.coverage}
                    </Text>
                  )}
                </View>
              ))}
            </View>

            <Link href="/logistics/programs">
              <View sx={{ mt: '$3' }}>
                <Text sx={{ fontSize: 13, color: 'blue600', fontWeight: '500' }}>
                  View all assistance programs {'\u2192'}
                </Text>
              </View>
            </Link>
          </View>
        )}

        {/* ============================================================= */}
        {/* Logistics Plan */}
        {/* ============================================================= */}
        <View sx={{ mt: '$6' }}>
          <SectionHeader title="Logistics Plan" />

          {planSections.length === 0 ? (
            <View sx={{ mt: '$4', alignItems: 'flex-start' }}>
              <Text sx={{ fontSize: 14, color: '$mutedForeground', mb: '$3' }}>
                Generate a personalized logistics plan with actionable steps for travel,
                lodging, and financial assistance.
              </Text>
              <Pressable
                onPress={() => generatePlan({ variables: { matchId } })}
                disabled={generatingPlan}
              >
                <View sx={{
                  backgroundColor: generatingPlan ? '#9CA3AF' : 'blue600',
                  borderRadius: 8,
                  px: '$6',
                  py: '$3',
                }}>
                  {generatingPlan ? (
                    <View sx={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <ActivityIndicator color="white" size="small" />
                      <Text sx={{ fontSize: 14, fontWeight: '600', color: 'white' }}>
                        Generating plan...
                      </Text>
                    </View>
                  ) : (
                    <Text sx={{ fontSize: 14, fontWeight: '600', color: 'white' }}>
                      Generate logistics plan
                    </Text>
                  )}
                </View>
              </Pressable>
            </View>
          ) : (
            <View sx={{ mt: '$4', gap: '$3' }}>
              {planSections.map((section, i) => {
                const isExpanded = expandedSections[i] ?? false;

                return (
                  <View key={i} sx={{
                    borderWidth: 1,
                    borderColor: '$border',
                    borderRadius: 12,
                    overflow: 'hidden',
                  }}>
                    <Pressable onPress={() => toggleSection(i)}>
                      <View sx={{
                        p: '$4',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: isExpanded ? '#F8FAFC' : undefined,
                      }}>
                        <Text sx={{ fontSize: 15, fontWeight: '600', color: '$foreground', flex: 1 }}>
                          {section.title}
                        </Text>
                        <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>
                          {isExpanded ? '\u25B2' : '\u25BC'}
                        </Text>
                      </View>
                    </Pressable>

                    {isExpanded && (
                      <View sx={{ px: '$4', pb: '$4' }}>
                        <Text sx={{ fontSize: 14, color: '$foreground', lineHeight: 22 }}>
                          {section.content}
                        </Text>

                        {section.tips && section.tips.length > 0 && (
                          <View sx={{ mt: '$3', backgroundColor: '#F0F9FF', borderRadius: 8, p: '$3' }}>
                            <Text sx={{ fontSize: 12, fontWeight: '600', color: '#0C4A6E', mb: '$2' }}>
                              Tips
                            </Text>
                            {section.tips.map((tip, j) => (
                              <View key={j} sx={{ flexDirection: 'row', gap: '$2', alignItems: 'flex-start', mb: '$1' }}>
                                <View sx={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#0284C7', mt: 7 }} />
                                <Text sx={{ fontSize: 13, color: '#075985', lineHeight: 20, flex: 1 }}>
                                  {tip}
                                </Text>
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Navigation */}
        <View sx={{ mt: '$6', flexDirection: 'row', flexWrap: 'wrap', gap: '$3' }}>
          <Link href="/logistics">
            <View sx={{
              borderRadius: 10, borderWidth: 1, borderColor: '$border', px: '$4', py: '$3',
            }}>
              <Text sx={{ fontSize: 13, fontWeight: '500', color: '$foreground' }}>
                {'\u2190'} Dashboard
              </Text>
            </View>
          </Link>
          <Link href="/logistics/programs">
            <View sx={{
              borderRadius: 10, borderWidth: 1, borderColor: '$border', px: '$4', py: '$3',
            }}>
              <Text sx={{ fontSize: 13, fontWeight: '500', color: '$foreground' }}>
                Assistance Programs {'\u2192'}
              </Text>
            </View>
          </Link>
          <Link href={`/logistics/plan/${matchId}`}>
            <View sx={{
              borderRadius: 10, borderWidth: 1, borderColor: '$border', px: '$4', py: '$3',
            }}>
              <Text sx={{ fontSize: 13, fontWeight: '500', color: '$foreground' }}>
                Full Plan View {'\u2192'}
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
            All costs, distances, and program eligibility are estimates. Actual costs will
            vary based on your specific situation, travel dates, and trial schedule. Contact
            trial sites and assistance programs directly to confirm details.
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
