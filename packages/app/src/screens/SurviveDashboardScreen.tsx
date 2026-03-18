import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import {
  useGetSurvivorshipPlanQuery,
  useGetSurveillanceScheduleQuery,
  useGetJournalEntriesQuery,
  useGetCtdnaHistoryQuery,
} from '../generated/graphql';

export function SurviveDashboardScreen() {
  const { data: planData, loading: planLoading } = useGetSurvivorshipPlanQuery({ errorPolicy: 'ignore' });
  const { data: scheduleData, loading: schedLoading } = useGetSurveillanceScheduleQuery({ errorPolicy: 'ignore' });
  const { data: journalData, loading: journalLoading } = useGetJournalEntriesQuery({
    variables: { limit: 7 },
    errorPolicy: 'ignore',
  });
  const { data: ctdnaData, loading: ctdnaLoading } = useGetCtdnaHistoryQuery({ errorPolicy: 'ignore' });

  const loading = planLoading || schedLoading || journalLoading || ctdnaLoading;
  const plan = planData?.survivorshipPlan;
  const events = scheduleData?.surveillanceSchedule ?? [];
  const entries = journalData?.journalEntries ?? [];

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>Survivorship</Text>
        <View sx={{ mt: '$8', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <ActivityIndicator size="small" />
          <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>Loading your survivorship hub...</Text>
        </View>
      </View>
    );
  }

  if (!plan) {
    return (
      <ScrollView sx={{ flex: 1 }}>
        <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
          <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>Survivorship</Text>
          <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
            Your lifelong companion for life after treatment
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
            <Text sx={{ fontSize: 36 }}>🌱</Text>
            <Text sx={{ mt: '$3', fontWeight: '600', color: '$foreground', textAlign: 'center' }}>
              Treatment complete? Start your survivorship journey
            </Text>
            <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground', textAlign: 'center', maxWidth: 400 }}>
              We'll create a personalized survivorship care plan with your surveillance schedule,
              late effect guidance, and lifestyle recommendations.
            </Text>
            <Link href="/survive/complete">
              <View sx={{
                mt: '$5',
                backgroundColor: 'blue600',
                borderRadius: 8,
                px: '$6',
                py: '$3',
              }}>
                <Text sx={{ fontSize: 14, fontWeight: '600', color: 'white' }}>
                  Begin transition
                </Text>
              </View>
            </Link>
          </View>
        </View>
      </ScrollView>
    );
  }

  // Compute dashboard stats
  const now = new Date();
  const overdue = events.filter(e => e.status === 'upcoming' && e.dueDate && new Date(e.dueDate) < now);
  const upcoming = events
    .filter(e => e.status === 'upcoming' && e.dueDate && new Date(e.dueDate) >= now)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
  const nextEvent = upcoming[0];

  // Journal streak
  const journalStreak = computeStreak(entries.map(e => e.entryDate));

  // ctDNA
  const ctdnaResults = ctdnaData?.ctdnaHistory ?? [];
  const latestCtdna = ctdnaResults[0];
  const hasDetectedCtdna = ctdnaResults.some(r => r.result === 'detected');

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>Survivorship</Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
          Your care plan and wellness at a glance
        </Text>

        <View sx={{ mt: '$8', gap: '$4' }}>
          {/* Your Plan card */}
          <Link href="/survive/plan">
            <View sx={{
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '$border',
              p: '$5',
            }}>
              <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$2' }}>
                <View sx={{
                  width: 32, height: 32, borderRadius: 8,
                  backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Text sx={{ fontSize: 14 }}>📋</Text>
                </View>
                <Text sx={{ fontWeight: '600', color: '$foreground' }}>Your Care Plan</Text>
              </View>
              <Text sx={{ mt: '$3', fontSize: 12, color: '$mutedForeground' }}>
                Last generated {new Date(plan.lastGeneratedAt).toLocaleDateString()}
              </Text>
              {plan.nextReviewDate && (
                <Text sx={{ mt: '$1', fontSize: 12, color: '$mutedForeground' }}>
                  Next review: {new Date(plan.nextReviewDate).toLocaleDateString()}
                </Text>
              )}
              <Text sx={{ mt: '$2', fontSize: 12, color: 'blue600' }}>Read your plan →</Text>
            </View>
          </Link>

          {/* Next Appointment card */}
          <Link href="/survive/monitoring">
            <View sx={{
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '$border',
              p: '$5',
            }}>
              <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$2' }}>
                <View sx={{
                  width: 32, height: 32, borderRadius: 8,
                  backgroundColor: '#DBEAFE', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Text sx={{ fontSize: 14 }}>📅</Text>
                </View>
                <Text sx={{ fontWeight: '600', color: '$foreground' }}>Next Appointment</Text>
              </View>
              {nextEvent ? (
                <>
                  <Text sx={{ mt: '$3', fontSize: 16, fontWeight: '600', color: '$foreground' }}>
                    {nextEvent.title}
                  </Text>
                  <Text sx={{ mt: '$1', fontSize: 12, color: '$mutedForeground' }}>
                    Due {new Date(nextEvent.dueDate!).toLocaleDateString()}
                    {' · '}
                    {daysUntilLabel(nextEvent.dueDate!)}
                  </Text>
                  {nextEvent.frequency && (
                    <Text sx={{ mt: '$1', fontSize: 11, color: '$mutedForeground' }}>
                      Frequency: {nextEvent.frequency}
                    </Text>
                  )}
                </>
              ) : (
                <Text sx={{ mt: '$3', fontSize: 14, color: '$mutedForeground' }}>
                  No upcoming appointments scheduled
                </Text>
              )}
              <Text sx={{ mt: '$2', fontSize: 12, color: 'blue600' }}>View schedule →</Text>
            </View>
          </Link>

          {/* ctDNA card */}
          <Link href="/survive/monitoring/ctdna">
            <View sx={{
              borderRadius: 12,
              borderWidth: 1,
              borderColor: hasDetectedCtdna ? '#F59E0B' : '$border',
              backgroundColor: hasDetectedCtdna ? '#FFFBEB' : undefined,
              p: '$5',
            }}>
              <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$2' }}>
                <View sx={{
                  width: 32, height: 32, borderRadius: 8,
                  backgroundColor: '#FEF3C7', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Text sx={{ fontSize: 14 }}>{'🧬'}</Text>
                </View>
                <Text sx={{ fontWeight: '600', color: '$foreground' }}>ctDNA Monitoring</Text>
              </View>
              {latestCtdna ? (
                <>
                  <View sx={{ mt: '$3', flexDirection: 'row', alignItems: 'center', gap: '$2' }}>
                    <View sx={{
                      width: 10, height: 10, borderRadius: 5,
                      backgroundColor: latestCtdna.result === 'not_detected' ? '#22C55E'
                        : latestCtdna.result === 'detected' ? '#F59E0B' : '#9CA3AF',
                    }} />
                    <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground' }}>
                      {latestCtdna.result === 'not_detected' ? 'Not Detected'
                        : latestCtdna.result === 'detected' ? 'Detected' : 'Indeterminate'}
                    </Text>
                  </View>
                  <Text sx={{ mt: '$1', fontSize: 12, color: '$mutedForeground' }}>
                    Last test: {new Date(latestCtdna.testDate).toLocaleDateString()}
                    {latestCtdna.provider ? ` \u00B7 ${latestCtdna.provider}` : ''}
                  </Text>
                  {hasDetectedCtdna && (
                    <Text sx={{ mt: '$2', fontSize: 12, color: '#92400E', fontWeight: '500' }}>
                      Discuss with your oncologist. Updated trial matches available.
                    </Text>
                  )}
                </>
              ) : (
                <Text sx={{ mt: '$3', fontSize: 13, color: '$mutedForeground' }}>
                  No ctDNA results yet. Learn about liquid biopsy monitoring.
                </Text>
              )}
              <Text sx={{ mt: '$2', fontSize: 12, color: 'blue600' }}>View ctDNA dashboard {'\u2192'}</Text>
            </View>
          </Link>

          {/* Overdue alert */}
          {overdue.length > 0 && (
            <Link href="/survive/monitoring">
              <View sx={{
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#FCA5A5',
                backgroundColor: '#FEF2F2',
                p: '$5',
              }}>
                <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$2' }}>
                  <View sx={{
                    width: 32, height: 32, borderRadius: 8,
                    backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Text sx={{ fontSize: 14 }}>⚠️</Text>
                  </View>
                  <Text sx={{ fontWeight: '600', color: '#991B1B' }}>Overdue</Text>
                </View>
                <Text sx={{ mt: '$3', fontSize: 14, color: '#991B1B' }}>
                  {overdue.length} surveillance {overdue.length === 1 ? 'event is' : 'events are'} overdue
                </Text>
                {overdue.slice(0, 3).map(e => (
                  <Text key={e.id} sx={{ mt: '$1', fontSize: 12, color: '#B91C1C' }}>
                    · {e.title} — was due {new Date(e.dueDate!).toLocaleDateString()}
                  </Text>
                ))}
                <Text sx={{ mt: '$2', fontSize: 12, color: '#991B1B' }}>View & manage →</Text>
              </View>
            </Link>
          )}

          {/* Quick journal card */}
          <Link href="/survive/journal/entry">
            <View sx={{
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#C4B5FD',
              backgroundColor: '#FAF5FF',
              p: '$5',
            }}>
              <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$2' }}>
                <View sx={{
                  width: 32, height: 32, borderRadius: 8,
                  backgroundColor: '#F3E8FF', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Text sx={{ fontSize: 14 }}>{'✏️'}</Text>
                </View>
                <Text sx={{ fontWeight: '600', color: '$foreground' }}>How are you today?</Text>
              </View>
              <Text sx={{ mt: '$2', fontSize: 13, color: '$mutedForeground' }}>
                Quick 60-second check-in
              </Text>
            </View>
          </Link>

          {/* Journal streak card */}
          <Link href="/survive/journal">
            <View sx={{
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '$border',
              p: '$5',
            }}>
              <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$2' }}>
                <View sx={{
                  width: 32, height: 32, borderRadius: 8,
                  backgroundColor: '#F3E8FF', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Text sx={{ fontSize: 14 }}>{'📓'}</Text>
                </View>
                <Text sx={{ fontWeight: '600', color: '$foreground' }}>Symptom Journal</Text>
              </View>
              <Text sx={{ mt: '$3', fontSize: 24, fontWeight: 'bold', color: '$foreground' }}>
                {journalStreak}
              </Text>
              <Text sx={{ fontSize: 12, color: '$mutedForeground' }}>
                day streak
                {entries.length > 0 && ` · last entry ${new Date(entries[0].entryDate).toLocaleDateString()}`}
              </Text>
              <Text sx={{ mt: '$2', fontSize: 12, color: 'blue600' }}>View history {'→'}</Text>
            </View>
          </Link>

          {/* Quick links */}
          <View sx={{ flexDirection: 'row', flexWrap: 'wrap', gap: '$3', mt: '$2' }}>
            {[
              { label: 'Late Effects', href: '/survive/effects', icon: '💊' },
              { label: 'Lifestyle', href: '/survive/lifestyle', icon: '🏃' },
              { label: 'Mental Health', href: '/survive/mental-health', icon: '🧠' },
              { label: 'Care Team', href: '/survive/care-team', icon: '👩‍⚕️' },
              { label: 'Monitoring', href: '/survive/monitoring', icon: '📊' },
              { label: 'ctDNA', href: '/survive/monitoring/ctdna', icon: '🧬' },
            ].map(item => (
              <Link key={item.href} href={item.href}>
                <View sx={{
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: '$border',
                  px: '$4',
                  py: '$3',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: '$2',
                }}>
                  <Text sx={{ fontSize: 14 }}>{item.icon}</Text>
                  <Text sx={{ fontSize: 13, fontWeight: '500', color: '$foreground' }}>{item.label}</Text>
                </View>
              </Link>
            ))}
          </View>
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

function computeStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const sorted = [...dates].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // Streak only counts if most recent entry is today or yesterday
  const mostRecent = sorted[0].split('T')[0];
  if (mostRecent !== today && mostRecent !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1].split('T')[0]);
    const curr = new Date(sorted[i].split('T')[0]);
    const diffDays = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}
