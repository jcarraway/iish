import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import {
  useGetLifestyleRecommendationsQuery,
  useGenerateLifestyleRecommendationsMutation,
} from '../generated/graphql';

export function LifestyleScreen() {
  const { data, loading, refetch } = useGetLifestyleRecommendationsQuery({ errorPolicy: 'ignore' });
  const [generate, { loading: generating }] = useGenerateLifestyleRecommendationsMutation({
    onCompleted: () => refetch(),
  });

  const recs = data?.lifestyleRecommendations;

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          Lifestyle & Wellness
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
          <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
            Lifestyle & Wellness
          </Text>
          <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
            Evidence-based guidance personalized to your cancer type, treatments, and medications
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
            <Text sx={{ fontSize: 36 }}>{'🏃'}</Text>
            <Text sx={{ mt: '$3', fontWeight: '600', color: '$foreground', textAlign: 'center' }}>
              Personalized lifestyle recommendations
            </Text>
            <Text sx={{
              mt: '$2', fontSize: 14, color: '$mutedForeground',
              textAlign: 'center', maxWidth: 400,
            }}>
              We'll create exercise, nutrition, alcohol, and environmental guidance tailored to your
              specific cancer type, subtype, and treatment history.
            </Text>
            {generating ? (
              <View sx={{ mt: '$5', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <ActivityIndicator size="small" />
                <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>
                  Personalizing your lifestyle plan...
                </Text>
              </View>
            ) : (
              <Pressable onPress={() => generate()}>
                <View sx={{
                  mt: '$5', backgroundColor: 'blue600',
                  borderRadius: 8, px: '$6', py: '$3',
                }}>
                  <Text sx={{ fontSize: 14, fontWeight: '600', color: 'white' }}>
                    Generate recommendations
                  </Text>
                </View>
              </Pressable>
            )}
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          Lifestyle & Wellness
        </Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
          Evidence-based guidance personalized to your cancer type, treatments, and medications
        </Text>

        <View sx={{ mt: '$8', gap: '$6' }}>
          <ExerciseSection exercise={recs.exercise} />
          <NutritionSection nutrition={recs.nutrition} />
          <AlcoholSection alcohol={recs.alcohol} />
          <EnvironmentSection environment={recs.environment} />
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
            These recommendations are AI-generated based on current evidence and your medical history.
            They are not a substitute for professional medical advice. Always discuss lifestyle changes
            with your oncologist or care team before starting.
          </Text>
        </View>

        {/* Footer actions */}
        <View sx={{ mt: '$4', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text sx={{ fontSize: 12, color: '$mutedForeground' }}>
            Generated {new Date(recs.generatedAt).toLocaleDateString()}
          </Text>
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
// Section components
// ============================================================================

function ExerciseSection({ exercise }: { exercise: NonNullable<ReturnType<typeof useGetLifestyleRecommendationsQuery>['data']>['lifestyleRecommendations'] extends infer T ? T extends { exercise: infer E } ? E : never : never }) {
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);

  return (
    <View>
      <SectionHeader icon="💪" title="Exercise" />

      <Text sx={{ mt: '$3', fontSize: 15, color: '$foreground', lineHeight: 22 }}>
        {exercise.headline}
      </Text>

      {/* Key stat card */}
      <View sx={{
        mt: '$4',
        backgroundColor: '#F0FDF4',
        borderWidth: 1,
        borderColor: '#BBF7D0',
        borderRadius: 12,
        p: '$4',
      }}>
        <Text sx={{ fontSize: 13, fontWeight: '600', color: '#166534' }}>
          What the evidence shows
        </Text>
        <Text sx={{ mt: '$2', fontSize: 13, color: '#14532D', lineHeight: 20 }}>
          {exercise.effectSize}
        </Text>
      </View>

      {/* Weekly target */}
      <View sx={{
        mt: '$3',
        flexDirection: 'row',
        gap: '$3',
        flexWrap: 'wrap',
      }}>
        <Badge label={`${exercise.weeklyTargetMinutes} min/week`} bg="#DBEAFE" fg="#1E40AF" />
        <Badge label={exercise.intensity} bg="#E0E7FF" fg="#3730A3" />
        <Badge label={`Strength ${exercise.strengthDaysPerWeek}x/week`} bg="#FCE7F3" fg="#9D174D" />
      </View>

      {/* Precautions */}
      {exercise.precautions.length > 0 && (
        <View sx={{ mt: '$4', gap: '$2' }}>
          <Text sx={{ fontSize: 13, fontWeight: '600', color: '#92400E' }}>
            Precautions for you
          </Text>
          {exercise.precautions.map((p, i) => (
            <View key={i} sx={{
              backgroundColor: '#FFFBEB',
              borderWidth: 1,
              borderColor: '#FDE68A',
              borderRadius: 10,
              p: '$3',
            }}>
              <Text sx={{ fontSize: 13, fontWeight: '600', color: '#92400E' }}>{p.issue}</Text>
              <Text sx={{ mt: '$1', fontSize: 12, color: '#78350F', lineHeight: 18 }}>{p.guidance}</Text>
            </View>
          ))}
        </View>
      )}

      {/* 4-week starter plan */}
      {exercise.starterPlan.length > 0 && (
        <View sx={{ mt: '$4' }}>
          <Text sx={{ fontSize: 13, fontWeight: '600', color: '$foreground' }}>
            4-week starter plan
          </Text>
          <View sx={{ mt: '$2', gap: '$2' }}>
            {exercise.starterPlan.map((week) => (
              <View key={week.week} sx={{
                borderWidth: 1,
                borderColor: '$border',
                borderRadius: 10,
                overflow: 'hidden',
              }}>
                <Pressable onPress={() =>
                  setExpandedWeek(expandedWeek === week.week ? null : week.week)
                }>
                  <View sx={{
                    p: '$3',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground' }}>
                      Week {week.week}
                    </Text>
                    <Text sx={{ fontSize: 12, color: '$mutedForeground' }}>
                      {week.totalMinutes} min total {expandedWeek === week.week ? '▲' : '▼'}
                    </Text>
                  </View>
                </Pressable>
                {expandedWeek === week.week && (
                  <View sx={{ px: '$3', pb: '$3', gap: '$2' }}>
                    {week.sessions.map((s, si) => (
                      <View key={si} sx={{
                        flexDirection: 'row',
                        gap: '$2',
                        alignItems: 'flex-start',
                      }}>
                        <Text sx={{ fontSize: 12, fontWeight: '600', color: 'blue600', width: 70 }}>
                          {s.day}
                        </Text>
                        <View sx={{ flex: 1 }}>
                          <Text sx={{ fontSize: 12, fontWeight: '600', color: '$foreground' }}>
                            {s.type} · {s.duration} min
                          </Text>
                          <Text sx={{ fontSize: 11, color: '$mutedForeground', lineHeight: 16 }}>
                            {s.description}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Symptom exercises */}
      {exercise.symptomExercises.length > 0 && (
        <View sx={{ mt: '$4' }}>
          <Text sx={{ fontSize: 13, fontWeight: '600', color: '$foreground' }}>
            For your specific symptoms
          </Text>
          <View sx={{ mt: '$2', gap: '$2' }}>
            {exercise.symptomExercises.map((se, i) => (
              <View key={i} sx={{
                borderWidth: 1,
                borderColor: '$border',
                borderRadius: 10,
                p: '$3',
              }}>
                <Text sx={{ fontSize: 13, fontWeight: '600', color: '$foreground' }}>
                  {se.symptom}
                </Text>
                <Text sx={{ mt: '$1', fontSize: 12, color: 'blue600' }}>
                  {se.exerciseType}
                </Text>
                <Text sx={{ mt: '$1', fontSize: 11, color: '$mutedForeground', lineHeight: 16 }}>
                  {se.evidence}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

function NutritionSection({ nutrition }: { nutrition: any }) {
  const [expandedMyth, setExpandedMyth] = useState<number | null>(null);

  return (
    <View>
      <SectionHeader icon="🥗" title="Nutrition" />

      <Text sx={{ mt: '$3', fontSize: 15, color: '$foreground', lineHeight: 22 }}>
        {nutrition.headline}
      </Text>

      {/* Strong evidence bullets */}
      {nutrition.strongEvidence.length > 0 && (
        <View sx={{ mt: '$4', gap: '$2' }}>
          <Text sx={{ fontSize: 13, fontWeight: '600', color: '#166534' }}>
            Strong evidence
          </Text>
          {nutrition.strongEvidence.map((item: string, i: number) => (
            <View key={i} sx={{ flexDirection: 'row', gap: '$2', alignItems: 'flex-start' }}>
              <Text sx={{ fontSize: 13, color: '#166534' }}>{'\u2713'}</Text>
              <Text sx={{ fontSize: 13, color: '$foreground', lineHeight: 20, flex: 1 }}>
                {item}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Medication-specific guidance */}
      {nutrition.medicationGuidance.length > 0 && (
        <View sx={{ mt: '$4', gap: '$3' }}>
          <Text sx={{ fontSize: 13, fontWeight: '600', color: '$foreground' }}>
            Based on your medications
          </Text>
          {nutrition.medicationGuidance.map((mg: any, i: number) => (
            <View key={i} sx={{
              borderWidth: 1,
              borderColor: '#C7D2FE',
              backgroundColor: '#EEF2FF',
              borderRadius: 10,
              p: '$3',
            }}>
              <Text sx={{ fontSize: 13, fontWeight: '600', color: '#3730A3' }}>
                {mg.medication}
              </Text>
              {mg.considerations.length > 0 && (
                <View sx={{ mt: '$2' }}>
                  {mg.considerations.map((c: string, ci: number) => (
                    <Text key={ci} sx={{ fontSize: 12, color: '#4338CA', lineHeight: 18 }}>
                      {'\u2022'} {c}
                    </Text>
                  ))}
                </View>
              )}
              {mg.emphasize.length > 0 && (
                <View sx={{ mt: '$2' }}>
                  <Text sx={{ fontSize: 11, fontWeight: '600', color: '#166534' }}>Emphasize:</Text>
                  <Text sx={{ fontSize: 12, color: '#14532D', lineHeight: 18 }}>
                    {mg.emphasize.join(', ')}
                  </Text>
                </View>
              )}
              {mg.limit.length > 0 && (
                <View sx={{ mt: '$1' }}>
                  <Text sx={{ fontSize: 11, fontWeight: '600', color: '#92400E' }}>Limit:</Text>
                  <Text sx={{ fontSize: 12, color: '#78350F', lineHeight: 18 }}>
                    {mg.limit.join(', ')}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Myth-busting */}
      {nutrition.mythBusting.length > 0 && (
        <View sx={{ mt: '$4' }}>
          <Text sx={{ fontSize: 13, fontWeight: '600', color: '$foreground' }}>
            Common myths — what the evidence says
          </Text>
          <View sx={{ mt: '$2', gap: '$2' }}>
            {nutrition.mythBusting.map((myth: any, i: number) => (
              <View key={i} sx={{
                borderWidth: 1,
                borderColor: '$border',
                borderRadius: 10,
                overflow: 'hidden',
              }}>
                <Pressable onPress={() =>
                  setExpandedMyth(expandedMyth === i ? null : i)
                }>
                  <View sx={{ p: '$3' }}>
                    <View sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text sx={{ fontSize: 13, fontWeight: '600', color: '$foreground', flex: 1 }}>
                        "{myth.myth}"
                      </Text>
                      <Text sx={{ fontSize: 12, color: '$mutedForeground', ml: '$2' }}>
                        {expandedMyth === i ? '▲' : '▼'}
                      </Text>
                    </View>
                  </View>
                </Pressable>
                {expandedMyth === i && (
                  <View sx={{ px: '$3', pb: '$3', gap: '$2' }}>
                    <View sx={{
                      backgroundColor: '#F0FDF4',
                      borderRadius: 8,
                      p: '$2',
                    }}>
                      <Text sx={{ fontSize: 11, fontWeight: '600', color: '#166534' }}>Reality</Text>
                      <Text sx={{ fontSize: 12, color: '#14532D', lineHeight: 18 }}>{myth.reality}</Text>
                    </View>
                    <Text sx={{ fontSize: 12, color: '$mutedForeground', lineHeight: 18 }}>
                      {myth.nuance}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

function AlcoholSection({ alcohol }: { alcohol: any }) {
  return (
    <View>
      <SectionHeader icon="🍷" title="Alcohol" />

      <Text sx={{ mt: '$3', fontSize: 15, color: '$foreground', lineHeight: 22 }}>
        {alcohol.headline}
      </Text>

      {/* Risk quantification */}
      <View sx={{
        mt: '$4',
        backgroundColor: '#FEF2F2',
        borderWidth: 1,
        borderColor: '#FECACA',
        borderRadius: 12,
        p: '$4',
      }}>
        <Text sx={{ fontSize: 13, fontWeight: '600', color: '#991B1B' }}>
          Quantified risk
        </Text>
        <Text sx={{ mt: '$2', fontSize: 13, color: '#7F1D1D', lineHeight: 20 }}>
          {alcohol.quantifiedRisk}
        </Text>
      </View>

      {/* Subtype context */}
      <View sx={{
        mt: '$3',
        borderWidth: 1,
        borderColor: '$border',
        borderRadius: 10,
        p: '$3',
      }}>
        <Text sx={{ fontSize: 13, fontWeight: '600', color: '$foreground' }}>
          For your specific subtype
        </Text>
        <Text sx={{ mt: '$1', fontSize: 13, color: '$mutedForeground', lineHeight: 20 }}>
          {alcohol.subtypeContext}
        </Text>
      </View>

      {/* Recommendation */}
      <View sx={{ mt: '$3', flexDirection: 'row', alignItems: 'flex-start', gap: '$3' }}>
        <View sx={{ flex: 1 }}>
          <Text sx={{ fontSize: 13, fontWeight: '600', color: '$foreground' }}>
            Recommendation
          </Text>
          <Text sx={{ mt: '$1', fontSize: 13, color: '$mutedForeground', lineHeight: 20 }}>
            {alcohol.recommendation}
          </Text>
        </View>
        <Badge
          label={alcohol.evidenceStrength}
          bg={alcohol.evidenceStrength === 'strong' ? '#DCFCE7' : '#FEF3C7'}
          fg={alcohol.evidenceStrength === 'strong' ? '#166534' : '#92400E'}
        />
      </View>

      {/* Honest framing */}
      <View sx={{
        mt: '$3',
        backgroundColor: '#F8FAFC',
        borderRadius: 10,
        p: '$3',
      }}>
        <Text sx={{ fontSize: 12, color: '$mutedForeground', lineHeight: 18, fontStyle: 'italic' }}>
          {alcohol.honestFraming}
        </Text>
      </View>
    </View>
  );
}

function EnvironmentSection({ environment }: { environment: any }) {
  return (
    <View>
      <SectionHeader icon="🌿" title="Environment" />

      <Text sx={{ mt: '$3', fontSize: 14, color: '$mutedForeground', lineHeight: 20 }}>
        {environment.approach}
      </Text>

      {/* Actionable steps */}
      {environment.steps.length > 0 && (
        <View sx={{ mt: '$4', gap: '$2' }}>
          {environment.steps.map((step: any, i: number) => (
            <View key={i} sx={{
              borderWidth: 1,
              borderColor: '$border',
              borderRadius: 10,
              p: '$3',
            }}>
              <View sx={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text sx={{ fontSize: 11, fontWeight: '600', color: '$mutedForeground', textTransform: 'uppercase' }}>
                  {step.category}
                </Text>
                <View sx={{ flexDirection: 'row', gap: '$1' }}>
                  <MicroBadge label={step.difficulty} />
                  <MicroBadge label={step.cost} />
                  <MicroBadge label={step.evidence} />
                </View>
              </View>
              <Text sx={{ mt: '$2', fontSize: 13, fontWeight: '600', color: '$foreground' }}>
                {step.action}
              </Text>
              <Text sx={{ mt: '$1', fontSize: 12, color: '$mutedForeground', lineHeight: 18 }}>
                {step.why}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Overblown concerns */}
      {environment.overblownConcerns.length > 0 && (
        <View sx={{ mt: '$4' }}>
          <Text sx={{ fontSize: 13, fontWeight: '600', color: '$foreground' }}>
            Don't worry about
          </Text>
          <View sx={{ mt: '$2', gap: '$2' }}>
            {environment.overblownConcerns.map((c: any, i: number) => (
              <View key={i} sx={{
                backgroundColor: '#F0FDF4',
                borderWidth: 1,
                borderColor: '#BBF7D0',
                borderRadius: 10,
                p: '$3',
              }}>
                <Text sx={{ fontSize: 13, fontWeight: '600', color: '#166534' }}>
                  "{c.claim}"
                </Text>
                <Text sx={{ mt: '$1', fontSize: 12, color: '#14532D', lineHeight: 18 }}>
                  {c.reality}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

// ============================================================================
// Shared primitives
// ============================================================================

function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <View sx={{
      flexDirection: 'row',
      alignItems: 'center',
      gap: '$2',
      borderBottomWidth: 1,
      borderBottomColor: '$border',
      pb: '$3',
    }}>
      <View sx={{
        width: 36, height: 36, borderRadius: 10,
        backgroundColor: '#F1F5F9',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <Text sx={{ fontSize: 18 }}>{icon}</Text>
      </View>
      <Text sx={{ fontSize: 20, fontWeight: 'bold', color: '$foreground' }}>
        {title}
      </Text>
    </View>
  );
}

function Badge({ label, bg, fg }: { label: string; bg: string; fg: string }) {
  return (
    <View sx={{ backgroundColor: bg, borderRadius: 12, px: '$2', py: 3 }}>
      <Text sx={{ fontSize: 11, fontWeight: '600', color: fg }}>{label}</Text>
    </View>
  );
}

function MicroBadge({ label }: { label: string }) {
  return (
    <View sx={{ backgroundColor: '#F1F5F9', borderRadius: 6, px: 5, py: 2 }}>
      <Text sx={{ fontSize: 10, color: '#64748B' }}>{label}</Text>
    </View>
  );
}
