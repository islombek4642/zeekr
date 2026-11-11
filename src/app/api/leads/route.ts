import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendTelegramLeadNotification } from '@/lib/telegram';
import { getSiteSettings } from '@/lib/settings';
import { leadFormSchema } from '@/lib/validations/lead';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parsed = leadFormSchema.safeParse(body);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map((i) => i.message).join(', ');
      return NextResponse.json(
        { error: errorMsg },
        { status: 400 }
      );
    }

    const {
      fullName,
      phone,
      modelId,
      inventoryItemId,
      preferredDate,
      preferredTime,
      type,
      notes,
      source,
    } = parsed.data;

    const lead = await prisma.lead.create({
      data: {
        type: type || 'TEST_DRIVE',
        fullName,
        phone,
        modelId: modelId || null,
        inventoryItemId: inventoryItemId || null,
        preferredDate: preferredDate ? new Date(preferredDate) : null,
        preferredTime: preferredTime || null,
        status: 'NEW',
        managerNotes: notes || null,
        source: source || 'website_api',
      },
      include: {
        model: true,
        inventoryItem: {
          include: {
            trim: true,
          },
        },
      },
    });

    // Send Telegram Notification with graceful degradation
    try {
      const settings = await getSiteSettings();
      await sendTelegramLeadNotification(
        {
          type: lead.type,
          fullName: lead.fullName,
          phone: lead.phone,
          modelName: lead.model?.name || lead.inventoryItem?.trim.name || null,
          vinOrCode: lead.inventoryItem?.vinOrCode || null,
          preferredDate: preferredDate || null,
          preferredTime: preferredTime || null,
          notes: notes || null,
          source: source || null,
        },
        settings.telegram_bot_token,
        settings.telegram_chat_id
      );
    } catch (telegramErr) {
      console.error('Telegram notification error in /api/leads (lead saved):', telegramErr);
    }

    return NextResponse.json({ success: true, leadId: lead.id });
  } catch (err: any) {
    console.error('Lead creation API error:', err);
    return NextResponse.json(
      { error: 'Arizani qabul qilishda xatolik yuz berdi' },
      { status: 500 }
    );
  }
}
