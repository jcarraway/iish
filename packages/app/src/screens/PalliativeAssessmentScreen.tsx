import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import {
  useSubmitSymptomAssessmentMutation,
  useGetSymptomAssessmentHistoryQuery,
} from '../generated/graphql';

// ============================================================================
// Constants
// ============================================================================

const SYMPTOMS = [
  { key: 'pain', label: 'Pain' },
  { key: 'tiredness', label: 'Tiredness' },
  { key: 'nausea', label: 'Nausea' },
  { key: 'depression', label: 'Depression' },
  { key: 'anxiety', label: 'Anxiety' },
  { key: 'drowsiness', label: 'Drowsiness' },
  { key: 'appetite', label: 'Lack of Appetite' },
  { key: 'wellbeing', label: 'Feeling of Wellbeing' },
  { key: 'shortnessOfBreath', label: 'Shortness of Breath' },
] as const;

type SymptomKey = (typeof SYMPTOMS)[number]['key'];

const NUMBERS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const TRIAGE_COLORS: Record<string, { bg: string; fg: string; border: string; label: string }> = {
  emergency: { bg: '#FEE2E2', fg: '#991B1B', border: '#FCA5A5', label: 'Emergency' },
  urgent: { bg: '#FFF7ED', fg: '#9A3412', border: '#FDBA74', label: 'Urgent' },
  monitor: { bg: '#FEF9C3', fg: '#854D0E', border: '#FDE047', label: 'Monitor' },
  routine: { bg: '#DCFCE7', fg: '#166534', border: '#BBF7D0', label: 'Routine' },
};

function severityColor(v: number): string {
  if (v <= 3) return '#16A34A';
  if (v <= 6) return '#D97706';
  return '#DC2626';
}

function trendArrow(delta: number): string {
  if (delta > 0) return '\u2191';  // worse
  if (delta < 0) return '\u2193';  // better
  return '\u2192';                  // stable
}

function trendColor(delta: number): string {
  if (delta > 0) return '#DC2626';  // worse = red
  if (delta < 0) return '#16A34A';  // better = green
  return '#9CA3AF';                  // stable = gray
}

function trendLabel(delta: number): string {
  if (delta > 0) return 'worse';
  if (delta < 0) return 'better';
  return 'stable';
}

// ============================================================================
// Component
// ============================================================================

export function PalliativeAssessmentScreen() {
  const [scores, setScores] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState<any>(null);
  const [showHistory, setShowHistory] = useState(false);

  const [submitAssessment, { loading: submitting }] = useSubmitSymptomAssessmentMutation();
  const { data: historyData, loading: historyLoading, refetch } =
    useGetSymptomAssessmentHistoryQuery({
      variables: { limit: 10 },
      errorPolicy: 'ignore',
    });

  const allFilled = SYMPTOMS.every((s) => scores[s.key] !== undefined);
  const totalScore = allFilled
    ? SYMPTOMS.reduce((sum, s) => sum + (scores[s.key] ?? 0), 0)
    : null;

  const handleSubmit = async () => {
    if (!allFilled) return;
    try {
      const input = {
        pain: scores.pain,
        tiredness: scores.tiredness,
        nausea: scores.nausea,
        depression: scores.depression,
        anxiety: scores.anxiety,
        drowsiness: scores.drowsiness,
        appetite: scores.appetite,
        wellbeing: scores.wellbeing,
        shortnessOfBreath: scores.shortnessOfBreath,
      };
      const result = await submitAssessment({ variables: { input } });
      if (result.data?.submitSymptomAssessment) {
        setSubmitted(result.data.submitSymptomAssessment);
        refetch();
      }
    } catch {
      // handled by Apollo error policy
    }
  };

  const history = historyData?.symptomAssessmentHistory ?? [];

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Link href="/palliative">
          <Text sx={{ fontSize: 14, color: 'blue600', mb: '$4' }}>
            {'\u2190'} Back to Palliative Care
          </Text>
        </Link>

        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          ESAS Symptom Assessment
        </Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
          Rate each symptom from 0 (none) to 10 (worst possible). This takes about 2 minutes.
        </Text>

        {/* ============================================================= */}
        {/* Assessment Form */}
        {/* ============================================================= */}
        {!submitted ? (
          <>
            <View sx={{ mt: '$6', gap: '$5' }}>
              {SYMPTOMS.map(({ key, label }) => (
                <View key={key}>
                  <View
                    sx={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: '$2',
                    }}
                  >
                    <Text sx={{ fontSize: 15, fontWeight: '600', color: '$foreground' }}>
                      {label}
                    </Text>
                    {scores[key] !== undefined && (
                      <Text
                        sx={{
                          fontSize: 14,
                          fontWeight: 'bold',
                          color: severityColor(scores[key]),
                        }}
                      >
                        {scores[key]}/10
                      </Text>
                    )}
                  </View>
                  <View sx={{ flexDirection: 'row', gap: 4, flexWrap: 'wrap' }}>
                    {NUMBERS.map((n) => {
                      const selected = scores[key] === n;
                      return (
                        <Pressable
                          key={n}
                          onPress={() =>
                            setScores((prev) => ({ ...prev, [key]: n }))
                          }
                        >
                          <View
                            sx={{
                              width: 30,
                              height: 30,
                              borderRadius: 6,
                              borderWidth: 1,
                              borderColor: selected ? severityColor(n) : '$border',
                              backgroundColor: selected ? severityColor(n) : 'transparent',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Text
                              sx={{
                                fontSize: 12,
                                fontWeight: selected ? 'bold' : '400',
                                color: selected ? 'white' : '$foreground',
                              }}
                            >
                              {n}
                            </Text>
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                  <View
                    sx={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      mt: '$1',
                    }}
                  >
                    <Text sx={{ fontSize: 11, color: '$mutedForeground' }}>None</Text>
                    <Text sx={{ fontSize: 11, color: '$mutedForeground' }}>Worst</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Total preview */}
            {totalScore != null && (
              <View
                sx={{
                  mt: '$4',
                  backgroundColor: '#F8FAFC',
                  borderRadius: 10,
                  p: '$4',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground' }}>
                  Total Score
                </Text>
                <Text sx={{ fontSize: 18, fontWeight: 'bold', color: severityColor(Math.round(totalScore / 9)) }}>
                  {totalScore}/90
                </Text>
              </View>
            )}

            {/* Submit */}
            <Pressable onPress={handleSubmit} disabled={!allFilled || submitting}>
              <View
                sx={{
                  mt: '$6',
                  backgroundColor: allFilled ? 'blue600' : '#CBD5E1',
                  borderRadius: 10,
                  py: '$3',
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: '$2',
                }}
              >
                {submitting && <ActivityIndicator size="small" color="white" />}
                <Text sx={{ fontSize: 16, fontWeight: '600', color: 'white' }}>
                  {submitting ? 'Submitting...' : 'Submit Assessment'}
                </Text>
              </View>
            </Pressable>
          </>
        ) : (
          /* ============================================================= */
          /* Triage Result */
          /* ============================================================= */
          <View sx={{ mt: '$6' }}>
            {(() => {
              const info =
                TRIAGE_COLORS[submitted.triageLevel] ?? TRIAGE_COLORS.routine;
              return (
                <View
                  sx={{
                    backgroundColor: info.bg,
                    borderWidth: 2,
                    borderColor: info.border,
                    borderRadius: 12,
                    p: '$5',
                  }}
                >
                  <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$3' }}>
                    <Text sx={{ fontSize: 14, fontWeight: '600', color: info.fg }}>
                      Triage Level:
                    </Text>
                    <View
                      sx={{
                        backgroundColor: 'white',
                        borderRadius: 12,
                        px: '$3',
                        py: 4,
                      }}
                    >
                      <Text
                        sx={{
                          fontSize: 13,
                          fontWeight: 'bold',
                          color: info.fg,
                          textTransform: 'uppercase',
                        }}
                      >
                        {info.label}
                      </Text>
                    </View>
                  </View>

                  {submitted.totalScore != null && (
                    <Text sx={{ mt: '$3', fontSize: 14, color: info.fg }}>
                      Total Score: {submitted.totalScore}/90
                    </Text>
                  )}

                  {submitted.triageRationale && (
                    <Text sx={{ mt: '$2', fontSize: 14, color: info.fg, lineHeight: 22 }}>
                      {submitted.triageRationale}
                    </Text>
                  )}

                  {submitted.recommendations?.length > 0 && (
                    <View sx={{ mt: '$4' }}>
                      <Text sx={{ fontSize: 14, fontWeight: '600', color: info.fg }}>
                        Recommendations
                      </Text>
                      {submitted.recommendations.map((r: string, i: number) => (
                        <View
                          key={i}
                          sx={{
                            flexDirection: 'row',
                            gap: '$2',
                            alignItems: 'flex-start',
                            mt: '$2',
                          }}
                        >
                          <View
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: 3,
                              backgroundColor: info.fg,
                              mt: 7,
                            }}
                          />
                          <Text
                            sx={{ fontSize: 13, color: info.fg, lineHeight: 20, flex: 1 }}
                          >
                            {r}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })()}

            <Pressable
              onPress={() => {
                setSubmitted(null);
                setScores({});
              }}
            >
              <View
                sx={{
                  mt: '$4',
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: 'blue600',
                  px: '$6',
                  py: '$3',
                  alignItems: 'center',
                }}
              >
                <Text sx={{ fontSize: 15, fontWeight: '600', color: 'blue600' }}>
                  New Assessment
                </Text>
              </View>
            </Pressable>
          </View>
        )}

        {/* ============================================================= */}
        {/* Assessment History */}
        {/* ============================================================= */}
        <View sx={{ mt: '$10' }}>
          <Pressable onPress={() => setShowHistory(!showHistory)}>
            <View sx={{ borderBottomWidth: 1, borderBottomColor: '$border', pb: '$3' }}>
              <Text sx={{ fontSize: 20, fontWeight: 'bold', color: '$foreground' }}>
                Assessment History {showHistory ? '\u25BE' : '\u25B8'}
              </Text>
            </View>
          </Pressable>

          {showHistory &&
            (historyLoading ? (
              <View
                sx={{
                  mt: '$4',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <ActivityIndicator size="small" />
                <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>
                  Loading history...
                </Text>
              </View>
            ) : history.length === 0 ? (
              <Text sx={{ mt: '$4', fontSize: 14, color: '$mutedForeground' }}>
                No assessments recorded yet.
              </Text>
            ) : (
              <View sx={{ mt: '$4', gap: '$3' }}>
                {history.map((assessment: any) => {
                  const info =
                    TRIAGE_COLORS[assessment.triageLevel] ?? TRIAGE_COLORS.routine;
                  const esasScores = assessment.esasScores ?? {};
                  const trends = assessment.trends ?? {};
                  return (
                    <View
                      key={assessment.id}
                      sx={{
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: '$border',
                        p: '$4',
                      }}
                    >
                      <View
                        sx={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Text sx={{ fontSize: 13, color: '$mutedForeground' }}>
                          {new Date(assessment.createdAt).toLocaleDateString()}
                        </Text>
                        <View
                          sx={{
                            backgroundColor: info.bg,
                            borderRadius: 8,
                            px: '$2',
                            py: 3,
                          }}
                        >
                          <Text
                            sx={{
                              fontSize: 11,
                              fontWeight: '600',
                              color: info.fg,
                            }}
                          >
                            {info.label}
                          </Text>
                        </View>
                      </View>

                      {assessment.totalScore != null && (
                        <Text sx={{ mt: '$2', fontSize: 12, color: '$foreground' }}>
                          Total: {assessment.totalScore}/90
                        </Text>
                      )}

                      <View
                        sx={{
                          flexDirection: 'row',
                          flexWrap: 'wrap',
                          gap: '$2',
                          mt: '$2',
                        }}
                      >
                        {SYMPTOMS.map(({ key, label }) => {
                          const val = esasScores[key] ?? 0;
                          const delta = trends[key];
                          return (
                            <View
                              key={key}
                              sx={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 2,
                              }}
                            >
                              <Text sx={{ fontSize: 11, color: '$mutedForeground' }}>
                                {label.substring(0, 3)}:
                              </Text>
                              <Text
                                sx={{
                                  fontSize: 11,
                                  fontWeight: '600',
                                  color: severityColor(val),
                                }}
                              >
                                {val}
                              </Text>
                              {delta !== undefined && delta !== 0 && (
                                <Text
                                  sx={{
                                    fontSize: 10,
                                    fontWeight: '600',
                                    color: trendColor(delta),
                                  }}
                                >
                                  {trendArrow(delta)}
                                </Text>
                              )}
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  );
                })}
              </View>
            ))}
        </View>

        {/* Disclaimer */}
        <View
          sx={{
            mt: '$8',
            backgroundColor: '#FFFBEB',
            borderWidth: 1,
            borderColor: '#FDE68A',
            borderRadius: 12,
            p: '$5',
          }}
        >
          <Text sx={{ fontSize: 13, fontWeight: '600', color: '#92400E' }}>
            Important disclaimer
          </Text>
          <Text sx={{ mt: '$2', fontSize: 12, color: '#78350F', lineHeight: 18 }}>
            This symptom assessment is a screening tool, not a diagnosis. Share your results
            with your care team. If you are experiencing severe symptoms (7 or above), contact
            your provider promptly.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
