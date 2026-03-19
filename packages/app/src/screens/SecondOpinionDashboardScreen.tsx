import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import {
  useGetSecondOpinionEvaluationQuery,
  useGetSecondOpinionRequestQuery,
  useCreateSecondOpinionRequestMutation,
  GetSecondOpinionRequestDocument,
  GetSecondOpinionEvaluationDocument,
} from '../generated/graphql';

// ============================================================================
// Constants
// ============================================================================

const SEVERITY_COLORS: Record<string, { bg: string; fg: string; border: string }> = {
  high: { bg: '#FEE2E2', fg: '#991B1B', border: '#FCA5A5' },
  moderate: { bg: '#FEF3C7', fg: '#92400E', border: '#FDE68A' },
  low: { bg: '#DBEAFE', fg: '#1E40AF', border: '#BAE6FD' },
};

const STATUS_STEPS = [
  { key: 'recommended', label: 'Recommended' },
  { key: 'exploring', label: 'Exploring Options' },
  { key: 'packet_prepared', label: 'Packet Prepared' },
  { key: 'sent', label: 'Sent' },
  { key: 'completed', label: 'Completed' },
];

// ============================================================================
// Component
// ============================================================================

export function SecondOpinionDashboardScreen() {
  const { data: evalData, loading: evalLoading } = useGetSecondOpinionEvaluationQuery({
    errorPolicy: 'ignore',
  });
  const { data: reqData, loading: reqLoading } = useGetSecondOpinionRequestQuery({
    errorPolicy: 'ignore',
  });
  const [createRequest, { loading: creating }] = useCreateSecondOpinionRequestMutation({
    refetchQueries: [
      { query: GetSecondOpinionRequestDocument },
      { query: GetSecondOpinionEvaluationDocument },
    ],
  });

  const evaluation = evalData?.secondOpinionEvaluation;
  const request = reqData?.secondOpinionRequest;
  const loading = evalLoading || reqLoading;

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          Second Opinion
        </Text>
        <View sx={{ mt: '$8', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <ActivityIndicator size="small" />
          <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>Loading your second opinion status...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          Second Opinion
        </Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
          A second opinion is standard quality cancer care
        </Text>

        {/* ============================================================= */}
        {/* Reassurance Message */}
        {/* ============================================================= */}
        <View sx={{
          mt: '$6',
          backgroundColor: '#F0F9FF',
          borderWidth: 1,
          borderColor: '#BAE6FD',
          borderRadius: 12,
          p: '$5',
        }}>
          <Text sx={{ fontSize: 15, fontWeight: '600', color: '#0C4A6E' }}>
            You deserve confidence in your treatment plan
          </Text>
          <Text sx={{ mt: '$2', fontSize: 13, color: '#075985', lineHeight: 20 }}>
            Seeking a second opinion is one of the most important steps you can take as a cancer
            patient. Leading cancer organizations, including the National Cancer Institute, recommend
            it as a standard part of quality care. It is not a sign of distrust in your doctor — it
            is a sign of being an informed, empowered patient.
          </Text>
        </View>

        {/* ============================================================= */}
        {/* Clinical Triggers */}
        {/* ============================================================= */}
        {evaluation?.triggers && evaluation.triggers.length > 0 ? (
          <View sx={{ mt: '$6' }}>
            <SectionHeader title="Clinical Triggers Identified" />
            <Text sx={{ mt: '$2', fontSize: 13, color: '$mutedForeground', lineHeight: 20 }}>
              Based on your diagnosis and treatment plan, the following factors suggest a second
              opinion may be especially valuable.
            </Text>

            <View sx={{ mt: '$4', gap: '$3' }}>
              {evaluation.triggers.map((trigger: any, i: number) => {
                const severity = trigger.severity ?? 'moderate';
                const colors = SEVERITY_COLORS[severity] ?? SEVERITY_COLORS.moderate;

                return (
                  <View key={i} sx={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: colors.bg,
                    borderRadius: 12,
                    p: '$5',
                  }}>
                    <View sx={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}>
                      <Text sx={{ fontSize: 15, fontWeight: '600', color: colors.fg, flex: 1, mr: '$3' }}>
                        {trigger.name}
                      </Text>
                      <View sx={{
                        backgroundColor: colors.fg,
                        borderRadius: 12,
                        px: '$2',
                        py: 3,
                      }}>
                        <Text sx={{
                          fontSize: 10,
                          fontWeight: 'bold',
                          color: 'white',
                          textTransform: 'uppercase',
                        }}>
                          {severity}
                        </Text>
                      </View>
                    </View>
                    <Text sx={{ mt: '$2', fontSize: 13, color: colors.fg, lineHeight: 20 }}>
                      {trigger.rationale}
                    </Text>
                    {trigger.evidenceBase && (
                      <Text sx={{ mt: '$2', fontSize: 11, color: colors.fg, opacity: 0.8 }}>
                        Evidence: {trigger.evidenceBase}
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        ) : (
          <View sx={{
            mt: '$6',
            borderWidth: 1,
            borderColor: '#BBF7D0',
            backgroundColor: '#F0FDF4',
            borderRadius: 12,
            p: '$5',
          }}>
            <Text sx={{ fontSize: 15, fontWeight: '600', color: '#166534' }}>
              No clinical triggers identified
            </Text>
            <Text sx={{ mt: '$2', fontSize: 13, color: '#14532D', lineHeight: 20 }}>
              We did not identify specific clinical factors that strongly indicate a need for a
              second opinion. However, a second opinion is always your right and is encouraged at
              any point in your cancer journey. You do not need a clinical reason to seek one.
            </Text>
          </View>
        )}

        {/* ============================================================= */}
        {/* Begin Process Button */}
        {/* ============================================================= */}
        {!request && (
          <Pressable
            onPress={() => createRequest()}
            disabled={creating}
          >
            <View sx={{
              mt: '$6',
              backgroundColor: creating ? '#9CA3AF' : 'blue600',
              borderRadius: 8,
              py: '$3',
              alignItems: 'center',
            }}>
              {creating ? (
                <View sx={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <ActivityIndicator color="white" size="small" />
                  <Text sx={{ fontSize: 14, fontWeight: '600', color: 'white' }}>
                    Starting...
                  </Text>
                </View>
              ) : (
                <Text sx={{ fontSize: 14, fontWeight: '600', color: 'white' }}>
                  Begin second opinion process
                </Text>
              )}
            </View>
          </Pressable>
        )}

        {/* ============================================================= */}
        {/* Status Timeline */}
        {/* ============================================================= */}
        {request && (
          <View sx={{ mt: '$6' }}>
            <SectionHeader title="Your Progress" />

            <View sx={{ mt: '$4', gap: '$2' }}>
              {STATUS_STEPS.map((step, i) => {
                const currentIdx = STATUS_STEPS.findIndex(s => s.key === request.status);
                const isCompleted = i < currentIdx;
                const isCurrent = i === currentIdx;

                return (
                  <View key={step.key} sx={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: '$3',
                    p: '$4',
                    borderRadius: 10,
                    borderWidth: isCurrent ? 2 : 1,
                    borderColor: isCurrent ? 'blue600' : isCompleted ? '#BBF7D0' : '$border',
                    backgroundColor: isCurrent ? '#DBEAFE' : isCompleted ? '#F0FDF4' : 'transparent',
                  }}>
                    <View sx={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: isCompleted ? '#22C55E' : isCurrent ? 'blue600' : '#E5E7EB',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {isCompleted ? (
                        <Text sx={{ fontSize: 14, fontWeight: 'bold', color: 'white' }}>{'\u2713'}</Text>
                      ) : (
                        <Text sx={{
                          fontSize: 13,
                          fontWeight: 'bold',
                          color: isCurrent ? 'white' : '#9CA3AF',
                        }}>
                          {i + 1}
                        </Text>
                      )}
                    </View>
                    <Text sx={{
                      fontSize: 14,
                      fontWeight: isCurrent ? '600' : '500',
                      color: isCompleted || isCurrent ? '$foreground' : '$mutedForeground',
                    }}>
                      {step.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* ============================================================= */}
        {/* Outcome Card */}
        {/* ============================================================= */}
        {request?.outcome && (
          <View sx={{ mt: '$6' }}>
            <SectionHeader title="Outcome" />
            <View sx={{
              mt: '$4',
              borderWidth: 1,
              borderColor: '#BBF7D0',
              backgroundColor: '#F0FDF4',
              borderRadius: 12,
              p: '$5',
            }}>
              <Text sx={{ fontSize: 15, fontWeight: '600', color: '#166534' }}>
                Second opinion completed
              </Text>
              <Text sx={{ mt: '$2', fontSize: 14, color: '#14532D', lineHeight: 22 }}>
                {request.outcomeSummary ?? request.outcome.replace(/_/g, ' ')}
              </Text>
            </View>
          </View>
        )}

        {/* ============================================================= */}
        {/* Quick Links */}
        {/* ============================================================= */}
        <View sx={{ mt: '$6' }}>
          <SectionHeader title="Resources" />

          <View sx={{ mt: '$4', gap: '$3' }}>
            <Link href="/second-opinion/centers">
              <View sx={{
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '$border',
                p: '$5',
              }}>
                <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$3' }}>
                  <View sx={{
                    width: 40, height: 40, borderRadius: 10,
                    backgroundColor: '#EDE9FE', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Text sx={{ fontSize: 18 }}>{'🏥'}</Text>
                  </View>
                  <View sx={{ flex: 1 }}>
                    <Text sx={{ fontSize: 15, fontWeight: '600', color: '$foreground' }}>
                      Find Centers
                    </Text>
                    <Text sx={{ fontSize: 12, color: '$mutedForeground', mt: 2 }}>
                      NCI-designated cancer centers and virtual options
                    </Text>
                  </View>
                  <Text sx={{ fontSize: 16, color: '$mutedForeground' }}>{'\u2192'}</Text>
                </View>
              </View>
            </Link>

            <Link href="/second-opinion/packet">
              <View sx={{
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '$border',
                p: '$5',
              }}>
                <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$3' }}>
                  <View sx={{
                    width: 40, height: 40, borderRadius: 10,
                    backgroundColor: '#DBEAFE', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Text sx={{ fontSize: 18 }}>{'📋'}</Text>
                  </View>
                  <View sx={{ flex: 1 }}>
                    <Text sx={{ fontSize: 15, fontWeight: '600', color: '$foreground' }}>
                      Record Packet
                    </Text>
                    <Text sx={{ fontSize: 12, color: '$mutedForeground', mt: 2 }}>
                      Clinical summary and targeted questions for reviewers
                    </Text>
                  </View>
                  <Text sx={{ fontSize: 16, color: '$mutedForeground' }}>{'\u2192'}</Text>
                </View>
              </View>
            </Link>

            <Link href="/second-opinion/communication">
              <View sx={{
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '$border',
                p: '$5',
              }}>
                <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$3' }}>
                  <View sx={{
                    width: 40, height: 40, borderRadius: 10,
                    backgroundColor: '#FCE7F3', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Text sx={{ fontSize: 18 }}>{'💬'}</Text>
                  </View>
                  <View sx={{ flex: 1 }}>
                    <Text sx={{ fontSize: 15, fontWeight: '600', color: '$foreground' }}>
                      Communication Guide
                    </Text>
                    <Text sx={{ fontSize: 12, color: '$mutedForeground', mt: 2 }}>
                      How to discuss a second opinion with your oncologist
                    </Text>
                  </View>
                  <Text sx={{ fontSize: 16, color: '$mutedForeground' }}>{'\u2192'}</Text>
                </View>
              </View>
            </Link>
          </View>
        </View>

        {/* ============================================================= */}
        {/* Disclaimer */}
        {/* ============================================================= */}
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
            This second opinion assessment is AI-generated and should be discussed with your
            oncologist. It is not a substitute for professional medical advice. All clinical
            decisions should be made in partnership with your medical team.
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
