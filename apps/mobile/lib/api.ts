import * as SecureStore from 'expo-secure-store';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

async function getSessionToken(): Promise<string | null> {
  return SecureStore.getItemAsync('session_token');
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getSessionToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
}

export async function setSessionToken(token: string): Promise<void> {
  await SecureStore.setItemAsync('session_token', token);
}

export async function clearSessionToken(): Promise<void> {
  await SecureStore.deleteItemAsync('session_token');
}
