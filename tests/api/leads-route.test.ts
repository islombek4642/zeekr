import { describe, it, expect, vi, beforeEach } from 'vitest';
import { resetRateLimitStore } from '@/lib/rate-limit';

const { mockLeadCreate, mockSendTelegram, mockGetSiteSettings } = vi.hoisted(() => ({
  mockLeadCreate: vi.fn(),
  mockSendTelegram: vi.fn(),
  mockGetSiteSettings: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    lead: {
      create: mockLeadCreate,
    },
  },
}));

vi.mock('@/lib/telegram', () => ({
  sendTelegramLeadNotification: mockSendTelegram,
}));

vi.mock('@/lib/settings', () => ({
  getSiteSettings: mockGetSiteSettings,
}));

import { POST } from '@/app/api/leads/route';

describe('POST /api/leads', () => {
  beforeEach(() => {
    resetRateLimitStore();
    vi.clearAllMocks();
    mockGetSiteSettings.mockResolvedValue({
      telegram_bot_token: '',
      telegram_chat_id: '',
    });
    mockLeadCreate.mockResolvedValue({
      id: 'lead-api-1',
      type: 'CAR_RESERVE',
      fullName: 'Sardor Karimov',
      phone: '+998901234567',
      model: { name: 'Zeekr 001' },
      inventoryItem: null,
    });
  });

  it('returns 200 and leadId for valid payload', async () => {
    const req = new Request('http://localhost:3000/api/leads', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': '203.0.113.10',
      },
      body: JSON.stringify({
        fullName: 'Sardor Karimov',
        phone: '+998901234567',
        type: 'CAR_RESERVE',
        preferredDate: '2026-12-05',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ success: true, leadId: 'lead-api-1' });
  });

  it('returns 400 on malformed JSON body', async () => {
    const req = new Request('http://localhost:3000/api/leads', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': '203.0.113.11',
      },
      body: '{invalid-json',
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(mockLeadCreate).not.toHaveBeenCalled();
  });

  it('returns 400 on invalid validation inputs', async () => {
    const req = new Request('http://localhost:3000/api/leads', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': '203.0.113.12',
      },
      body: JSON.stringify({
        fullName: '   ',
        phone: '123',
        preferredDate: '2026-02-31',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(mockLeadCreate).not.toHaveBeenCalled();
  });

  it('returns 400 on Prisma P2003 foreign key constraint error', async () => {
    mockLeadCreate.mockRejectedValueOnce({ code: 'P2003' });

    const req = new Request('http://localhost:3000/api/leads', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': '203.0.113.13',
      },
      body: JSON.stringify({
        fullName: 'Sardor Karimov',
        phone: '+998901234567',
        modelId: 'missing-model-id',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('Tanlangan model');
  });

  it('enforces rate-limiting and returns 429 with Retry-After header', async () => {
    const ip = '203.0.113.99';
    for (let i = 0; i < 5; i++) {
      const req = new Request('http://localhost:3000/api/leads', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-forwarded-for': ip,
        },
        body: JSON.stringify({
          fullName: 'Sardor Karimov',
          phone: '+998901234567',
        }),
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
    }

    const limitedReq = new Request('http://localhost:3000/api/leads', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': ip,
      },
      body: JSON.stringify({
        fullName: 'Sardor Karimov',
        phone: '+998901234567',
      }),
    });
    const limitedRes = await POST(limitedReq);
    expect(limitedRes.status).toBe(429);
    expect(Number(limitedRes.headers.get('retry-after'))).toBeGreaterThanOrEqual(1);
    const body = await limitedRes.json();
    expect(body.error).toContain("Juda ko'p so'rov");
  });
});
