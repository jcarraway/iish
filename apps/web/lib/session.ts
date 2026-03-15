import { cookies } from 'next/headers';
import { redis } from './redis';

export interface SessionData {
  userId: string;
  email: string;
  createdAt: string;
  expiresAt: string;
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('session_id')?.value;
  if (!sessionId) return null;

  const data = await redis.get(`session:${sessionId}`);
  if (!data) return null;

  const session: SessionData = JSON.parse(data);
  if (new Date(session.expiresAt) < new Date()) {
    await redis.del(`session:${sessionId}`);
    return null;
  }

  // Sliding expiration
  const remaining = await redis.ttl(`session:${sessionId}`);
  const maxAge = 7 * 24 * 60 * 60;
  if (remaining > 0 && remaining < maxAge * 0.25) {
    await redis.expire(`session:${sessionId}`, maxAge);
  }

  return session;
}

export async function requireSession(): Promise<SessionData> {
  const session = await getSession();
  if (!session) throw new Error('UNAUTHORIZED');
  return session;
}
