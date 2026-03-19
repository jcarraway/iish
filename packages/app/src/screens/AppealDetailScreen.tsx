import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import {
  useGetInsuranceDenialQuery,
  useGenerateAppealLetterMutation,
  useUpdateDenialStatusMutation,
  useGeneratePeerReviewPrepMutation,
  GetInsuranceDenialDocument,
} from '../generated/graphql';

// ============================================================================
// Constants
// ============================================================================

const STATUS_COLORS: Record<string, { bg: string; fg: string; label: string }> = {
  denied: { bg: '#FEE2E2', fg: '#991B1B', label: 'Denied' },
  appeal_drafted: { bg: '#FEF3C7', fg: '#92400E', label: 'Appeal Drafted' },
  submitted: { bg: '#DBEAFE', fg: '#1E40AF', label: 'Submitted' },
  appeal_won: { bg: '#DCFCE7', fg: '#166534', label: 'Won' },
  appeal_lost: { bg: '#F3F4F6', fg: '#6B7280', label: 'Lost' },
  under_review: { bg: '#E0E7FF', fg: '#4338CA', label: 'Under Review' },
};

const TIMELINE_STEPS = [
  { key: 'denied', label: 'Denied' },
  { key: 'appeal_drafted', label: 'Appeal Drafted' },
  { key: 'submitted', label: 'Submitted' },
  { key: 'decision', label: 'Decision' },
];

// ============================================================================
// Component
// ============================================================================

export function AppealDetailScreen({ id }: { id?: string }) {
  const [showPeerPrep, setShowPeerPrep] = useState(false);

  const { data, loading, refetch } = useGetInsuranceDenialQuery({
    variables: { id: id ?? '' },
    skip: !id,
  });

  const [generateAppealLetter, { loading: generating }] = useGenerateAppealLetterMutation({
    refetchQueries: [{ query: GetInsuranceDenialDocument, variables: { id } }],
  });

  const [updateDenialStatus, { loading: updating }] = useUpdateDenialStatusMutation({
    onCompleted: () => refetch(),
  });

  const [generatePeerPrep, { data: prepData, loading: prepping }] =
    useGeneratePeerReviewPrepMutation();

  const denial = data?.insuranceDenial;
  const prep = prepData?.generatePeerReviewPrep;

  if (!id) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 20, fontWeight: 'bold', color: '$foreground' }}>
          No denial selected
        </Text>
        <Link href="/advocate">
          <Text sx={{ mt: '$4', fontSize: 14, color: 'blue600' }}>
            Back to Insurance Advocate {'\u2192'}
          </Text>
        </Link>
      </View>
    );
  }

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>Appeal Detail</Text>
        <View sx={{ mt: '$8', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <ActivityIndicator size="small" />
          <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>Loading denial details...</Text>
        </View>
      </View>
    );
  }

  if (!denial) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 20, fontWeight: 'bold', color: '$foreground' }}>
          Denial not found
        </Text>
        <Link href="/advocate">
          <Text sx={{ mt: '$4', fontSize: 14, color: 'blue600' }}>
            Back to Insurance Advocate {'\u2192'}
          </Text>
        </Link>
      </View>
    );
  }

  const status = STATUS_COLORS[denial.status] ?? STATUS_COLORS.denied;
  const deadlineColor = getDeadlineColor(denial.appealDeadline);
  const currentStepIndex = getTimelineIndex(denial.status);
  const letters = denial.appealLetters ?? [];
  const latestLetter = letters.length > 0 ? letters[letters.length - 1] : null;

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        {/* Back link */}
        <Link href="/advocate">
          <Text sx={{ fontSize: 13, color: 'blue600' }}>
            {'\u2190'} Back to Insurance Advocate
          </Text>
        </Link>

        {/* Denial summary card */}
        <View sx={{
          mt: '$4',
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
            <Text sx={{ fontSize: 24, fontWeight: 'bold', color: '$foreground', flex: 1, mr: '$3' }}>
              {denial.deniedService}
            </Text>
            <View sx={{
              backgroundColor: status.bg,
              borderRadius: 12,
              px: '$3',
              py: 4,
            }}>
              <Text sx={{ fontSize: 12, fontWeight: '600', color: status.fg }}>
                {status.label}
              </Text>
            </View>
          </View>

          <View sx={{ mt: '$4', gap: '$2' }}>
            <DetailRow label="Insurer" value={denial.insurerName} />
            <DetailRow label="Category" value={formatCategory(denial.serviceCategory)} />
            <DetailRow label="Denial Date" value={new Date(denial.denialDate).toLocaleDateString()} />
            {denial.claimNumber && <DetailRow label="Claim #" value={denial.claimNumber} />}
            {denial.planType && <DetailRow label="Plan Type" value={formatCategory(denial.planType)} />}
          </View>

          <View sx={{ mt: '$4' }}>
            <Text sx={{ fontSize: 12, fontWeight: '600', color: '$foreground' }}>
              Denial Reason
            </Text>
            <Text sx={{ mt: '$1', fontSize: 13, color: '$mutedForeground', lineHeight: 20 }}>
              {denial.denialReason}
            </Text>
          </View>

          {denial.appealDeadline && (
            <View sx={{
              mt: '$4',
              backgroundColor: deadlineColor.bg,
              borderRadius: 8,
              px: '$3',
              py: '$2',
            }}>
              <Text sx={{ fontSize: 13, fontWeight: '600', color: deadlineColor.fg }}>
                Appeal deadline: {new Date(denial.appealDeadline).toLocaleDateString()}
                {' \u00B7 '}
                {daysUntilLabel(denial.appealDeadline)}
              </Text>
            </View>
          )}
        </View>

        {/* Status timeline */}
        <View sx={{ mt: '$6' }}>
          <Text sx={{ fontSize: 16, fontWeight: '600', color: '$foreground', mb: '$4' }}>
            Appeal Timeline
          </Text>
          <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$1' }}>
            {TIMELINE_STEPS.map((step, i) => {
              const isActive = i <= currentStepIndex;
              const isCurrent = i === currentStepIndex;
              return (
                <View key={step.key} sx={{ flex: 1, alignItems: 'center' }}>
                  <View sx={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: isActive ? 'blue600' : '#E5E7EB',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: isCurrent ? 3 : 0,
                    borderColor: '#93C5FD',
                  }}>
                    <Text sx={{
                      fontSize: 11,
                      fontWeight: 'bold',
                      color: isActive ? 'white' : '#9CA3AF',
                    }}>
                      {i + 1}
                    </Text>
                  </View>
                  <Text sx={{
                    mt: '$1',
                    fontSize: 10,
                    fontWeight: isCurrent ? '600' : '400',
                    color: isActive ? '$foreground' : '$mutedForeground',
                    textAlign: 'center',
                  }}>
                    {step.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Generate appeal letter */}
        {denial.status !== 'appeal_won' && denial.status !== 'appeal_lost' && (
          <View sx={{ mt: '$6' }}>
            <Pressable
              onPress={() => generateAppealLetter({ variables: { denialId: id } })}
              disabled={generating}
            >
              <View sx={{
                backgroundColor: generating ? '#D1D5DB' : 'blue600',
                borderRadius: 8,
                py: '$3',
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: '$2',
              }}>
                {generating && <ActivityIndicator size="small" color="white" />}
                <Text sx={{ fontSize: 14, fontWeight: '600', color: 'white' }}>
                  {generating
                    ? 'Generating appeal letter...'
                    : letters.length > 0
                      ? 'Generate Next-Level Appeal Letter'
                      : 'Generate Appeal Letter'}
                </Text>
              </View>
            </Pressable>
          </View>
        )}

        {/* Appeal letters */}
        {letters.length > 0 && (
          <View sx={{ mt: '$6', gap: '$4' }}>
            <View sx={{ borderBottomWidth: 1, borderBottomColor: '$border', pb: '$3' }}>
              <Text sx={{ fontSize: 20, fontWeight: 'bold', color: '$foreground' }}>
                Appeal Letters ({letters.length})
              </Text>
            </View>

            {letters.map((letter, i) => (
              <View key={letter.id} sx={{
                borderWidth: 1,
                borderColor: '$border',
                borderRadius: 12,
                overflow: 'hidden',
              }}>
                <View sx={{
                  backgroundColor: '#F9FAFB',
                  px: '$4',
                  py: '$3',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground' }}>
                    {formatAppealLevel(letter.appealLevel)}
                  </Text>
                  <Text sx={{ fontSize: 12, color: '$mutedForeground' }}>
                    {new Date(letter.generatedAt).toLocaleDateString()}
                  </Text>
                </View>

                {/* Letter content */}
                <View sx={{ p: '$4', backgroundColor: 'white' }}>
                  <Text sx={{
                    fontSize: 13,
                    color: '#374151',
                    lineHeight: 22,
                    fontFamily: 'monospace',
                  }}>
                    {letter.letterContent}
                  </Text>
                </View>

                {/* Physician signature required */}
                <View sx={{
                  mx: '$4',
                  mb: '$3',
                  backgroundColor: '#FEE2E2',
                  borderRadius: 8,
                  p: '$3',
                }}>
                  <Text sx={{ fontSize: 13, fontWeight: 'bold', color: '#991B1B' }}>
                    [PHYSICIAN SIGNATURE REQUIRED]
                  </Text>
                  <Text sx={{ mt: '$1', fontSize: 12, color: '#B91C1C' }}>
                    This letter must be reviewed and signed by your treating physician before submission.
                  </Text>
                </View>

                {/* Patient summary */}
                {letter.patientSummary && (
                  <View sx={{ mx: '$4', mb: '$3' }}>
                    <Text sx={{ fontSize: 12, fontWeight: '600', color: '$foreground', mb: '$1' }}>
                      Patient Summary (2-sentence version)
                    </Text>
                    <View sx={{
                      backgroundColor: '#F0F9FF',
                      borderRadius: 8,
                      p: '$3',
                    }}>
                      <Text sx={{ fontSize: 13, color: '#075985', lineHeight: 20 }}>
                        {letter.patientSummary}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Supporting documents */}
                {letter.supportingDocuments.length > 0 && (
                  <View sx={{ mx: '$4', mb: '$4' }}>
                    <Text sx={{ fontSize: 12, fontWeight: '600', color: '$foreground', mb: '$2' }}>
                      Supporting Documents Checklist
                    </Text>
                    {letter.supportingDocuments.map((doc, di) => (
                      <View key={di} sx={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: '$2',
                        py: '$1',
                      }}>
                        <View sx={{
                          width: 16,
                          height: 16,
                          borderRadius: 3,
                          borderWidth: 1,
                          borderColor: '#D1D5DB',
                        }} />
                        <Text sx={{ fontSize: 12, color: '$mutedForeground', flex: 1 }}>
                          {doc}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Outcome badge */}
                {letter.outcome && (
                  <View sx={{ mx: '$4', mb: '$4' }}>
                    <View sx={{
                      backgroundColor: letter.outcome === 'approved' ? '#DCFCE7' : '#FEF3C7',
                      borderRadius: 8,
                      p: '$3',
                    }}>
                      <Text sx={{
                        fontSize: 13,
                        fontWeight: '600',
                        color: letter.outcome === 'approved' ? '#166534' : '#92400E',
                      }}>
                        Outcome: {letter.outcome === 'approved' ? 'Approved' : letter.outcome}
                      </Text>
                      {letter.outcomeDetails && (
                        <Text sx={{
                          mt: '$1',
                          fontSize: 12,
                          color: letter.outcome === 'approved' ? '#14532D' : '#78350F',
                        }}>
                          {letter.outcomeDetails}
                        </Text>
                      )}
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Action buttons */}
        {denial.status !== 'appeal_won' && denial.status !== 'appeal_lost' && letters.length > 0 && (
          <View sx={{ mt: '$6', gap: '$3' }}>
            <View sx={{ borderBottomWidth: 1, borderBottomColor: '$border', pb: '$3' }}>
              <Text sx={{ fontSize: 18, fontWeight: '600', color: '$foreground' }}>
                Actions
              </Text>
            </View>

            {denial.status !== 'submitted' && (
              <Pressable
                onPress={() =>
                  updateDenialStatus({
                    variables: { input: { denialId: id, status: 'submitted' } },
                  })
                }
                disabled={updating}
              >
                <View sx={{
                  borderWidth: 1,
                  borderColor: '#3B82F6',
                  borderRadius: 8,
                  py: '$3',
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: '$2',
                }}>
                  {updating && <ActivityIndicator size="small" />}
                  <Text sx={{ fontSize: 14, fontWeight: '600', color: '#3B82F6' }}>
                    {updating ? 'Updating...' : 'Mark as Submitted'}
                  </Text>
                </View>
              </Pressable>
            )}

            <Pressable
              onPress={() => {
                generatePeerPrep({ variables: { denialId: id } });
                setShowPeerPrep(true);
              }}
              disabled={prepping}
            >
              <View sx={{
                borderWidth: 1,
                borderColor: '#8B5CF6',
                borderRadius: 8,
                py: '$3',
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: '$2',
              }}>
                {prepping && <ActivityIndicator size="small" />}
                <Text sx={{ fontSize: 14, fontWeight: '600', color: '#8B5CF6' }}>
                  {prepping ? 'Generating...' : 'Generate Peer-to-Peer Prep'}
                </Text>
              </View>
            </Pressable>
          </View>
        )}

        {/* Peer review prep */}
        {showPeerPrep && prep && (
          <View sx={{ mt: '$6' }}>
            <View sx={{ borderBottomWidth: 1, borderBottomColor: '$border', pb: '$3' }}>
              <Text sx={{ fontSize: 20, fontWeight: 'bold', color: '#7C3AED' }}>
                Peer-to-Peer Review Prep
              </Text>
              <Text sx={{ mt: '$1', fontSize: 12, color: '$mutedForeground' }}>
                Generated {new Date(prep.generatedAt).toLocaleDateString()}
              </Text>
            </View>

            {/* Key points */}
            {prep.keyPoints.length > 0 && (
              <PrepSection title="Key Points to Make">
                {prep.keyPoints.map((point, i) => (
                  <Text key={i} sx={{ fontSize: 13, color: '$foreground', lineHeight: 22 }}>
                    {i + 1}. {point}
                  </Text>
                ))}
              </PrepSection>
            )}

            {/* Anticipated arguments */}
            {prep.anticipatedArguments.length > 0 && (
              <PrepSection title="Anticipated Arguments & Rebuttals">
                {prep.anticipatedArguments.map((item, i) => (
                  <View key={i} sx={{
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                    borderRadius: 8,
                    p: '$3',
                    mb: i < prep.anticipatedArguments.length - 1 ? '$3' : 0,
                  }}>
                    <Text sx={{ fontSize: 12, fontWeight: '600', color: '#991B1B' }}>
                      They may say:
                    </Text>
                    <Text sx={{ fontSize: 13, color: '#374151', mt: '$1', lineHeight: 20 }}>
                      {item.argument}
                    </Text>
                    <Text sx={{ fontSize: 12, fontWeight: '600', color: '#166534', mt: '$2' }}>
                      Your rebuttal:
                    </Text>
                    <Text sx={{ fontSize: 13, color: '#374151', mt: '$1', lineHeight: 20 }}>
                      {item.rebuttal}
                    </Text>
                  </View>
                ))}
              </PrepSection>
            )}

            {/* Clinical guidelines */}
            {prep.guidelines.length > 0 && (
              <PrepSection title="Relevant Clinical Guidelines">
                {prep.guidelines.map((g, i) => (
                  <Text key={i} sx={{ fontSize: 13, color: '$foreground', lineHeight: 20 }}>
                    {'\u2022'} {g}
                  </Text>
                ))}
              </PrepSection>
            )}

            {/* Tips */}
            {prep.tips.length > 0 && (
              <PrepSection title="Tips for the Call">
                {prep.tips.map((tip, i) => (
                  <Text key={i} sx={{ fontSize: 13, color: '$foreground', lineHeight: 20 }}>
                    {'\u2022'} {tip}
                  </Text>
                ))}
              </PrepSection>
            )}
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
            Important disclaimer
          </Text>
          <Text sx={{ mt: '$2', fontSize: 12, color: '#78350F', lineHeight: 18 }}>
            All appeal letters are AI-generated and must be reviewed, edited, and signed by your
            treating physician before submission to your insurance company. This is not legal advice.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View sx={{ flexDirection: 'row', gap: '$2' }}>
      <Text sx={{ fontSize: 13, fontWeight: '600', color: '$mutedForeground', width: 100 }}>
        {label}
      </Text>
      <Text sx={{ fontSize: 13, color: '$foreground', flex: 1 }}>
        {value}
      </Text>
    </View>
  );
}

function PrepSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View sx={{
      mt: '$4',
      borderWidth: 1,
      borderColor: '$border',
      borderRadius: 12,
      p: '$4',
    }}>
      <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground', mb: '$3' }}>
        {title}
      </Text>
      <View sx={{ gap: '$2' }}>
        {children}
      </View>
    </View>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function formatCategory(cat: string): string {
  return cat
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function formatAppealLevel(level: string): string {
  if (level === 'internal_1') return 'Internal Appeal (Level 1)';
  if (level === 'internal_2') return 'Internal Appeal (Level 2)';
  if (level === 'external') return 'External Review';
  return level.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function getTimelineIndex(status: string): number {
  switch (status) {
    case 'denied':
      return 0;
    case 'appeal_drafted':
      return 1;
    case 'submitted':
    case 'under_review':
      return 2;
    case 'appeal_won':
    case 'appeal_lost':
      return 3;
    default:
      return 0;
  }
}

function getDeadlineColor(deadline: string | null | undefined): { bg: string; fg: string } {
  if (!deadline) return { bg: '#F3F4F6', fg: '#6B7280' };
  const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (days < 0) return { bg: '#FEE2E2', fg: '#991B1B' };
  if (days < 7) return { bg: '#FEE2E2', fg: '#991B1B' };
  if (days < 30) return { bg: '#FEF3C7', fg: '#92400E' };
  return { bg: '#DCFCE7', fg: '#166534' };
}

function daysUntilLabel(dateStr: string): string {
  const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'today';
  if (diff === 1) return 'tomorrow';
  if (diff < 0) return `${Math.abs(diff)} days ago`;
  return `in ${diff} days`;
}
