import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import {
  useGetTrialLogisticsAssessmentQuery,
  useGenerateLogisticsPlanMutation,
} from '../generated/graphql';

// ============================================================================
// Component
// ============================================================================

export function LogisticsPlanScreen({ matchId }: { matchId: string }) {
  const { data, loading, refetch } = useGetTrialLogisticsAssessmentQuery({
    variables: { matchId },
  });
  const [generatePlan, { loading: generatingPlan }] = useGenerateLogisticsPlanMutation({
    onCompleted: () => refetch(),
  });

  const assessment = data?.trialLogisticsAssessment;

  // Collapsible sections
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});

  const toggleSection = (index: number) => {
    setExpandedSections((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  // Parse plan sections
  let planSections: Array<{ title: string; content: string; tips?: string[] }> = [];
  try {
    if (assessment?.logisticsPlan) {
      const parsed = typeof assessment.logisticsPlan === 'string'
        ? JSON.parse(assessment.logisticsPlan)
        : assessment.logisticsPlan;
      if (Array.isArray(parsed)) planSections = parsed;
      else if (parsed?.sections && Array.isArray(parsed.sections)) planSections = parsed.sections;
    }
  } catch {
    // ignore
  }

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          Logistics Plan
        </Text>
        <View sx={{ mt: '$8', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <ActivityIndicator size="small" />
          <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>Loading plan...</Text>
        </View>
      </View>
    );
  }

  // No assessment at all
  if (!assessment) {
    return (
      <ScrollView sx={{ flex: 1 }}>
        <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
          <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
            Logistics Plan
          </Text>
          <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
            No logistics assessment found for this trial
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
            <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground', textAlign: 'center' }}>
              Run a logistics assessment first to generate a plan
            </Text>
            <Text sx={{
              mt: '$2', fontSize: 13, color: '$mutedForeground',
              textAlign: 'center', maxWidth: 400,
            }}>
              A logistics assessment analyzes your travel distance, costs, and barriers.
              Once complete, you can generate a personalized logistics plan.
            </Text>
            <Link href={`/logistics/assessment/${matchId}`}>
              <View sx={{
                mt: '$4',
                backgroundColor: 'blue600',
                borderRadius: 8,
                px: '$6',
                py: '$3',
              }}>
                <Text sx={{ fontSize: 14, fontWeight: '600', color: 'white' }}>
                  Go to Assessment
                </Text>
              </View>
            </Link>
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

  // Assessment exists but no plan yet
  if (planSections.length === 0) {
    return (
      <ScrollView sx={{ flex: 1 }}>
        <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
          <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
            Logistics Plan
          </Text>
          <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
            Trial {matchId.length > 16 ? matchId.slice(0, 16) + '...' : matchId}
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
            <Text sx={{ fontSize: 36 }}>{'\uD83D\uDDFA\uFE0F'}</Text>
            <Text sx={{ mt: '$3', fontWeight: '600', color: '$foreground', textAlign: 'center' }}>
              Generate a personalized logistics plan
            </Text>
            <Text sx={{
              mt: '$2', fontSize: 14, color: '$mutedForeground',
              textAlign: 'center', maxWidth: 440, lineHeight: 22,
            }}>
              Based on your logistics assessment, we will create a step-by-step plan covering
              travel arrangements, lodging options, financial assistance applications, and
              practical tips for managing trial visits.
            </Text>
            <Pressable
              onPress={() => generatePlan({ variables: { matchId } })}
              disabled={generatingPlan}
            >
              <View sx={{
                mt: '$5',
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
            <Link href={`/logistics/assessment/${matchId}`}>
              <View sx={{
                borderRadius: 10, borderWidth: 1, borderColor: '$border', px: '$4', py: '$3',
              }}>
                <Text sx={{ fontSize: 13, fontWeight: '500', color: '$foreground' }}>
                  View Assessment {'\u2192'}
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
              AI-generated content
            </Text>
            <Text sx={{ mt: '$2', fontSize: 12, color: '#78350F', lineHeight: 18 }}>
              This plan is AI-generated. Verify details with program providers directly.
            </Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  // Plan exists — show collapsible sections
  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          Logistics Plan
        </Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
          Trial {matchId.length > 16 ? matchId.slice(0, 16) + '...' : matchId}
        </Text>

        {/* Plan sections */}
        <View sx={{ mt: '$6', gap: '$3' }}>
          {planSections.map((section, i) => {
            const isExpanded = expandedSections[i] ?? true;

            return (
              <View key={i} sx={{
                borderWidth: 1,
                borderColor: '$border',
                borderRadius: 12,
                overflow: 'hidden',
              }}>
                <Pressable onPress={() => toggleSection(i)}>
                  <View sx={{
                    p: '$5',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: isExpanded ? '#F8FAFC' : undefined,
                    borderBottomWidth: isExpanded ? 1 : 0,
                    borderBottomColor: '$border',
                  }}>
                    <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$3', flex: 1 }}>
                      <View sx={{
                        width: 28, height: 28, borderRadius: 14,
                        backgroundColor: '#DBEAFE',
                        alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Text sx={{ fontSize: 13, fontWeight: 'bold', color: '#1E40AF' }}>
                          {i + 1}
                        </Text>
                      </View>
                      <Text sx={{ fontSize: 16, fontWeight: '600', color: '$foreground', flex: 1 }}>
                        {section.title}
                      </Text>
                    </View>
                    <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>
                      {isExpanded ? '\u25B2' : '\u25BC'}
                    </Text>
                  </View>
                </Pressable>

                {isExpanded && (
                  <View sx={{ p: '$5' }}>
                    <Text sx={{ fontSize: 14, color: '$foreground', lineHeight: 24 }}>
                      {section.content}
                    </Text>

                    {section.tips && section.tips.length > 0 && (
                      <View sx={{
                        mt: '$4',
                        backgroundColor: '#F0F9FF',
                        borderWidth: 1,
                        borderColor: '#BAE6FD',
                        borderRadius: 10,
                        p: '$4',
                      }}>
                        <Text sx={{ fontSize: 13, fontWeight: '600', color: '#0C4A6E', mb: '$2' }}>
                          Tips
                        </Text>
                        <View sx={{ gap: '$2' }}>
                          {section.tips.map((tip, j) => (
                            <View key={j} sx={{ flexDirection: 'row', gap: '$2', alignItems: 'flex-start' }}>
                              <View sx={{
                                width: 6, height: 6, borderRadius: 3,
                                backgroundColor: '#0284C7', mt: 7,
                              }} />
                              <Text sx={{ fontSize: 13, color: '#075985', lineHeight: 20, flex: 1 }}>
                                {tip}
                              </Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Regenerate button */}
        <Pressable
          onPress={() => generatePlan({ variables: { matchId } })}
          disabled={generatingPlan}
        >
          <View sx={{
            mt: '$6',
            borderWidth: 1,
            borderColor: '$border',
            borderRadius: 8,
            px: '$6',
            py: '$3',
            alignSelf: 'flex-start',
          }}>
            {generatingPlan ? (
              <View sx={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <ActivityIndicator size="small" />
                <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground' }}>
                  Regenerating...
                </Text>
              </View>
            ) : (
              <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground' }}>
                Regenerate plan
              </Text>
            )}
          </View>
        </Pressable>

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
          <Link href={`/logistics/assessment/${matchId}`}>
            <View sx={{
              borderRadius: 10, borderWidth: 1, borderColor: '$border', px: '$4', py: '$3',
            }}>
              <Text sx={{ fontSize: 13, fontWeight: '500', color: '$foreground' }}>
                View Assessment {'\u2192'}
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
            AI-generated content
          </Text>
          <Text sx={{ mt: '$2', fontSize: 12, color: '#78350F', lineHeight: 18 }}>
            This plan is AI-generated. Verify details with program providers directly.
            Costs, availability, and eligibility requirements may change. Always confirm
            information with trial coordinators and assistance programs before making
            travel or financial commitments.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
