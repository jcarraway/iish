import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import {
  useGetPreventionLifestyleQuery,
  useGeneratePreventionLifestyleMutation,
} from '../generated/graphql';

// ============================================================================
// Component
// ============================================================================

export function PreventLifestyleScreen() {
  const { data, loading, refetch } = useGetPreventionLifestyleQuery({ errorPolicy: 'ignore' });
  const [generate, { loading: generating }] = useGeneratePreventionLifestyleMutation({
    onCompleted: () => refetch(),
  });

  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [expandedMyth, setExpandedMyth] = useState<number | null>(null);
  const [expandedOverblown, setExpandedOverblown] = useState<number | null>(null);

  const recs = data?.preventionLifestyle as any;

  function toggleSection(section: string) {
    setExpandedSection(expandedSection === section ? null : section);
  }

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          Prevention Lifestyle
        </Text>
        <View sx={{ mt: '$8', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <ActivityIndicator size="small" />
          <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (!recs) {
    return (
      <ScrollView sx={{ flex: 1 }}>
        <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
          <Link href="/prevent/risk">
            <Text sx={{ fontSize: 13, color: 'blue600', mb: '$4' }}>
              {'\u2190'} Back to Risk Assessment
            </Text>
          </Link>

          <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
            Prevention Lifestyle
          </Text>
          <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
            Evidence-based lifestyle changes to reduce your breast cancer risk
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
            <Text sx={{ fontSize: 36 }}>{'🌱'}</Text>
            <Text sx={{ mt: '$3', fontWeight: '600', color: '$foreground', textAlign: 'center' }}>
              Personalized prevention lifestyle plan
            </Text>
            <Text sx={{
              mt: '$2', fontSize: 14, color: '$mutedForeground',
              textAlign: 'center', maxWidth: 400,
            }}>
              We'll create exercise, nutrition, alcohol, and environmental guidance based on
              your risk profile and personal health history to help reduce your breast cancer risk.
            </Text>
            {generating ? (
              <View sx={{ mt: '$5', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <ActivityIndicator size="small" />
                <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>
                  Building your prevention plan...
                </Text>
              </View>
            ) : (
              <Pressable onPress={() => generate()}>
                <View sx={{
                  mt: '$5', backgroundColor: 'blue600',
                  borderRadius: 8, px: '$6', py: '$3',
                }}>
                  <Text sx={{ fontSize: 14, fontWeight: '600', color: 'white' }}>
                    Generate Recommendations
                  </Text>
                </View>
              </Pressable>
            )}
          </View>
        </View>
      </ScrollView>
    );
  }

  const exercise = recs.exercise;
  const nutrition = recs.nutrition;
  const alcohol = recs.alcohol;
  const environment = recs.environment;

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Link href="/prevent/risk">
          <Text sx={{ fontSize: 13, color: 'blue600', mb: '$4' }}>
            {'\u2190'} Back to Risk Assessment
          </Text>
        </Link>

        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          Prevention Lifestyle
        </Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
          Evidence-based lifestyle changes to reduce your breast cancer risk
        </Text>

        <View sx={{ mt: '$8', gap: '$4' }}>
          {/* ================================================================ */}
          {/* Exercise Section                                                 */}
          {/* ================================================================ */}
          <View sx={{ borderWidth: 1, borderColor: '$border', borderRadius: 12, overflow: 'hidden' }}>
            <Pressable onPress={() => toggleSection('exercise')}>
              <View sx={{
                p: '$5', flexDirection: 'row', alignItems: 'center',
                justifyContent: 'space-between', backgroundColor: expandedSection === 'exercise' ? '#F0FDF4' : 'white',
              }}>
                <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$3' }}>
                  <View sx={{
                    width: 36, height: 36, borderRadius: 10,
                    backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Text sx={{ fontSize: 18 }}>{'💪'}</Text>
                  </View>
                  <View>
                    <Text sx={{ fontSize: 16, fontWeight: '600', color: '$foreground' }}>Exercise</Text>
                    {exercise?.riskReduction && (
                      <Text sx={{ fontSize: 12, color: '#166534' }}>
                        Reduces risk by {exercise.riskReduction}
                      </Text>
                    )}
                  </View>
                </View>
                <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>
                  {expandedSection === 'exercise' ? '\u25B2' : '\u25BC'}
                </Text>
              </View>
            </Pressable>

            {expandedSection === 'exercise' && exercise && (
              <View sx={{ px: '$5', pb: '$5' }}>
                <Text sx={{ fontSize: 15, color: '$foreground', lineHeight: 22 }}>
                  {exercise.headline}
                </Text>

                {/* Weekly target */}
                {exercise.weeklyTarget && (
                  <View sx={{
                    mt: '$4', flexDirection: 'row', gap: '$3', flexWrap: 'wrap',
                  }}>
                    <Badge label={exercise.weeklyTarget} bg="#DBEAFE" fg="#1E40AF" />
                    {exercise.riskReduction && (
                      <Badge label={`Reduces risk by ${exercise.riskReduction}`} bg="#DCFCE7" fg="#166534" />
                    )}
                  </View>
                )}

                {/* Evidence */}
                {exercise.evidence && (
                  <View sx={{
                    mt: '$4', backgroundColor: '#F0FDF4', borderWidth: 1,
                    borderColor: '#BBF7D0', borderRadius: 12, p: '$4',
                  }}>
                    <Text sx={{ fontSize: 13, fontWeight: '600', color: '#166534' }}>
                      What the evidence shows
                    </Text>
                    <Text sx={{ mt: '$2', fontSize: 13, color: '#14532D', lineHeight: 20 }}>
                      {exercise.evidence}
                    </Text>
                  </View>
                )}

                {/* Starter plan table */}
                {exercise.starterPlan && exercise.starterPlan.length > 0 && (
                  <View sx={{ mt: '$4' }}>
                    <Text sx={{ fontSize: 13, fontWeight: '600', color: '$foreground' }}>
                      Starter plan
                    </Text>
                    <View sx={{ mt: '$2', gap: '$2' }}>
                      {exercise.starterPlan.map((entry: any, i: number) => (
                        <View key={i} sx={{
                          borderWidth: 1, borderColor: '$border', borderRadius: 10, p: '$3',
                          flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                        }}>
                          <View sx={{ flex: 1 }}>
                            <Text sx={{ fontSize: 13, fontWeight: '600', color: '$foreground' }}>
                              {entry.activity}
                            </Text>
                            {entry.duration && (
                              <Text sx={{ fontSize: 12, color: '$mutedForeground' }}>
                                {entry.duration}
                              </Text>
                            )}
                          </View>
                          {entry.frequency && (
                            <Badge label={entry.frequency} bg="#F1F5F9" fg="#64748B" />
                          )}
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Tips */}
                {exercise.tips && exercise.tips.length > 0 && (
                  <View sx={{ mt: '$4', gap: '$2' }}>
                    <Text sx={{ fontSize: 13, fontWeight: '600', color: '$foreground' }}>
                      Tips for getting started
                    </Text>
                    {exercise.tips.map((tip: string, i: number) => (
                      <View key={i} sx={{ flexDirection: 'row', gap: '$2', alignItems: 'flex-start' }}>
                        <Text sx={{ fontSize: 13, color: '#166534' }}>{'\u2713'}</Text>
                        <Text sx={{ fontSize: 13, color: '$foreground', lineHeight: 20, flex: 1 }}>
                          {tip}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>

          {/* ================================================================ */}
          {/* Nutrition Section                                                */}
          {/* ================================================================ */}
          <View sx={{ borderWidth: 1, borderColor: '$border', borderRadius: 12, overflow: 'hidden' }}>
            <Pressable onPress={() => toggleSection('nutrition')}>
              <View sx={{
                p: '$5', flexDirection: 'row', alignItems: 'center',
                justifyContent: 'space-between', backgroundColor: expandedSection === 'nutrition' ? '#F0FDF4' : 'white',
              }}>
                <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$3' }}>
                  <View sx={{
                    width: 36, height: 36, borderRadius: 10,
                    backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Text sx={{ fontSize: 18 }}>{'🥗'}</Text>
                  </View>
                  <Text sx={{ fontSize: 16, fontWeight: '600', color: '$foreground' }}>Nutrition</Text>
                </View>
                <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>
                  {expandedSection === 'nutrition' ? '\u25B2' : '\u25BC'}
                </Text>
              </View>
            </Pressable>

            {expandedSection === 'nutrition' && nutrition && (
              <View sx={{ px: '$5', pb: '$5' }}>
                <Text sx={{ fontSize: 15, color: '$foreground', lineHeight: 22 }}>
                  {nutrition.headline}
                </Text>

                {/* Key principles */}
                {nutrition.keyPrinciples && nutrition.keyPrinciples.length > 0 && (
                  <View sx={{ mt: '$4', gap: '$2' }}>
                    <Text sx={{ fontSize: 13, fontWeight: '600', color: '$foreground' }}>
                      Key principles
                    </Text>
                    {nutrition.keyPrinciples.map((principle: string, i: number) => (
                      <View key={i} sx={{ flexDirection: 'row', gap: '$2', alignItems: 'flex-start' }}>
                        <View sx={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#0284C7', mt: 7 }} />
                        <Text sx={{ fontSize: 13, color: '$foreground', lineHeight: 20, flex: 1 }}>
                          {principle}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Foods to emphasize */}
                {nutrition.foodsToEmphasize && nutrition.foodsToEmphasize.length > 0 && (
                  <View sx={{ mt: '$4' }}>
                    <Text sx={{ fontSize: 13, fontWeight: '600', color: '#166534' }}>
                      Foods to emphasize
                    </Text>
                    <View sx={{ mt: '$2', flexDirection: 'row', gap: '$2', flexWrap: 'wrap' }}>
                      {nutrition.foodsToEmphasize.map((food: string, i: number) => (
                        <Badge key={i} label={food} bg="#DCFCE7" fg="#166534" />
                      ))}
                    </View>
                  </View>
                )}

                {/* Foods to limit */}
                {nutrition.foodsToLimit && nutrition.foodsToLimit.length > 0 && (
                  <View sx={{ mt: '$4' }}>
                    <Text sx={{ fontSize: 13, fontWeight: '600', color: '#92400E' }}>
                      Foods to limit
                    </Text>
                    <View sx={{ mt: '$2', flexDirection: 'row', gap: '$2', flexWrap: 'wrap' }}>
                      {nutrition.foodsToLimit.map((food: string, i: number) => (
                        <Badge key={i} label={food} bg="#FEF3C7" fg="#92400E" />
                      ))}
                    </View>
                  </View>
                )}

                {/* Myths */}
                {nutrition.myths && nutrition.myths.length > 0 && (
                  <View sx={{ mt: '$4' }}>
                    <Text sx={{ fontSize: 13, fontWeight: '600', color: '$foreground' }}>
                      Common myths — what the evidence says
                    </Text>
                    <View sx={{ mt: '$2', gap: '$2' }}>
                      {nutrition.myths.map((item: any, i: number) => (
                        <View key={i} sx={{
                          borderWidth: 1, borderColor: '$border', borderRadius: 10, overflow: 'hidden',
                        }}>
                          <Pressable onPress={() => setExpandedMyth(expandedMyth === i ? null : i)}>
                            <View sx={{ p: '$3' }}>
                              <View sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text sx={{ fontSize: 13, fontWeight: '600', color: '$foreground', flex: 1 }}>
                                  "{item.myth}"
                                </Text>
                                <Text sx={{ fontSize: 12, color: '$mutedForeground', ml: '$2' }}>
                                  {expandedMyth === i ? '\u25B2' : '\u25BC'}
                                </Text>
                              </View>
                            </View>
                          </Pressable>
                          {expandedMyth === i && (
                            <View sx={{ px: '$3', pb: '$3' }}>
                              <View sx={{
                                backgroundColor: '#F0FDF4', borderRadius: 8, p: '$2',
                              }}>
                                <Text sx={{ fontSize: 11, fontWeight: '600', color: '#166534' }}>Reality</Text>
                                <Text sx={{ fontSize: 12, color: '#14532D', lineHeight: 18 }}>
                                  {item.reality}
                                </Text>
                              </View>
                            </View>
                          )}
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* ================================================================ */}
          {/* Alcohol Section                                                  */}
          {/* ================================================================ */}
          <View sx={{ borderWidth: 1, borderColor: '$border', borderRadius: 12, overflow: 'hidden' }}>
            <Pressable onPress={() => toggleSection('alcohol')}>
              <View sx={{
                p: '$5', flexDirection: 'row', alignItems: 'center',
                justifyContent: 'space-between', backgroundColor: expandedSection === 'alcohol' ? '#FEF2F2' : 'white',
              }}>
                <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$3' }}>
                  <View sx={{
                    width: 36, height: 36, borderRadius: 10,
                    backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Text sx={{ fontSize: 18 }}>{'🍷'}</Text>
                  </View>
                  <Text sx={{ fontSize: 16, fontWeight: '600', color: '$foreground' }}>Alcohol</Text>
                </View>
                <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>
                  {expandedSection === 'alcohol' ? '\u25B2' : '\u25BC'}
                </Text>
              </View>
            </Pressable>

            {expandedSection === 'alcohol' && alcohol && (
              <View sx={{ px: '$5', pb: '$5' }}>
                <Text sx={{ fontSize: 15, color: '$foreground', lineHeight: 22 }}>
                  {alcohol.headline}
                </Text>

                {/* Current risk */}
                {alcohol.currentRisk && (
                  <View sx={{
                    mt: '$4', backgroundColor: '#FEF2F2', borderWidth: 1,
                    borderColor: '#FECACA', borderRadius: 12, p: '$4',
                  }}>
                    <Text sx={{ fontSize: 13, fontWeight: '600', color: '#991B1B' }}>
                      Your risk level
                    </Text>
                    <Text sx={{ mt: '$2', fontSize: 13, color: '#7F1D1D', lineHeight: 20 }}>
                      {alcohol.currentRisk}
                    </Text>
                  </View>
                )}

                {/* Recommendation */}
                {alcohol.recommendation && (
                  <View sx={{
                    mt: '$3', borderWidth: 1, borderColor: '$border', borderRadius: 10, p: '$3',
                  }}>
                    <Text sx={{ fontSize: 13, fontWeight: '600', color: '$foreground' }}>
                      Recommendation
                    </Text>
                    <Text sx={{ mt: '$1', fontSize: 13, color: '$mutedForeground', lineHeight: 20 }}>
                      {alcohol.recommendation}
                    </Text>
                  </View>
                )}

                {/* Risk reduction */}
                {alcohol.riskReduction && (
                  <View sx={{ mt: '$3', flexDirection: 'row', gap: '$3' }}>
                    <Badge label={`Reduces risk by ${alcohol.riskReduction}`} bg="#DCFCE7" fg="#166534" />
                  </View>
                )}

                {/* Evidence */}
                {alcohol.evidence && (
                  <View sx={{
                    mt: '$3', backgroundColor: '#F8FAFC', borderRadius: 10, p: '$3',
                  }}>
                    <Text sx={{ fontSize: 13, fontWeight: '600', color: '$foreground' }}>
                      Evidence
                    </Text>
                    <Text sx={{ mt: '$1', fontSize: 12, color: '$mutedForeground', lineHeight: 18 }}>
                      {alcohol.evidence}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* ================================================================ */}
          {/* Environment Section                                              */}
          {/* ================================================================ */}
          <View sx={{ borderWidth: 1, borderColor: '$border', borderRadius: 12, overflow: 'hidden' }}>
            <Pressable onPress={() => toggleSection('environment')}>
              <View sx={{
                p: '$5', flexDirection: 'row', alignItems: 'center',
                justifyContent: 'space-between', backgroundColor: expandedSection === 'environment' ? '#F0FDF4' : 'white',
              }}>
                <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$3' }}>
                  <View sx={{
                    width: 36, height: 36, borderRadius: 10,
                    backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Text sx={{ fontSize: 18 }}>{'🌿'}</Text>
                  </View>
                  <Text sx={{ fontSize: 16, fontWeight: '600', color: '$foreground' }}>Environment</Text>
                </View>
                <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>
                  {expandedSection === 'environment' ? '\u25B2' : '\u25BC'}
                </Text>
              </View>
            </Pressable>

            {expandedSection === 'environment' && environment && (
              <View sx={{ px: '$5', pb: '$5' }}>
                <Text sx={{ fontSize: 15, color: '$foreground', lineHeight: 22 }}>
                  {environment.headline}
                </Text>

                {/* Actionable steps */}
                {environment.actionableSteps && environment.actionableSteps.length > 0 && (
                  <View sx={{ mt: '$4', gap: '$2' }}>
                    <Text sx={{ fontSize: 13, fontWeight: '600', color: '$foreground' }}>
                      Actionable steps
                    </Text>
                    {environment.actionableSteps.map((step: any, i: number) => {
                      const priorityColors: Record<string, { bg: string; fg: string }> = {
                        high: { bg: '#FEE2E2', fg: '#991B1B' },
                        medium: { bg: '#FEF3C7', fg: '#92400E' },
                        low: { bg: '#DCFCE7', fg: '#166534' },
                      };
                      const pc = priorityColors[step.priority] ?? priorityColors.medium;
                      return (
                        <View key={i} sx={{
                          borderWidth: 1, borderColor: '$border', borderRadius: 10, p: '$3',
                        }}>
                          <View sx={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text sx={{ fontSize: 13, fontWeight: '600', color: '$foreground', flex: 1 }}>
                              {step.step}
                            </Text>
                            <Badge label={step.priority} bg={pc.bg} fg={pc.fg} />
                          </View>
                          {step.why && (
                            <Text sx={{ mt: '$2', fontSize: 12, color: '$mutedForeground', lineHeight: 18 }}>
                              {step.why}
                            </Text>
                          )}
                        </View>
                      );
                    })}
                  </View>
                )}

                {/* Overblown concerns */}
                {environment.overblown && environment.overblown.length > 0 && (
                  <View sx={{ mt: '$4' }}>
                    <Text sx={{ fontSize: 13, fontWeight: '600', color: '$foreground' }}>
                      Don't worry about
                    </Text>
                    <View sx={{ mt: '$2', gap: '$2' }}>
                      {environment.overblown.map((item: any, i: number) => (
                        <View key={i} sx={{
                          borderWidth: 1, borderColor: '$border', borderRadius: 10, overflow: 'hidden',
                        }}>
                          <Pressable onPress={() => setExpandedOverblown(expandedOverblown === i ? null : i)}>
                            <View sx={{ p: '$3' }}>
                              <View sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text sx={{ fontSize: 13, fontWeight: '600', color: '#166534', flex: 1 }}>
                                  "{item.concern}"
                                </Text>
                                <Text sx={{ fontSize: 12, color: '$mutedForeground', ml: '$2' }}>
                                  {expandedOverblown === i ? '\u25B2' : '\u25BC'}
                                </Text>
                              </View>
                            </View>
                          </Pressable>
                          {expandedOverblown === i && (
                            <View sx={{ px: '$3', pb: '$3' }}>
                              <View sx={{
                                backgroundColor: '#F0FDF4', borderRadius: 8, p: '$2',
                              }}>
                                <Text sx={{ fontSize: 11, fontWeight: '600', color: '#166534' }}>Reality</Text>
                                <Text sx={{ fontSize: 12, color: '#14532D', lineHeight: 18 }}>
                                  {item.reality}
                                </Text>
                              </View>
                            </View>
                          )}
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>

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
            Important disclaimer
          </Text>
          <Text sx={{ mt: '$2', fontSize: 12, color: '#78350F', lineHeight: 18 }}>
            These recommendations are AI-generated based on current evidence and your risk profile.
            They are not a substitute for professional medical advice. Always discuss lifestyle changes
            with your healthcare provider before starting.
          </Text>
        </View>

        {/* Footer actions */}
        <View sx={{ mt: '$4', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          {recs.generatedAt && (
            <Text sx={{ fontSize: 12, color: '$mutedForeground' }}>
              Generated {new Date(recs.generatedAt).toLocaleDateString()}
            </Text>
          )}
          {generating ? (
            <View sx={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <ActivityIndicator size="small" />
              <Text sx={{ fontSize: 12, color: '$mutedForeground' }}>Refreshing...</Text>
            </View>
          ) : (
            <Pressable onPress={() => generate()}>
              <Text sx={{ fontSize: 12, fontWeight: '600', color: 'blue600' }}>
                Refresh recommendations
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

// ============================================================================
// Shared primitives
// ============================================================================

function Badge({ label, bg, fg }: { label: string; bg: string; fg: string }) {
  return (
    <View sx={{ backgroundColor: bg, borderRadius: 12, px: '$2', py: 3 }}>
      <Text sx={{ fontSize: 11, fontWeight: '600', color: fg }}>{label}</Text>
    </View>
  );
}
