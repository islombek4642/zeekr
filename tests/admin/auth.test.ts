import { describe, it, expect, vi, afterEach } from 'vitest';
import jwt from 'jsonwebtoken';
import {
  hashPassword,
  verifyPassword,
  signToken,
  verifyToken,
  getAdminSession,
} from '@/lib/auth';

describe('Admin Authentication Utilities', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should hash and verify passwords with bcrypt', async () => {
    const password = 'SuperSecretZeekrPassword2026';
    const hash = await hashPassword(password);
    expect(await verifyPassword(password, hash)).toBe(true);
    expect(await verifyPassword('WrongPassword', hash)).toBe(false);
  });

  it('should sign and verify JWT tokens', async () => {
    const payload = { userId: 'user-123', email: 'admin@zeekr.uz', role: 'ADMIN' };
    const token = await signToken(payload);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');

    const decoded = await verifyToken(token);
    expect(decoded).toBeDefined();
    expect(decoded?.userId).toBe('user-123');
    expect(decoded?.email).toBe('admin@zeekr.uz');
  });

  it('should return null for invalid or expired token verification', async () => {
    const invalid = await verifyToken('not.a.valid.jwt.token');
    expect(invalid).toBeNull();

    const expired = jwt.sign(
      { userId: 'user-123', email: 'admin@zeekr.uz', role: 'ADMIN' },
      'zeekr-dev-only-jwt-secret-not-for-production',
      { algorithm: 'HS256', expiresIn: '-10s' }
    );
    expect(await verifyToken(expired)).toBeNull();
  });

  it('should reject non-ADMIN tokens in getAdminSession', async () => {
    const userToken = await signToken({
      userId: 'user-456',
      email: 'viewer@zeekr.uz',
      role: 'USER',
    });
    expect(await verifyToken(userToken)).not.toBeNull();
    expect(await getAdminSession(userToken)).toBeNull();

    const adminToken = await signToken({
      userId: 'admin-1',
      email: 'admin@zeekr.uz',
      role: 'ADMIN',
    });
    const session = await getAdminSession(adminToken);
    expect(session?.userId).toBe('admin-1');
    expect(session?.role).toBe('ADMIN');
  });

  it('should throw in production when JWT_SECRET is missing or whitespace, and succeed when set', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('JWT_SECRET', '');

    await expect(
      signToken({ userId: 'u1', email: 'a@zeekr.uz', role: 'ADMIN' })
    ).rejects.toThrow(/JWT_SECRET/);
    await expect(verifyToken('some.jwt.token')).rejects.toThrow(/JWT_SECRET/);

    vi.stubEnv('JWT_SECRET', '   ');
    await expect(
      signToken({ userId: 'u1', email: 'a@zeekr.uz', role: 'ADMIN' })
    ).rejects.toThrow(/JWT_SECRET/);

    vi.stubEnv('JWT_SECRET', 'prod-super-secure-secret-key-at-least-32-chars');
    const prodToken = await signToken({
      userId: 'u1',
      email: 'a@zeekr.uz',
      role: 'ADMIN',
    });
    const decoded = await verifyToken(prodToken);
    expect(decoded?.userId).toBe('u1');
    expect(decoded?.role).toBe('ADMIN');
  });
});
