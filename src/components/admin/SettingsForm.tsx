'use client';

import React, { useState } from 'react';
import { SiteSettings } from '@/types/settings';
import { updateSettingsAction } from '@/app/actions/adminSettingsActions';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  DollarSign,
  Percent,
  Bot,
  Save,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface SettingsFormProps {
  initialSettings: SiteSettings;
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [formData, setFormData] = useState<SiteSettings>(initialSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (key: keyof SiteSettings, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await updateSettingsAction({
        ...formData,
        usd_to_uzs_rate: Number(formData.usd_to_uzs_rate),
        default_loan_apr: Number(formData.default_loan_apr),
      });

      if (!res.success) {
        setErrorMsg(res.error || 'Sozlamalarni saqlashda xatolik yuz berdi');
        setIsLoading(false);
        return;
      }

      setSuccessMsg("Barcha sozlamalar muvaffaqiyatli yangilandi va sayt bo'ylab qo'llanildi!");
    } catch (err: any) {
      setErrorMsg(err.message || 'Tarmoq xatosi yuz berdi');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs font-semibold text-red-600 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 1. SHOWROOM & KONTAKTLAR */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-700" />
            Showroom & Aloqa Ma&apos;lumotlari
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Saytning header, footer va kontaktlar sahifasida ko&apos;rinadigan dilerlik ma&apos;lumotlari
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Showroom Manzili *
            </label>
            <input
              type="text"
              required
              value={formData.showroom_address}
              onChange={(e) => handleChange('showroom_address', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Asosiy Telefon Raqam *
              </label>
              <input
                type="text"
                required
                value={formData.primary_phone}
                onChange={(e) => handleChange('primary_phone', e.target.value)}
                placeholder="+998712000000"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Qo&apos;shimcha Telefon
              </label>
              <input
                type="text"
                value={formData.secondary_phone}
                onChange={(e) => handleChange('secondary_phone', e.target.value)}
                placeholder="+998901234567"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Aloqa Emaili
              </label>
              <input
                type="email"
                value={formData.contact_email}
                onChange={(e) => handleChange('contact_email', e.target.value)}
                placeholder="info@zeekr-auto.uz"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Ish Vaqti
              </label>
              <input
                type="text"
                value={formData.working_hours}
                onChange={(e) => handleChange('working_hours', e.target.value)}
                placeholder="Har kuni 09:00 dan 20:00 gacha"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Xarita Iframe URL (Yandex / Google Maps)
            </label>
            <input
              type="text"
              value={formData.map_iframe_url}
              onChange={(e) => handleChange('map_iframe_url', e.target.value)}
              placeholder="https://yandex.uz/map-widget/v1/?..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-900"
            />
          </div>
        </div>
      </div>

      {/* 2. MOLIYA & VALYUTA KURSI */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            Moliya & Kredit Kalkulyatori Sozlamalari
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Valyuta kursi va avtokredit bo&apos;yicha standart annuitet hisob-kitob ko&apos;rsatkichlari
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-slate-500" />
              1 AQSH Dollari Kursi (UZS so&apos;mda) *
            </label>
            <input
              type="number"
              required
              min={1000}
              max={50000}
              value={formData.usd_to_uzs_rate}
              onChange={(e) => handleChange('usd_to_uzs_rate', Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono font-bold text-slate-900 bg-white"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Saytdagi barcha UZS narxlar ushbu kurs orqali bir zumda qayta hisoblanadi.
            </span>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Percent className="w-4 h-4 text-slate-500" />
              Yillik Kredit Stavkasi (APR %) *
            </label>
            <input
              type="number"
              required
              min={1}
              max={100}
              step="0.5"
              value={formData.default_loan_apr}
              onChange={(e) => handleChange('default_loan_apr', Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono font-bold text-slate-900 bg-white"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Modellar sahifasidagi kredit kalkulyatorida birlamchi foiz stavkasi.
            </span>
          </div>
        </div>
      </div>

      {/* 3. IJTIMOIY TARMOQLAR */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Send className="w-4 h-4 text-sky-500" />
            Ijtimoiy Tarmoq Havolalari
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Footer va aloqa bo&apos;limidagi rasmiy kanallar
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Telegram Kanal
            </label>
            <input
              type="url"
              value={formData.telegram_channel}
              onChange={(e) => handleChange('telegram_channel', e.target.value)}
              placeholder="https://t.me/zeekr_uzbekistan"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Instagram Profil
            </label>
            <input
              type="url"
              value={formData.instagram_url}
              onChange={(e) => handleChange('instagram_url', e.target.value)}
              placeholder="https://instagram.com/zeekr..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              YouTube Kanal
            </label>
            <input
              type="url"
              value={formData.youtube_url}
              onChange={(e) => handleChange('youtube_url', e.target.value)}
              placeholder="https://youtube.com/@..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900"
            />
          </div>
        </div>
      </div>

      {/* 4. TELEGRAM BOT NOTIFICATIONS */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Bot className="w-4 h-4 text-indigo-600" />
            Telegram Bot Integratsiyasi (Arizalar Xabarnomasi)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Saytdan yangi test-drayv yoki avtomobil bron arizasi tushganda sotuvchilar guruhiga darhol xabar yuborish
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Telegram Bot Token
            </label>
            <input
              type="password"
              value={formData.telegram_bot_token}
              onChange={(e) => handleChange('telegram_bot_token', e.target.value)}
              placeholder="123456789:ABCdefGhIJKlmNoPQRstuVWXyz"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-900"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              @BotFather orqali yaratilgan bot tokeni
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Telegram Guruh Chat ID
            </label>
            <input
              type="text"
              value={formData.telegram_chat_id}
              onChange={(e) => handleChange('telegram_chat_id', e.target.value)}
              placeholder="-1001234567890"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-900"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Menejerlar guruhi yoki kanalining ID raqami
            </span>
          </div>
        </div>
      </div>

      {/* SAVE BUTTON */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{isLoading ? 'Saqlanmoqda...' : 'Barcha sozlamalarni saqlash'}</span>
        </button>
      </div>

    </form>
  );
}

