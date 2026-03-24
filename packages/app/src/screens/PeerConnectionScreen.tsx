import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator, Alert } from 'react-native';
import { Link } from 'solito/link';
import { useRouter } from 'solito/router';
import {
  useGetPeerConnectionQuery,
  useRespondToConnectionMutation,
  usePauseConnectionMutation,
  useResumeConnectionMutation,
  useCompleteConnectionMutation,
  useEndConnectionMutation,
} from '../generated/graphql';

// ============================================================================
// Constants
// ============================================================================

const STATUS_DISPLAY: Record<string, { bg: string; fg: string; label: string; description: string }> = {
  proposed: { bg: '#FEF3C7', fg: '#92400E', label: 'Proposed', description: 'Waiting for mentor to accept' },
  active: { bg: '#DCFCE7', fg: '#166534', label: 'Active', description: 'Connection is active' },
  paused: { bg: '#F3F4F6', fg: '#6B7280', label: 'Paused', description: 'Connection is paused' },
  completed: { bg: '#E0E7FF', fg: '#4338CA', label: 'Completed', description: 'Connection completed successfully' },
  ended: { bg: '#FEE2E2', fg: '#991B1B', label: 'Ended', description: 'Connection was ended' },
};

// ============================================================================
// Component
// ============================================================================

export function PeerConnectionScreen({ connectionId }: { connectionId: string }) {
  const router = useRouter();
  const { data, loading, refetch } = useGetPeerConnectionQuery({
    variables: { connectionId },
    errorPolicy: 'ignore',
  });
  const [respondMutation, { loading: responding }] = useRespondToConnectionMutation();
  const [pauseMutation, { loading: pausing }] = usePauseConnectionMutation();
  const [resumeMutation, { loading: resuming }] = useResumeConnectionMutation();
  const [completeMutation, { loading: completing }] = useCompleteConnectionMutation();
  const [endMutation, { loading: ending }] = useEndConnectionMutation();

  const connection = data?.peerConnection;
  const actionLoading = responding || pausing || resuming || completing || ending;

  const handleRespond = async (accept: boolean) => {
    await respondMutation({ variables: { connectionId, accept } });
    refetch();
  };

  const handlePause = async () => {
    await pauseMutation({ variables: { connectionId } });
    refetch();
  };

  const handleResume = async () => {
    await resumeMutation({ variables: { connectionId } });
    refetch();
  };

  const handleComplete = async () => {
    await completeMutation({ variables: { connectionId } });
    refetch();
  };

  const handleEnd = async () => {
    await endMutation({ variables: { connectionId } });
    refetch();
  };

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>Connection</Text>
        <View sx={{ mt: '$8', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <ActivityIndicator size="small" />
          <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (!connection) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>Connection Not Found</Text>
        <Link href="/peers">
          <Text sx={{ color: '#7C3AED', mt: '$4', fontSize: 15, fontWeight: '600' }}>Back to Peer Support</Text>
        </Link>
      </View>
    );
  }

  const status = STATUS_DISPLAY[connection.status] ?? STATUS_DISPLAY.ended;
  const isMentor = connection.role === 'mentor';

  return (
    <ScrollView sx={{ flex: 1, bg: '$background' }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$10', width: '100%' }}>
        {/* Header */}
        <View sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
              Peer Connection
            </Text>
            <Text sx={{ fontSize: 14, color: '$mutedForeground', mt: 2 }}>
              You are the {connection.role}
            </Text>
          </View>
          <View sx={{ bg: status.bg, px: '$4', py: '$2', borderRadius: 10 }}>
            <Text sx={{ fontSize: 14, fontWeight: '700', color: status.fg }}>{status.label}</Text>
          </View>
        </View>

        {/* Match Info */}
        <View sx={{ mt: '$6', bg: '$card', borderRadius: 12, p: '$5', borderWidth: 1, borderColor: '$border' }}>
          <Text sx={{ fontSize: 16, fontWeight: '700', color: '$foreground' }}>Match Details</Text>
          <View sx={{ mt: '$3', gap: '$2' }}>
            <View sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>Match Score</Text>
              <Text sx={{ fontSize: 14, fontWeight: '600', color: '#7C3AED' }}>{Math.round(connection.matchScore)}%</Text>
            </View>
            <View sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>Status</Text>
              <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground' }}>{status.description}</Text>
            </View>
          </View>

          {/* Match Reasons */}
          {connection.matchReasons.length > 0 && (
            <View sx={{ flexDirection: 'row', flexWrap: 'wrap', gap: '$2', mt: '$3' }}>
              {connection.matchReasons.map(reason => (
                <View key={reason} sx={{ bg: '#F0FDF4', px: '$3', py: '$1', borderRadius: 6 }}>
                  <Text sx={{ fontSize: 12, color: '#166534', fontWeight: '600' }}>{reason}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Proposed: Mentor can accept/decline */}
        {connection.status === 'proposed' && isMentor && (
          <View sx={{ mt: '$6', bg: '#FEF3C7', borderRadius: 12, p: '$5' }}>
            <Text sx={{ fontSize: 16, fontWeight: '700', color: '#92400E' }}>New Connection Request</Text>
            <Text sx={{ fontSize: 14, color: '#92400E', mt: '$2', lineHeight: 22 }}>
              Someone with a matching diagnosis would like to connect with you as their peer mentor.
            </Text>
            <View sx={{ flexDirection: 'row', gap: '$3', mt: '$4' }}>
              <Pressable onPress={() => handleRespond(true)} disabled={actionLoading} sx={{ flex: 1 }}>
                <View sx={{ bg: '#22C55E', py: '$3', borderRadius: 10, alignItems: 'center' }}>
                  <Text sx={{ color: '#FFFFFF', fontSize: 15, fontWeight: '700' }}>Accept</Text>
                </View>
              </Pressable>
              <Pressable onPress={() => handleRespond(false)} disabled={actionLoading} sx={{ flex: 1 }}>
                <View sx={{ bg: '#EF4444', py: '$3', borderRadius: 10, alignItems: 'center' }}>
                  <Text sx={{ color: '#FFFFFF', fontSize: 15, fontWeight: '700' }}>Decline</Text>
                </View>
              </Pressable>
            </View>
          </View>
        )}

        {/* Active: Action Buttons */}
        {connection.status === 'active' && (
          <View sx={{ mt: '$6', gap: '$3' }}>
            {/* Messages */}
            <Link href={`/peers/connection/${connectionId}/messages`}>
              <View sx={{ bg: '#7C3AED', py: '$4', borderRadius: 12, alignItems: 'center' }}>
                <Text sx={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>Open Messages</Text>
              </View>
            </Link>

            {/* Connection Actions */}
            <View sx={{ flexDirection: 'row', gap: '$3' }}>
              <Pressable onPress={handlePause} disabled={actionLoading} sx={{ flex: 1 }}>
                <View sx={{ bg: '$card', py: '$3', borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '$border' }}>
                  <Text sx={{ color: '$foreground', fontSize: 14, fontWeight: '600' }}>Pause</Text>
                </View>
              </Pressable>
              <Pressable onPress={handleComplete} disabled={actionLoading} sx={{ flex: 1 }}>
                <View sx={{ bg: '#DCFCE7', py: '$3', borderRadius: 10, alignItems: 'center' }}>
                  <Text sx={{ color: '#166534', fontSize: 14, fontWeight: '600' }}>Complete</Text>
                </View>
              </Pressable>
              <Pressable onPress={handleEnd} disabled={actionLoading} sx={{ flex: 1 }}>
                <View sx={{ bg: '#FEE2E2', py: '$3', borderRadius: 10, alignItems: 'center' }}>
                  <Text sx={{ color: '#991B1B', fontSize: 14, fontWeight: '600' }}>End</Text>
                </View>
              </Pressable>
            </View>
          </View>
        )}

        {/* Paused: Resume */}
        {connection.status === 'paused' && (
          <View sx={{ mt: '$6', gap: '$3' }}>
            <Pressable onPress={handleResume} disabled={actionLoading}>
              <View sx={{ bg: '#7C3AED', py: '$4', borderRadius: 12, alignItems: 'center' }}>
                <Text sx={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>Resume Connection</Text>
              </View>
            </Pressable>
            <Pressable onPress={handleEnd} disabled={actionLoading}>
              <View sx={{ bg: '#FEE2E2', py: '$3', borderRadius: 10, alignItems: 'center' }}>
                <Text sx={{ color: '#991B1B', fontSize: 14, fontWeight: '600' }}>End Connection</Text>
              </View>
            </Pressable>
          </View>
        )}

        {/* Completed/Ended: Feedback */}
        {['completed', 'ended'].includes(connection.status) && (
          <View sx={{ mt: '$6' }}>
            {connection.mentorRating == null && connection.menteeRating == null ? (
              <Link href={`/peers/connection/${connectionId}/feedback`}>
                <View sx={{ bg: '#7C3AED', py: '$4', borderRadius: 12, alignItems: 'center' }}>
                  <Text sx={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>Leave Feedback</Text>
                </View>
              </Link>
            ) : (
              <View sx={{ bg: '$card', borderRadius: 12, p: '$4', borderWidth: 1, borderColor: '$border' }}>
                <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground' }}>Feedback submitted</Text>
                {connection.feedbackComment && (
                  <Text sx={{ fontSize: 14, color: '$mutedForeground', mt: '$2' }}>"{connection.feedbackComment}"</Text>
                )}
              </View>
            )}
          </View>
        )}

        {/* Safety / Report */}
        {connection.status === 'active' && (
          <View sx={{ mt: '$8', pt: '$6', borderTopWidth: 1, borderColor: '$border' }}>
            <Link href="/peers/safety">
              <Text sx={{ fontSize: 14, color: '#EF4444', fontWeight: '600' }}>Report a Concern</Text>
            </Link>
          </View>
        )}

        {/* Back link */}
        <View sx={{ mt: '$6' }}>
          <Link href="/peers">
            <Text sx={{ fontSize: 14, color: '#7C3AED', fontWeight: '600' }}>Back to Peer Support</Text>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}
