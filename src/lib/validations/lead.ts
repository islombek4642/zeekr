import { z } from 'zod';

export const leadFormSchema = z.object({
  fullName: z.string().min(2, "Ism kamida 2 ta belgidan iborat bo'lishi kerak"),
  phone: z
    .string()
    .min(9, "Telefon raqami kamida 9 ta raqam bo'lishi kerak")
    .transform((val) => val.replace(/[\s\-\(\)]/g, ''))
    .refine((val) => /^(\+?998)?[0-9]{9}$/.test(val), {
      message: "Noto'g'ri telefon raqami formati (+998XXXXXXXXX)",
    }),
  modelId: z.string().optional().nullable(),
  inventoryItemId: z.string().optional().nullable(),
  preferredDate: z.string().optional().nullable(),
  preferredTime: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
  type: z.enum(['TEST_DRIVE', 'CONSULTATION', 'CAR_RESERVE', 'SERVICE']).optional(),
});

export type LeadFormData = z.infer<typeof leadFormSchema>;
