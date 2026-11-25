'use client';

import React, { useState } from 'react';
import { Wrench, Calendar, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

interface ServiceBookingFormProps {
  models?: Array<{ id: string; name: string }>;
}

export function ServiceBookingForm({ models = [] }: ServiceBookingFormProps) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [modelId, setModelId] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [notes, setNotes] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const payload: Record<string, any> = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        type: 'SERVICE',
        source: 'service_page',
      };

      if (modelId) payload.modelId = modelId;
      if (preferredDate) payload.preferredDate = preferredDate;
      if (preferredTime) payload.preferredTime = preferredTime;
      if (notes.trim()) payload.notes = notes.trim();

      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Arizani yuborishda xatolik yuz berdi');
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
      setIsLoading(false);
      setFullName('');
      setPhone('');
      setModelId('');
      setPreferredDate('');
      setPreferredTime('');
      setNotes('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Tarmoq xatosi yuz berdi');
      setIsLoading(false);
    }
  };

  return (
    <div id="service-booking" className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-sm">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-2">
            <Wrench className="w-4 h-4" /> Rasmiy Servis Buyurtmasi
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Servis Xizmatiga Yozilish
          </h2>
          <p className="text-xs text-slate-500 mt-2">
            Mutaxassislarimiz belgilangan vaqtda sizga xizmat ko&apos;rsatish uchun barcha choralarni ko&apos;rishadi.
          </p>
        </div>

        {isSuccess ? (
          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-emerald-900">
              Arizangiz muvaffaqiyatli qabul qilindi!
            </h3>
            <p className="text-xs text-emerald-700 max-w-md mx-auto">
              Tez orada servis menejerimiz siz bilan bog&apos;lanib, tashrif vaqtini tasdiqlaydi.
            </p>
            <button
              type="button"
              onClick={() => setIsSuccess(false)}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors"
            >
              Yangi ariza topshirish
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMsg && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  To&apos;liq ismingiz *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Rustam Alimov"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Telefon raqamingiz *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+998 90 123 45 67"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Avtomobil Modeli (Ixtiyoriy)
                </label>
                <select
                  value={modelId}
                  onChange={(e) => setModelId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950"
                >
                  <option value="">Modelni tanlang</option>
                  {models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                  <option value="zeekr-001">Zeekr 001</option>
                  <option value="zeekr-007">Zeekr 007</option>
                  <option value="zeekr-009">Zeekr 009</option>
                  <option value="zeekr-x">Zeekr X</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Qulay sana (Ixtiyoriy)
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Qulay vaqt oralig&apos;i (Ixtiyoriy)
                </label>
                <input
                  type="text"
                  placeholder="Masalan: 10:00 — 12:00"
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Xizmat turi yoki shikoyat (Ixtiyoriy)
                </label>
                <textarea
                  rows={3}
                  placeholder="10,000 km texnik ko'rik, OTA dasturiy yangilash yoki g'ildirak sozlash..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-xl bg-slate-950 text-white font-bold text-sm hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
            >
              {isLoading ? 'Yuborilmoqda...' : 'Servisga Yozilishni Tasdiqlash'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
