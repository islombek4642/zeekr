import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendTelegramLeadNotification } from '@/lib/telegram';
import { getSiteSettings } from '@/lib/settings';
import { leadFormSchema } from '@/lib/validations/lead';
import { checkRateLimit, extractClientIp } from '@/lib/rate-limit';

export async function POST(req: Request) {
  try {
    const ip = extractClientIp(req.headers);
    const rateLimit = checkRateLimit(`leads:ip:${ip}`, {
      limit: 5,
      windowMs: 60_000,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Juda ko'p so'rov yuborildi. Iltimos birozdan so'ng qayta urinib ko'ring.",
          retryAfterSeconds: rateLimit.retryAfterSeconds,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.retryAfterSeconds),
          },
        }
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Noto'g'ri JSON ma'lumot yuborildi" },
        { status: 400 }
      );
    }

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Noto'g'ri so'rov formati" },
        { status: 400 }
      );
    }

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

    const phoneRateLimit = checkRateLimit(`leads:phone:${phone}`, {
      limit: 5,
      windowMs: 60_000,
    });

    if (!phoneRateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Juda ko'p so'rov yuborildi. Iltimos birozdan so'ng qayta urinib ko'ring.",
          retryAfterSeconds: phoneRateLimit.retryAfterSeconds,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(phoneRateLimit.retryAfterSeconds),
          },
        }
      );
    }

    let lead;
    try {
      lead = await prisma.lead.create({
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
    } catch (dbErr: any) {
      if (dbErr?.code === 'P2003') {
        return NextResponse.json(
          { error: 'Tanlangan model yoki avtomobil topilmadi' },
          { status: 400 }
        );
      }
      throw dbErr;
    }

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
