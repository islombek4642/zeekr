'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginAdminAction } from '@/app/actions/authActions';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await loginAdminAction({ email, password });
      if (!res.success) {
        setErrorMessage(res.error || 'Kirish muvaffaqiyatsiz bo\'ldi');
        setIsLoading(false);
        return;
      }

      router.push(from);
      router.refresh();
    } catch {
      setErrorMessage('Tarmoq xatosi. Iltimos qaytadan urinib ko\'ring.');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMessage && (
        <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-medium text-center">
          {errorMessage}
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
          Email *
        </label>
        <div className="relative">
          <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@zeekr-auto.uz"
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-white transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
          Parol *
        </label>
        <div className="relative">
          <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-white transition-all"
          />
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 bg-white hover:bg-slate-100 disabled:bg-slate-700 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
        >
          {isLoading ? 'Tekshirilmoqda...' : 'Tizimga kirish'}
          {!isLoading && <ArrowRight className="w-4 h-4" />}
        </button>
      </div>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl">
        
        {/* LOGO & TITLE */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold uppercase tracking-wider mb-3 border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Xavfsiz Boshqaruv Tizimi</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-widest uppercase">
            ZEEKR ADMIN
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Dilerlik markazi boshqaruv paneli
          </p>
        </div>

        <Suspense fallback={<div className="text-center py-8 text-xs text-slate-500">Yuklanmoqda...</div>}>
          <AdminLoginForm />
        </Suspense>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-500">
            Faqat vakolatli xodimlar uchun. Ruxsatsiz kirish taqiqlanadi.
          </p>
        </div>

      </div>
    </div>
  );
}

