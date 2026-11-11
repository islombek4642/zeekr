import { prisma } from './prisma';
import { SiteSettings } from '@/types/settings';

export const DEFAULT_SETTINGS: SiteSettings = {
  showroom_address: "Toshkent shahri, Sergeli tumani, Yangi Sergeli ko'chasi, 45-uy",
  primary_phone: '+998712000000',
  secondary_phone: '+998901234567',
  contact_email: 'info@zeekr-auto.uz',
  working_hours: 'Har kuni 09:00 dan 20:00 gacha',
  map_iframe_url: 'https://yandex.uz/map-widget/v1/?ll=69.2163%2C41.2255&z=15',
  telegram_channel: 'https://t.me/zeekr_uzbekistan',
  instagram_url: 'https://instagram.com/zeekr.uzbekistan',
  youtube_url: 'https://youtube.com/@zeekruzbekistan',
  usd_to_uzs_rate: 12850,
  default_loan_apr: 22,
  telegram_bot_token: process.env.TELEGRAM_BOT_TOKEN || '',
  telegram_chat_id: process.env.TELEGRAM_CHAT_ID || '',
};

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

export function getContactDisplayInfo(settings: SiteSettings) {
  return {
    address: settings.showroom_address,
    phone: settings.primary_phone,
    secondaryPhone: settings.secondary_phone,
    email: settings.contact_email,
    hours: settings.working_hours,
  };
}

