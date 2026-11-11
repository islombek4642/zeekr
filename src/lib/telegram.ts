export interface LeadMessagePayload {
  type: 'TEST_DRIVE' | 'CONSULTATION' | 'CAR_RESERVE' | 'SERVICE';
  fullName: string;
  phone: string;
  modelName?: string | null;
  vinOrCode?: string | null;
  preferredDate?: string | null;
  preferredTime?: string | null;
  notes?: string | null;
  source?: string | null;
}

export function formatLeadTelegramMessage(payload: LeadMessagePayload): string {
  const typeMap: Record<string, string> = {
    TEST_DRIVE: '🚗 Yangi Test-drayv arizasi',
    CONSULTATION: '💬 Yangi Konsultatsiya arizasi',
    CAR_RESERVE: '⚡ Avtomobilni bron qilish arizasi',
    SERVICE: '🛠 Servis / Kafolat arizasi',
  };

  const header = typeMap[payload.type] || '📩 Yangi Ariza';
  const lines: string[] = [
    `<b>${header}</b>\n`,
    `👤 <b>Mijoz:</b> ${payload.fullName}`,
    `📞 <b>Telefon:</b> ${payload.phone}`,
  ];

  if (payload.modelName) {
    lines.push(`🚙 <b>Model:</b> ${payload.modelName}`);
  }

  if (payload.vinOrCode) {
    lines.push(`🔢 <b>VIN / Kod:</b> ${payload.vinOrCode}`);
  }

  if (payload.preferredDate) {
    lines.push(`📅 <b>Sana:</b> ${payload.preferredDate}`);
  }

  if (payload.preferredTime) {
    lines.push(`⏰ <b>Vaqt:</b> ${payload.preferredTime}`);
  }

  if (payload.notes) {
    lines.push(`📝 <b>Izoh:</b> ${payload.notes}`);
  }

  lines.push(`\n🌐 <i>Sayt: Zeekr Uzbekistan</i>`);
  return lines.join('\n');
}

export async function sendTelegramLeadNotification(
  payload: LeadMessagePayload,
  botToken?: string,
  chatId?: string
): Promise<boolean> {
  const token = botToken || process.env.TELEGRAM_BOT_TOKEN;
  const chat = chatId || process.env.TELEGRAM_CHAT_ID;

  if (!token || !chat || token.includes('demo') || token === '') {
    console.log('[Telegram Notification Simulated]:', formatLeadTelegramMessage(payload));
    return true;
  }

  try {
    const text = formatLeadTelegramMessage(payload);
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chat,
        text,
        parse_mode: 'HTML',
      }),
    });

    const data = await res.json();
    return data.ok === true;
  } catch (error) {
    console.error('Failed to send Telegram lead notification:', error);
    return false;
  }
}
