'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Locale } from '@/lib/i18n';

interface LanguageSwitcherProps {
  currentLocale: Locale;
}

export function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const router = useRouter();

  const handleSwitch = (locale: Locale) => {
    document.cookie = `locale=${locale}; path=/; max-age=31536000; SameSite=Lax`;
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`;
    document.cookie = `zeekr_locale=${locale}; path=/; max-age=31536000; SameSite=Lax`;
    router.refresh();
  };

  return (
    <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs font-bold">
      <button
        type="button"
        onClick={() => handleSwitch('uz')}
        className={`px-2 py-1 rounded-md transition-all ${
          currentLocale === 'uz'
            ? 'bg-slate-950 text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-950'
        }`}
        aria-label="O'zbek tili"
      >
        UZ
      </button>
      <button
        type="button"
        onClick={() => handleSwitch('ru')}
        className={`px-2 py-1 rounded-md transition-all ${
          currentLocale === 'ru'
            ? 'bg-slate-950 text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-950'
        }`}
        aria-label="Русский язык"
      >
        RU
      </button>
    </div>
  );
}
