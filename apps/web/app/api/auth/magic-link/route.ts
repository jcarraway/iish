import { NextRequest, NextResponse } from 'next/server';
import { createMagicLinkToken } from '@iish/shared';
import { Resend } from 'resend';
import { z } from 'zod';

const resend = new Resend(process.env.RESEND_API_KEY!);

const requestSchema = z.object({
  email: z.string().email(),
  redirect: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { email, redirect } = requestSchema.parse(await req.json());
    const normalizedEmail = email.toLowerCase().trim();
    const token = await createMagicLinkToken(normalizedEmail);

    let link = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify?token=${token}`;
    if (redirect) {
      link += `&redirect=${encodeURIComponent(redirect)}`;
    }

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: normalizedEmail,
      subject: 'Your sign-in link',
      html: `<p><a href="${link}">Click here to sign in</a></p><p>Expires in 15 minutes.</p>`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }
    console.error('Magic link error:', err);
    return NextResponse.json({ error: 'Failed to send magic link' }, { status: 500 });
  }
}
