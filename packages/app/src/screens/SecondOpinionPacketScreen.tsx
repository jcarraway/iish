import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import {
  useGetSecondOpinionRequestQuery,
  useGenerateRecordPacketMutation,
  GetSecondOpinionRequestDocument,
} from '../generated/graphql';

// ============================================================================
// Component
// ============================================================================

export function SecondOpinionPacketScreen() {
  const { data, loading: queryLoading } = useGetSecondOpinionRequestQuery({
    errorPolicy: 'ignore',
  });
  const [generatePacket, { loading: generating, error }] = useGenerateRecordPacketMutation({
    refetchQueries: [{ query: GetSecondOpinionRequestDocument }],
  });

  const request = data?.secondOpinionRequest;
  const hasPacket = !!request?.clinicalSummary;

  if (queryLoading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          Record Packet
        </Text>
        <View sx={{ mt: '$8', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <ActivityIndicator size="small" />
          <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>Loading your record packet...</Text>
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
            Record Packet
          </Text>
          <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
            Compile your clinical records for a second opinion review
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
              Start your second opinion process first
            </Text>
            <Text sx={{
              mt: '$2', fontSize: 14, color: '$mutedForeground',
              textAlign: 'center', maxWidth: 400, lineHeight: 22,
            }}>
              Before generating a record packet, you need to begin the second opinion process
              from the dashboard.
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
          Record Packet
        </Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
          A compiled clinical summary and targeted questions for the reviewing oncologist
        </Text>

        {/* ============================================================= */}
        {/* Generate Button (no packet yet) */}
        {/* ============================================================= */}
        {!hasPacket && !generating && (
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
                What is a record packet?
              </Text>
              <Text sx={{ mt: '$2', fontSize: 13, color: '#075985', lineHeight: 20 }}>
                We will compile a clinical summary of your case — including diagnosis, staging,
                treatment history, and genomic findings — and generate targeted questions for the
                reviewing oncologist. This ensures they can quickly understand your case and focus
                on the areas that matter most.
              </Text>
            </View>

            <Pressable onPress={() => generatePacket()} disabled={generating}>
              <View sx={{
                mt: '$5',
                backgroundColor: 'blue600',
                borderRadius: 8,
                py: '$3',
                alignItems: 'center',
              }}>
                <Text sx={{ fontSize: 14, fontWeight: '600', color: 'white' }}>
                  Generate your record packet
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
              Preparing your record packet...
            </Text>
            <Text sx={{ mt: '$2', fontSize: 13, color: '$mutedForeground', textAlign: 'center' }}>
              We are compiling your clinical history, genomic data, and treatment information
              into a comprehensive summary for the reviewing oncologist.
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
              We could not generate your record packet. Please try again.
            </Text>
            <Pressable onPress={() => generatePacket()}>
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
        {/* Clinical Summary */}
        {/* ============================================================= */}
        {hasPacket && (
          <View sx={{ mt: '$6', gap: '$6' }}>
            {/* Clinical Summary Card */}
            <View>
              <SectionHeader title="Clinical Summary" />
              <View sx={{
                mt: '$4',
                borderWidth: 1,
                borderColor: '$border',
                borderRadius: 12,
                p: '$5',
              }}>
                <Text sx={{
                  fontSize: 14,
                  color: '$foreground',
                  lineHeight: 22,
                }}>
                  {request.clinicalSummary}
                </Text>
              </View>
            </View>

            {/* Questions for Review */}
            {request.questionsForReview && request.questionsForReview.length > 0 && (
              <View>
                <SectionHeader title="Questions for Review" />
                <Text sx={{ mt: '$2', fontSize: 13, color: '$mutedForeground', lineHeight: 20 }}>
                  These targeted questions will help the reviewing oncologist focus on the most
                  important aspects of your case.
                </Text>

                <View sx={{ mt: '$4', gap: '$3' }}>
                  {request.questionsForReview.map((question: string, i: number) => (
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
            )}

            {/* Physician review note */}
            <View sx={{
              backgroundColor: '#F0F9FF',
              borderWidth: 1,
              borderColor: '#BAE6FD',
              borderRadius: 12,
              p: '$5',
            }}>
              <Text sx={{ fontSize: 14, fontWeight: '600', color: '#0C4A6E' }}>
                This packet should be reviewed by your oncologist before sending
              </Text>
              <Text sx={{ mt: '$2', fontSize: 13, color: '#075985', lineHeight: 20 }}>
                Your oncologist can add context, correct any inaccuracies, and include supplementary
                materials such as pathology slides, imaging discs, or additional lab results.
              </Text>
            </View>

            {/* Regenerate button */}
            <Pressable onPress={() => generatePacket()} disabled={generating}>
              <View sx={{
                borderWidth: 1,
                borderColor: '$border',
                borderRadius: 8,
                py: '$3',
                alignItems: 'center',
              }}>
                <Text sx={{ fontSize: 13, fontWeight: '600', color: '$foreground' }}>
                  {generating ? 'Regenerating...' : 'Regenerate packet'}
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
          <Link href="/second-opinion/communication">
            <View sx={{
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '$border',
              px: '$4',
              py: '$3',
            }}>
              <Text sx={{ fontSize: 13, fontWeight: '500', color: '$foreground' }}>
                Communication Guide {'\u2192'}
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
            This record packet is AI-generated from your uploaded medical records and clinical data.
            It may contain inaccuracies and must be reviewed by your oncologist before being shared
            with a second opinion provider.
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
