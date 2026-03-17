import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'dripsy';
import { TextInput, ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import {
  useGetSurveillanceScheduleQuery,
  useMarkEventCompleteMutation,
  useSkipEventMutation,
  useRescheduleEventMutation,
} from '../generated/graphql';

type FilterTab = 'all' | 'upcoming' | 'overdue' | 'completed' | 'skipped';

const FILTERS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'completed', label: 'Completed' },
  { key: 'skipped', label: 'Skipped' },
];

function daysUntilLabel(dateStr: string): string {
  const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'today';
  if (diff === 1) return 'tomorrow';
  if (diff < 0) return `${Math.abs(diff)} days ago`;
  return `in ${diff} days`;
}

function statusColor(status: string, dueDate: string | null | undefined): { bg: string; text: string; label: string } {
  if (status === 'completed') return { bg: '#DCFCE7', text: '#166534', label: 'Completed' };
  if (status === 'skipped') return { bg: '#F3F4F6', text: '#6B7280', label: 'Skipped' };
  if (status === 'upcoming' && dueDate && new Date(dueDate) < new Date()) {
    return { bg: '#FEE2E2', text: '#991B1B', label: 'Overdue' };
  }
  return { bg: '#DBEAFE', text: '#1E40AF', label: 'Upcoming' };
}

function isOverdue(event: { status: string; dueDate?: string | null }): boolean {
  return event.status === 'upcoming' && !!event.dueDate && new Date(event.dueDate) < new Date();
}

export function SurveillanceCalendarScreen() {
  const { data, loading, refetch } = useGetSurveillanceScheduleQuery({ errorPolicy: 'ignore' });
  const [markComplete] = useMarkEventCompleteMutation();
  const [skipEvent] = useSkipEventMutation();
  const [rescheduleEvent] = useRescheduleEventMutation();

  const [filter, setFilter] = useState<FilterTab>('all');
  const [expandedAction, setExpandedAction] = useState<{ eventId: string; action: 'complete' | 'skip' | 'reschedule' } | null>(null);
  const [completeDateInput, setCompleteDateInput] = useState('');
  const [resultSummaryInput, setResultSummaryInput] = useState('');
  const [skipReasonInput, setSkipReasonInput] = useState('');
  const [rescheduleDateInput, setRescheduleDateInput] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const events = data?.surveillanceSchedule ?? [];

  const filtered = events.filter(e => {
    if (filter === 'all') return true;
    if (filter === 'overdue') return isOverdue(e);
    if (filter === 'upcoming') return e.status === 'upcoming' && e.dueDate && new Date(e.dueDate) >= new Date();
    return e.status === filter;
  });

  // Sort: overdue first, then by due date ascending
  const sorted = [...filtered].sort((a, b) => {
    const aOverdue = isOverdue(a);
    const bOverdue = isOverdue(b);
    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;
    const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
    const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
    return aDate - bDate;
  });

  const overdueCount = events.filter(e => isOverdue(e)).length;

  function openAction(eventId: string, action: 'complete' | 'skip' | 'reschedule') {
    setExpandedAction({ eventId, action });
    setCompleteDateInput(new Date().toISOString().split('T')[0]);
    setResultSummaryInput('');
    setSkipReasonInput('');
    setRescheduleDateInput('');
  }

  async function handleMarkComplete(eventId: string) {
    if (!completeDateInput) return;
    setActionLoading(true);
    await markComplete({
      variables: { input: { eventId, completedDate: completeDateInput, resultSummary: resultSummaryInput || undefined } },
    });
    setExpandedAction(null);
    setActionLoading(false);
    refetch();
  }

  async function handleSkip(eventId: string) {
    if (!skipReasonInput) return;
    setActionLoading(true);
    await skipEvent({
      variables: { input: { eventId, reason: skipReasonInput } },
    });
    setExpandedAction(null);
    setActionLoading(false);
    refetch();
  }

  async function handleReschedule(eventId: string) {
    if (!rescheduleDateInput) return;
    setActionLoading(true);
    await rescheduleEvent({
      variables: { input: { eventId, newDueDate: rescheduleDateInput } },
    });
    setExpandedAction(null);
    setActionLoading(false);
    refetch();
  }

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>Surveillance Schedule</Text>
        <View sx={{ mt: '$8', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <ActivityIndicator size="small" />
          <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>Loading your schedule...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>Surveillance Schedule</Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
          Track your follow-up appointments and screenings
        </Text>

        {/* Filter pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} sx={{ mt: '$6' }}>
          <View sx={{ flexDirection: 'row', gap: '$2' }}>
            {FILTERS.map(f => (
              <Pressable key={f.key} onPress={() => setFilter(f.key)}>
                <View sx={{
                  px: '$4',
                  py: '$2',
                  borderRadius: 20,
                  backgroundColor: filter === f.key ? '$foreground' : '$muted',
                }}>
                  <Text sx={{
                    fontSize: 13,
                    fontWeight: '500',
                    color: filter === f.key ? '$background' : '$foreground',
                  }}>
                    {f.label}
                    {f.key === 'overdue' && overdueCount > 0 ? ` (${overdueCount})` : ''}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {/* Overdue banner */}
        {filter === 'all' && overdueCount > 0 && (
          <View sx={{
            mt: '$5',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#FCA5A5',
            backgroundColor: '#FEF2F2',
            p: '$4',
          }}>
            <Text sx={{ fontWeight: '600', color: '#991B1B' }}>
              {overdueCount} overdue {overdueCount === 1 ? 'event' : 'events'}
            </Text>
            <Text sx={{ mt: '$1', fontSize: 13, color: '#B91C1C' }}>
              Please schedule these as soon as possible
            </Text>
          </View>
        )}

        {/* Event list */}
        <View sx={{ mt: '$5', gap: '$3' }}>
          {sorted.length === 0 && (
            <View sx={{
              borderRadius: 12,
              borderWidth: 1,
              borderStyle: 'dashed',
              borderColor: '$border',
              p: '$6',
              alignItems: 'center',
            }}>
              <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>
                {filter === 'all' ? 'No surveillance events yet' : `No ${filter} events`}
              </Text>
            </View>
          )}

          {sorted.map(event => {
            const sc = statusColor(event.status, event.dueDate);
            const isExpanded = expandedAction?.eventId === event.id;
            const canAct = event.status === 'upcoming';

            return (
              <View key={event.id} sx={{
                borderRadius: 12,
                borderWidth: 1,
                borderColor: isOverdue(event) ? '#FCA5A5' : '$border',
                overflow: 'hidden',
              }}>
                <Link href={`/survive/monitoring/${event.id}`}>
                  <View sx={{ p: '$4' }}>
                    {/* Status badge + title */}
                    <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$2' }}>
                      <View sx={{
                        px: '$2',
                        py: 2,
                        borderRadius: 6,
                        backgroundColor: sc.bg,
                      }}>
                        <Text sx={{ fontSize: 11, fontWeight: '600', color: sc.text }}>
                          {sc.label}
                        </Text>
                      </View>
                      <Text sx={{ fontSize: 11, color: '$mutedForeground', textTransform: 'uppercase' }}>
                        {event.type}
                      </Text>
                    </View>

                    <Text sx={{ mt: '$2', fontSize: 16, fontWeight: '600', color: '$foreground' }}>
                      {event.title}
                    </Text>

                    {event.dueDate && (
                      <Text sx={{ mt: '$1', fontSize: 13, color: '$mutedForeground' }}>
                        {event.status === 'completed' ? 'Was due' : 'Due'}{' '}
                        {new Date(event.dueDate).toLocaleDateString()} · {daysUntilLabel(event.dueDate)}
                      </Text>
                    )}

                    {event.frequency && (
                      <Text sx={{ mt: '$1', fontSize: 11, color: '$mutedForeground' }}>
                        {event.frequency}
                        {event.guidelineSource ? ` · ${event.guidelineSource}` : ''}
                      </Text>
                    )}

                    {event.status === 'completed' && event.completedDate && (
                      <Text sx={{ mt: '$2', fontSize: 12, color: '#166534' }}>
                        Completed {new Date(event.completedDate).toLocaleDateString()}
                        {event.resultSummary ? ` · ${event.resultSummary.slice(0, 80)}...` : ''}
                      </Text>
                    )}

                    {event.status === 'skipped' && event.resultSummary && (
                      <Text sx={{ mt: '$2', fontSize: 12, color: '#6B7280' }}>
                        {event.resultSummary}
                      </Text>
                    )}
                  </View>
                </Link>

                {/* Action buttons */}
                {canAct && !isExpanded && (
                  <View sx={{
                    flexDirection: 'row',
                    borderTopWidth: 1,
                    borderTopColor: '$border',
                  }}>
                    <Pressable onPress={() => openAction(event.id, 'complete')} style={{ flex: 1 }}>
                      <View sx={{ py: '$2', alignItems: 'center' }}>
                        <Text sx={{ fontSize: 13, fontWeight: '500', color: '#166534' }}>Mark Complete</Text>
                      </View>
                    </Pressable>
                    <View sx={{ width: 1, backgroundColor: '$border' }} />
                    <Pressable onPress={() => openAction(event.id, 'reschedule')} style={{ flex: 1 }}>
                      <View sx={{ py: '$2', alignItems: 'center' }}>
                        <Text sx={{ fontSize: 13, fontWeight: '500', color: '#1E40AF' }}>Reschedule</Text>
                      </View>
                    </Pressable>
                    <View sx={{ width: 1, backgroundColor: '$border' }} />
                    <Pressable onPress={() => openAction(event.id, 'skip')} style={{ flex: 1 }}>
                      <View sx={{ py: '$2', alignItems: 'center' }}>
                        <Text sx={{ fontSize: 13, fontWeight: '500', color: '#6B7280' }}>Skip</Text>
                      </View>
                    </Pressable>
                  </View>
                )}

                {/* Inline action forms */}
                {isExpanded && expandedAction.action === 'complete' && (
                  <View sx={{ p: '$4', borderTopWidth: 1, borderTopColor: '$border', backgroundColor: '#F0FDF4' }}>
                    <Text sx={{ fontSize: 13, fontWeight: '600', color: '#166534', mb: '$2' }}>Mark Complete</Text>
                    <Text sx={{ fontSize: 12, color: '$mutedForeground', mb: '$1' }}>Completion date</Text>
                    <TextInput
                      value={completeDateInput}
                      onChangeText={setCompleteDateInput}
                      placeholder="YYYY-MM-DD"
                      style={{ borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 8, fontSize: 14, marginBottom: 8, backgroundColor: '#fff' }}
                    />
                    <Text sx={{ fontSize: 12, color: '$mutedForeground', mb: '$1' }}>Result summary (optional)</Text>
                    <TextInput
                      value={resultSummaryInput}
                      onChangeText={setResultSummaryInput}
                      placeholder="e.g. All clear, no abnormalities found"
                      multiline
                      style={{ borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 8, fontSize: 14, minHeight: 60, marginBottom: 8, backgroundColor: '#fff' }}
                    />
                    <View sx={{ flexDirection: 'row', gap: '$2' }}>
                      <Pressable onPress={() => handleMarkComplete(event.id)} disabled={actionLoading}>
                        <View sx={{ px: '$4', py: '$2', backgroundColor: '#166534', borderRadius: 8 }}>
                          <Text sx={{ color: 'white', fontSize: 13, fontWeight: '600' }}>
                            {actionLoading ? 'Saving...' : 'Confirm'}
                          </Text>
                        </View>
                      </Pressable>
                      <Pressable onPress={() => setExpandedAction(null)}>
                        <View sx={{ px: '$4', py: '$2', borderRadius: 8, borderWidth: 1, borderColor: '$border' }}>
                          <Text sx={{ fontSize: 13, color: '$mutedForeground' }}>Cancel</Text>
                        </View>
                      </Pressable>
                    </View>
                  </View>
                )}

                {isExpanded && expandedAction.action === 'skip' && (
                  <View sx={{ p: '$4', borderTopWidth: 1, borderTopColor: '$border', backgroundColor: '#F9FAFB' }}>
                    <Text sx={{ fontSize: 13, fontWeight: '600', color: '#6B7280', mb: '$2' }}>Skip Event</Text>
                    <Text sx={{ fontSize: 12, color: '$mutedForeground', mb: '$1' }}>Reason for skipping</Text>
                    <TextInput
                      value={skipReasonInput}
                      onChangeText={setSkipReasonInput}
                      placeholder="e.g. Scheduling conflict, will reschedule next month"
                      multiline
                      style={{ borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 8, fontSize: 14, minHeight: 60, marginBottom: 8, backgroundColor: '#fff' }}
                    />
                    <View sx={{ flexDirection: 'row', gap: '$2' }}>
                      <Pressable onPress={() => handleSkip(event.id)} disabled={actionLoading}>
                        <View sx={{ px: '$4', py: '$2', backgroundColor: '#6B7280', borderRadius: 8 }}>
                          <Text sx={{ color: 'white', fontSize: 13, fontWeight: '600' }}>
                            {actionLoading ? 'Saving...' : 'Confirm Skip'}
                          </Text>
                        </View>
                      </Pressable>
                      <Pressable onPress={() => setExpandedAction(null)}>
                        <View sx={{ px: '$4', py: '$2', borderRadius: 8, borderWidth: 1, borderColor: '$border' }}>
                          <Text sx={{ fontSize: 13, color: '$mutedForeground' }}>Cancel</Text>
                        </View>
                      </Pressable>
                    </View>
                  </View>
                )}

                {isExpanded && expandedAction.action === 'reschedule' && (
                  <View sx={{ p: '$4', borderTopWidth: 1, borderTopColor: '$border', backgroundColor: '#EFF6FF' }}>
                    <Text sx={{ fontSize: 13, fontWeight: '600', color: '#1E40AF', mb: '$2' }}>Reschedule</Text>
                    <Text sx={{ fontSize: 12, color: '$mutedForeground', mb: '$1' }}>New due date</Text>
                    <TextInput
                      value={rescheduleDateInput}
                      onChangeText={setRescheduleDateInput}
                      placeholder="YYYY-MM-DD"
                      style={{ borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 8, fontSize: 14, marginBottom: 8, backgroundColor: '#fff' }}
                    />
                    <View sx={{ flexDirection: 'row', gap: '$2' }}>
                      <Pressable onPress={() => handleReschedule(event.id)} disabled={actionLoading}>
                        <View sx={{ px: '$4', py: '$2', backgroundColor: '#1E40AF', borderRadius: 8 }}>
                          <Text sx={{ color: 'white', fontSize: 13, fontWeight: '600' }}>
                            {actionLoading ? 'Saving...' : 'Confirm'}
                          </Text>
                        </View>
                      </Pressable>
                      <Pressable onPress={() => setExpandedAction(null)}>
                        <View sx={{ px: '$4', py: '$2', borderRadius: 8, borderWidth: 1, borderColor: '$border' }}>
                          <Text sx={{ fontSize: 13, color: '$mutedForeground' }}>Cancel</Text>
                        </View>
                      </Pressable>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}
