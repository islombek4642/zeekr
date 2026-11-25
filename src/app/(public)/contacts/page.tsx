import { Metadata } from 'next';
import { getSiteSettings } from '@/lib/settings';
import { getCurrentLocale, getTranslations } from '@/lib/i18n';
import { InteractiveMap } from '@/components/contacts/InteractiveMap';
import { MapPin, Phone, Mail, Clock, Send, ShieldCheck } from 'lucide-react';
import { formatPhoneNumber } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Bog’lanish va Showroom Manzili — Zeekr Uzbekistan',
  description: 'Toshkentdagi rasmiy Zeekr avtosaloni manzili, telefon raqamlari, ish vaqti va lokatsiyasi. Konsultatsiya olish va savollarga javob topish.',
};

export default async function ContactsPage() {
  const [settings, locale] = await Promise.all([
    getSiteSettings(),
    getCurrentLocale(),
  ]);
  const t = getTranslations(locale);

  return (
    <main className="min-h-screen bg-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER */}
        <div className="mb-12 text-left border-b border-slate-100 pb-8">
          <div className="inline-flex items-center gap-2 text-emerald-600 text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>{t.contacts.badge}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            {t.contacts.title}
          </h1>
          <p className="text-sm text-slate-500 mt-2 max-w-2xl leading-relaxed">
            {t.contacts.subtitle}
          </p>
        </div>

        {/* CONTACT CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          
          {/* ADDRESS */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-900 shadow-sm">
                <MapPin className="w-5 h-5 text-slate-700" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  {t.home.addressLabel}
                </span>
                <p className="font-semibold text-slate-900 text-sm mt-1 leading-snug">
                  {settings.showroom_address || "Toshkent shahri"}
                </p>
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-200/60 text-xs text-slate-500">
              Avtoturargoh mavjud
            </div>
          </div>

          {/* PHONE */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-900 shadow-sm">
                <Phone className="w-5 h-5 text-slate-700" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  {t.home.phoneLabel}
                </span>
                {settings.primary_phone ? (
                  <p className="font-semibold text-slate-900 text-sm mt-1">
                    <a href={`tel:${settings.primary_phone}`} className="hover:text-sky-600 transition-colors">
                      {formatPhoneNumber(settings.primary_phone)}
                    </a>
                  </p>
                ) : (
                  <p className="font-semibold text-slate-900 text-sm mt-1">+998 71 200 00 00</p>
                )}
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-200/60 text-xs text-slate-500">
              Yagona aloqa markazi
            </div>
          </div>

          {/* EMAIL */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-900 shadow-sm">
                <Mail className="w-5 h-5 text-slate-700" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  {t.home.emailLabel}
                </span>
                {settings.contact_email ? (
                  <p className="font-semibold text-slate-900 text-sm mt-1">
                    <a href={`mailto:${settings.contact_email}`} className="hover:text-sky-600 transition-colors truncate block">
                      {settings.contact_email}
                    </a>
                  </p>
                ) : (
                  <p className="font-semibold text-slate-900 text-sm mt-1">info@zeekr-auto.uz</p>
                )}
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-200/60 text-xs text-slate-500">
              Rasmiy pochta
            </div>
          </div>

          {/* HOURS */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-900 shadow-sm">
                <Clock className="w-5 h-5 text-slate-700" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  {t.home.hoursLabel}
                </span>
                <p className="font-semibold text-slate-900 text-sm mt-1">
                  {settings.working_hours || "09:00 — 20:00"}
                </p>
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-200/60 text-xs text-slate-500">
              Dam olish kunlarisiz
            </div>
          </div>

        </div>

        {/* MAP & SOCIALS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8">
            <InteractiveMap
              mapUrl={settings.map_iframe_url}
              address={settings.showroom_address || "Toshkent shahri"}
            />
          </div>

          <div className="lg:col-span-4 bg-slate-900 text-white rounded-3xl p-8 space-y-6">
            <h3 className="text-xl font-bold">
              Ijtimoiy Tarmoqlar
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Bizning rasmiy sahifalarimizga obuna bo&apos;ling va eng so&apos;nggi Zeekr yangiliklari, aksiyalar va yetkazib berish jarayonlaridan birinchilardan bo&apos;lib xabardor bo&apos;ling.
            </p>

            <div className="space-y-3 pt-2">
              {settings.telegram_channel && (
                <a
                  href={settings.telegram_channel}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors text-xs font-semibold"
                >
                  <Send className="w-4 h-4 text-sky-400" />
                  <span>Telegram Kanal</span>
                </a>
              )}
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
