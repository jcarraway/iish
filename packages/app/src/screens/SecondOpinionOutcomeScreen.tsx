import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator, TextInput } from 'react-native';
import { Link } from 'solito/link';
import {
  useGetSecondOpinionRequestQuery,
  useRecordSecondOpinionOutcomeMutation,
  GetSecondOpinionRequestDocument,
} from '../generated/graphql';
import { Picker } from '../components/Picker';

// ============================================================================
// Constants
// ============================================================================

const OUTCOME_OPTIONS = [
  { label: 'Select outcome', value: '' },
  { label: 'Confirmed original plan', value: 'confirmed' },
  { label: 'Modified treatment plan', value: 'modified' },
  { label: 'Changed treatment entirely', value: 'changed' },
  { label: 'Seeking additional opinions', value: 'additional' },
  { label: 'Decided not to proceed', value: 'declined' },
];

const OUTCOME_LABELS: Record<string, string> = {
  confirmed: 'Confirmed original plan',
  modified: 'Modified treatment plan',
  changed: 'Changed treatment entirely',
  additional: 'Seeking additional opinions',
  declined: 'Decided not to proceed',
};

// ============================================================================
// Component
// ============================================================================

export function SecondOpinionOutcomeScreen() {
  const { data, loading: queryLoading } = useGetSecondOpinionRequestQuery({
    errorPolicy: 'ignore',
  });
  const [recordOutcome, { loading: recording }] = useRecordSecondOpinionOutcomeMutation({
    refetchQueries: [{ query: GetSecondOpinionRequestDocument }],
  });

  const request = data?.secondOpinionRequest;
  const isCompleted = !!request?.outcome;

  // Form state
  const [outcomeType, setOutcomeType] = useState('');
  const [outcomeSummary, setOutcomeSummary] = useState('');

  if (queryLoading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          Record Outcome
        </Text>
        <View sx={{ mt: '$8', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <ActivityIndicator size="small" />
          <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>Loading...</Text>
        </View>
      </View>
    );
  }

  // No active request
  if (!request) {
    return (
      <ScrollView sx={{ flex: 1 }}>
        <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
          <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
            Record Outcome
          </Text>
          <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
            Record the outcome of your second opinion
          </Text>

          <View sx={{
            mt: '$6',
            borderWidth: 2,
            borderStyle: 'dashed',
            borderColor: '$border',
            borderRadius: 16,
            p: '$8',
            alignItems: 'center',
          }}>
            <Text sx={{ fontSize: 16, fontWeight: '600', color: '$foreground', textAlign: 'center' }}>
              No active second opinion request
            </Text>
            <Text sx={{
              mt: '$2', fontSize: 14, color: '$mutedForeground',
              textAlign: 'center', maxWidth: 400, lineHeight: 22,
            }}>
              Start your second opinion process from the dashboard to track your journey and
              record outcomes.
            </Text>
            <Link href="/second-opinion">
              <View sx={{
                mt: '$5',
                backgroundColor: 'blue600',
                borderRadius: 8,
                px: '$6',
                py: '$3',
              }}>
                <Text sx={{ fontSize: 14, fontWeight: '600', color: 'white' }}>
                  Go to Dashboard
                </Text>
              </View>
            </Link>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          Record Outcome
        </Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
          Record the outcome of your second opinion consultation
        </Text>

        {/* ============================================================= */}
        {/* Completed Outcome */}
        {/* ============================================================= */}
        {isCompleted && (
          <View sx={{ mt: '$6' }}>
            <View sx={{
              borderWidth: 1,
              borderColor: '#BBF7D0',
              backgroundColor: '#F0FDF4',
              borderRadius: 12,
              p: '$5',
            }}>
              <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$2' }}>
                <View sx={{
                  width: 10, height: 10, borderRadius: 5,
                  backgroundColor: '#22C55E',
                }} />
                <Text sx={{ fontSize: 16, fontWeight: '600', color: '#166534' }}>
                  Outcome recorded
                </Text>
              </View>
              <Text sx={{ mt: '$3', fontSize: 15, fontWeight: '500', color: '#14532D' }}>
                {request.outcome ? OUTCOME_LABELS[request.outcome] ?? request.outcome.replace(/_/g, ' ') : 'Unknown'}
              </Text>
              {request.outcomeSummary && (
                <View sx={{
                  mt: '$3',
                  backgroundColor: 'white',
                  borderRadius: 8,
                  p: '$4',
                }}>
                  <Text sx={{ fontSize: 12, fontWeight: '600', color: '$mutedForeground', mb: '$1' }}>
                    Your notes
                  </Text>
                  <Text sx={{ fontSize: 14, color: '$foreground', lineHeight: 22 }}>
                    {request.outcomeSummary}
                  </Text>
                </View>
              )}
            </View>

            {/* Empowering message */}
            <View sx={{
              mt: '$4',
              backgroundColor: '#F0F9FF',
              borderWidth: 1,
              borderColor: '#BAE6FD',
              borderRadius: 12,
              p: '$5',
            }}>
              <Text sx={{ fontSize: 14, fontWeight: '600', color: '#0C4A6E' }}>
                You made the right choice
              </Text>
              <Text sx={{ mt: '$2', fontSize: 13, color: '#075985', lineHeight: 20 }}>
                Whatever the outcome, seeking a second opinion was the right decision. It either
                confirmed your treatment path or opened new possibilities — both outcomes serve
                your best interest.
              </Text>
            </View>
          </View>
        )}

        {/* ============================================================= */}
        {/* Outcome Form */}
        {/* ============================================================= */}
        {!isCompleted && (
          <View sx={{ mt: '$6' }}>
            {/* Empowering message */}
            <View sx={{
              backgroundColor: '#F0FDF4',
              borderWidth: 1,
              borderColor: '#BBF7D0',
              borderRadius: 12,
              p: '$5',
              mb: '$6',
            }}>
              <Text sx={{ fontSize: 14, fontWeight: '600', color: '#166534' }}>
                Whatever the outcome, you made the right choice
              </Text>
              <Text sx={{ mt: '$2', fontSize: 13, color: '#14532D', lineHeight: 20 }}>
                Seeking a second opinion was the right choice. It either confirmed your treatment
                path or opened new possibilities. Both outcomes serve your best interest and give
                you greater confidence going forward.
              </Text>
            </View>

            <View sx={{
              borderWidth: 1,
              borderColor: '$border',
              borderRadius: 12,
              p: '$5',
            }}>
              {/* Outcome type */}
              <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground', mb: '$3' }}>
                What was the outcome?
              </Text>
              <Picker
                value={outcomeType}
                onValueChange={setOutcomeType}
                options={OUTCOME_OPTIONS}
              />

              {/* Summary notes */}
              <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground', mt: '$5', mb: '$2' }}>
                Additional notes (optional)
              </Text>
              <Text sx={{ fontSize: 12, color: '$mutedForeground', mb: '$3' }}>
                Any details about what you learned, changes to your plan, or next steps.
              </Text>
              <TextInput
                value={outcomeSummary}
                onChangeText={setOutcomeSummary}
                placeholder="Share any notes about your second opinion experience..."
                multiline
                numberOfLines={4}
                style={{
                  borderWidth: 1,
                  borderColor: '#D1D5DB',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 14,
                  color: '#111827',
                  minHeight: 100,
                  textAlignVertical: 'top',
                }}
              />

              {/* Submit button */}
              <Pressable
                onPress={() => {
                  if (!outcomeType) return;
                  recordOutcome({
                    variables: {
                      input: {
                        outcome: outcomeType,
                        outcomeSummary: outcomeSummary.trim() || undefined,
                      },
                    },
                  });
                }}
                disabled={!outcomeType || recording}
              >
                <View sx={{
                  mt: '$5',
                  backgroundColor: !outcomeType ? '#9CA3AF' : recording ? '#9CA3AF' : 'blue600',
                  borderRadius: 8,
                  py: '$3',
                  alignItems: 'center',
                }}>
                  {recording ? (
                    <View sx={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <ActivityIndicator color="white" size="small" />
                      <Text sx={{ fontSize: 14, fontWeight: '600', color: 'white' }}>
                        Recording...
                      </Text>
                    </View>
                  ) : (
                    <Text sx={{ fontSize: 14, fontWeight: '600', color: 'white' }}>
                      Record outcome
                    </Text>
                  )}
                </View>
              </Pressable>
            </View>
          </View>
        )}

        {/* ============================================================= */}
        {/* Navigation */}
        {/* ============================================================= */}
        <View sx={{ mt: '$6', flexDirection: 'row', flexWrap: 'wrap', gap: '$3' }}>
          <Link href="/second-opinion">
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
          <Link href="/second-opinion/centers">
            <View sx={{
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '$border',
              px: '$4',
              py: '$3',
            }}>
              <Text sx={{ fontSize: 13, fontWeight: '500', color: '$foreground' }}>
                Find Centers {'\u2192'}
              </Text>
            </View>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}
