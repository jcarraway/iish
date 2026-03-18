import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import type { SurvivorshipCarePlan } from '@oncovax/shared';
import {
  useGetSurvivorshipPlanQuery,
  useRefreshScpMutation,
} from '../generated/graphql';
import { FeedbackPrompt } from '../components/FeedbackPrompt';

const SECTIONS = [
  { key: 'overview', label: 'Overview' },
  { key: 'surveillance', label: 'Surveillance' },
  { key: 'lateEffects', label: 'Late Effects' },
  { key: 'lifestyle', label: 'Lifestyle' },
  { key: 'ongoingTherapy', label: 'Medications' },
  { key: 'careTeam', label: 'Care Team' },
  { key: 'additionalScreening', label: 'Screening' },
] as const;

export function SCPReadingScreen() {
  const { data, loading, refetch } = useGetSurvivorshipPlanQuery();
  const [refreshSCP, { loading: refreshing }] = useRefreshScpMutation();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));

  const plan = data?.survivorshipPlan;
  const scp = plan?.planContent as unknown as SurvivorshipCarePlan | null;

  const toggleSection = (key: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleRefresh = async () => {
    try {
      await refreshSCP();
      await refetch();
    } catch {
      // swallow — UI shows via error state
    }
  };

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 768, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          Your Survivorship Care Plan
        </Text>
        <View sx={{ mt: '$8', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <ActivityIndicator size="small" />
          <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>Loading your care plan...</Text>
        </View>
      </View>
    );
  }

  if (!plan || !scp) {
    return (
      <ScrollView sx={{ flex: 1 }}>
        <View sx={{ mx: 'auto', maxWidth: 768, px: '$6', py: '$16', width: '100%' }}>
          <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
            Your Survivorship Care Plan
          </Text>
          <Text sx={{ mt: '$4', fontSize: 14, color: '$mutedForeground' }}>
            No care plan has been generated yet.
          </Text>
          <Link href="/survive/complete">
            <Text sx={{ mt: '$2', fontSize: 14, color: 'blue600' }}>
              Complete your treatment transition →
            </Text>
          </Link>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 768, px: '$6', py: '$16', width: '100%' }}>
        {/* Header */}
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          Your Survivorship Care Plan
        </Text>
        <Text sx={{ mt: '$2', fontSize: 12, color: '$mutedForeground' }}>
          Generated {new Date(plan.lastGeneratedAt).toLocaleDateString()}
          {plan.nextReviewDate && ` · Next review: ${new Date(plan.nextReviewDate).toLocaleDateString()}`}
        </Text>

        {/* Section nav */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} sx={{ mt: '$4' }}>
          <View sx={{ flexDirection: 'row', gap: '$2' }}>
            {SECTIONS.map(s => (
              <Pressable key={s.key} onPress={() => toggleSection(s.key)}>
                <View sx={{
                  borderRadius: 9999,
                  px: '$3',
                  py: '$1',
                  borderWidth: 1,
                  borderColor: expandedSections.has(s.key) ? 'blue600' : '$border',
                  backgroundColor: expandedSections.has(s.key) ? '#EFF6FF' : 'transparent',
                }}>
                  <Text sx={{
                    fontSize: 12,
                    fontWeight: expandedSections.has(s.key) ? '600' : '400',
                    color: expandedSections.has(s.key) ? 'blue600' : '$mutedForeground',
                  }}>
                    {s.label}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {/* Sections */}
        <View sx={{ mt: '$6', gap: '$4' }}>
          {/* Overview */}
          <CollapsibleSection
            title="Overview"
            sectionKey="overview"
            expanded={expandedSections.has('overview')}
            onToggle={toggleSection}
          >
            <Text sx={{ fontSize: 15, lineHeight: 24, color: '$foreground' }}>
              {scp.overview.plainLanguageSummary}
            </Text>
            <Text sx={{ mt: '$4', fontSize: 14, fontWeight: '600', color: '$foreground' }}>
              What to expect
            </Text>
            <Text sx={{ mt: '$1', fontSize: 14, lineHeight: 22, color: '$mutedForeground' }}>
              {scp.overview.whatToExpect}
            </Text>
            {scp.overview.keyDates.length > 0 && (
              <View sx={{ mt: '$4' }}>
                <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground', mb: '$2' }}>
                  Key dates
                </Text>
                {scp.overview.keyDates.map((d, i) => (
                  <View key={i} sx={{ flexDirection: 'row', gap: '$3', mb: '$2' }}>
                    <Text sx={{ fontSize: 12, fontWeight: '600', color: 'blue600', width: 80 }}>
                      {d.date}
                    </Text>
                    <View sx={{ flex: 1 }}>
                      <Text sx={{ fontSize: 13, fontWeight: '500', color: '$foreground' }}>{d.event}</Text>
                      <Text sx={{ fontSize: 12, color: '$mutedForeground' }}>{d.description}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </CollapsibleSection>

          {/* Surveillance */}
          <CollapsibleSection
            title="Surveillance Schedule"
            sectionKey="surveillance"
            expanded={expandedSections.has('surveillance')}
            onToggle={toggleSection}
          >
            <Text sx={{ fontSize: 14, lineHeight: 22, color: '$mutedForeground', mb: '$4' }}>
              {scp.surveillance.whatWeWatch}
            </Text>
            {/* Vertical timeline */}
            {scp.surveillance.schedule.map((item, i) => (
              <View key={i} sx={{ flexDirection: 'row', gap: '$3', mb: '$4' }}>
                <View sx={{ alignItems: 'center', width: 20 }}>
                  <View sx={{
                    width: 10, height: 10, borderRadius: 5,
                    backgroundColor: 'blue600',
                  }} />
                  {i < scp.surveillance.schedule.length - 1 && (
                    <View sx={{ width: 2, flex: 1, backgroundColor: '#DBEAFE', mt: 2 }} />
                  )}
                </View>
                <View sx={{ flex: 1, pb: '$2' }}>
                  <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground' }}>
                    {item.title}
                  </Text>
                  <Text sx={{ fontSize: 13, color: '$mutedForeground', mt: '$1' }}>
                    {item.description}
                  </Text>
                  <View sx={{ flexDirection: 'row', gap: '$3', mt: '$1' }}>
                    <Text sx={{ fontSize: 11, color: 'blue600' }}>{item.frequency}</Text>
                    <Text sx={{ fontSize: 11, color: '$mutedForeground' }}>Next: {item.nextDue}</Text>
                  </View>
                  <Text sx={{ fontSize: 10, color: '$mutedForeground', mt: '$1' }}>
                    {item.guidelineSource}
                  </Text>
                </View>
              </View>
            ))}
            {scp.surveillance.whenToCallDoctor.length > 0 && (
              <View sx={{ mt: '$2', bg: '#FFFBEB', borderRadius: 8, p: '$4' }}>
                <Text sx={{ fontSize: 13, fontWeight: '600', color: '#92400E', mb: '$2' }}>
                  Call your doctor if you notice:
                </Text>
                {scp.surveillance.whenToCallDoctor.map((item, i) => (
                  <Text key={i} sx={{ fontSize: 13, color: '#92400E', mb: '$1' }}>· {item}</Text>
                ))}
              </View>
            )}
          </CollapsibleSection>

          {/* Late Effects */}
          <CollapsibleSection
            title="Late Effects"
            sectionKey="lateEffects"
            expanded={expandedSections.has('lateEffects')}
            onToggle={toggleSection}
          >
            {scp.lateEffects.byTreatment.map((group, gi) => (
              <View key={gi} sx={{ mb: '$4' }}>
                <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground', mb: '$2' }}>
                  From {group.treatmentName}
                </Text>
                {group.possibleEffects.map((effect, ei) => (
                  <View key={ei} sx={{ mb: '$3', borderLeftWidth: 3, borderColor: likelihoodColor(effect.likelihood), pl: '$3' }}>
                    <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$2' }}>
                      <Text sx={{ fontSize: 13, fontWeight: '600', color: '$foreground' }}>
                        {effect.effect}
                      </Text>
                      <View sx={{
                        borderRadius: 9999,
                        px: 8,
                        py: 1,
                        backgroundColor: likelihoodBg(effect.likelihood),
                      }}>
                        <Text sx={{ fontSize: 10, color: likelihoodColor(effect.likelihood) }}>
                          {effect.likelihood.replace('_', ' ')}
                        </Text>
                      </View>
                    </View>
                    <Text sx={{ fontSize: 12, color: '$mutedForeground', mt: '$1' }}>
                      Onset: {effect.typicalOnset} · Duration: {effect.duration}
                    </Text>
                    <Text sx={{ fontSize: 12, color: '$foreground', mt: '$1' }}>
                      What helps: {effect.management}
                    </Text>
                    <Text sx={{ fontSize: 11, color: '#B45309', mt: '$1' }}>
                      Call your doctor if: {effect.whenToWorry}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </CollapsibleSection>

          {/* Lifestyle */}
          <CollapsibleSection
            title="Lifestyle"
            sectionKey="lifestyle"
            expanded={expandedSections.has('lifestyle')}
            onToggle={toggleSection}
          >
            <View sx={{ mb: '$4' }}>
              <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground' }}>
                {scp.lifestyle.exercise.headline}
              </Text>
              <Text sx={{ fontSize: 13, color: '$mutedForeground', mt: '$1' }}>
                Target: {scp.lifestyle.exercise.target}
              </Text>
              {scp.lifestyle.exercise.precautions.map((p, i) => (
                <Text key={i} sx={{ fontSize: 12, color: '$mutedForeground', mt: '$1' }}>· {p}</Text>
              ))}
            </View>
            <View sx={{ mb: '$4' }}>
              <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground' }}>
                {scp.lifestyle.nutrition.headline}
              </Text>
              {scp.lifestyle.nutrition.recommendations.map((r, i) => (
                <Text key={i} sx={{ fontSize: 12, color: '$mutedForeground', mt: '$1' }}>· {r}</Text>
              ))}
            </View>
            <View>
              <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground' }}>
                {scp.lifestyle.alcohol.headline}
              </Text>
              <Text sx={{ fontSize: 13, color: '$mutedForeground', mt: '$1' }}>
                {scp.lifestyle.alcohol.detail}
              </Text>
            </View>
          </CollapsibleSection>

          {/* Ongoing Therapy */}
          <CollapsibleSection
            title="Ongoing Medications"
            sectionKey="ongoingTherapy"
            expanded={expandedSections.has('ongoingTherapy')}
            onToggle={toggleSection}
          >
            {scp.ongoingTherapy.medications.length === 0 ? (
              <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>
                No ongoing medications listed.
              </Text>
            ) : (
              scp.ongoingTherapy.medications.map((med, i) => (
                <View key={i} sx={{ mb: '$4', borderWidth: 1, borderColor: '$border', borderRadius: 8, p: '$4' }}>
                  <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground' }}>{med.name}</Text>
                  <Text sx={{ fontSize: 13, color: '$mutedForeground', mt: '$1' }}>
                    Purpose: {med.purpose}
                  </Text>
                  <Text sx={{ fontSize: 12, color: '$mutedForeground', mt: '$1' }}>
                    Duration: {med.duration}
                  </Text>
                  {med.commonSideEffects.length > 0 && (
                    <View sx={{ mt: '$2' }}>
                      <Text sx={{ fontSize: 12, fontWeight: '500', color: '$foreground' }}>
                        Common side effects:
                      </Text>
                      {med.commonSideEffects.map((se, si) => (
                        <Text key={si} sx={{ fontSize: 12, color: '$mutedForeground' }}>· {se}</Text>
                      ))}
                    </View>
                  )}
                  <Text sx={{ fontSize: 12, color: '$foreground', mt: '$2' }}>
                    Management: {med.management}
                  </Text>
                </View>
              ))
            )}
          </CollapsibleSection>

          {/* Care Team */}
          <CollapsibleSection
            title="Care Team"
            sectionKey="careTeam"
            expanded={expandedSections.has('careTeam')}
            onToggle={toggleSection}
          >
            {scp.careTeam.whoToCallFor.map((entry, i) => (
              <View key={i} sx={{ flexDirection: 'row', gap: '$3', mb: '$3' }}>
                <View sx={{
                  width: 8, height: 8, borderRadius: 4, mt: 6,
                  backgroundColor: entry.urgency === 'urgent' ? '#EF4444' : entry.urgency === 'soon' ? '#F59E0B' : '#3B82F6',
                }} />
                <View sx={{ flex: 1 }}>
                  <Text sx={{ fontSize: 13, fontWeight: '500', color: '$foreground' }}>
                    {entry.concern}
                  </Text>
                  <Text sx={{ fontSize: 12, color: '$mutedForeground' }}>
                    Contact: {entry.contact}
                  </Text>
                </View>
              </View>
            ))}
          </CollapsibleSection>

          {/* Additional Screening */}
          <CollapsibleSection
            title="Additional Screening"
            sectionKey="additionalScreening"
            expanded={expandedSections.has('additionalScreening')}
            onToggle={toggleSection}
          >
            {scp.additionalScreening.length === 0 ? (
              <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>
                No additional screenings recommended beyond your surveillance schedule.
              </Text>
            ) : (
              scp.additionalScreening.map((s, i) => (
                <View key={i} sx={{ mb: '$3', borderLeftWidth: 3, borderColor: '#A78BFA', pl: '$3' }}>
                  <Text sx={{ fontSize: 13, fontWeight: '600', color: '$foreground' }}>{s.screening}</Text>
                  <Text sx={{ fontSize: 12, color: '$mutedForeground', mt: '$1' }}>{s.reason}</Text>
                  <Text sx={{ fontSize: 11, color: '$mutedForeground', mt: '$1' }}>
                    {s.frequency} · Starting {s.startingWhen}
                  </Text>
                </View>
              ))
            )}
          </CollapsibleSection>
        </View>

        {/* Disclaimer */}
        <View sx={{ mt: '$8', bg: '#F9FAFB', borderRadius: 8, p: '$4' }}>
          <Text sx={{ fontSize: 11, color: '$mutedForeground', lineHeight: 18 }}>
            {scp.disclaimer}
          </Text>
        </View>

        {/* Feedback */}
        <View sx={{ mt: '$6' }}>
          <FeedbackPrompt
            feedbackType="scp_reading"
            title="Was this care plan helpful?"
            description="Your feedback helps us improve"
          />
        </View>

        {/* Refresh button */}
        <View sx={{ mt: '$6', alignItems: 'center' }}>
          <Pressable onPress={handleRefresh} disabled={refreshing}>
            <View sx={{
              borderWidth: 1,
              borderColor: '$border',
              borderRadius: 8,
              px: '$6',
              py: '$3',
              flexDirection: 'row',
              alignItems: 'center',
              gap: '$2',
            }}>
              {refreshing && <ActivityIndicator size="small" />}
              <Text sx={{ fontSize: 14, fontWeight: '500', color: '$foreground' }}>
                {refreshing ? 'Refreshing...' : 'Refresh my plan'}
              </Text>
            </View>
          </Pressable>
          <Text sx={{ mt: '$2', fontSize: 11, color: '$mutedForeground' }}>
            Regenerate with the latest clinical guidelines
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

function CollapsibleSection({
  title,
  sectionKey,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  sectionKey: string;
  expanded: boolean;
  onToggle: (key: string) => void;
  children: React.ReactNode;
}) {
  return (
    <View sx={{ borderWidth: 1, borderColor: '$border', borderRadius: 12, overflow: 'hidden' }}>
      <Pressable onPress={() => onToggle(sectionKey)}>
        <View sx={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: '$4',
          backgroundColor: expanded ? '#F9FAFB' : 'transparent',
        }}>
          <Text sx={{ fontSize: 15, fontWeight: '600', color: '$foreground' }}>{title}</Text>
          <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>
            {expanded ? '−' : '+'}
          </Text>
        </View>
      </Pressable>
      {expanded && (
        <View sx={{ p: '$4', pt: '$2' }}>
          {children}
        </View>
      )}
    </View>
  );
}

function likelihoodColor(l: string): string {
  if (l === 'common') return '#DC2626';
  if (l === 'less_common') return '#F59E0B';
  return '#6B7280';
}

function likelihoodBg(l: string): string {
  if (l === 'common') return '#FEE2E2';
  if (l === 'less_common') return '#FEF3C7';
  return '#F3F4F6';
}
