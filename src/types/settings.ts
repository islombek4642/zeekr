export interface SiteSettings {
  showroom_address: string;
  primary_phone: string;
  secondary_phone: string;
  contact_email: string;
  working_hours: string;
  map_iframe_url: string;
  telegram_channel: string;
  instagram_url: string;
  youtube_url: string;
  usd_to_uzs_rate: number;
  default_loan_apr: number;
  telegram_bot_token: string;
  telegram_chat_id: string;
}

export type SettingKey = keyof SiteSettings;

