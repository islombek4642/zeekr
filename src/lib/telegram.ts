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

export function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
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
    `👤 <b>Mijoz:</b> ${escapeHtml(payload.fullName)}`,
    `📞 <b>Telefon:</b> ${escapeHtml(payload.phone)}`,
  ];

  if (payload.modelName) {
    lines.push(`🚙 <b>Model:</b> ${escapeHtml(payload.modelName)}`);
  }

  if (payload.vinOrCode) {
    lines.push(`🔢 <b>VIN / Kod:</b> ${escapeHtml(payload.vinOrCode)}`);
  }

  if (payload.preferredDate) {
    lines.push(`📅 <b>Sana:</b> ${escapeHtml(payload.preferredDate)}`);
  }

  if (payload.preferredTime) {
    lines.push(`⏰ <b>Vaqt:</b> ${escapeHtml(payload.preferredTime)}`);
  }

  if (payload.notes) {
    lines.push(`📝 <b>Izoh:</b> ${escapeHtml(payload.notes)}`);
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
    // If not configured, safely return false without throwing
    return false;
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

    return res.ok;
  } catch (err) {
    console.error('Failed to dispatch telegram lead notification:', err);
    return false;
  }
}
