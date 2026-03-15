import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ title: 'Sign In', presentation: 'modal' }} />
      <Stack.Screen name="start/upload" options={{ title: 'Upload Documents' }} />
      <Stack.Screen name="start/manual" options={{ title: 'Enter Details' }} />
      <Stack.Screen name="start/confirm" options={{ title: 'Confirm Details' }} />
      <Stack.Screen name="matches/[trialId]" options={{ title: 'Trial Details' }} />
    </Stack>
  );
}
