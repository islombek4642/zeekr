import { z } from 'zod';

const CONTROL_CHARS_RE = /[\u0000-\u001F\u007F]/;
const NOTE_CONTROL_CHARS_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;
const ZERO_WIDTH_CHARS_RE = /[\u200B-\u200D\uFEFF]/;
const STRICT_ISO_DATE_TIME_RE =
  /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,9})?)?(?:Z|([+-])(\d{2}):(\d{2}))?)?$/;

export function normalizePhoneNumber(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 9) {
    return `+998${digits}`;
  }
  if (digits.length === 12 && digits.startsWith('998')) {
    return `+${digits}`;
  }
  return phone.trim();
}

export function isValidPreferredDate(val: string): boolean {
  const trimmed = val.trim();
  if (!trimmed || CONTROL_CHARS_RE.test(val)) return false;

  const match = STRICT_ISO_DATE_TIME_RE.exec(trimmed);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (year < 2020 || year > 2100) return false;
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;

  const utcDate = new Date(Date.UTC(year, month - 1, day));
  if (
    utcDate.getUTCFullYear() !== year ||
    utcDate.getUTCMonth() !== month - 1 ||
    utcDate.getUTCDate() !== day
  ) {
    return false;
  }

  if (match[4] !== undefined) {
    const hour = Number(match[4]);
    const minute = Number(match[5]);
    const second = match[6] !== undefined ? Number(match[6]) : 0;
    if (hour < 0 || hour > 23 || minute < 0 || minute > 59 || second < 0 || second > 59) {
      return false;
    }
    if (match[7] !== undefined) {
      const tzHour = Number(match[8]);
      const tzMinute = Number(match[9]);
      if (tzHour < 0 || tzHour > 23 || tzMinute < 0 || tzMinute > 59) {
        return false;
      }
    }
  }

  return !Number.isNaN(Date.parse(trimmed));
}

function optionalCleanString(max: number, allowNewlines = false) {
  const pattern = allowNewlines ? NOTE_CONTROL_CHARS_RE : CONTROL_CHARS_RE;
  return z
    .string()
    .refine((val) => !pattern.test(val), {
      message: "Matnda taqiqlangan belgilar mavjud",
    })
    .pipe(z.string().trim().max(max))
    .optional()
    .nullable();
}

export const leadFormSchema = z.object({
  fullName: z
    .string()
    .refine((val) => !CONTROL_CHARS_RE.test(val) && !ZERO_WIDTH_CHARS_RE.test(val), {
      message: "Ism taqiqlangan belgilarni o'z ichiga olmasligi kerak",
    })
    .pipe(
      z
        .string()
        .trim()
        .min(2, "Ism kamida 2 ta belgidan iborat bo'lishi kerak")
        .max(100, "Ism 100 ta belgidan oshmasligi kerak")
    ),
  phone: z
    .string()
    .refine((val) => !CONTROL_CHARS_RE.test(val), {
      message: "Telefon raqami taqiqlangan belgilarni o'z ichiga olmasligi kerak",
    })
    .pipe(
      z
        .string()
        .trim()
        .min(9, "Telefon raqami kamida 9 ta raqam bo'lishi kerak")
        .max(30, "Telefon raqami 30 ta belgidan oshmasligi kerak")
        .transform((val) => normalizePhoneNumber(val))
        .refine((val) => /^\+998[0-9]{9}$/.test(val), {
          message: "Noto'g'ri O'zbekiston telefon raqami formati (+998XXXXXXXXX)",
        })
    ),
  modelId: optionalCleanString(100),
  inventoryItemId: optionalCleanString(100),
  preferredDate: z
    .string()
    .trim()
    .max(40)
    .optional()
    .nullable()
    .refine((val) => !val || isValidPreferredDate(val), {
      message: "Noto'g'ri sana formati",
    }),
  preferredTime: optionalCleanString(60),
  notes: optionalCleanString(1000, true),
  source: optionalCleanString(100),
  type: z.enum(['TEST_DRIVE', 'CONSULTATION', 'CAR_RESERVE', 'SERVICE']).optional(),
});

export type LeadFormData = z.infer<typeof leadFormSchema>;
