import { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable } from 'dripsy';
import { useRouter } from 'solito/router';
import { useMeQuery } from '../generated/graphql';

export function AuthScreen() {
  const router = useRouter();
  const { data: meData } = useMeQuery();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (meData?.me) {
      router.replace('/dashboard');
    }
  }, [meData, router]);

  const handleSubmit = async () => {
    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to send magic link');
      }

      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  if (status === 'success') {
    return (
      <View sx={{ mx: 'auto', maxWidth: 448, px: '$6', py: '$24', alignItems: 'center', alignSelf: 'center', width: '100%' }}>
        <Text sx={{ fontSize: '$2xl', fontWeight: '700', color: '$foreground' }}>Check your email</Text>
        <Text sx={{ mt: '$4', color: '$mutedForeground', textAlign: 'center' }}>
          We sent a sign-in link to <Text sx={{ fontWeight: '600' }}>{email}</Text>. It expires in 15 minutes.
        </Text>
      </View>
    );
  }

  return (
    <View sx={{ mx: 'auto', maxWidth: 448, px: '$6', py: '$24', alignSelf: 'center', width: '100%' }}>
      <Text sx={{ fontSize: '$2xl', fontWeight: '700', color: '$foreground' }}>Sign in to OncoVax</Text>
      <Text sx={{ mt: '$2', color: '$mutedForeground' }}>
        Enter your email and we&apos;ll send you a magic link to sign in.
      </Text>

      <View sx={{ mt: '$8', gap: '$4' }}>
        <View>
          <Text sx={{ fontSize: '$sm', fontWeight: '500', color: '$foreground', mb: '$1' }}>
            Email address
          </Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            placeholder="you@example.com"
            placeholderTextColor="#737373"
            sx={{
              borderWidth: 1,
              borderColor: '$input',
              borderRadius: '$md',
              bg: '$background',
              px: '$3',
              py: '$2',
              fontSize: '$sm',
              color: '$foreground',
            }}
          />
        </View>

        {status === 'error' && (
          <Text sx={{ fontSize: '$sm', color: '$destructive' }}>{errorMessage}</Text>
        )}

        <Pressable
          onPress={handleSubmit}
          disabled={status === 'loading'}
          sx={{
            bg: '$primary',
            borderRadius: '$md',
            px: '$4',
            py: '$2',
            alignItems: 'center',
            opacity: status === 'loading' ? 0.5 : 1,
          }}
        >
          <Text sx={{ fontSize: '$sm', fontWeight: '500', color: '$primaryForeground' }}>
            {status === 'loading' ? 'Sending...' : 'Send magic link'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
