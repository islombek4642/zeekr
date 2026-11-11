import { z } from 'zod';

export const settingsFormSchema = z.object({
  showroom_address: z.string().optional().default(''),
  primary_phone: z.string().optional().default(''),
  secondary_phone: z.string().optional().default(''),
  contact_email: z.string().optional().default(''),
  working_hours: z.string().optional().default(''),
  map_iframe_url: z.string().optional().default(''),
  telegram_channel: z.string().optional().default(''),
  instagram_url: z.string().optional().default(''),
  youtube_url: z.string().optional().default(''),
  usd_to_uzs_rate: z.number().min(1000, "Kurs 1000 dan yuqori bo'lishi kerak").max(50000, "Kurs 50000 dan past bo'lishi kerak"),
  default_loan_apr: z.number().min(1, "Foiz stavkasi kamida 1% bo'lishi kerak").max(100, "Foiz stavkasi 100% dan oshmasligi kerak"),
  telegram_bot_token: z.string().optional().default(''),
  telegram_chat_id: z.string().optional().default(''),
});

export type SettingsFormData = z.infer<typeof settingsFormSchema>;
