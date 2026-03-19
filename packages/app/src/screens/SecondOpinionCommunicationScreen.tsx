import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import {
  useGetSecondOpinionRequestQuery,
  useGenerateCommunicationGuideMutation,
  GetSecondOpinionRequestDocument,
} from '../generated/graphql';

// ============================================================================
// Component
// ============================================================================

export function SecondOpinionCommunicationScreen() {
  const { data, loading: queryLoading } = useGetSecondOpinionRequestQuery({
    errorPolicy: 'ignore',
  });
  const [generateGuide, { loading: generating, error }] = useGenerateCommunicationGuideMutation({
    refetchQueries: [{ query: GetSecondOpinionRequestDocument }],
  });

  const request = data?.secondOpinionRequest;
  const rawGuide = request?.communicationGuide;

  // Parse the JSON guide
  let guide: {
    portalMessage?: string;
    inPersonScript?: string;
    recordsRequest?: string;
    reassurance?: string;
  } | null = null;
  if (rawGuide) {
    try {
      guide = typeof rawGuide === 'string' ? JSON.parse(rawGuide) : rawGuide;
    } catch {
      guide = null;
    }
  }

  // Collapsible section state
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    portalMessage: true,
    inPersonScript: false,
    recordsRequest: false,
    reassurance: false,
  });

  function toggleSection(key: string) {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  }

  if (queryLoading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          Communication Guide
        </Text>
        <View sx={{ mt: '$8', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <ActivityIndicator size="small" />
          <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>Loading your communication guide...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          Communication Guide
        </Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
          How to discuss a second opinion with your oncologist
        </Text>

        {/* ============================================================= */}
        {/* Key Message */}
        {/* ============================================================= */}
        <View sx={{
          mt: '$6',
          backgroundColor: '#F0FDF4',
          borderWidth: 1,
          borderColor: '#BBF7D0',
          borderRadius: 12,
          p: '$5',
        }}>
          <Text sx={{ fontSize: 15, fontWeight: '600', color: '#166534' }}>
            Most oncologists welcome and encourage second opinions
          </Text>
          <Text sx={{ mt: '$2', fontSize: 13, color: '#14532D', lineHeight: 20 }}>
            Seeking a second opinion is a sign of being an informed, engaged patient. Your
            oncologist will not be offended — in fact, most physicians consider it a responsible
            step in complex medical decision-making. A second opinion often strengthens your
            confidence in your current treatment plan.
          </Text>
        </View>

        {/* ============================================================= */}
        {/* Generate Button (no guide yet) */}
        {/* ============================================================= */}
        {!guide && !generating && (
          <>
            <View sx={{
              mt: '$6',
              backgroundColor: '#F0F9FF',
              borderWidth: 1,
              borderColor: '#BAE6FD',
              borderRadius: 12,
              p: '$5',
            }}>
              <Text sx={{ fontSize: 15, fontWeight: '600', color: '#0C4A6E' }}>
                What you will get
              </Text>
              <Text sx={{ mt: '$2', fontSize: 13, color: '#075985', lineHeight: 20 }}>
                A personalized communication guide including a portal/email message you can send to
                your oncologist, an in-person talking script, a records request template, and
                reassurance framing to help you feel confident about the conversation.
              </Text>
            </View>

            <Pressable onPress={() => generateGuide()} disabled={generating}>
              <View sx={{
                mt: '$5',
                backgroundColor: 'blue600',
                borderRadius: 8,
                py: '$3',
                alignItems: 'center',
              }}>
                <Text sx={{ fontSize: 14, fontWeight: '600', color: 'white' }}>
                  Generate Communication Guide
                </Text>
              </View>
            </Pressable>
          </>
        )}

        {/* ============================================================= */}
        {/* Generating State */}
        {/* ============================================================= */}
        {generating && (
          <View sx={{
            mt: '$6',
            borderWidth: 1,
            borderColor: '$border',
            borderRadius: 12,
            p: '$6',
            alignItems: 'center',
          }}>
            <ActivityIndicator size="large" />
            <Text sx={{ mt: '$4', fontSize: 14, fontWeight: '600', color: '$foreground' }}>
              Generating your communication guide...
            </Text>
            <Text sx={{ mt: '$2', fontSize: 13, color: '$mutedForeground', textAlign: 'center' }}>
              We are creating personalized messaging templates based on your clinical situation
              and relationship with your oncology team.
            </Text>
          </View>
        )}

        {/* ============================================================= */}
        {/* Error State */}
        {/* ============================================================= */}
        {error && !generating && (
          <View sx={{
            mt: '$6',
            backgroundColor: '#FEF2F2',
            borderWidth: 1,
            borderColor: '#FECACA',
            borderRadius: 12,
            p: '$5',
          }}>
            <Text sx={{ fontSize: 14, fontWeight: '600', color: '#991B1B' }}>
              Something went wrong
            </Text>
            <Text sx={{ mt: '$2', fontSize: 13, color: '#B91C1C', lineHeight: 20 }}>
              We could not generate your communication guide. Please try again.
            </Text>
            <Pressable onPress={() => generateGuide()}>
              <View sx={{
                mt: '$3',
                backgroundColor: '#991B1B',
                borderRadius: 8,
                px: '$4',
                py: '$3',
                alignSelf: 'flex-start',
              }}>
                <Text sx={{ fontSize: 13, fontWeight: '600', color: 'white' }}>Retry</Text>
              </View>
            </Pressable>
          </View>
        )}

        {/* ============================================================= */}
        {/* Guide Sections */}
        {/* ============================================================= */}
        {guide && (
          <View sx={{ mt: '$6', gap: '$3' }}>
            {/* Section 1: Portal/Email Message */}
            <CollapsibleSection
              title="Portal/Email Message"
              subtitle="A message you can send through your patient portal or email"
              expanded={expandedSections.portalMessage}
              onToggle={() => toggleSection('portalMessage')}
            >
              <View sx={{
                backgroundColor: '#F8FAFC',
                borderRadius: 8,
                p: '$4',
              }}>
                <Text sx={{
                  fontSize: 14,
                  color: '$foreground',
                  lineHeight: 22,
                  fontFamily: 'monospace',
                }}>
                  {guide.portalMessage ?? 'No portal message available.'}
                </Text>
              </View>
            </CollapsibleSection>

            {/* Section 2: In-Person Script */}
            <CollapsibleSection
              title="In-Person Script"
              subtitle="What to say at your next appointment"
              expanded={expandedSections.inPersonScript}
              onToggle={() => toggleSection('inPersonScript')}
            >
              <Text sx={{ fontSize: 14, color: '$foreground', lineHeight: 22 }}>
                {guide.inPersonScript ?? 'No in-person script available.'}
              </Text>
            </CollapsibleSection>

            {/* Section 3: Records Request */}
            <CollapsibleSection
              title="Records Request"
              subtitle="Template for requesting your medical records"
              expanded={expandedSections.recordsRequest}
              onToggle={() => toggleSection('recordsRequest')}
            >
              <View sx={{
                backgroundColor: '#F8FAFC',
                borderRadius: 8,
                p: '$4',
              }}>
                <Text sx={{
                  fontSize: 14,
                  color: '$foreground',
                  lineHeight: 22,
                  fontFamily: 'monospace',
                }}>
                  {guide.recordsRequest ?? 'No records request template available.'}
                </Text>
              </View>
            </CollapsibleSection>

            {/* Section 4: Reassurance */}
            <CollapsibleSection
              title="Reassurance"
              subtitle="Why this is the right thing to do"
              expanded={expandedSections.reassurance}
              onToggle={() => toggleSection('reassurance')}
            >
              <View sx={{
                backgroundColor: '#F0FDF4',
                borderWidth: 1,
                borderColor: '#BBF7D0',
                borderRadius: 8,
                p: '$4',
              }}>
                <Text sx={{ fontSize: 14, color: '#14532D', lineHeight: 22 }}>
                  {guide.reassurance ?? 'No reassurance content available.'}
                </Text>
              </View>
            </CollapsibleSection>

            {/* Regenerate button */}
            <Pressable onPress={() => generateGuide()} disabled={generating}>
              <View sx={{
                mt: '$2',
                borderWidth: 1,
                borderColor: '$border',
                borderRadius: 8,
                py: '$3',
                alignItems: 'center',
              }}>
                <Text sx={{ fontSize: 13, fontWeight: '600', color: '$foreground' }}>
                  {generating ? 'Regenerating...' : 'Regenerate guide'}
                </Text>
              </View>
            </Pressable>
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

        {/* ============================================================= */}
        {/* Disclaimer */}
        {/* ============================================================= */}
        <View sx={{
          mt: '$6',
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
            This communication guide is AI-generated and personalized to your situation. It is
            meant to help you prepare for conversations with your medical team, not to replace
            professional medical advice. Adapt these templates to your personal communication style.
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

function CollapsibleSection({
  title,
  subtitle,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  subtitle: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <View sx={{
      borderWidth: 1,
      borderColor: expanded ? 'blue600' : '$border',
      borderRadius: 12,
      overflow: 'hidden',
    }}>
      <Pressable onPress={onToggle}>
        <View sx={{
          p: '$5',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: expanded ? '#F0F9FF' : 'transparent',
        }}>
          <View sx={{ flex: 1, mr: '$3' }}>
            <Text sx={{ fontSize: 15, fontWeight: '600', color: '$foreground' }}>
              {title}
            </Text>
            <Text sx={{ mt: '$1', fontSize: 12, color: '$mutedForeground' }}>
              {subtitle}
            </Text>
          </View>
          <Text sx={{ fontSize: 16, color: '$mutedForeground' }}>
            {expanded ? '\u2212' : '+'}
          </Text>
        </View>
      </Pressable>
      {expanded && (
        <View sx={{ px: '$5', pb: '$5' }}>
          {children}
        </View>
      )}
    </View>
  );
}
