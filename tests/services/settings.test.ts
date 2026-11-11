import { describe, it, expect } from 'vitest';
import { DEFAULT_SETTINGS, parseSiteSettings } from '@/lib/settings';

describe('Site Settings Service', () => {
  it('should have complete fallback defaults for all dynamic fields', () => {
    expect(DEFAULT_SETTINGS.showroom_address).toBeDefined();
    expect(DEFAULT_SETTINGS.primary_phone).toBeDefined();
    expect(DEFAULT_SETTINGS.usd_to_uzs_rate).toBe(12850);
    expect(DEFAULT_SETTINGS.default_loan_apr).toBe(22);
  });

  it('should parse raw database settings into typed SiteSettings object', () => {
    const raw = [
      { key: 'showroom_address', value: 'Sergeli 45' },
      { key: 'usd_to_uzs_rate', value: '13000' },
    ];
    const parsed = parseSiteSettings(raw);
    expect(parsed.showroom_address).toBe('Sergeli 45');
    expect(parsed.usd_to_uzs_rate).toBe(13000);
    expect(parsed.primary_phone).toBe(DEFAULT_SETTINGS.primary_phone);
  });
});

