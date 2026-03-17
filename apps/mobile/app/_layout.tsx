import { Stack } from 'expo-router';
import { ApolloProvider } from '@apollo/client';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActivityIndicator, View } from 'react-native';
import { DripsyProvider } from '@oncovax/app';
import { apolloClient } from '../lib/apollo';
import { useProtectedRoute } from '../lib/auth';

function RootNavigator() {
  const { isReady } = useProtectedRoute();

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ title: 'Sign In', presentation: 'modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ApolloProvider client={apolloClient}>
      <DripsyProvider>
        <SafeAreaProvider>
          <RootNavigator />
        </SafeAreaProvider>
      </DripsyProvider>
    </ApolloProvider>
  );
}
