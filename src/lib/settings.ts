import { prisma } from './prisma';
import { SiteSettings } from '@/types/settings';
import { getDefaultSettings } from './data-provider';

export function getFallbackSettings(): SiteSettings {
  const defaults = getDefaultSettings();
  return {
    ...defaults,
    telegram_bot_token: process.env.TELEGRAM_BOT_TOKEN || defaults.telegram_bot_token || '',
    telegram_chat_id: process.env.TELEGRAM_CHAT_ID || defaults.telegram_chat_id || '',
  };
}

export const DEFAULT_SETTINGS: SiteSettings = getFallbackSettings();

export function parseSiteSettings(rawSettings: { key: string; value: string }[]): SiteSettings {
  const result: any = { ...DEFAULT_SETTINGS };

  for (const item of rawSettings) {
    if (item.key === 'usd_to_uzs_rate' || item.key === 'default_loan_apr') {
      const num = Number(item.value);
      if (!isNaN(num) && num > 0) {
        result[item.key] = num;
      }
    } else {
      result[item.key] = item.value;
    }
  }

  return result as SiteSettings;
}

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const records = await prisma.setting.findMany();
    return parseSiteSettings(records);
  } catch (err) {
    console.error('Error fetching settings from database, returning defaults:', err);
    return DEFAULT_SETTINGS;
  }
}

export async function updateSiteSettings(updates: Partial<SiteSettings>): Promise<void> {
  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined) {
      await prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
    }
  }
}

export function getContactDisplayInfo(settings: Partial<SiteSettings> = {}) {
  return {
    address: settings.showroom_address || '',
    phone: settings.primary_phone || '',
    secondaryPhone: settings.secondary_phone || '',
    email: settings.contact_email || '',
    hours: settings.working_hours || '',
  };
}
