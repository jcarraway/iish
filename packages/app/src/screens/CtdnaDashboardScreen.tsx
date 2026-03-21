import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator, TextInput, Platform } from 'react-native';
import { Link } from 'solito/link';
import { Picker } from '../components/Picker';
import {
  useGetCtdnaHistoryQuery,
  useAddCtdnaResultMutation,
  useGetSurveillanceScheduleQuery,
  GetCtdnaHistoryDocument,
} from '../generated/graphql';

const RESULT_COLORS: Record<string, string> = {
  not_detected: '#22C55E',
  detected: '#F59E0B',
  indeterminate: '#9CA3AF',
};

const RESULT_LABELS: Record<string, string> = {
  not_detected: 'Not Detected',
  detected: 'Detected',
  indeterminate: 'Indeterminate',
};

const PROVIDER_OPTIONS = [
  { label: 'Select provider', value: '' },
  { label: 'Natera Signatera', value: 'Natera Signatera' },
  { label: 'Guardant Reveal', value: 'Guardant Reveal' },
  { label: 'Other', value: 'Other' },
];

const RESULT_OPTIONS = [
  { label: 'Select result', value: '' },
  { label: 'Not Detected', value: 'not_detected' },
  { label: 'Detected', value: 'detected' },
  { label: 'Indeterminate', value: 'indeterminate' },
];

export function CtdnaDashboardScreen() {
  const { data, loading } = useGetCtdnaHistoryQuery({ errorPolicy: 'ignore' });
  const { data: scheduleData } = useGetSurveillanceScheduleQuery({ errorPolicy: 'ignore' });
  const [addResult, { loading: adding }] = useAddCtdnaResultMutation({
    refetchQueries: [{ query: GetCtdnaHistoryDocument }],
  });

  const [formOpen, setFormOpen] = useState(false);
  const [testDate, setTestDate] = useState('');
  const [provider, setProvider] = useState('');
  const [result, setResult] = useState('');
  const [ctdnaLevel, setCtdnaLevel] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const results = data?.ctdnaHistory ?? [];
  const hasDetected = results.some(r => r.result === 'detected');

  // Find next ctDNA surveillance event
  const events = scheduleData?.surveillanceSchedule ?? [];
  const now = new Date();
  const nextCtdnaEvent = events.find(
    e => e.status === 'upcoming' &&
      ['ctdna', 'ctDNA', 'ct_dna', 'liquid_biopsy'].includes(e.type) &&
      e.dueDate && new Date(e.dueDate) >= now,
  );

  async function handleSubmit() {
    if (!testDate || !provider || !result) return;
    await addResult({
      variables: {
        input: {
          testDate,
          provider,
          result,
          ...(ctdnaLevel ? { ctdnaLevel: parseFloat(ctdnaLevel) } : {}),
        },
      },
    });
    setFormOpen(false);
    setTestDate('');
    setProvider('');
    setResult('');
    setCtdnaLevel('');
  }

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>ctDNA Monitoring</Text>
        <View sx={{ mt: '$8', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <ActivityIndicator size="small" />
          <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>Loading your ctDNA history...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>ctDNA Monitoring</Text>
        <Link href="/survive/monitoring/ctdna/guide">
          <Text sx={{ mt: '$2', fontSize: 14, color: 'blue600' }}>
            Learn about ctDNA {'\u2192'}
          </Text>
        </Link>

        {/* Detected alert banner */}
        {hasDetected && (
          <View sx={{
            mt: '$6', p: '$5', borderRadius: 12,
            borderWidth: 1, borderColor: '#F59E0B',
            backgroundColor: '#FFFBEB',
          }}>
            <Text sx={{ fontSize: 14, fontWeight: '600', color: '#92400E' }}>
              Your recent ctDNA result warrants discussion with your oncologist.
            </Text>
            <Text sx={{ fontSize: 13, color: '#92400E', mt: '$2' }}>
              We've updated your trial matches to include options for molecular relapse intervention.
            </Text>
            <Link href="/matches">
              <Text sx={{ fontSize: 13, fontWeight: '600', color: '#B45309', mt: '$3' }}>
                View updated matches {'\u2192'}
              </Text>
            </Link>
          </View>
        )}

        {/* Add New Result */}
        <Pressable onPress={() => setFormOpen(!formOpen)}>
          <View sx={{
            mt: '$6', borderRadius: 12, borderWidth: 1, borderColor: '$border', p: '$5',
          }}>
            <View sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text sx={{ fontSize: 16, fontWeight: '600', color: '$foreground' }}>
                Add New Result
              </Text>
              <Text sx={{ fontSize: 18, color: '$mutedForeground' }}>{formOpen ? '\u2212' : '+'}</Text>
            </View>

            {formOpen && (
              <View sx={{ mt: '$4', gap: '$4' }}>
                <View>
                  <Text sx={{ fontSize: 13, fontWeight: '600', color: '$foreground', mb: '$1' }}>
                    Test Date
                  </Text>
                  <TextInput
                    value={testDate}
                    onChangeText={setTestDate}
                    placeholder="YYYY-MM-DD"
                    style={{
                      borderWidth: 1,
                      borderColor: '#D1D5DB',
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      paddingVertical: Platform.OS === 'web' ? 8 : 12,
                      fontSize: 14,
                    }}
                  />
                </View>

                <View>
                  <Text sx={{ fontSize: 13, fontWeight: '600', color: '$foreground', mb: '$1' }}>
                    Provider
                  </Text>
                  <Picker
                    value={provider}
                    onValueChange={setProvider}
                    options={PROVIDER_OPTIONS}
                  />
                </View>

                <View>
                  <Text sx={{ fontSize: 13, fontWeight: '600', color: '$foreground', mb: '$1' }}>
                    Result
                  </Text>
                  <Picker
                    value={result}
                    onValueChange={setResult}
                    options={RESULT_OPTIONS}
                  />
                </View>

                <View>
                  <Text sx={{ fontSize: 13, fontWeight: '600', color: '$foreground', mb: '$1' }}>
                    ctDNA Level (optional)
                  </Text>
                  <TextInput
                    value={ctdnaLevel}
                    onChangeText={setCtdnaLevel}
                    placeholder="e.g. 0.15"
                    keyboardType="numeric"
                    style={{
                      borderWidth: 1,
                      borderColor: '#D1D5DB',
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      paddingVertical: Platform.OS === 'web' ? 8 : 12,
                      fontSize: 14,
                    }}
                  />
                </View>

                <Pressable
                  onPress={handleSubmit}
                  disabled={adding || !testDate || !provider || !result}
                >
                  <View sx={{
                    backgroundColor: (!testDate || !provider || !result) ? '#9CA3AF' : 'blue600',
                    borderRadius: 8,
                    py: '$3',
                    alignItems: 'center',
                  }}>
                    {adding ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <Text sx={{ fontSize: 14, fontWeight: '600', color: 'white' }}>
                        Submit Result
                      </Text>
                    )}
                  </View>
                </Pressable>
              </View>
            )}
          </View>
        </Pressable>

        {/* Results timeline */}
        <View sx={{ mt: '$6' }}>
          <Text sx={{ fontSize: 18, fontWeight: '700', color: '$foreground' }}>Your Results</Text>

          {results.length === 0 ? (
            <View sx={{
              mt: '$4', p: '$6', borderRadius: 12,
              borderWidth: 2, borderStyle: 'dashed', borderColor: '$border',
              alignItems: 'center',
            }}>
              <Text sx={{ fontSize: 14, color: '$mutedForeground', textAlign: 'center' }}>
                No ctDNA results recorded yet. Add your first result above or learn more about ctDNA monitoring.
              </Text>
            </View>
          ) : (
            <View sx={{ mt: '$3', gap: '$3' }}>
              {results.map(r => {
                const color = RESULT_COLORS[r.result] ?? '#9CA3AF';
                const label = RESULT_LABELS[r.result] ?? r.result;
                const isExpanded = expandedId === r.id;
                const interp = r.interpretation;

                return (
                  <Pressable key={r.id} onPress={() => setExpandedId(isExpanded ? null : r.id)}>
                    <View sx={{
                      borderRadius: 12, borderWidth: 1, borderColor: '$border', p: '$5',
                    }}>
                      <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$3' }}>
                        <View sx={{
                          width: 14, height: 14, borderRadius: 7,
                          backgroundColor: color,
                        }} />
                        <View sx={{ flex: 1 }}>
                          <Text sx={{ fontSize: 16, fontWeight: '600', color: '$foreground' }}>
                            {label}
                          </Text>
                          <Text sx={{ fontSize: 12, color: '$mutedForeground', mt: 2 }}>
                            {new Date(r.testDate).toLocaleDateString()}
                            {r.provider ? ` \u00B7 ${r.provider}` : ''}
                            {r.ctdnaLevel != null ? ` \u00B7 Level: ${r.ctdnaLevel}` : ''}
                          </Text>
                        </View>
                        {r.triggeredTrialRematch && (
                          <View sx={{
                            backgroundColor: '#DBEAFE',
                            borderRadius: 6,
                            px: '$2',
                            py: 2,
                          }}>
                            <Text sx={{ fontSize: 10, fontWeight: '600', color: '#1E40AF' }}>
                              Trial re-match
                            </Text>
                          </View>
                        )}
                      </View>

                      {interp && (
                        <Text sx={{ fontSize: 13, color: '$mutedForeground', mt: '$3' }}>
                          {interp.summary}
                        </Text>
                      )}

                      {isExpanded && interp && (
                        <View sx={{ mt: '$4', gap: '$3' }}>
                          <View>
                            <Text sx={{ fontSize: 13, fontWeight: '600', color: '$foreground' }}>
                              What this means
                            </Text>
                            <Text sx={{ fontSize: 13, color: '$mutedForeground', mt: '$1' }}>
                              {interp.whatThisMeans}
                            </Text>
                          </View>
                          <View>
                            <Text sx={{ fontSize: 13, fontWeight: '600', color: '$foreground' }}>
                              Next steps
                            </Text>
                            <Text sx={{ fontSize: 13, color: '$mutedForeground', mt: '$1' }}>
                              {interp.nextSteps}
                            </Text>
                          </View>
                          {interp.trendContext && (
                            <View>
                              <Text sx={{ fontSize: 13, fontWeight: '600', color: '$foreground' }}>
                                Trend context
                              </Text>
                              <Text sx={{ fontSize: 13, color: '$mutedForeground', mt: '$1' }}>
                                {interp.trendContext}
                              </Text>
                            </View>
                          )}
                          {r.triggeredTrialRematch && (
                            <Link href="/matches">
                              <Text sx={{ fontSize: 13, color: 'blue600', fontWeight: '600' }}>
                                View updated trial matches {'\u2192'}
                              </Text>
                            </Link>
                          )}
                        </View>
                      )}

                      <Text sx={{ fontSize: 12, color: '$mutedForeground', mt: '$2' }}>
                        {isExpanded ? 'Tap to collapse' : 'Tap for details'}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        {/* Next scheduled test */}
        <View sx={{
          mt: '$6', borderRadius: 12, borderWidth: 1, borderColor: '$border', p: '$5',
        }}>
          <Text sx={{ fontSize: 16, fontWeight: '600', color: '$foreground' }}>
            Next Scheduled Test
          </Text>
          {nextCtdnaEvent ? (
            <View sx={{ mt: '$3' }}>
              <Text sx={{ fontSize: 14, color: '$foreground' }}>
                {nextCtdnaEvent.title}
              </Text>
              <Text sx={{ fontSize: 13, color: '$mutedForeground', mt: '$1' }}>
                Due {new Date(nextCtdnaEvent.dueDate!).toLocaleDateString()}
                {' \u00B7 '}
                {daysUntilLabel(nextCtdnaEvent.dueDate!)}
              </Text>
            </View>
          ) : (
            <Text sx={{ fontSize: 13, color: '$mutedForeground', mt: '$3' }}>
              No ctDNA test currently scheduled. Discuss your monitoring schedule with your oncologist.
            </Text>
          )}
        </View>

        {/* Disclaimer */}
        <View sx={{
          mt: '$6', p: '$4', borderRadius: 10,
          backgroundColor: '$muted', borderWidth: 1, borderColor: '$border',
        }}>
          <Text sx={{ fontSize: 12, color: '$mutedForeground', fontStyle: 'italic' }}>
            ctDNA results should always be interpreted by your oncologist in the context of your
            complete clinical picture. IISH does not provide medical diagnoses or treatment recommendations.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

function daysUntilLabel(dateStr: string): string {
  const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'today';
  if (diff === 1) return 'tomorrow';
  if (diff < 0) return `${Math.abs(diff)} days ago`;
  return `in ${diff} days`;
}
