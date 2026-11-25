import jwt from 'jsonwebtoken';
import { SignJWT } from 'jose';
import { NextRequest } from 'next/server';
import { mockCookieStore, TEST_JWT_SECRET } from './setup';

export interface JwtTestPayload {
  userId: string;
  email: string;
  role: string;
  [key: string]: unknown;
}

export const DEFAULT_ADMIN_PAYLOAD: JwtTestPayload = {
  userId: 'user-admin-1',
  email: 'admin@zeekr-auto.uz',
  role: 'ADMIN',
};

export function signValidAdminJwt(
  secret: string = process.env.JWT_SECRET || TEST_JWT_SECRET,
  overrides: Partial<JwtTestPayload> = {}
): string {
  return jwt.sign({ ...DEFAULT_ADMIN_PAYLOAD, ...overrides }, secret, { expiresIn: '1h' });
}

export async function signJoseAdminJwt(
  secret: string = process.env.JWT_SECRET || TEST_JWT_SECRET,
  overrides: Partial<JwtTestPayload> = {}
): Promise<string> {
  const encoded = new TextEncoder().encode(secret);
  return new SignJWT({ ...DEFAULT_ADMIN_PAYLOAD, ...overrides })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(encoded);
}

export function signRoleJwt(
  role: string,
  secret: string = process.env.JWT_SECRET || TEST_JWT_SECRET
): string {
  return jwt.sign(
    {
      userId: `user-${role.toLowerCase()}-1`,
      email: `${role.toLowerCase()}@zeekr-auto.uz`,
      role,
    },
    secret,
    { expiresIn: '1h' }
  );
}

export function signExpiredAdminJwt(
  secret: string = process.env.JWT_SECRET || TEST_JWT_SECRET
): string {
  return jwt.sign(DEFAULT_ADMIN_PAYLOAD, secret, { expiresIn: '-10s' });
}

export function signWrongSecretAdminJwt(): string {
  return jwt.sign(DEFAULT_ADMIN_PAYLOAD, 'completely-wrong-secret-key-9999', { expiresIn: '1h' });
}

export function setAuthCookie(token: string): void {
  mockCookieStore.set('admin_token', token);
}

export function clearAuthCookie(): void {
  mockCookieStore.delete('admin_token');
}

export function buildNextRequest(
  pathnameOrUrl: string,
  options: {
    method?: string;
    token?: string;
    cookies?: Record<string, string>;
    headers?: Record<string, string>;
    body?: BodyInit | null;
  } = {}
): NextRequest {
  const url = pathnameOrUrl.startsWith('http')
    ? pathnameOrUrl
    : `http://localhost:3000${pathnameOrUrl.startsWith('/') ? '' : '/'}${pathnameOrUrl}`;

  const headers = new Headers(options.headers || {});
  const cookiePairs: string[] = [];
  if (options.token) {
    cookiePairs.push(`admin_token=${options.token}`);
  }
  if (options.cookies) {
    for (const [k, v] of Object.entries(options.cookies)) {
      cookiePairs.push(`${k}=${v}`);
    }
  }
  if (cookiePairs.length > 0) {
    const existing = headers.get('cookie');
    headers.set('cookie', existing ? `${existing}; ${cookiePairs.join('; ')}` : cookiePairs.join('; '));
  }

  return new NextRequest(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ?? undefined,
  });
}
