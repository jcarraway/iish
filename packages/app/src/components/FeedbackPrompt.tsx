import { useState } from 'react';
import { View, Text, Pressable } from 'dripsy';
import { TextInput } from 'react-native';
import { useSubmitFeedbackMutation } from '../generated/graphql';

interface FeedbackPromptProps {
  feedbackType: string;
  title: string;
  description: string;
  context?: any;
}

export function FeedbackPrompt({ feedbackType, title, description, context }: FeedbackPromptProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [submitFeedback, { loading }] = useSubmitFeedbackMutation();

  if (dismissed || submitted) {
    if (submitted) {
      return (
        <View sx={{
          borderWidth: 1,
          borderColor: '#86EFAC',
          backgroundColor: '#F0FDF4',
          borderRadius: 12,
          p: '$4',
          alignItems: 'center',
        }}>
          <Text sx={{ fontSize: 14, fontWeight: '600', color: '#166534' }}>
            Thank you for your feedback!
          </Text>
        </View>
      );
    }
    return null;
  }

  const handleSubmit = async () => {
    if (rating == null) return;
    try {
      await submitFeedback({
        variables: {
          input: {
            feedbackType,
            rating,
            comment: comment.trim() || null,
            context: context || null,
          },
        },
      });
      setSubmitted(true);
    } catch {
      // swallow
    }
  };

  return (
    <View sx={{
      borderWidth: 1,
      borderColor: '$border',
      borderRadius: 12,
      p: '$4',
    }}>
      <View sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View sx={{ flex: 1 }}>
          <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground' }}>
            {title}
          </Text>
          <Text sx={{ mt: '$1', fontSize: 12, color: '$mutedForeground' }}>
            {description}
          </Text>
        </View>
        <Pressable onPress={() => setDismissed(true)}>
          <Text sx={{ fontSize: 18, color: '$mutedForeground', px: '$2' }}>×</Text>
        </Pressable>
      </View>

      {/* Star rating */}
      <View sx={{ flexDirection: 'row', gap: '$2', mt: '$3' }}>
        {[1, 2, 3, 4, 5].map(star => (
          <Pressable key={star} onPress={() => setRating(star)}>
            <View sx={{
              width: 40,
              height: 40,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: rating != null && star <= rating ? '#F59E0B' : '$border',
              backgroundColor: rating != null && star <= rating ? '#FEF3C7' : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Text sx={{ fontSize: 18 }}>
                {rating != null && star <= rating ? '\u2605' : '\u2606'}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>

      {/* Comment (shows after rating) */}
      {rating != null && (
        <View sx={{ mt: '$3' }}>
          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="Any additional thoughts? (optional)"
            multiline
            numberOfLines={2}
            style={{
              borderWidth: 1,
              borderColor: '#D1D5DB',
              borderRadius: 8,
              padding: 12,
              fontSize: 14,
              minHeight: 60,
            }}
          />
          <Pressable onPress={handleSubmit} disabled={loading}>
            <View sx={{
              mt: '$3',
              backgroundColor: 'blue600',
              borderRadius: 8,
              px: '$5',
              py: '$2',
              alignSelf: 'flex-start',
            }}>
              <Text sx={{ fontSize: 14, fontWeight: '600', color: 'white' }}>
                {loading ? 'Submitting...' : 'Submit'}
              </Text>
            </View>
          </Pressable>
        </View>
      )}
    </View>
  );
}
