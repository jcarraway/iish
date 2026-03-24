import { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, TextInput } from 'dripsy';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { Link } from 'solito/link';
import {
  useGetPeerMessagesQuery,
  useSendPeerMessageMutation,
  useMarkPeerMessagesReadMutation,
} from '../generated/graphql';

// ============================================================================
// Crisis Modal
// ============================================================================

function CrisisResourcesModal({
  alert,
  onDismiss,
}: {
  alert: { message: string; resources: { name: string; phone: string; description: string; available: string }[] };
  onDismiss: () => void;
}) {
  return (
    <View sx={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      bg: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center',
      px: '$4', zIndex: 100,
    }}>
      <View sx={{ bg: '$background', borderRadius: 16, p: '$6', maxWidth: 500, width: '100%' }}>
        <Text sx={{ fontSize: 20, fontWeight: '700', color: '#991B1B', mb: '$3' }}>
          You Are Not Alone
        </Text>
        <Text sx={{ fontSize: 14, color: '$foreground', lineHeight: 22, mb: '$4' }}>
          {alert.message}
        </Text>
        {alert.resources.map(r => (
          <View key={r.name} sx={{ bg: '#FEF2F2', borderRadius: 10, p: '$4', mb: '$3' }}>
            <Text sx={{ fontSize: 15, fontWeight: '700', color: '#991B1B' }}>{r.name}</Text>
            <Text sx={{ fontSize: 18, fontWeight: '700', color: '#DC2626', mt: '$1' }}>{r.phone}</Text>
            <Text sx={{ fontSize: 13, color: '#7F1D1D', mt: '$1' }}>{r.description}</Text>
            <Text sx={{ fontSize: 12, color: '#991B1B', mt: '$1' }}>{r.available}</Text>
          </View>
        ))}
        <Pressable onPress={onDismiss}>
          <View sx={{ bg: '$foreground', py: '$3', borderRadius: 10, alignItems: 'center', mt: '$2' }}>
            <Text sx={{ color: '$background', fontSize: 14, fontWeight: '700' }}>I Understand</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

// ============================================================================
// Component
// ============================================================================

export function PeerMessagesScreen({ connectionId }: { connectionId: string }) {
  const [messageText, setMessageText] = useState('');
  const [crisisAlert, setCrisisAlert] = useState<any>(null);
  const scrollRef = useRef<any>(null);

  const { data, loading, refetch } = useGetPeerMessagesQuery({
    variables: { connectionId, limit: 100 },
    pollInterval: 10000, // Poll every 10 seconds
    errorPolicy: 'ignore',
  });
  const [sendMutation, { loading: sending }] = useSendPeerMessageMutation();
  const [markReadMutation] = useMarkPeerMessagesReadMutation();

  const messages = data?.peerMessages ?? [];

  // Mark messages as read on mount and when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      markReadMutation({ variables: { connectionId } }).catch(() => {});
    }
  }, [messages.length, connectionId]);

  const handleSend = useCallback(async () => {
    const text = messageText.trim();
    if (!text) return;

    setMessageText('');
    const result = await sendMutation({
      variables: { input: { connectionId, content: text } },
    });

    // Check for crisis alert
    const alert = result.data?.sendPeerMessage?.crisisAlert;
    if (alert?.detected) {
      setCrisisAlert(alert);
    }

    refetch();
  }, [messageText, connectionId, sendMutation, refetch]);

  if (loading && messages.length === 0) {
    return (
      <View sx={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text sx={{ fontSize: 14, color: '$mutedForeground', mt: '$3' }}>Loading messages...</Text>
      </View>
    );
  }

  return (
    <View sx={{ flex: 1, bg: '$background' }}>
      {/* Crisis Modal */}
      {crisisAlert && (
        <CrisisResourcesModal alert={crisisAlert} onDismiss={() => setCrisisAlert(null)} />
      )}

      {/* Header */}
      <View sx={{
        px: '$4', py: '$3', borderBottomWidth: 1, borderColor: '$border',
        flexDirection: 'row', alignItems: 'center', gap: '$3',
      }}>
        <Link href={`/peers/connection/${connectionId}`}>
          <Text sx={{ fontSize: 20, color: '#7C3AED' }}>{'←'}</Text>
        </Link>
        <View sx={{ flex: 1 }}>
          <Text sx={{ fontSize: 16, fontWeight: '700', color: '$foreground' }}>Messages</Text>
          <Text sx={{ fontSize: 12, color: '$mutedForeground' }}>Peer Connection</Text>
        </View>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={90}
      >
        <ScrollView
          ref={scrollRef}
          sx={{ flex: 1, px: '$4', py: '$3' }}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd?.({ animated: false })}
        >
          {messages.length === 0 ? (
            <View sx={{ alignItems: 'center', py: '$10' }}>
              <Text sx={{ fontSize: 40, mb: '$3' }}>{'💬'}</Text>
              <Text sx={{ fontSize: 16, fontWeight: '600', color: '$foreground' }}>Start the conversation</Text>
              <Text sx={{ fontSize: 14, color: '$mutedForeground', mt: '$2', textAlign: 'center' }}>
                Say hello! Remember — share experiences, not medical advice.
              </Text>
            </View>
          ) : (
            <View sx={{ gap: '$2', pb: '$2' }}>
              {messages.map(msg => (
                <View
                  key={msg.id}
                  sx={{
                    alignSelf: msg.isOwnMessage ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                  }}
                >
                  <View sx={{
                    bg: msg.isOwnMessage ? '#7C3AED' : '#F3F4F6',
                    px: '$4', py: '$3', borderRadius: 16,
                    borderBottomRightRadius: msg.isOwnMessage ? 4 : 16,
                    borderBottomLeftRadius: msg.isOwnMessage ? 16 : 4,
                  }}>
                    <Text sx={{
                      fontSize: 15, lineHeight: 22,
                      color: msg.isOwnMessage ? '#FFFFFF' : '$foreground',
                    }}>
                      {msg.content}
                    </Text>
                  </View>
                  <View sx={{
                    flexDirection: 'row', gap: 6, mt: 2,
                    justifyContent: msg.isOwnMessage ? 'flex-end' : 'flex-start',
                    px: 4,
                  }}>
                    <Text sx={{ fontSize: 10, color: '$mutedForeground' }}>
                      {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    {msg.isOwnMessage && msg.readAt && (
                      <Text sx={{ fontSize: 10, color: '#7C3AED' }}>Read</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View sx={{
          px: '$4', py: '$3', borderTopWidth: 1, borderColor: '$border',
          flexDirection: 'row', alignItems: 'flex-end', gap: '$2', bg: '$background',
        }}>
          <TextInput
            value={messageText}
            onChangeText={setMessageText}
            placeholder="Type a message..."
            multiline
            sx={{
              flex: 1, borderWidth: 1, borderColor: '$border', borderRadius: 20,
              px: '$4', py: '$3', fontSize: 15, color: '$foreground', bg: '$card',
              maxHeight: 100,
            }}
          />
          <Pressable onPress={handleSend} disabled={!messageText.trim() || sending}>
            <View sx={{
              bg: messageText.trim() ? '#7C3AED' : '#E5E7EB',
              width: 44, height: 44, borderRadius: 22,
              alignItems: 'center', justifyContent: 'center',
            }}>
              {sending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text sx={{ color: messageText.trim() ? '#FFFFFF' : '#9CA3AF', fontSize: 18 }}>{'↑'}</Text>
              )}
            </View>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
