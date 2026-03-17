import { useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useSegments, useRouter } from 'expo-router';

export function useProtectedRoute() {
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    SecureStore.getItemAsync('auth_token').then(token => {
      setIsAuthenticated(!!token);
      setIsReady(true);
    });
  }, []);

  useEffect(() => {
    if (!isReady) return;
    const inAuth = segments[0] === 'auth';
    if (!isAuthenticated && !inAuth) router.replace('/auth');
    else if (isAuthenticated && inAuth) router.replace('/');
  }, [isReady, isAuthenticated, segments]);

  return { isReady, isAuthenticated };
}
