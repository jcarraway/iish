import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { useRouter } from 'solito/router';
import { useGetPeerMatchesQuery, useProposeConnectionMutation } from '../generated/graphql';

// ============================================================================
// Component
// ============================================================================

export function FindMatchScreen() {
  const router = useRouter();
  const { data, loading, refetch } = useGetPeerMatchesQuery({ errorPolicy: 'ignore' });
  const [proposeMutation, { loading: proposing }] = useProposeConnectionMutation();
  const [proposedIds, setProposedIds] = useState<Set<string>>(new Set());

  const matches = data?.peerMatches ?? [];

  const handlePropose = async (mentorProfileId: string) => {
    await proposeMutation({ variables: { mentorProfileId } });
    setProposedIds(prev => new Set([...prev, mentorProfileId]));
  };

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>Find a Peer Match</Text>
        <View sx={{ mt: '$8', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <ActivityIndicator size="small" />
          <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>Finding your best matches...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView sx={{ flex: 1, bg: '$background' }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$10', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>Find a Peer Match</Text>
        <Text sx={{ fontSize: 16, color: '$mutedForeground', mt: '$2', lineHeight: 24 }}>
          We match you with mentors who share your diagnosis, treatment experience, and stage of journey. All matches are privacy-preserving.
        </Text>

        {matches.length === 0 ? (
          <View sx={{ mt: '$10', alignItems: 'center', py: '$8' }}>
            <Text sx={{ fontSize: 48, mb: '$4' }}>{'🔍'}</Text>
            <Text sx={{ fontSize: 18, fontWeight: '600', color: '$foreground', textAlign: 'center' }}>
              No matches available right now
            </Text>
            <Text sx={{ fontSize: 14, color: '$mutedForeground', mt: '$2', textAlign: 'center', maxWidth: 400 }}>
              This could mean there aren't trained mentors with a matching diagnosis yet. Check back soon — new mentors enroll regularly.
            </Text>
            <Pressable onPress={() => refetch()} sx={{ mt: '$4' }}>
              <View sx={{ bg: '$foreground', px: '$5', py: '$3', borderRadius: 10 }}>
                <Text sx={{ color: '$background', fontWeight: '600', fontSize: 15 }}>Try Again</Text>
              </View>
            </Pressable>
          </View>
        ) : (
          <View sx={{ mt: '$6', gap: '$4' }}>
            {matches.map((match, idx) => {
              const isProposed = proposedIds.has(match.mentorProfileId);
              return (
                <View
                  key={match.mentorProfileId}
                  sx={{
                    bg: '$card', borderRadius: 16, p: '$5',
                    borderWidth: idx === 0 ? 2 : 1,
                    borderColor: idx === 0 ? '#7C3AED' : '$border',
                  }}
                >
                  {idx === 0 && (
                    <View sx={{ bg: '#7C3AED', alignSelf: 'flex-start', px: '$3', py: '$1', borderRadius: 6, mb: '$3' }}>
                      <Text sx={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700' }}>BEST MATCH</Text>
                    </View>
                  )}

                  <View sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View sx={{ flex: 1 }}>
                      <Text sx={{ fontSize: 20, fontWeight: '700', color: '$foreground' }}>
                        {match.summary.displayName}
                      </Text>
                      <Text sx={{ fontSize: 14, color: '$mutedForeground', mt: 2 }}>
                        {match.summary.ageRange} · {match.summary.treatmentPhase}
                      </Text>
                    </View>
                    <View sx={{ bg: '#F5F3FF', px: '$3', py: '$2', borderRadius: 8, alignItems: 'center' }}>
                      <Text sx={{ fontSize: 20, fontWeight: '700', color: '#7C3AED' }}>
                        {Math.round(match.matchScore)}%
                      </Text>
                      <Text sx={{ fontSize: 10, color: '#7C3AED', fontWeight: '600' }}>MATCH</Text>
                    </View>
                  </View>

                  {/* Match Reasons */}
                  <View sx={{ flexDirection: 'row', flexWrap: 'wrap', gap: '$2', mt: '$3' }}>
                    {match.matchReasons.map(reason => (
                      <View key={reason} sx={{ bg: '#F0FDF4', px: '$3', py: '$1', borderRadius: 6 }}>
                        <Text sx={{ fontSize: 12, color: '#166534', fontWeight: '600' }}>{reason}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Bio */}
                  {match.summary.bio && (
                    <Text sx={{ fontSize: 14, color: '$foreground', mt: '$3', lineHeight: 22 }}>
                      "{match.summary.bio}"
                    </Text>
                  )}

                  {/* Comfortable Discussing */}
                  {match.summary.comfortableDiscussing.length > 0 && (
                    <View sx={{ mt: '$3' }}>
                      <Text sx={{ fontSize: 12, color: '$mutedForeground', mb: '$1' }}>Can discuss:</Text>
                      <View sx={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                        {match.summary.comfortableDiscussing.slice(0, 5).map(topic => (
                          <View key={topic} sx={{ bg: '#EDE9FE', px: 8, py: 3, borderRadius: 4 }}>
                            <Text sx={{ fontSize: 11, color: '#6D28D9' }}>
                              {topic.replace(/_/g, ' ')}
                            </Text>
                          </View>
                        ))}
                        {match.summary.comfortableDiscussing.length > 5 && (
                          <Text sx={{ fontSize: 11, color: '$mutedForeground', alignSelf: 'center' }}>
                            +{match.summary.comfortableDiscussing.length - 5} more
                          </Text>
                        )}
                      </View>
                    </View>
                  )}

                  {/* Track Record */}
                  {(match.summary.totalMenteesSupported > 0 || match.summary.averageRating != null) && (
                    <View sx={{ flexDirection: 'row', gap: '$4', mt: '$3' }}>
                      {match.summary.totalMenteesSupported > 0 && (
                        <Text sx={{ fontSize: 12, color: '$mutedForeground' }}>
                          {match.summary.totalMenteesSupported} mentee{match.summary.totalMenteesSupported !== 1 ? 's' : ''} supported
                        </Text>
                      )}
                      {match.summary.averageRating != null && (
                        <Text sx={{ fontSize: 12, color: '$mutedForeground' }}>
                          {match.summary.averageRating.toFixed(1)}/5 rating
                        </Text>
                      )}
                    </View>
                  )}

                  {/* Connect Button */}
                  <Pressable
                    onPress={() => handlePropose(match.mentorProfileId)}
                    disabled={isProposed || proposing}
                    sx={{ mt: '$4' }}
                  >
                    <View sx={{
                      bg: isProposed ? '#DCFCE7' : '#7C3AED',
                      py: '$3', borderRadius: 10, alignItems: 'center',
                    }}>
                      {proposing ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <Text sx={{
                          color: isProposed ? '#166534' : '#FFFFFF',
                          fontSize: 15, fontWeight: '700',
                        }}>
                          {isProposed ? 'Request Sent' : 'Request Connection'}
                        </Text>
                      )}
                    </View>
                  </Pressable>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
