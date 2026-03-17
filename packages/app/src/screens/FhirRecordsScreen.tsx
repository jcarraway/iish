import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import { confirmAction } from '../utils';
import {
  useGetFhirConnectionsQuery,
  useRevokeFhirConnectionMutation,
  useResyncFhirConnectionMutation,
} from '../generated/graphql';

const STATUS_BADGE: Record<string, { bg: string; fg: string; label: string }> = {
  synced: { bg: '#DCFCE7', fg: '#15803D', label: 'Connected' },
  revoked: { bg: '#FEE2E2', fg: '#B91C1C', label: 'Revoked' },
  token_expired: { bg: '#FEF3C7', fg: '#92400E', label: 'Session expired' },
};

const PRIVACY_ITEMS = [
  'Mental health records',
  'Substance use history',
  'Reproductive health data',
  'Billing and insurance information',
  'Clinical notes (provider-to-provider)',
];

export function FhirRecordsScreen() {
  const { data, loading, error, refetch } = useGetFhirConnectionsQuery();
  const [revokeConnection] = useRevokeFhirConnectionMutation();
  const [resyncConnection] = useResyncFhirConnectionMutation();
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [resyncingId, setResyncingId] = useState<string | null>(null);

  const connections = data?.fhirConnections ?? [];

  const handleRevoke = (connectionId: string) => {
    confirmAction(
      'This will disconnect your MyChart account and remove all imported data. Are you sure?',
      async () => {
        setRevokingId(connectionId);
        try {
          await revokeConnection({ variables: { connectionId } });
          refetch();
        } finally {
          setRevokingId(null);
        }
      },
    );
  };

  const handleResync = async (connectionId: string) => {
    setResyncingId(connectionId);
    try {
      await resyncConnection({ variables: { connectionId } });
      refetch();
    } finally {
      setResyncingId(null);
    }
  };

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 768, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 28, fontWeight: '700', color: 'gray900' }}>Connected Records</Text>
        <View sx={{ mt: '$8', flexDirection: 'row', alignItems: 'center', gap: '$3' }}>
          <ActivityIndicator size="small" />
          <Text sx={{ fontSize: 14, color: 'gray600' }}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 768, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 28, fontWeight: '700', color: 'gray900' }}>Connected Records</Text>
        <Text sx={{ mt: '$4', fontSize: 14, color: '#DC2626' }}>{error.message}</Text>
      </View>
    );
  }

  return (
    <ScrollView>
      <View sx={{ mx: 'auto', maxWidth: 768, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 28, fontWeight: '700', color: 'gray900' }}>Connected Records</Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: 'gray500' }}>
          View and manage your connected medical record sources.
        </Text>

        {connections.length === 0 ? (
          <View sx={{ mt: '$8', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', p: '$8', alignItems: 'center' }}>
            <Text sx={{ fontSize: 14, color: 'gray500' }}>No connected records yet.</Text>
            <Link href="/start/mychart">
              <View sx={{ mt: '$4', bg: '#2563EB', borderRadius: 8, px: '$4', py: '$2' }}>
                <Text sx={{ color: 'white', fontSize: 14 }}>Connect MyChart</Text>
              </View>
            </Link>
          </View>
        ) : (
          <View sx={{ mt: '$8', gap: '$4' }}>
            {connections.map((conn) => {
              const badge = STATUS_BADGE[conn.syncStatus as string] ?? { bg: '#F3F4F6', fg: '#6B7280', label: conn.syncStatus };
              const isRevoked = conn.syncStatus === 'revoked';
              const resources = (conn.resourcesPulled as unknown as Array<{ description: string; dateRange?: { latest?: string } }>) ?? [];

              return (
                <View key={conn.id} sx={{ borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', p: '$5' }}>
                  <View sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View sx={{ flex: 1 }}>
                      <Text sx={{ fontSize: 14, fontWeight: '600', color: 'gray900' }}>
                        {conn.healthSystemName ?? 'Unknown Health System'}
                      </Text>
                      <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$2', mt: '$1' }}>
                        <View sx={{ bg: badge.bg, borderRadius: 12, px: 8, py: 2 }}>
                          <Text sx={{ fontSize: 10, fontWeight: '500', color: badge.fg }}>{badge.label}</Text>
                        </View>
                        {conn.lastSyncedAt && (
                          <Text sx={{ fontSize: 10, color: '#9CA3AF' }}>
                            Last synced {new Date(conn.lastSyncedAt).toLocaleDateString()}
                          </Text>
                        )}
                      </View>
                    </View>

                    {!isRevoked && (
                      <View sx={{ flexDirection: 'row', gap: '$2' }}>
                        <Pressable onPress={() => handleResync(conn.id)} disabled={resyncingId === conn.id}>
                          <View sx={{ borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, px: '$3', py: '$1', opacity: resyncingId === conn.id ? 0.5 : 1 }}>
                            <Text sx={{ fontSize: 12, color: 'gray700' }}>
                              {resyncingId === conn.id ? 'Syncing...' : 'Re-sync'}
                            </Text>
                          </View>
                        </Pressable>
                        <Pressable onPress={() => handleRevoke(conn.id)} disabled={revokingId === conn.id}>
                          <View sx={{ borderWidth: 1, borderColor: '#FECACA', borderRadius: 8, px: '$3', py: '$1', opacity: revokingId === conn.id ? 0.5 : 1 }}>
                            <Text sx={{ fontSize: 12, color: '#DC2626' }}>
                              {revokingId === conn.id ? 'Revoking...' : 'Revoke access'}
                            </Text>
                          </View>
                        </Pressable>
                      </View>
                    )}
                  </View>

                  {/* Resources pulled */}
                  {resources.length > 0 && !isRevoked && (
                    <View sx={{ mt: '$4', borderTopWidth: 1, borderColor: '#F3F4F6', pt: '$4' }}>
                      <Text sx={{ fontSize: 11, fontWeight: '500', color: 'gray500', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Data accessed
                      </Text>
                      <View sx={{ mt: '$2', gap: '$1' }}>
                        {resources.map((r, i) => (
                          <View key={i} sx={{ flexDirection: 'row', alignItems: 'center', gap: '$2' }}>
                            <Text sx={{ fontSize: 12, color: '#22C55E' }}>✓</Text>
                            <Text sx={{ fontSize: 14, color: 'gray600' }}>{r.description}</Text>
                            {r.dateRange?.latest && (
                              <Text sx={{ fontSize: 12, color: '#9CA3AF' }}>
                                (as of {new Date(r.dateRange.latest).toLocaleDateString()})
                              </Text>
                            )}
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* What we never access */}
        <View sx={{ mt: '$8', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', p: '$5' }}>
          <Text sx={{ fontSize: 14, fontWeight: '600', color: 'gray900' }}>What we never access</Text>
          <View sx={{ mt: '$3', gap: '$2' }}>
            {PRIVACY_ITEMS.map((item, i) => (
              <View key={i} sx={{ flexDirection: 'row', alignItems: 'center', gap: '$2' }}>
                <Text sx={{ fontSize: 14, color: '#F87171' }}>✕</Text>
                <Text sx={{ fontSize: 14, color: 'gray600' }}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Connect another system */}
        <View sx={{ mt: '$6', alignItems: 'center' }}>
          <Link href="/start/mychart">
            <Text sx={{ fontSize: 14, color: '#2563EB' }}>Connect another health system</Text>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}
