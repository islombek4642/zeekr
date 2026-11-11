import { describe, it, expect } from 'vitest';
import { formatLeadTelegramMessage } from '@/lib/telegram';

describe('Telegram Notification Service', () => {
  it('should format test-drive lead message properly with Uzbek labels', () => {
    const message = formatLeadTelegramMessage({
      type: 'TEST_DRIVE',
      fullName: 'Alisher Valiyev',
      phone: '+998901234567',
      modelName: 'Zeekr 001',
      preferredDate: '2026-11-15',
      preferredTime: '14:00 - 16:00',
    });
    expect(message).toContain('Yangi Test-drayv arizasi');
    expect(message).toContain('Alisher Valiyev');
    expect(message).toContain('+998901234567');
    expect(message).toContain('Zeekr 001');
  });

  it('should format vehicle reservation lead message', () => {
    const message = formatLeadTelegramMessage({
      type: 'CAR_RESERVE',
      fullName: 'Jamshid Karimov',
      phone: '+998912345678',
      modelName: 'Zeekr 007 AWD Performance',
      vinOrCode: 'ZEEKR007-UZ-001',
    });
    expect(message).toContain('Avtomobilni bron qilish');
    expect(message).toContain('Jamshid Karimov');
    expect(message).toContain('ZEEKR007-UZ-001');
  });
});
