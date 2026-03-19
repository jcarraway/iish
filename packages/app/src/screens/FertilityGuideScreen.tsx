import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import {
  useGenerateFertilityDiscussionGuideMutation,
} from '../generated/graphql';

// ============================================================================
// Component
// ============================================================================

export function FertilityGuideScreen() {
  const [generateGuide, { data, loading, error }] = useGenerateFertilityDiscussionGuideMutation();

  const guide = data?.generateFertilityDiscussionGuide;

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          Discussion Guide
        </Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
          Personalized talking points for your oncologist conversation about fertility
        </Text>

        {/* Generate button (if no guide yet) */}
        {!guide && !loading && (
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
                Starting the conversation
              </Text>
              <Text sx={{ mt: '$2', fontSize: 13, color: '#075985', lineHeight: 20 }}>
                Talking to your oncologist about fertility can feel overwhelming. This guide gives
                you a personalized opening statement, specific questions based on your treatment plan,
                and key facts to keep the conversation focused and productive.
              </Text>
              <Text sx={{ mt: '$2', fontSize: 13, color: '#075985', lineHeight: 20 }}>
                Your oncologist is your ally in this conversation. They want you to have all the
                information you need to make the best decision for your future.
              </Text>
            </View>

            <Pressable
              onPress={() => generateGuide()}
              disabled={loading}
            >
              <View sx={{
                mt: '$5',
                backgroundColor: 'blue600',
                borderRadius: 8,
                py: '$3',
                alignItems: 'center',
              }}>
                <Text sx={{ fontSize: 14, fontWeight: '600', color: 'white' }}>
                  Generate My Discussion Guide
                </Text>
              </View>
            </Pressable>
          </>
        )}

        {/* Loading state */}
        {loading && (
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
              Generating your personalized guide...
            </Text>
            <Text sx={{ mt: '$2', fontSize: 13, color: '$mutedForeground', textAlign: 'center' }}>
              We are analyzing your treatment plan, cancer type, and timeline to create
              relevant questions and talking points.
            </Text>
          </View>
        )}

        {/* Error state */}
        {error && !loading && (
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
              We could not generate your discussion guide. Please try again.
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

        {/* Generated guide */}
        {guide && (
          <View sx={{ mt: '$6', gap: '$6' }}>
            {/* Opening Statement */}
            <View sx={{
              borderLeftWidth: 4,
              borderLeftColor: '#6366F1',
              backgroundColor: '#EEF2FF',
              borderRadius: 0,
              borderTopRightRadius: 12,
              borderBottomRightRadius: 12,
              p: '$5',
            }}>
              <Text sx={{ fontSize: 12, fontWeight: '600', color: '#4338CA', mb: '$2' }}>
                OPENING STATEMENT
              </Text>
              <Text sx={{
                fontSize: 15,
                color: '#312E81',
                lineHeight: 24,
                fontStyle: 'italic',
              }}>
                "{guide.openingStatement}"
              </Text>
            </View>

            {/* Questions */}
            <View>
              <SectionHeader title="Questions to Ask" />
              <View sx={{ mt: '$4', gap: '$3' }}>
                {guide.questions.map((question, i) => (
                  <View key={i} sx={{
                    borderWidth: 1,
                    borderColor: '$border',
                    borderRadius: 10,
                    p: '$4',
                    flexDirection: 'row',
                    gap: '$3',
                  }}>
                    <View sx={{
                      width: 28, height: 28, borderRadius: 14,
                      backgroundColor: '#DBEAFE',
                      alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Text sx={{ fontSize: 13, fontWeight: 'bold', color: '#1E40AF' }}>
                        {i + 1}
                      </Text>
                    </View>
                    <Text sx={{ fontSize: 14, color: '$foreground', lineHeight: 22, flex: 1 }}>
                      {question}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Key Facts */}
            <View>
              <SectionHeader title="Key Facts" />
              <View sx={{ mt: '$4', gap: '$2' }}>
                {guide.keyFacts.map((fact, i) => (
                  <View key={i} sx={{ flexDirection: 'row', gap: '$2', alignItems: 'flex-start' }}>
                    <View sx={{
                      width: 6, height: 6, borderRadius: 3,
                      backgroundColor: '#6366F1', mt: 8,
                    }} />
                    <Text sx={{ fontSize: 14, color: '$foreground', lineHeight: 22, flex: 1 }}>
                      {fact}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Timeline Notes */}
            <View>
              <SectionHeader title="Timeline Notes" />
              <View sx={{
                mt: '$4',
                backgroundColor: '#FEF3C7',
                borderWidth: 1,
                borderColor: '#FDE68A',
                borderRadius: 12,
                p: '$5',
              }}>
                {guide.timelineNotes.map((note, i) => (
                  <View key={i} sx={{
                    flexDirection: 'row',
                    gap: '$2',
                    alignItems: 'flex-start',
                    ...(i > 0 ? { mt: '$2' } : {}),
                  }}>
                    <View sx={{
                      width: 6, height: 6, borderRadius: 3,
                      backgroundColor: '#92400E', mt: 8,
                    }} />
                    <Text sx={{ fontSize: 14, color: '#78350F', lineHeight: 22, flex: 1 }}>
                      {note}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Encouragement note */}
            <View sx={{
              backgroundColor: '#F0FDF4',
              borderWidth: 1,
              borderColor: '#BBF7D0',
              borderRadius: 12,
              p: '$5',
            }}>
              <Text sx={{ fontSize: 14, fontWeight: '600', color: '#166534' }}>
                This guide is for your use
              </Text>
              <Text sx={{ mt: '$2', fontSize: 13, color: '#14532D', lineHeight: 20 }}>
                Your oncologist is your ally in this conversation. They want you to have the
                information you need to make decisions that are right for your whole life — not
                just your treatment. You deserve to ask these questions.
              </Text>
            </View>

            {/* Generated at */}
            <Text sx={{ fontSize: 11, color: '$mutedForeground' }}>
              Generated {new Date(guide.generatedAt).toLocaleDateString()}
            </Text>
          </View>
        )}

        {/* Navigation */}
        <View sx={{ mt: '$6', flexDirection: 'row', flexWrap: 'wrap', gap: '$3' }}>
          <Link href="/fertility">
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
          <Link href="/fertility/providers">
            <View sx={{
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '$border',
              px: '$4',
              py: '$3',
            }}>
              <Text sx={{ fontSize: 13, fontWeight: '500', color: '$foreground' }}>
                Find Providers {'\u2192'}
              </Text>
            </View>
          </Link>
        </View>

        {/* Disclaimer */}
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
            This discussion guide is AI-generated and personalized to your treatment plan. It is
            meant to help you prepare for conversations with your medical team, not to replace
            professional medical advice.
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
