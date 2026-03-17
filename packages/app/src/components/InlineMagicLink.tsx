import { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable } from 'dripsy';
import { useRequestMagicLinkMutation, useMeQuery } from '../generated/graphql';

interface Props {
  onAuthDetected: () => void;
  redirectPath?: string;
}

export function InlineMagicLink({ onAuthDetected, redirectPath }: Props) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [requestMagicLink] = useRequestMagicLinkMutation();
  const { data: meData } = useMeQuery({ pollInterval: sent ? 3000 : 0, skip: !sent });

  useEffect(() => {
    if (meData?.me) {
      onAuthDetected();
    }
  }, [meData, onAuthDetected]);

  const handleSend = async () => {
    setError('');
    setSending(true);
    try {
      await requestMagicLink({
        variables: { email, redirect: redirectPath },
      });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send sign-in link');
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <View sx={{ borderRadius: '$lg', borderWidth: 1, borderColor: 'blue200', bg: 'blue50', p: '$4' }}>
        <Text sx={{ fontSize: '$sm', fontWeight: '500', color: 'blue800' }}>Check your email</Text>
        <Text sx={{ mt: '$1', fontSize: '$sm', color: 'blue600' }}>
          We sent a sign-in link to <Text sx={{ fontWeight: '700' }}>{email}</Text>. Click it to
          continue.
        </Text>
        <Text sx={{ mt: '$2', fontSize: '$xs', color: 'blue500' }}>
          Waiting for you to sign in...
        </Text>
      </View>
    );
  }

  return (
    <View sx={{ borderRadius: '$lg', borderWidth: 1, borderColor: 'gray200', bg: 'gray50', p: '$4' }}>
      <Text sx={{ mb: '$3', fontSize: '$sm', fontWeight: '500', color: 'gray700' }}>
        Sign in to save your profile and find matches
      </Text>
      {error !== '' && (
        <Text sx={{ mb: '$2', fontSize: '$sm', color: 'red600' }}>{error}</Text>
      )}
      <View sx={{ flexDirection: 'row', gap: '$2' }}>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="your@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          sx={{
            flex: 1,
            borderRadius: '$lg',
            borderWidth: 1,
            borderColor: 'gray300',
            px: '$3',
            py: '$2',
            fontSize: '$sm',
          }}
        />
        <Pressable
          onPress={handleSend}
          disabled={!email || sending}
          sx={{
            borderRadius: '$lg',
            bg: !email || sending ? 'gray300' : 'blue600',
            px: '$4',
            py: '$2',
            justifyContent: 'center',
          }}
        >
          <Text sx={{ fontSize: '$sm', fontWeight: '500', color: 'white' }}>
            {sending ? 'Sending...' : 'Send link'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
