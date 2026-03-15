import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('session_id')?.value;

  if (sessionId) {
    await redis.del(`session:${sessionId}`);
  }

  const response = NextResponse.redirect(new URL('/', req.url));
  response.cookies.set('session_id', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(0),
    path: '/',
  });
  return response;
}
