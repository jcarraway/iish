import { useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { useRouter } from 'solito/router';
import { useSubmitConnectionFeedbackMutation } from '../generated/graphql';

// ============================================================================
// Component
// ============================================================================

export function PeerFeedbackScreen({ connectionId }: { connectionId: string }) {
  const router = useRouter();
  const [submitMutation, { loading }] = useSubmitConnectionFeedbackMutation();
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    await submitMutation({
      variables: { connectionId, rating, comment: comment || null },
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <ScrollView sx={{ flex: 1, bg: '$background' }}>
        <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%', alignItems: 'center' }}>
          <Text sx={{ fontSize: 48, mb: '$4' }}>{'🙏'}</Text>
          <Text sx={{ fontSize: 24, fontWeight: '700', color: '$foreground', textAlign: 'center' }}>
            Thank You for Your Feedback
          </Text>
          <Text sx={{ fontSize: 16, color: '$mutedForeground', mt: '$3', textAlign: 'center', maxWidth: 400 }}>
            Your feedback helps us improve the peer matching experience and supports your mentor's journey.
          </Text>
          <Pressable onPress={() => router.push('/peers')} sx={{ mt: '$6' }}>
            <View sx={{ bg: '#7C3AED', px: '$6', py: '$3', borderRadius: 10 }}>
              <Text sx={{ color: '#FFFFFF', fontSize: 15, fontWeight: '700' }}>Back to Peer Support</Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView sx={{ flex: 1, bg: '$background' }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$10', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>Connection Feedback</Text>
        <Text sx={{ fontSize: 16, color: '$mutedForeground', mt: '$2', lineHeight: 24 }}>
          How was your experience with this peer connection? Your feedback is anonymous and helps us improve matching.
        </Text>

        {/* Rating */}
        <View sx={{ mt: '$8' }}>
          <Text sx={{ fontSize: 16, fontWeight: '700', color: '$foreground', mb: '$3' }}>
            Overall Experience
          </Text>
          <View sx={{ flexDirection: 'row', gap: '$3', justifyContent: 'center' }}>
            {[1, 2, 3, 4, 5].map(n => (
              <Pressable key={n} onPress={() => setRating(n)}>
                <View sx={{
                  width: 56, height: 56, borderRadius: 28,
                  bg: n <= rating ? '#7C3AED' : '$card',
                  borderWidth: 2, borderColor: n <= rating ? '#7C3AED' : '$border',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Text sx={{
                    fontSize: 24, fontWeight: '700',
                    color: n <= rating ? '#FFFFFF' : '$mutedForeground',
                  }}>
                    {n}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
          <View sx={{ flexDirection: 'row', justifyContent: 'space-between', mt: '$2', px: '$2' }}>
            <Text sx={{ fontSize: 12, color: '$mutedForeground' }}>Not helpful</Text>
            <Text sx={{ fontSize: 12, color: '$mutedForeground' }}>Very helpful</Text>
          </View>
        </View>

        {/* Comment */}
        <View sx={{ mt: '$8' }}>
          <Text sx={{ fontSize: 16, fontWeight: '700', color: '$foreground', mb: '$2' }}>
            Additional Comments (Optional)
          </Text>
          <TextInput
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
            placeholder="What was most helpful? What could be improved?"
            sx={{
              borderWidth: 1, borderColor: '$border', borderRadius: 10, p: '$3',
              fontSize: 14, color: '$foreground', bg: '$card', minHeight: 100,
              textAlignVertical: 'top',
            }}
          />
        </View>

        {/* Submit */}
        <View sx={{ mt: '$8' }}>
          <Pressable onPress={handleSubmit} disabled={rating === 0 || loading}>
            <View sx={{
              bg: rating > 0 ? '#7C3AED' : '#E5E7EB',
              py: '$4', borderRadius: 12, alignItems: 'center',
            }}>
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text sx={{
                  color: rating > 0 ? '#FFFFFF' : '#9CA3AF',
                  fontSize: 16, fontWeight: '700',
                }}>
                  Submit Feedback
                </Text>
              )}
            </View>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
