import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { redis } from '@/lib/redis';
import { verifyMagicLinkToken } from '@iish/shared';
import { randomBytes } from 'crypto';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) return NextResponse.redirect(new URL('/auth?error=missing_token', req.url));

  const payload = await verifyMagicLinkToken(token);
  if (!payload) return NextResponse.redirect(new URL('/auth?error=invalid_token', req.url));

  const user = await prisma.user.upsert({
    where: { email: payload.email },
    update: { lastLoginAt: new Date() },
    create: { email: payload.email },
  });

  const sessionId = randomBytes(32).toString('hex');
  const maxAge = 7 * 24 * 60 * 60; // 7 days in seconds
  const expiresAt = new Date(Date.now() + maxAge * 1000);

  await redis.setex(
    `session:${sessionId}`,
    maxAge,
    JSON.stringify({ userId: user.id, email: user.email, createdAt: new Date().toISOString(), expiresAt: expiresAt.toISOString() })
  );

  // Support redirect param (validated as relative path)
  const redirectParam = req.nextUrl.searchParams.get('redirect');
  let redirectPath = '/dashboard';
  if (redirectParam && redirectParam.startsWith('/') && !redirectParam.startsWith('//')) {
    redirectPath = redirectParam;
  }

  const response = NextResponse.redirect(new URL(redirectPath, req.url));
  response.cookies.set('session_id', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  });
  return response;
}
