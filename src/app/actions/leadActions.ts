'use server';

import { prisma } from '@/lib/prisma';
import { leadFormSchema } from '@/lib/validations/lead';
import { sendTelegramLeadNotification } from '@/lib/telegram';
import { getSiteSettings } from '@/lib/settings';
import { revalidatePath } from 'next/cache';

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
    const parsed = leadFormSchema.safeParse(input);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map((i) => i.message).join(', ');
      return { success: false, error: errorMsg };
    }

    const { fullName, phone, modelId, preferredDate, preferredTime, notes, source } = parsed.data;

    const lead = await prisma.lead.create({
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
    return { success: false, error: err.message || 'Kutilmagan xatolik yuz berdi' };
  }
}
