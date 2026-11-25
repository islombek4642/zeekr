import React from 'react';
import Link from 'next/link';
import { MapPin, Clock, Phone, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { Locale, getTranslations } from '@/lib/i18n';
import { SiteSettings } from '@/lib/settings';
import { formatPhoneNumber } from '@/lib/utils';

interface ShowroomSectionProps {
  settings: SiteSettings;
  locale: Locale;
}

export function ShowroomSection({ settings, locale }: ShowroomSectionProps) {
  const t = getTranslations(locale);

  return (
    <section className="py-20 bg-slate-50 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* HEADER */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-bold uppercase tracking-wider border border-sky-100">
            <ShieldCheck className="w-4 h-4" />
            <span>{t.home.showroomBadge}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
            {t.home.showroomTitle}
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            {t.home.showroomSubtitle}
          </p>
        </div>

        {/* INFO CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* ADDRESS */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center mb-4">
                <MapPin className="w-5 h-5 text-sky-600" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                {t.home.addressLabel}
              </span>
              <p className="text-sm font-bold text-slate-900 leading-snug">
                {settings.showroom_address || 'Toshkent sh., Sergeli tumani'}
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100">
              <Link
                href="/contacts"
                className="text-xs font-semibold text-sky-600 hover:text-sky-700 inline-flex items-center gap-1"
              >
                {t.home.viewContacts} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* WORKING HOURS */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center mb-4">
                <Clock className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                {t.home.hoursLabel}
              </span>
              <p className="text-sm font-bold text-slate-900 leading-snug">
                {settings.working_hours || '09:00 — 20:00 (Dam olish kunlarisiz)'}
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100">
              <Link
                href="/test-drive"
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
              >
                {t.home.bookTestDrive} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* PHONE */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center mb-4">
                <Phone className="w-5 h-5 text-indigo-600" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                {t.home.phoneLabel}
              </span>
              {settings.primary_phone ? (
                <a
                  href={`tel:${settings.primary_phone}`}
                  className="text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors block"
                >
                  {formatPhoneNumber(settings.primary_phone)}
                </a>
              ) : (
                <span className="text-sm font-bold text-slate-900">+998 71 200 00 00</span>
              )}
            </div>
            {settings.secondary_phone && settings.secondary_phone.trim() ? (
              <div className="pt-4 mt-4 border-t border-slate-100">
                <a
                  href={`tel:${settings.secondary_phone}`}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  {formatPhoneNumber(settings.secondary_phone)}
                </a>
              </div>
            ) : null}
          </div>

          {/* EMAIL */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center mb-4">
                <Mail className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                {t.home.emailLabel}
              </span>
              {settings.contact_email && settings.contact_email.trim() ? (
                <a
                  href={`mailto:${settings.contact_email}`}
                  className="text-sm font-bold text-slate-900 hover:text-amber-600 transition-colors truncate block"
                >
                  {settings.contact_email}
                </a>
              ) : (
                <span className="text-sm font-bold text-slate-900">info@zeekr-auto.uz</span>
              )}
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100">
              <span className="text-xs text-slate-400">24/7 onlayn qo&apos;llab-quvvatlash</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
