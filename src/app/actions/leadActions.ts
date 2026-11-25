'use server';

import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { leadFormSchema } from '@/lib/validations/lead';
import { sendTelegramLeadNotification } from '@/lib/telegram';
import { getSiteSettings } from '@/lib/settings';
import { revalidatePath } from 'next/cache';
import { checkRateLimit, extractClientIp } from '@/lib/rate-limit';

export async function createTestDriveLeadAction(input: {
  fullName: string;
  phone: string;
  modelId?: string | null;
  preferredDate?: string | null;
  preferredTime?: string | null;
  notes?: string | null;
  source?: string | null;
}) {
  try {
    let ip = 'unknown';
    try {
      const headerList = await headers();
      ip = extractClientIp(headerList);
    } catch {
      // Outside Next.js request context (e.g. unit tests)
    }

    const rateLimit = checkRateLimit(`lead-action:ip:${ip}`, {
      limit: 5,
      windowMs: 60_000,
    });

    if (!rateLimit.allowed) {
      return {
        success: false,
        error: "Juda ko'p so'rov yuborildi. Iltimos birozdan so'ng qayta urinib ko'ring.",
      };
    }

    const parsed = leadFormSchema.safeParse(input);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map((i) => i.message).join(', ');
      return { success: false, error: errorMsg };
    }

    const { fullName, phone, modelId, preferredDate, preferredTime, notes, source } = parsed.data;

    const phoneRateLimit = checkRateLimit(`lead-action:phone:${phone}`, {
      limit: 5,
      windowMs: 60_000,
    });

    if (!phoneRateLimit.allowed) {
      return {
        success: false,
        error: "Juda ko'p so'rov yuborildi. Iltimos birozdan so'ng qayta urinib ko'ring.",
      };
    }

    let lead;
    try {
      lead = await prisma.lead.create({
        data: {
          type: 'TEST_DRIVE',
          fullName,
          phone,
          modelId: modelId || null,
          preferredDate: preferredDate ? new Date(preferredDate) : null,
          preferredTime: preferredTime || null,
          status: 'NEW',
          managerNotes: notes || null,
          source: source || 'test_drive_page',
        },
        include: {
          model: true,
        },
      });
    } catch (dbErr: any) {
      if (dbErr?.code === 'P2003') {
        return { success: false, error: 'Tanlangan model topilmadi' };
      }
      throw dbErr;
    }

    // Notify Telegram (graceful degradation)
    try {
      const settings = await getSiteSettings();
      await sendTelegramLeadNotification(
        {
          type: 'TEST_DRIVE',
          fullName: lead.fullName,
          phone: lead.phone,
          modelName: lead.model?.name || null,
          preferredDate: preferredDate || null,
          preferredTime: preferredTime || null,
          notes: notes || null,
          source: source || 'test_drive_page',
        },
        settings.telegram_bot_token,
        settings.telegram_chat_id
      );
    } catch (telegramErr) {
      console.error('Telegram notification error (lead was saved):', telegramErr);
    }

    revalidatePath('/admin/leads');
    return { success: true, leadId: lead.id };
  } catch (err: any) {
    console.error('createTestDriveLeadAction error:', err);
    return { success: false, error: 'Kutilmagan xatolik yuz berdi' };
  }
}
