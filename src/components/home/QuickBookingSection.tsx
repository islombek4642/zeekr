'use client';

import { useState } from 'react';
import { Send, CheckCircle2, Phone, User, Car } from 'lucide-react';

interface QuickBookingProps {
  models: Array<{ id: string; name: string }>;
}

export function QuickBookingSection({ models }: QuickBookingProps) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [modelId, setModelId] = useState(models[0]?.id || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      setError('Iltimos, ism va telefon raqamingizni kiriting.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'TEST_DRIVE',
          fullName,
          phone,
          modelId: modelId || undefined,
          source: 'home_quick_booking',
        }),
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        setError('Arizani yuborishda xatolik yuz berdi. Iltimos qaytadan urinib ko‘ring.');
      }
    } catch (err) {
      setError('Aloqa xatosi. Iltimos keyinroq urinib ko‘ring.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 bg-slate-100 border-t border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl text-center space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-bold uppercase tracking-wider">
            Tezkor Yozilish
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
            Zeekr Bilan Test-Drayv His Qiling
          </h2>
          <p className="text-sm text-slate-600 max-w-lg mx-auto">
            Ma&apos;lumotlaringizni qoldiring, mutaxassisimiz 15 daqiqa ichida siz bilan bog&apos;lanadi va qulay vaqtni belgilaydi.
          </p>

          {success ? (
            <div className="py-8 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-800 space-y-2 animate-in fade-in">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="text-lg font-bold">Arizangiz qabul qilindi!</h3>
              <p className="text-xs text-emerald-700">
                Menejerimiz tez orada siz bilan bog&apos;lanadi. Rahmat!
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto text-left">
              {error && (
                <div className="p-3 text-xs rounded-lg bg-rose-50 border border-rose-200 text-rose-700">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ismingiz
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="Alisher Valiyev"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Telefon raqamingiz
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      required
                      placeholder="+998 (90) 123-45-67"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-slate-900"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Qaysi model qiziqtirmoqda?
                </label>
                <div className="relative">
                  <Car className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <select
                    value={modelId}
                    onChange={(e) => setModelId(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-slate-900 bg-white"
                  >
                    {models.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-lg bg-slate-950 text-white font-bold text-sm hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                {loading ? 'Yuborilmoqda...' : 'Test-drayvga yozilish'}
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}

        </div>

      </div>
    </section>
  );
}

