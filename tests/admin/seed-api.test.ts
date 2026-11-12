import { describe, it, expect, vi } from 'vitest';
import { POST } from '@/app/api/admin/seed/route';
import { signToken } from '@/lib/auth';

describe('Admin Seed API Endpoint', () => {
  it('should return 401 Unauthorized if no admin token is present', async () => {
    const req = new Request('http://localhost:3000/api/admin/seed', {
      method: 'POST',
      headers: {},
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.success).toBe(false);
  });

  it('should allow seeding if valid admin authorization header or cookie is present', async () => {
    const token = await signToken({
      userId: 'test-admin',
      email: 'admin@zeekr-auto.uz',
      role: 'ADMIN',
    });

    const req = new Request('http://localhost:3000/api/admin/seed', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const res = await POST(req);
    // Since in testing environment Prisma may not be connected to a live server,
    // the route either returns 200 (if live db) or 500 with descriptive error,
    // but crucially NOT 401.
    expect(res.status).not.toBe(401);
  });
});

