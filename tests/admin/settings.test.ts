import { describe, it, expect } from 'vitest';
import { settingsFormSchema } from '@/lib/validations/settings';

describe('Admin Settings Form Validation', () => {
  it('should validate exchange rate and loan interest rate ranges', () => {
    const valid = settingsFormSchema.safeParse({
      showroom_address: 'Toshkent sh.',
      primary_phone: '+998712000000',
      usd_to_uzs_rate: 12850,
      default_loan_apr: 22,
    });
    expect(valid.success).toBe(true);

    const invalid = settingsFormSchema.safeParse({
      usd_to_uzs_rate: -5,
      default_loan_apr: 150,
    });
    expect(invalid.success).toBe(false);
  });

  it('should allow optional social and telegram bot fields', () => {
    const result = settingsFormSchema.safeParse({
      showroom_address: 'Toshkent',
      primary_phone: '+998901234567',
      usd_to_uzs_rate: 12850,
      default_loan_apr: 20,
      telegram_channel: 'https://t.me/zeekr',
      instagram_url: 'https://instagram.com/zeekr',
      telegram_bot_token: '123456:ABC',
      telegram_chat_id: '-10012345',
    });
    expect(result.success).toBe(true);
  });
});
