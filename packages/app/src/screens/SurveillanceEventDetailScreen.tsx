import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'dripsy';
import { TextInput, ActivityIndicator } from 'react-native';
import {
  useGetSurveillanceScheduleQuery,
  useMarkEventCompleteMutation,
  useSkipEventMutation,
  useRescheduleEventMutation,
} from '../generated/graphql';

function daysUntilLabel(dateStr: string): string {
  const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'today';
  if (diff === 1) return 'tomorrow';
  if (diff < 0) return `${Math.abs(diff)} days ago`;
  return `in ${diff} days`;
}

function statusBadge(status: string, dueDate: string | null | undefined): { bg: string; text: string; label: string } {
  if (status === 'completed') return { bg: '#DCFCE7', text: '#166534', label: 'Completed' };
  if (status === 'skipped') return { bg: '#F3F4F6', text: '#6B7280', label: 'Skipped' };
  if (status === 'upcoming' && dueDate && new Date(dueDate) < new Date()) {
    return { bg: '#FEE2E2', text: '#991B1B', label: 'Overdue' };
  }
  return { bg: '#DBEAFE', text: '#1E40AF', label: 'Upcoming' };
}

interface Props {
  eventId: string;
}

export function SurveillanceEventDetailScreen({ eventId }: Props) {
  const { data, loading, refetch } = useGetSurveillanceScheduleQuery({ errorPolicy: 'ignore' });
  const [markComplete] = useMarkEventCompleteMutation();
  const [skipEvent] = useSkipEventMutation();
  const [rescheduleEvent] = useRescheduleEventMutation();

  const [activeAction, setActiveAction] = useState<'complete' | 'skip' | 'reschedule' | null>(null);
  const [completeDateInput, setCompleteDateInput] = useState(new Date().toISOString().split('T')[0]);
  const [resultSummaryInput, setResultSummaryInput] = useState('');
  const [skipReasonInput, setSkipReasonInput] = useState('');
  const [rescheduleDateInput, setRescheduleDateInput] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const event = data?.surveillanceSchedule?.find(e => e.id === eventId);

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <View sx={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <ActivityIndicator size="small" />
          <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>Loading event...</Text>
        </View>
      </View>
    );
  }

  if (!event) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 18, fontWeight: '600', color: '$foreground' }}>Event not found</Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
          This surveillance event may have been removed or does not exist.
        </Text>
      </View>
    );
  }

  const sb = statusBadge(event.status, event.dueDate);
  const canAct = event.status === 'upcoming';

  async function handleMarkComplete() {
    if (!completeDateInput) return;
    setActionLoading(true);
    await markComplete({
      variables: { input: { eventId, completedDate: completeDateInput, resultSummary: resultSummaryInput || undefined } },
    });
    setActiveAction(null);
    setActionLoading(false);
    refetch();
  }

  async function handleSkip() {
    if (!skipReasonInput) return;
    setActionLoading(true);
    await skipEvent({
      variables: { input: { eventId, reason: skipReasonInput } },
    });
    setActiveAction(null);
    setActionLoading(false);
    refetch();
  }

  async function handleReschedule() {
    if (!rescheduleDateInput) return;
    setActionLoading(true);
    await rescheduleEvent({
      variables: { input: { eventId, newDueDate: rescheduleDateInput } },
    });
    setActiveAction(null);
    setActionLoading(false);
    refetch();
  }

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        {/* Header */}
        <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$3', mb: '$4' }}>
          <View sx={{ px: '$3', py: 4, borderRadius: 8, backgroundColor: sb.bg }}>
            <Text sx={{ fontSize: 12, fontWeight: '600', color: sb.text }}>{sb.label}</Text>
          </View>
          <Text sx={{ fontSize: 12, color: '$mutedForeground', textTransform: 'uppercase' }}>{event.type}</Text>
        </View>

        <Text sx={{ fontSize: 26, fontWeight: 'bold', color: '$foreground' }}>{event.title}</Text>

        {/* Due date */}
        {event.dueDate && (
          <View sx={{ mt: '$3', flexDirection: 'row', alignItems: 'center', gap: '$2' }}>
            <Text sx={{ fontSize: 14, color: '$foreground' }}>
              Due: {new Date(event.dueDate).toLocaleDateString()}
            </Text>
            <Text sx={{ fontSize: 13, color: '$mutedForeground' }}>
              ({daysUntilLabel(event.dueDate)})
            </Text>
          </View>
        )}

        {/* Description */}
        {event.description && (
          <View sx={{ mt: '$6', borderRadius: 12, borderWidth: 1, borderColor: '$border', p: '$5' }}>
            <Text sx={{ fontWeight: '600', color: '$foreground', mb: '$2' }}>What this test checks for</Text>
            <Text sx={{ fontSize: 14, lineHeight: 22, color: '$mutedForeground' }}>{event.description}</Text>
          </View>
        )}

        {/* Frequency & guideline */}
        <View sx={{ mt: '$4', gap: '$3' }}>
          {event.frequency && (
            <View sx={{ flexDirection: 'row', gap: '$2' }}>
              <Text sx={{ fontSize: 13, fontWeight: '600', color: '$foreground' }}>Frequency:</Text>
              <Text sx={{ fontSize: 13, color: '$mutedForeground' }}>{event.frequency}</Text>
            </View>
          )}
          {event.guidelineSource && (
            <View sx={{ flexDirection: 'row', gap: '$2', flexWrap: 'wrap' }}>
              <Text sx={{ fontSize: 13, fontWeight: '600', color: '$foreground' }}>Guideline:</Text>
              <Text sx={{ fontSize: 13, color: '$mutedForeground' }}>{event.guidelineSource}</Text>
            </View>
          )}
        </View>

        {/* Completion details */}
        {event.status === 'completed' && (
          <View sx={{ mt: '$6', borderRadius: 12, backgroundColor: '#F0FDF4', p: '$5' }}>
            <Text sx={{ fontWeight: '600', color: '#166534', mb: '$2' }}>Completion Details</Text>
            {event.completedDate && (
              <Text sx={{ fontSize: 14, color: '#166534' }}>
                Completed on {new Date(event.completedDate).toLocaleDateString()}
              </Text>
            )}
            {event.resultSummary && (
              <Text sx={{ mt: '$2', fontSize: 14, lineHeight: 22, color: '#166534' }}>
                {event.resultSummary}
              </Text>
            )}
            {event.nextDueDate && (
              <Text sx={{ mt: '$2', fontSize: 13, color: '#15803D' }}>
                Next occurrence: {new Date(event.nextDueDate).toLocaleDateString()}
              </Text>
            )}
          </View>
        )}

        {/* Skipped details */}
        {event.status === 'skipped' && event.resultSummary && (
          <View sx={{ mt: '$6', borderRadius: 12, backgroundColor: '#F9FAFB', p: '$5' }}>
            <Text sx={{ fontWeight: '600', color: '#6B7280', mb: '$2' }}>Skip Details</Text>
            <Text sx={{ fontSize: 14, lineHeight: 22, color: '#6B7280' }}>{event.resultSummary}</Text>
            {event.nextDueDate && (
              <Text sx={{ mt: '$2', fontSize: 13, color: '#9CA3AF' }}>
                Next occurrence: {new Date(event.nextDueDate).toLocaleDateString()}
              </Text>
            )}
          </View>
        )}

        {/* Action buttons */}
        {canAct && !activeAction && (
          <View sx={{ mt: '$6', flexDirection: 'row', gap: '$3', flexWrap: 'wrap' }}>
            <Pressable onPress={() => setActiveAction('complete')}>
              <View sx={{ px: '$5', py: '$3', backgroundColor: '#166534', borderRadius: 8 }}>
                <Text sx={{ color: 'white', fontSize: 14, fontWeight: '600' }}>Mark Complete</Text>
              </View>
            </Pressable>
            <Pressable onPress={() => setActiveAction('reschedule')}>
              <View sx={{ px: '$5', py: '$3', backgroundColor: '#1E40AF', borderRadius: 8 }}>
                <Text sx={{ color: 'white', fontSize: 14, fontWeight: '600' }}>Reschedule</Text>
              </View>
            </Pressable>
            <Pressable onPress={() => setActiveAction('skip')}>
              <View sx={{ px: '$5', py: '$3', borderRadius: 8, borderWidth: 1, borderColor: '$border' }}>
                <Text sx={{ fontSize: 14, fontWeight: '600', color: '#6B7280' }}>Skip</Text>
              </View>
            </Pressable>
          </View>
        )}

        {/* Inline forms */}
        {activeAction === 'complete' && (
          <View sx={{ mt: '$6', borderRadius: 12, backgroundColor: '#F0FDF4', p: '$5' }}>
            <Text sx={{ fontWeight: '600', color: '#166534', mb: '$3' }}>Mark Complete</Text>
            <Text sx={{ fontSize: 12, color: '$mutedForeground', mb: '$1' }}>Completion date</Text>
            <TextInput
              value={completeDateInput}
              onChangeText={setCompleteDateInput}
              placeholder="YYYY-MM-DD"
              style={{ borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 10, fontSize: 14, marginBottom: 12, backgroundColor: '#fff' }}
            />
            <Text sx={{ fontSize: 12, color: '$mutedForeground', mb: '$1' }}>Result summary (optional)</Text>
            <TextInput
              value={resultSummaryInput}
              onChangeText={setResultSummaryInput}
              placeholder="e.g. All clear, no abnormalities found"
              multiline
              style={{ borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 10, fontSize: 14, minHeight: 80, marginBottom: 12, backgroundColor: '#fff' }}
            />
            <View sx={{ flexDirection: 'row', gap: '$3' }}>
              <Pressable onPress={handleMarkComplete} disabled={actionLoading}>
                <View sx={{ px: '$5', py: '$2', backgroundColor: '#166534', borderRadius: 8 }}>
                  <Text sx={{ color: 'white', fontSize: 13, fontWeight: '600' }}>
                    {actionLoading ? 'Saving...' : 'Confirm'}
                  </Text>
                </View>
              </Pressable>
              <Pressable onPress={() => setActiveAction(null)}>
                <View sx={{ px: '$5', py: '$2', borderRadius: 8, borderWidth: 1, borderColor: '$border' }}>
                  <Text sx={{ fontSize: 13, color: '$mutedForeground' }}>Cancel</Text>
                </View>
              </Pressable>
            </View>
          </View>
        )}

        {activeAction === 'skip' && (
          <View sx={{ mt: '$6', borderRadius: 12, backgroundColor: '#F9FAFB', p: '$5' }}>
            <Text sx={{ fontWeight: '600', color: '#6B7280', mb: '$3' }}>Skip Event</Text>
            <Text sx={{ fontSize: 12, color: '$mutedForeground', mb: '$1' }}>Reason for skipping</Text>
            <TextInput
              value={skipReasonInput}
              onChangeText={setSkipReasonInput}
              placeholder="e.g. Scheduling conflict, will do next month"
              multiline
              style={{ borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 10, fontSize: 14, minHeight: 80, marginBottom: 12, backgroundColor: '#fff' }}
            />
            <View sx={{ flexDirection: 'row', gap: '$3' }}>
              <Pressable onPress={handleSkip} disabled={actionLoading}>
                <View sx={{ px: '$5', py: '$2', backgroundColor: '#6B7280', borderRadius: 8 }}>
                  <Text sx={{ color: 'white', fontSize: 13, fontWeight: '600' }}>
                    {actionLoading ? 'Saving...' : 'Confirm Skip'}
                  </Text>
                </View>
              </Pressable>
              <Pressable onPress={() => setActiveAction(null)}>
                <View sx={{ px: '$5', py: '$2', borderRadius: 8, borderWidth: 1, borderColor: '$border' }}>
                  <Text sx={{ fontSize: 13, color: '$mutedForeground' }}>Cancel</Text>
                </View>
              </Pressable>
            </View>
          </View>
        )}

        {activeAction === 'reschedule' && (
          <View sx={{ mt: '$6', borderRadius: 12, backgroundColor: '#EFF6FF', p: '$5' }}>
            <Text sx={{ fontWeight: '600', color: '#1E40AF', mb: '$3' }}>Reschedule</Text>
            <Text sx={{ fontSize: 12, color: '$mutedForeground', mb: '$1' }}>New due date</Text>
            <TextInput
              value={rescheduleDateInput}
              onChangeText={setRescheduleDateInput}
              placeholder="YYYY-MM-DD"
              style={{ borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 10, fontSize: 14, marginBottom: 12, backgroundColor: '#fff' }}
            />
            <View sx={{ flexDirection: 'row', gap: '$3' }}>
              <Pressable onPress={handleReschedule} disabled={actionLoading}>
                <View sx={{ px: '$5', py: '$2', backgroundColor: '#1E40AF', borderRadius: 8 }}>
                  <Text sx={{ color: 'white', fontSize: 13, fontWeight: '600' }}>
                    {actionLoading ? 'Saving...' : 'Confirm'}
                  </Text>
                </View>
              </Pressable>
              <Pressable onPress={() => setActiveAction(null)}>
                <View sx={{ px: '$5', py: '$2', borderRadius: 8, borderWidth: 1, borderColor: '$border' }}>
                  <Text sx={{ fontSize: 13, color: '$mutedForeground' }}>Cancel</Text>
                </View>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
