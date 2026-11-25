import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { leadFormSchema } from '@/lib/validations/lead';
import { resetRateLimitStore } from '@/lib/rate-limit';

const { mockLeadCreate, mockSendTelegram, mockGetSiteSettings, mockRevalidatePath } = vi.hoisted(() => ({
  mockLeadCreate: vi.fn(),
  mockSendTelegram: vi.fn(),
  mockGetSiteSettings: vi.fn(),
  mockRevalidatePath: vi.fn(),
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

vi.mock('next/cache', () => ({
  revalidatePath: mockRevalidatePath,
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockRejectedValue(new Error('No request headers in unit test')),
}));

import { createTestDriveLeadAction } from '@/app/actions/leadActions';

describe('Lead Form Zod Validation', () => {
  it('should validate valid Uzbekistan phone number and reject invalid ones', () => {
    const valid = leadFormSchema.safeParse({
      fullName: 'Sardor Rahimiy',
      phone: '+998901234567',
      modelId: 'model-123',
    });
    expect(valid.success).toBe(true);

    const validFormatted = leadFormSchema.safeParse({
      fullName: 'Islombek Davronov',
      phone: '901234567',
      modelId: 'model-456',
    });
    expect(validFormatted.success).toBe(true);

    const invalid = leadFormSchema.safeParse({
      fullName: 'S',
      phone: '123',
    });
    expect(invalid.success).toBe(false);
  });

  it('should reject empty or whitespace-only fullName, oversized fields, and invalid/rollover preferredDate', () => {
    expect(
      leadFormSchema.safeParse({ fullName: '', phone: '' }).success
    ).toBe(false);

    expect(
      leadFormSchema.safeParse({ fullName: '   ', phone: '+998901234567' }).success
    ).toBe(false);

    expect(
      leadFormSchema.safeParse({ fullName: 'A'.repeat(101), phone: '+998901234567' }).success
    ).toBe(false);

    expect(
      leadFormSchema.safeParse({
        fullName: 'Ali Valiyev',
        phone: '+998901234567',
        notes: 'N'.repeat(1001),
      }).success
    ).toBe(false);

    expect(
      leadFormSchema.safeParse({
        fullName: 'Ali Valiyev',
        phone: '+998901234567',
        preferredDate: 'not-a-date',
      }).success
    ).toBe(false);

    expect(
      leadFormSchema.safeParse({
        fullName: 'Ali Valiyev',
        phone: '+998901234567',
        preferredDate: '2026-02-31',
      }).success
    ).toBe(false);

    expect(
      leadFormSchema.safeParse({
        fullName: '  Ali Valiyev  ',
        phone: '+998901234567',
        preferredDate: '2026-12-01',
      }).success
    ).toBe(true);
  });
});

describe('createTestDriveLeadAction', () => {
  beforeEach(() => {
    resetRateLimitStore();
    vi.clearAllMocks();
    mockGetSiteSettings.mockResolvedValue({
      telegram_bot_token: '',
      telegram_chat_id: '',
    });
    mockLeadCreate.mockResolvedValue({
      id: 'lead-1',
      fullName: 'Ali Valiyev',
      phone: '+998901234567',
      model: { name: 'Zeekr 001' },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates a test-drive lead for valid input and calls revalidatePath', async () => {
    const res = await createTestDriveLeadAction({
      fullName: 'Ali Valiyev',
      phone: '901234567',
      preferredDate: '2026-12-01',
    });

    expect(res).toEqual({ success: true, leadId: 'lead-1' });
    expect(mockLeadCreate).toHaveBeenCalledTimes(1);
    expect(mockRevalidatePath).toHaveBeenCalledWith('/admin/leads');
  });

  it('returns structured error for invalid input without calling Prisma', async () => {
    const res = await createTestDriveLeadAction({
      fullName: '  ',
      phone: '123',
    });

    expect(res.success).toBe(false);
    expect(res.error).toBeDefined();
    expect(mockLeadCreate).not.toHaveBeenCalled();
  });

  it('maps Prisma P2003 foreign key errors cleanly without leaking raw Prisma details', async () => {
    mockLeadCreate.mockRejectedValueOnce({
      code: 'P2003',
      message: 'Foreign key constraint failed on internal_table_xyz',
    });

    const res = await createTestDriveLeadAction({
      fullName: 'Ali Valiyev',
      phone: '+998901234567',
      modelId: 'non-existent-id',
    });

    expect(res.success).toBe(false);
    expect(res.error).toBe('Tanlangan model topilmadi');
    expect(res.error).not.toContain('internal_table_xyz');
  });

  it('enforces rate-limiting on repeated rapid calls', async () => {
    for (let i = 0; i < 5; i++) {
      const ok = await createTestDriveLeadAction({
        fullName: 'Ali Valiyev',
        phone: '+998901234567',
      });
      expect(ok.success).toBe(true);
    }

    const limited = await createTestDriveLeadAction({
      fullName: 'Ali Valiyev',
      phone: '+998901234567',
    });
    expect(limited.success).toBe(false);
    expect(limited.error).toContain("Juda ko'p so'rov");
  });
});
