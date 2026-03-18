import { View, Text, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import { useGetRecurrenceEventQuery } from '../generated/graphql';

interface CascadeStep {
  key: string;
  title: string;
  description: string;
  href: string;
  gated?: boolean;
  conditional?: boolean;
}

const CASCADE_STEPS: CascadeStep[] = [
  {
    key: 'acknowledged',
    title: 'Acknowledged',
    description: 'You have received and acknowledged this report.',
    href: '/survive/recurrence',
  },
  {
    key: 'supportOffered',
    title: 'Support Resources Available',
    description: 'Crisis and peer support resources are ready for you.',
    href: '/survive/recurrence/support',
  },
  {
    key: 'resequencingRecommended',
    title: 'Re-Sequencing Recommended',
    description: 'The recurrent tumor may have different genomics — re-testing is recommended.',
    href: '/survive/recurrence/sequencing',
  },
  {
    key: 'trialRematched',
    title: 'Trial Matches Updated',
    description: 'Clinical trial search re-run with your updated profile.',
    href: '/survive/recurrence/trials',
  },
  {
    key: 'financialRematched',
    title: 'Financial Assistance Updated',
    description: 'Financial programs re-matched for your new situation.',
    href: '/financial',
  },
  {
    key: 'secondOpinionOffered',
    title: 'Second Opinion Resources',
    description: 'NCI-designated centers and virtual second opinion services.',
    href: '/survive/recurrence/status',
  },
  {
    key: 'careTeamUpdated',
    title: 'Care Team Suggestions',
    description: 'Consider updating your care team for recurrence management.',
    href: '/survive/care-team',
  },
  {
    key: 'translatorRegenerated',
    title: 'Treatment Translation',
    description: 'Updated treatment landscape with second-line options.',
    href: '/survive/recurrence/treatment',
    gated: true,
  },
  {
    key: 'planArchived',
    title: 'Survivorship Plan Archived',
    description: 'Previous care plan saved and surveillance paused.',
    href: '/survive/plan',
    conditional: true,
  },
  {
    key: 'pipelineActivated',
    title: 'Pipeline Ready',
    description: 'Neoantigen prediction pipeline ready for new data.',
    href: '/pipeline',
    conditional: true,
  },
  {
    key: 'genomicComparisonReady',
    title: 'Genomic Comparison',
    description: 'Side-by-side comparison of original vs. recurrent genomics.',
    href: '/survive/recurrence/comparison',
    conditional: true,
  },
];

export function RecurrenceCascadeScreen() {
  const { data, loading } = useGetRecurrenceEventQuery({ errorPolicy: 'ignore' });
  const event = data?.recurrenceEvent;

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 640, px: '$6', py: '$16', width: '100%' }}>
        <View sx={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <ActivityIndicator size="small" />
          <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>Loading cascade status...</Text>
        </View>
      </View>
    );
  }

  if (!event) {
    return (
      <ScrollView sx={{ flex: 1 }}>
        <View sx={{ mx: 'auto', maxWidth: 640, px: '$6', py: '$16', width: '100%' }}>
          <Text sx={{ fontSize: 24, fontWeight: 'bold', color: '$foreground' }}>
            Cascade Status
          </Text>
          <Text sx={{ mt: '$4', fontSize: 14, color: '$mutedForeground' }}>
            No active recurrence response.
          </Text>
          <Link href="/survive">
            <Text sx={{ mt: '$4', fontSize: 14, color: 'blue600' }}>
              Back to survivorship dashboard
            </Text>
          </Link>
        </View>
      </ScrollView>
    );
  }

  const cascade = event.cascadeStatus;
  const isAcknowledged = !!event.acknowledgedAt;

  const completedCount = CASCADE_STEPS.filter(s => (cascade as any)?.[s.key]).length;
  const totalSteps = CASCADE_STEPS.length;

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 640, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 28, fontWeight: 'bold', color: '$foreground' }}>
          Your Recurrence Response
        </Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
          Reported {new Date(event.detectedDate).toLocaleDateString()}
          {event.recurrenceType ? ` · ${event.recurrenceType}` : ''}
          {event.recurrenceSites?.length ? ` · ${event.recurrenceSites.join(', ')}` : ''}
        </Text>

        {/* Progress bar */}
        <View sx={{ mt: '$6', flexDirection: 'row', alignItems: 'center', gap: '$3' }}>
          <View sx={{ flex: 1, height: 6, backgroundColor: '$border', borderRadius: 3 }}>
            <View sx={{
              height: 6, borderRadius: 3, backgroundColor: '#22C55E',
              width: `${(completedCount / totalSteps) * 100}%` as any,
            }} />
          </View>
          <Text sx={{ fontSize: 13, color: '$mutedForeground' }}>
            {completedCount}/{totalSteps}
          </Text>
        </View>

        {/* Cascade timeline */}
        <View sx={{ mt: '$8' }}>
          {CASCADE_STEPS.map((step, index) => {
            const isComplete = (cascade as any)?.[step.key] ?? false;
            const isLocked = step.gated && !isAcknowledged;

            return (
              <View key={step.key}>
                <Link href={isLocked ? '/survive/recurrence' : step.href}>
                  <View sx={{
                    flexDirection: 'row', gap: '$4', py: '$4',
                    opacity: isLocked ? 0.5 : 1,
                  }}>
                    {/* Timeline dot + line */}
                    <View sx={{ alignItems: 'center', width: 24 }}>
                      <View sx={{
                        width: 24, height: 24, borderRadius: 12,
                        backgroundColor: isComplete ? '#22C55E' : isLocked ? '#D1D5DB' : '#F59E0B',
                        alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Text sx={{ fontSize: 12, color: 'white', fontWeight: '700' }}>
                          {isComplete ? '\u2713' : isLocked ? '\u{1F512}' : '\u2022'}
                        </Text>
                      </View>
                      {index < CASCADE_STEPS.length - 1 && (
                        <View sx={{
                          width: 2, flex: 1, minHeight: 16,
                          backgroundColor: isComplete ? '#22C55E' : '$border',
                        }} />
                      )}
                    </View>

                    {/* Content */}
                    <View sx={{ flex: 1, pb: '$2' }}>
                      <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$2' }}>
                        <Text sx={{ fontSize: 15, fontWeight: '600', color: '$foreground' }}>
                          {step.title}
                        </Text>
                        {step.conditional && (
                          <View sx={{
                            borderRadius: 4, backgroundColor: '#F3F4F6',
                            px: '$2', py: 1,
                          }}>
                            <Text sx={{ fontSize: 10, color: '$mutedForeground' }}>
                              Conditional
                            </Text>
                          </View>
                        )}
                        {step.gated && (
                          <View sx={{
                            borderRadius: 4, backgroundColor: '#FEF3C7',
                            px: '$2', py: 1,
                          }}>
                            <Text sx={{ fontSize: 10, color: '#92400E' }}>
                              After acknowledgment
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text sx={{ mt: '$1', fontSize: 13, color: '$mutedForeground' }}>
                        {step.description}
                      </Text>
                      {!isLocked && (
                        <Text sx={{ mt: '$1', fontSize: 12, color: 'blue600' }}>
                          {isComplete ? 'View details' : 'Pending'} {'\u2192'}
                        </Text>
                      )}
                    </View>
                  </View>
                </Link>
              </View>
            );
          })}
        </View>

        {/* What's next */}
        {!isAcknowledged && (
          <View sx={{
            mt: '$6', borderRadius: 12, backgroundColor: '#FEF3C7', p: '$5',
          }}>
            <Text sx={{ fontSize: 15, fontWeight: '600', color: '#92400E' }}>
              Some steps are waiting for your acknowledgment
            </Text>
            <Text sx={{ mt: '$2', fontSize: 14, color: '#92400E', lineHeight: 22 }}>
              Treatment translation and plan archival will be unlocked after you
              acknowledge the recurrence report.
            </Text>
            <Link href="/survive/recurrence">
              <Text sx={{ mt: '$3', fontSize: 14, fontWeight: '600', color: '#92400E' }}>
                Go to acknowledgment page {'\u2192'}
              </Text>
            </Link>
          </View>
        )}

        <Link href="/survive">
          <Text sx={{ mt: '$6', fontSize: 14, color: 'blue600' }}>
            Back to survivorship dashboard
          </Text>
        </Link>
      </View>
    </ScrollView>
  );
}
