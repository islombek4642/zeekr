import { describe, it, expect, vi, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { SignJWT } from 'jose';
import { middleware } from '@/middleware';
import { signToken } from '@/lib/auth';
import { getJwtSecret } from '@/lib/jwt-secret';

describe('Admin Middleware JWT Verification', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('allows /admin/login without a cookie', async () => {
    const req = new NextRequest('http://localhost:3000/admin/login');
    const res = await middleware(req);

    expect(res.status).toBe(200);
    expect(res.headers.get('location')).toBeNull();
  });

  it('redirects /admin and /admin/cars to /admin/login when cookie is missing', async () => {
    const reqRoot = new NextRequest('http://localhost:3000/admin');
    const resRoot = await middleware(reqRoot);
    expect(resRoot.status).toBe(307);
    expect(resRoot.headers.get('location')).toBe('http://localhost:3000/admin/login?from=%2Fadmin');

    const reqCars = new NextRequest('http://localhost:3000/admin/cars');
    const resCars = await middleware(reqCars);
    expect(resCars.status).toBe(307);
    expect(resCars.headers.get('location')).toBe('http://localhost:3000/admin/login?from=%2Fadmin%2Fcars');
  });

  it('redirects and clears admin_token cookie on forged token', async () => {
    const req = new NextRequest('http://localhost:3000/admin', {
      headers: { cookie: 'admin_token=forged.jwt.token' },
    });
    const res = await middleware(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost:3000/admin/login?from=%2Fadmin');
    expect(res.headers.get('set-cookie')).toContain('admin_token=');
  });

  it('redirects and clears admin_token cookie on expired token', async () => {
    const secret = new TextEncoder().encode(getJwtSecret());
    const expiredToken = await new SignJWT({
      userId: 'admin-1',
      email: 'admin@zeekr.uz',
      role: 'ADMIN',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime(Math.floor(Date.now() / 1000) - 60)
      .sign(secret);

    const req = new NextRequest('http://localhost:3000/admin', {
      headers: { cookie: `admin_token=${expiredToken}` },
    });
    const res = await middleware(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost:3000/admin/login?from=%2Fadmin');
    expect(res.headers.get('set-cookie')).toContain('admin_token=');
  });

  it('redirects and clears admin_token cookie when role is not ADMIN', async () => {
    const nonAdminToken = await signToken({
      userId: 'user-1',
      email: 'viewer@zeekr.uz',
      role: 'USER',
    });

    const req = new NextRequest('http://localhost:3000/admin', {
      headers: { cookie: `admin_token=${nonAdminToken}` },
    });
    const res = await middleware(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost:3000/admin/login?from=%2Fadmin');
    expect(res.headers.get('set-cookie')).toContain('admin_token=');
  });

  it('allows valid ADMIN token signed by auth.signToken through to /admin', async () => {
    const validToken = await signToken({
      userId: 'admin-1',
      email: 'admin@zeekr.uz',
      role: 'ADMIN',
    });

    const req = new NextRequest('http://localhost:3000/admin', {
      headers: { cookie: `admin_token=${validToken}` },
    });
    const res = await middleware(req);

    expect(res.status).toBe(200);
    expect(res.headers.get('location')).toBeNull();
    expect(res.headers.get('x-middleware-next')).toBe('1');
  });
});
