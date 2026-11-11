import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword, signToken, verifyToken } from '@/lib/auth';

describe('Admin Authentication Utilities', () => {
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

  it('should return null for invalid token verification', async () => {
    const invalid = await verifyToken('not.a.valid.jwt.token');
    expect(invalid).toBeNull();
  });
});
