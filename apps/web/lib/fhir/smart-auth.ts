import { EncryptJWT, jwtDecrypt } from 'jose';
import type { SmartEndpoints, FhirTokenPair } from '@oncovax/shared';
import type { FhirCapabilityStatement } from './types';

const SMART_OAUTH_EXT_URL = 'http://fhir-registry.smarthealthit.org/StructureDefinition/oauth-uris';
const ENCRYPTION_SECRET = new TextEncoder().encode(
  (process.env.MAGIC_LINK_SECRET ?? '').padEnd(32, '0').slice(0, 32),
);

// Discover authorize and token endpoints from a FHIR server's /metadata
export async function discoverEndpoints(fhirBaseUrl: string): Promise<SmartEndpoints> {
  const base = fhirBaseUrl.replace(/\/$/, '');
  const res = await fetch(`${base}/metadata`, {
    headers: { Accept: 'application/fhir+json' },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch FHIR metadata: ${res.status}`);
  }

  const capability = (await res.json()) as FhirCapabilityStatement;

  const security = capability.rest?.[0]?.security;
  const oauthExt = security?.extension?.find(e => e.url === SMART_OAUTH_EXT_URL);

  if (!oauthExt?.extension) {
    throw new Error('FHIR server does not support SMART on FHIR');
  }

  const authorizeUrl = oauthExt.extension.find(e => e.url === 'authorize')?.valueUri;
  const tokenUrl = oauthExt.extension.find(e => e.url === 'token')?.valueUri;

  if (!authorizeUrl || !tokenUrl) {
    throw new Error('Missing authorize or token endpoint in FHIR metadata');
  }

  return { authorizeUrl, tokenUrl, fhirBaseUrl: base };
}

// Build the SMART on FHIR authorization URL
export function buildAuthorizeUrl(
  endpoints: SmartEndpoints,
  clientId: string,
  redirectUri: string,
  state: string,
  scopes: readonly string[],
): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: scopes.join(' '),
    state,
    aud: endpoints.fhirBaseUrl,
  });

  return `${endpoints.authorizeUrl}?${params.toString()}`;
}

// Exchange authorization code for tokens
export async function exchangeCodeForTokens(
  endpoints: SmartEndpoints,
  code: string,
  clientId: string,
  redirectUri: string,
): Promise<FhirTokenPair> {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: clientId,
    redirect_uri: redirectUri,
  });

  const res = await fetch(endpoints.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => 'unknown');
    throw new Error(`Token exchange failed: ${res.status} — ${errText}`);
  }

  const data = await res.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
    scope: data.scope,
    tokenType: data.token_type ?? 'Bearer',
  };
}

// Refresh an access token
export async function refreshAccessToken(
  tokenUrl: string,
  refreshToken: string,
  clientId: string,
): Promise<FhirTokenPair> {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: clientId,
  });

  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) {
    throw new Error(`Token refresh failed: ${res.status}`);
  }

  const data = await res.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? refreshToken,
    expiresIn: data.expires_in,
    scope: data.scope,
    tokenType: data.token_type ?? 'Bearer',
  };
}

// Encrypt a token for database storage
export async function encryptToken(token: string): Promise<string> {
  return new EncryptJWT({ token })
    .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
    .setIssuedAt()
    .encrypt(ENCRYPTION_SECRET);
}

// Decrypt a token from database storage
export async function decryptToken(encrypted: string): Promise<string> {
  const { payload } = await jwtDecrypt(encrypted, ENCRYPTION_SECRET);
  return payload.token as string;
}
