import { describe, it, expect, vi, afterEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import fs from 'fs';
import path from 'path';
import { formatPhoneNumber } from '@/lib/utils';
import { getLeadTypeLabel, LEAD_TYPE_LABELS } from '@/lib/lead-workflow';
import * as dataProvider from '@/lib/data-provider';
import * as settingsLib from '@/lib/settings';

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) =>
    React.createElement('a', { href, ...props }, children),
}));

import { Footer } from '@/components/layout/Footer';

describe('Layout Formatting Utilities', () => {
  it('should format raw phone numbers into readable Uzbek display format', () => {
    expect(formatPhoneNumber('+998901234567')).toBe('+998 (90) 123-45-67');
    expect(formatPhoneNumber('998712000000')).toBe('+998 (71) 200-00-00');
  });

  it('should handle already formatted or irregular numbers gracefully', () => {
    expect(formatPhoneNumber('12345')).toBe('12345');
  });
});

describe('Feature 8: Lead Type Labels & Dynamic Footer', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('maps all lead types accurately including SERVICE -> Servis', () => {
    expect(LEAD_TYPE_LABELS.SERVICE).toBe('Servis');
    expect(getLeadTypeLabel('TEST_DRIVE')).toBe('Test-drayv');
    expect(getLeadTypeLabel('CAR_RESERVE')).toBe('Bron qilish');
    expect(getLeadTypeLabel('SERVICE')).toBe('Servis');
    expect(getLeadTypeLabel('CONSULTATION')).toBe('Konsultatsiya');
    expect(getLeadTypeLabel('UNKNOWN')).toBe('Konsultatsiya');

    const adminPageSrc = fs.readFileSync(
      path.join(process.cwd(), 'src/app/admin/page.tsx'),
      'utf-8'
    );
    expect(adminPageSrc).toContain('getLeadTypeLabel(lead.type)');

    const leadTableSrc = fs.readFileSync(
      path.join(process.cwd(), 'src/components/admin/LeadTable.tsx'),
      'utf-8'
    );
    expect(leadTableSrc).toContain('getLeadTypeLabel(lead.type)');
  });

  it('renders models dynamically from getCarModels() in Footer', async () => {
    vi.spyOn(settingsLib, 'getSiteSettings').mockResolvedValue({
      showroom_address: 'Toshkent, Amir Temur 100',
      primary_phone: '+998712000000',
      secondary_phone: '',
      contact_email: 'info@zeekr.uz',
      working_hours: '09:00 - 20:00',
      map_iframe_url: '',
      usd_to_uzs_rate: 12700,
      default_loan_apr: 22,
      telegram_channel: '',
      instagram_url: '',
      youtube_url: '',
      telegram_bot_token: '',
      telegram_chat_id: '',
    });

    vi.spyOn(dataProvider, 'getCarModels').mockResolvedValue([
      {
        id: 'custom-1',
        slug: 'zeekr-7x',
        name: 'Zeekr 7X',
        tagline: 'Electric SUV',
      } as never,
      {
        id: 'custom-2',
        slug: 'zeekr-mix',
        name: 'Zeekr MIX',
        tagline: 'Family MPV',
      } as never,
    ]);

    const element = await Footer();
    const html = renderToStaticMarkup(element);

    expect(html).toContain('/models/zeekr-7x');
    expect(html).toContain('Zeekr 7X — Electric SUV');
    expect(html).toContain('/models/zeekr-mix');
    expect(html).toContain('Zeekr MIX — Family MPV');
    expect(html).not.toContain('/models/zeekr-001');
  });
});
