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
