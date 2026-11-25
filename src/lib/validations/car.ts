import { z } from 'zod';

const CONTROL_CHARS_RE = /[\u0000-\u001F\u007F]/;

export function isValidAssetPathOrUrl(value: string): boolean {
  if (CONTROL_CHARS_RE.test(value)) return false;

  const val = value.trim();
  if (!val) return false;

  if (val.startsWith('/')) {
    if (val.startsWith('//')) return false;
    if (val.includes('..') || val.includes('\\')) return false;
    if (/[\s<>'"]/.test(val)) return false;
    if (/(?:%2e|%5c)/i.test(val)) return false;
    try {
      const decoded = decodeURIComponent(val);
      if (
        CONTROL_CHARS_RE.test(decoded) ||
        decoded.includes('..') ||
        decoded.includes('\\') ||
        decoded.startsWith('//')
      ) {
        return false;
      }
    } catch {
      return false;
    }
    return true;
  }

  try {
    const parsed = new URL(val);
    if ((parsed.protocol !== 'http:' && parsed.protocol !== 'https:') || !parsed.hostname) {
      return false;
    }
    if (/(?:%2e|%5c)/i.test(parsed.pathname)) return false;
    try {
      const decodedPath = decodeURIComponent(parsed.pathname);
      if (CONTROL_CHARS_RE.test(decodedPath) || decodedPath.includes('..') || decodedPath.includes('\\')) {
        return false;
      }
    } catch {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export const imagePathOrUrlSchema = z
  .string()
  .trim()
  .min(1, "Asosiy rasm ssilkasi kiritilishi shart")
  .max(500, "Rasm yo'li 500 ta belgidan oshmasligi kerak")
  .refine(isValidAssetPathOrUrl, {
    message: "Noto'g'ri rasm yo'li yoki URL formati",
  });

export const carModelFormSchema = z.object({
  name: z.string().trim().min(2, "Model nomi kiritilishi shart"),
  slug: z.string().trim().min(2, "Slug kiritilishi shart"),
  tagline: z.string().trim().min(2, "Shior kiritilishi shart"),
  basePriceUSD: z.number().positive("Narx musbat son bo'lishi kerak"),
  rangeKm: z.number().positive("Masofa musbat son bo'lishi kerak"),
  acceleration0100: z.number().positive("Tezlanish musbat son bo'lishi kerak"),
  batteryKwh: z.number().positive("Batareya musbat son bo'lishi kerak"),
  powerHp: z.number().positive("Ot kuchi musbat son bo'lishi kerak"),
  topSpeedKmH: z.number().positive("Maksimal tezlik musbat son bo'lishi kerak"),
  chargingTimeMin: z.number().positive("Zaryadlash vaqti musbat son bo'lishi kerak"),
  mainImage: imagePathOrUrlSchema,
  description: z.string().trim().min(5, "Tavsif kiritilishi shart"),
  galleryImages: z.array(imagePathOrUrlSchema).optional().default([]),
  isActive: z.boolean().optional().default(true),
});

export const carTrimFormSchema = z.object({
  modelId: z.string().trim().min(1, "Model tanlanishi shart"),
  name: z.string().trim().min(1, "Komplektatsiya nomi kiritilishi shart"),
  priceUSD: z.number().positive("Narx musbat son bo'lishi kerak"),
  driveType: z.string().trim().min(1, "Privod turi kiritilishi shart"),
  rangeKm: z.number().positive("Masofa musbat son bo'lishi kerak"),
  acceleration: z.number().positive("Tezlanish musbat son bo'lishi kerak"),
  features: z.array(z.string()).default([]),
});

export const carColorFormSchema = z.object({
  modelId: z.string().trim().min(1, "Model tanlanishi shart"),
  name: z.string().trim().min(1, "Rang nomi kiritilishi shart"),
  hexCode: z
    .string()
    .trim()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "To'g'ri HEX rang kodi bo'lishi kerak"),
  imageUrl: imagePathOrUrlSchema,
  isInterior: z.boolean().default(false),
});

export const inventoryItemFormSchema = z.object({
  trimId: z.string().trim().min(1, "Komplektatsiya tanlanishi shart"),
  vinOrCode: z.string().trim().optional().nullable(),
  exteriorColor: z.string().trim().min(1, "Tashqi rang kiritilishi shart"),
  interiorColor: z.string().trim().min(1, "Interyer rangi kiritilishi shart"),
  year: z.number().min(2020).max(2030),
  status: z.enum(['IN_STOCK', 'IN_TRANSIT', 'RESERVED', 'SOLD']),
  priceUSD: z.number().positive("Narx musbat son bo'lishi kerak"),
  priceUZS: z.number().optional().nullable(),
  notes: z.string().trim().optional().nullable(),
  images: z.array(imagePathOrUrlSchema).optional().default([]),
});

export type CarModelFormData = z.infer<typeof carModelFormSchema>;
export type CarTrimFormData = z.infer<typeof carTrimFormSchema>;
export type CarColorFormData = z.infer<typeof carColorFormSchema>;
export type InventoryItemFormData = z.infer<typeof inventoryItemFormSchema>;
