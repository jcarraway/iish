import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import { useGetPeerMentorProfileQuery, useGetPeerConnectionsQuery, useGetMentorStatsQuery } from '../generated/graphql';

// ============================================================================
// Constants
// ============================================================================

const STATUS_COLORS: Record<string, { bg: string; fg: string; label: string }> = {
  proposed: { bg: '#FEF3C7', fg: '#92400E', label: 'Proposed' },
  mentor_accepted: { bg: '#DBEAFE', fg: '#1E40AF', label: 'Accepted' },
  active: { bg: '#DCFCE7', fg: '#166534', label: 'Active' },
  paused: { bg: '#F3F4F6', fg: '#6B7280', label: 'Paused' },
  completed: { bg: '#E0E7FF', fg: '#4338CA', label: 'Completed' },
  ended: { bg: '#FEE2E2', fg: '#991B1B', label: 'Ended' },
};

// ============================================================================
// Component
// ============================================================================

export function PeersDashboardScreen() {
  const { data: profileData, loading: profileLoading } = useGetPeerMentorProfileQuery({ errorPolicy: 'ignore' });
  const { data: connectionsData, loading: connectionsLoading } = useGetPeerConnectionsQuery({ errorPolicy: 'ignore' });
  const { data: statsData } = useGetMentorStatsQuery({ errorPolicy: 'ignore' });

  const mentorProfile = profileData?.peerMentorProfile;
  const connections = connectionsData?.peerConnections ?? [];
  const stats = statsData?.mentorStats;
  const loading = profileLoading || connectionsLoading;

  const activeConnections = connections.filter(c => c.status === 'active');
  const pendingConnections = connections.filter(c => c.status === 'proposed');

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>Peer Support</Text>
        <View sx={{ mt: '$8', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <ActivityIndicator size="small" />
          <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView sx={{ flex: 1, bg: '$background' }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$10', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>Peer Support</Text>
        <Text sx={{ fontSize: 16, color: '$mutedForeground', mt: '$2', lineHeight: 24 }}>
          Connect with someone who truly understands what you're going through — same diagnosis, same treatment, just a few steps ahead.
        </Text>

        {/* Quick Actions */}
        <View sx={{ flexDirection: 'row', flexWrap: 'wrap', gap: '$3', mt: '$8' }}>
          {!mentorProfile && (
            <Link href="/peers/become-mentor">
              <View sx={{ bg: '#7C3AED', px: '$5', py: '$3', borderRadius: 10 }}>
                <Text sx={{ color: '#FFFFFF', fontWeight: '600', fontSize: 15 }}>Become a Mentor</Text>
              </View>
            </Link>
          )}
          <Link href="/peers/find-match">
            <View sx={{ bg: '$foreground', px: '$5', py: '$3', borderRadius: 10 }}>
              <Text sx={{ color: '$background', fontWeight: '600', fontSize: 15 }}>Find a Peer Match</Text>
            </View>
          </Link>
          {mentorProfile && (
            <Link href="/peers/training">
              <View sx={{ bg: '#DBEAFE', px: '$5', py: '$3', borderRadius: 10 }}>
                <Text sx={{ color: '#1E40AF', fontWeight: '600', fontSize: 15 }}>
                  {mentorProfile.isTrained ? 'Review Training' : 'Complete Training'}
                </Text>
              </View>
            </Link>
          )}
        </View>

        {/* Mentor Profile Card */}
        {mentorProfile && (
          <View sx={{ mt: '$8', bg: '#F5F3FF', borderRadius: 12, p: '$5' }}>
            <Text sx={{ fontSize: 18, fontWeight: '700', color: '#5B21B6' }}>Your Mentor Profile</Text>
            <View sx={{ mt: '$3', gap: '$2' }}>
              <View sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>Status</Text>
                <View sx={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View sx={{ width: 8, height: 8, borderRadius: 4, bg: mentorProfile.isTrained ? '#22C55E' : '#F59E0B' }} />
                  <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground' }}>
                    {mentorProfile.isTrained ? 'Active & Trained' : 'Training Incomplete'}
                  </Text>
                </View>
              </View>
              {stats && (
                <>
                  <View sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>Mentees Supported</Text>
                    <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground' }}>{stats.totalMenteesSupported}</Text>
                  </View>
                  <View sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>Active Connections</Text>
                    <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground' }}>{stats.activeConnections}</Text>
                  </View>
                  {stats.averageRating != null && (
                    <View sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>Average Rating</Text>
                      <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground' }}>{stats.averageRating.toFixed(1)} / 5</Text>
                    </View>
                  )}
                </>
              )}
            </View>
          </View>
        )}

        {/* Pending Connections */}
        {pendingConnections.length > 0 && (
          <View sx={{ mt: '$8' }}>
            <Text sx={{ fontSize: 20, fontWeight: '700', color: '$foreground' }}>Pending Requests</Text>
            <View sx={{ mt: '$3', gap: '$3' }}>
              {pendingConnections.map(conn => (
                <Link key={conn.id} href={`/peers/connection/${conn.id}`}>
                  <View sx={{ bg: '#FEF3C7', borderRadius: 12, p: '$4' }}>
                    <View sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text sx={{ fontSize: 15, fontWeight: '600', color: '#92400E' }}>
                        {conn.role === 'mentor' ? 'New mentee request' : 'Awaiting mentor response'}
                      </Text>
                      <Text sx={{ fontSize: 13, color: '#92400E' }}>
                        Score: {Math.round(conn.matchScore)}%
                      </Text>
                    </View>
                  </View>
                </Link>
              ))}
            </View>
          </View>
        )}

        {/* Active Connections */}
        {activeConnections.length > 0 && (
          <View sx={{ mt: '$8' }}>
            <Text sx={{ fontSize: 20, fontWeight: '700', color: '$foreground' }}>Active Connections</Text>
            <View sx={{ mt: '$3', gap: '$3' }}>
              {activeConnections.map(conn => (
                <Link key={conn.id} href={`/peers/connection/${conn.id}`}>
                  <View sx={{ bg: '$card', borderRadius: 12, p: '$4', borderWidth: 1, borderColor: '$border' }}>
                    <View sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View>
                        <Text sx={{ fontSize: 15, fontWeight: '600', color: '$foreground' }}>
                          {conn.role === 'mentor' ? 'Mentee' : 'Mentor'}
                        </Text>
                        <Text sx={{ fontSize: 13, color: '$mutedForeground', mt: 2 }}>
                          Match: {Math.round(conn.matchScore)}% — {conn.matchReasons.slice(0, 2).join(', ')}
                        </Text>
                      </View>
                      <View sx={{ bg: '#DCFCE7', px: '$3', py: '$1', borderRadius: 8 }}>
                        <Text sx={{ fontSize: 12, fontWeight: '600', color: '#166534' }}>Active</Text>
                      </View>
                    </View>
                  </View>
                </Link>
              ))}
            </View>
          </View>
        )}

        {/* All Connections History */}
        {connections.length > 0 && connections.some(c => !['active', 'proposed'].includes(c.status)) && (
          <View sx={{ mt: '$8' }}>
            <Text sx={{ fontSize: 20, fontWeight: '700', color: '$foreground' }}>Past Connections</Text>
            <View sx={{ mt: '$3', gap: '$3' }}>
              {connections
                .filter(c => !['active', 'proposed'].includes(c.status))
                .map(conn => {
                  const sc = STATUS_COLORS[conn.status] ?? STATUS_COLORS.ended;
                  return (
                    <Link key={conn.id} href={`/peers/connection/${conn.id}`}>
                      <View sx={{ bg: '$card', borderRadius: 12, p: '$4', borderWidth: 1, borderColor: '$border' }}>
                        <View sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text sx={{ fontSize: 15, fontWeight: '600', color: '$foreground' }}>
                            {conn.role === 'mentor' ? 'Mentee' : 'Mentor'}
                          </Text>
                          <View sx={{ bg: sc.bg, px: '$3', py: '$1', borderRadius: 8 }}>
                            <Text sx={{ fontSize: 12, fontWeight: '600', color: sc.fg }}>{sc.label}</Text>
                          </View>
                        </View>
                      </View>
                    </Link>
                  );
                })}
            </View>
          </View>
        )}

        {/* Empty State */}
        {connections.length === 0 && !mentorProfile && (
          <View sx={{ mt: '$10', alignItems: 'center', py: '$8' }}>
            <Text sx={{ fontSize: 48, mb: '$4' }}>{'🤝'}</Text>
            <Text sx={{ fontSize: 18, fontWeight: '600', color: '$foreground', textAlign: 'center' }}>
              No peer connections yet
            </Text>
            <Text sx={{ fontSize: 14, color: '$mutedForeground', mt: '$2', textAlign: 'center', maxWidth: 400 }}>
              Find someone who's been through what you're going through, or become a mentor for someone earlier in their journey.
            </Text>
          </View>
        )}

        {/* Safety Link */}
        <View sx={{ mt: '$10', pt: '$6', borderTopWidth: 1, borderColor: '$border' }}>
          <Link href="/peers/safety">
            <Text sx={{ fontSize: 14, color: '#7C3AED', fontWeight: '600' }}>Safety & Guidelines</Text>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}
