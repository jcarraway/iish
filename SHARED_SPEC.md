# Shared Architecture — Venture Studio Consumer Apps
# Read this file first. All four product specs reference these conventions.

## Overview

Four separate standalone repos. Each is a pnpm monorepo:

```
/
  apps/
    mobile/        → Expo SDK 54 (primary consumer surface)
    web/           → Next.js 15 App Router (marketing + dashboard + API)
  packages/
    db/            → Prisma 7 + PostgreSQL schema
    shared/        → Types, utils, constants
  CLAUDE.md        → Product-specific spec (replaces this file in each repo)
```

Each repo is completely independent. No shared code across the four products.

---

## Exact Package Versions (DO NOT DEVIATE)

### Build Tools
| Package | Version |
|---------|---------|
| pnpm | 9.14.2 |
| turbo | 2.6.1 |
| typescript | 5.7.2 |
| node | >=20.0.0 |

### Backend / Web
| Package | Version |
|---------|---------|
| next | 15.0.0 |
| react | 19.0.0 |
| react-dom | 19.0.0 |
| prisma | 7.0.0 |
| @prisma/client | 7.0.1 |
| ioredis | 5.8.2 |
| stripe | 20.3.1 |
| resend | 4.0.0 |
| jose | 5.9.6 |
| zod | 3.23.8 |
| @anthropic-ai/sdk | 0.39.0 |
| cloudinary | 2.5.1 |

### Mobile
| Package | Version |
|---------|---------|
| expo | ~54.0.0 |
| expo-router | ~4.0.0 |
| react-native | 0.76.9 |
| @stripe/stripe-react-native | 0.42.0 |
| expo-camera | ~16.0.0 |
| expo-image-picker | ~16.0.0 |
| expo-secure-store | ~14.0.0 |
| expo-file-system | ~18.0.0 |

---

## Prisma 7 — CRITICAL RULES

```prisma
generator client {
  provider = "prisma-client"   // NOT "prisma-client-js" — breaking change in v7
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

```bash
# Package.json scripts in packages/db:
pnpm db:generate    # prisma generate
pnpm db:migrate     # prisma migrate dev
pnpm db:push        # prisma db push (dev only, never prod)
pnpm db:studio      # prisma studio
```

---

## Authentication — Magic Link

### Flow
1. User submits email → `POST /api/auth/magic-link`
2. Server: generate signed JWT (HS256, 15-min TTL) `{ email, type: "magic_link" }`
3. Server: send email via Resend with link `https://{domain}/api/auth/verify?token={jwt}`
4. User clicks link → `GET /api/auth/verify?token=xxx`
5. Server: verify JWT → upsert User → create Redis session → set httpOnly cookie
6. Redirect to `/dashboard`

### Session in Redis
```
Key:   session:{sessionId}
Value: JSON { userId, email, createdAt, expiresAt }
TTL:   7 days, sliding (refresh when <25% TTL remains)
```

### Implementation

```typescript
// packages/shared/src/auth.ts
import { SignJWT, jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.MAGIC_LINK_SECRET!);

export async function createMagicLinkToken(email: string): Promise<string> {
  return new SignJWT({ email, type: 'magic_link' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(SECRET);
}

export async function verifyMagicLinkToken(token: string): Promise<{ email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    if (payload.type !== 'magic_link') return null;
    return { email: payload.email as string };
  } catch {
    return null;
  }
}
```

```typescript
// apps/web/app/api/auth/magic-link/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createMagicLinkToken } from '@pkg/shared';
import { Resend } from 'resend';
import { z } from 'zod';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: NextRequest) {
  const { email } = z.object({ email: z.string().email() }).parse(await req.json());
  const normalizedEmail = email.toLowerCase().trim();
  const token = await createMagicLinkToken(normalizedEmail);
  const link = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify?token=${token}`;

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: normalizedEmail,
    subject: 'Your sign-in link',
    html: `<p><a href="${link}">Click here to sign in</a></p><p>Expires in 15 minutes.</p>`,
  });

  return NextResponse.json({ success: true });
}
```

```typescript
// apps/web/app/api/auth/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { redis } from '@/lib/redis';
import { verifyMagicLinkToken } from '@pkg/shared';
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

  const response = NextResponse.redirect(new URL('/dashboard', req.url));
  response.cookies.set('session_id', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  });
  return response;
}
```

```typescript
// apps/web/lib/session.ts
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
```

```typescript
// apps/web/lib/redis.ts
import Redis from 'ioredis';
export const redis = new Redis(process.env.REDIS_URL!);
```

```typescript
// apps/web/lib/db.ts
import { PrismaClient } from '@pkg/db/generated/prisma';
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

---

## Stripe — Subscription Pattern

All apps use Stripe Billing (NOT Connect). Direct charges only.

```typescript
// apps/web/lib/stripe.ts
import Stripe from 'stripe';
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
```

```typescript
// apps/web/app/api/stripe/create-checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/session';
import { prisma } from '@/lib/db';
import { stripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  const session = await requireSession();
  const { priceId } = await req.json();

  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.userId } });

  // Create Stripe customer if doesn't exist
  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({ email: user.email });
    customerId = customer.id;
    await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } });
  }

  const checkout = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/upgrade`,
  });

  return NextResponse.json({ url: checkout.url });
}
```

```typescript
// apps/web/app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription;
      await prisma.user.updateMany({
        where: { stripeCustomerId: sub.customer as string },
        data: {
          subscriptionStatus: sub.status,
          subscriptionCurrentPeriodEnd: new Date(sub.current_period_end * 1000),
          stripePriceId: sub.items.data[0].price.id,
        },
      });
      break;
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      await prisma.user.updateMany({
        where: { stripeCustomerId: sub.customer as string },
        data: { subscriptionStatus: 'canceled', subscriptionCurrentPeriodEnd: null },
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
```

---

## Claude AI — Vision Analysis

```typescript
// apps/web/lib/ai.ts
import Anthropic from '@anthropic-ai/sdk';

export const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export async function analyzeImageFromUrl(imageUrl: string, prompt: string): Promise<string> {
  const res = await fetch(imageUrl);
  const buffer = await res.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  const mediaType = (res.headers.get('content-type') ?? 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/webp';

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
        { type: 'text', text: prompt },
      ],
    }],
  });

  return (message.content[0] as { type: 'text'; text: string }).text;
}

// Use this when you need structured JSON output
export async function analyzeImageStructured<T>(imageUrl: string, systemPrompt: string, jsonSchema: string): Promise<T> {
  const prompt = `${systemPrompt}\n\nRespond ONLY with a valid JSON object matching this schema. No markdown, no preamble:\n${jsonSchema}`;
  const raw = await analyzeImageFromUrl(imageUrl, prompt);
  const clean = raw.replace(/```json\n?|```\n?/g, '').trim();
  return JSON.parse(clean) as T;
}
```

---

## Cloudinary — Image Upload

```typescript
// apps/web/lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export { cloudinary };

export async function uploadBase64Image(base64: string, folder: string): Promise<string> {
  const result = await cloudinary.uploader.upload(`data:image/jpeg;base64,${base64}`, {
    folder,
    resource_type: 'image',
  });
  return result.secure_url;
}

// For client-side direct upload — return signed params
export async function getUploadSignature(folder: string) {
  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET!
  );
  return {
    timestamp,
    signature,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    folder,
  };
}
```

---

## Retention Metrics — UserEvent Table

**Every app MUST implement this.** Kill decisions at Day 75 depend on this data.

```prisma
// Add to every product's Prisma schema
model UserEvent {
  id        String   @id @default(uuid()) @db.Uuid
  userId    String   @map("user_id") @db.Uuid
  event     String   @db.VarChar(100)
  metadata  Json     @default("{}")
  createdAt DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt])
  @@index([event, createdAt])
  @@map("user_events")
}
```

**Standard event names — use these exact strings:**
```
app_opened             — every session open
analysis_completed     — core AI feature used
paywall_shown          — paywall was triggered
subscription_started   — successful conversion
subscription_canceled  — churn
day1_retained          — computed by daily cron
day7_retained          — computed by daily cron
day30_retained         — computed by daily cron
```

```typescript
// apps/web/lib/events.ts
import { prisma } from './db';

export async function trackEvent(userId: string, event: string, metadata: Record<string, unknown> = {}) {
  await prisma.userEvent.create({ data: { userId, event, metadata } }).catch(() => {
    // Never throw — event tracking must never break core flows
    console.error(`Failed to track event: ${event}`);
  });
}
```

---

## Infrastructure

| Service | Provider |
|---------|----------|
| Web hosting | Vercel |
| PostgreSQL | Railway |
| Redis | Railway |
| Email | Resend |
| Payments | Stripe |
| Media | Cloudinary |
| AI | Anthropic (Claude API) |

### Environment Variables (required in every app)
```
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
MAGIC_LINK_SECRET=<64-char hex string>
NEXT_PUBLIC_APP_URL=https://...
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@...
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_MONTHLY_PRICE_ID=price_...
STRIPE_ANNUAL_PRICE_ID=price_...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
ANTHROPIC_API_KEY=sk-ant-...
```

---

## What NOT To Do
- Don't use `prisma-client-js` generator — use `prisma-client` (Prisma 7 breaking change)
- Don't use tRPC — use Next.js API routes directly
- Don't use NextAuth — use the magic link flow above
- Don't use Supabase — use Prisma + Railway PostgreSQL
- Don't use Stripe Connect — these apps charge direct, no platform fees
- Don't skip `UserEvent` tracking — retention is the only thing that matters
- Don't expose `ANTHROPIC_API_KEY` or `STRIPE_SECRET_KEY` client-side
- Don't use `synchronize: true` in any ORM config
- Don't throw errors in `trackEvent` — wrap in try/catch always
