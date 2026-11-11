import { z } from 'zod';

export const carModelFormSchema = z.object({
  name: z.string().min(2, "Model nomi kiritilishi shart"),
  slug: z.string().min(2, "Slug kiritilishi shart"),
  tagline: z.string().min(2, "Shior kiritilishi shart"),
  basePriceUSD: z.number().positive("Narx musbat son bo'lishi kerak"),
  rangeKm: z.number().positive("Masofa musbat son bo'lishi kerak"),
  acceleration0100: z.number().positive("Tezlanish musbat son bo'lishi kerak"),
  batteryKwh: z.number().positive("Batareya musbat son bo'lishi kerak"),
  powerHp: z.number().positive("Ot kuchi musbat son bo'lishi kerak"),
  topSpeedKmH: z.number().positive("Maksimal tezlik musbat son bo'lishi kerak"),
  chargingTimeMin: z.number().positive("Zaryadlash vaqti musbat son bo'lishi kerak"),
  mainImage: z.string().min(1, "Asosiy rasm ssilkasi kiritilishi shart"),
  description: z.string().min(5, "Tavsif kiritilishi shart"),
  galleryImages: z.array(z.string()).optional().default([]),
  isActive: z.boolean().optional().default(true),
});

export const inventoryItemFormSchema = z.object({
  trimId: z.string().min(1, "Komplektatsiya tanlanishi shart"),
  vinOrCode: z.string().optional().nullable(),
  exteriorColor: z.string().min(1, "Tashqi rang kiritilishi shart"),
  interiorColor: z.string().min(1, "Interyer rangi kiritilishi shart"),
  year: z.number().min(2020).max(2030),
  status: z.enum(['IN_STOCK', 'IN_TRANSIT', 'RESERVED', 'SOLD']),
  priceUSD: z.number().positive("Narx musbat son bo'lishi kerak"),
  priceUZS: z.number().optional().nullable(),
  notes: z.string().optional().nullable(),
  images: z.array(z.string()).optional().default([]),
});

export type CarModelFormData = z.infer<typeof carModelFormSchema>;
export type InventoryItemFormData = z.infer<typeof inventoryItemFormSchema>;

