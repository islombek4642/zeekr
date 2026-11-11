import { Metadata } from 'next';
import { getSiteSettings } from '@/lib/settings';
import { formatPhoneNumber } from '@/lib/utils';
import { InteractiveMap } from '@/components/contacts/InteractiveMap';
import { MapPin, Phone, Mail, Clock, Send, ShieldCheck, MessageCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Bog’lanish va Showroom Manzili — Zeekr Uzbekistan',
  description: 'Toshkentdagi rasmiy Zeekr avtosaloni manzili, telefon raqamlari, ish vaqti va lokatsiyasi. Konsultatsiya olish va savollarga javob topish.',
};

export default async function ContactsPage() {
  const settings = await getSiteSettings();

  return (
    <main className="min-h-screen bg-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER */}
        <div className="mb-12 text-left border-b border-slate-100 pb-8">
          <div className="inline-flex items-center gap-2 text-emerald-600 text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Rasmiy Dilerlik Markazi</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            Aloqa & Manzil
          </h1>
          <p className="text-sm text-slate-500 mt-2 max-w-2xl leading-relaxed">
            Zamonaviy Zeekr shou-rumiga tashrif buyuring, premium servis xizmatlarimizdan foydalaning yoki mutaxassislarimiz bilan bog&apos;laning.
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
                  Showroom Manzili
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
                  Aloqa Telefonlari
                </span>
                <div className="mt-1 space-y-1">
                  <div>
                    <a
                      href={`tel:${settings.primary_phone}`}
                      className="font-bold text-slate-900 text-sm hover:text-emerald-600 transition-colors block"
                    >
                      {formatPhoneNumber(settings.primary_phone)}
                    </a>
                  </div>
                  {settings.secondary_phone && (
                    <div>
                      <a
                        href={`tel:${settings.secondary_phone}`}
                        className="text-xs text-slate-600 hover:text-slate-900 transition-colors block"
                      >
                        {formatPhoneNumber(settings.secondary_phone)}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-200/60 text-xs text-emerald-600 font-medium">
              Call-markaz faol
            </div>
          </div>

          {/* WORKING HOURS */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-900 shadow-sm">
                <Clock className="w-5 h-5 text-slate-700" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Ish Vaqti
                </span>
                <p className="font-semibold text-slate-900 text-sm mt-1 leading-snug">
                  {settings.working_hours || "09:00 — 20:00"}
                </p>
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-200/60 text-xs text-slate-500">
              Dam olish kunlarisiz
            </div>
          </div>

          {/* EMAIL & SOCIAL */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-900 shadow-sm">
                <Mail className="w-5 h-5 text-slate-700" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Elektron Pochta & Tarmoqlar
                </span>
                <a
                  href={`mailto:${settings.contact_email}`}
                  className="font-semibold text-slate-900 text-sm hover:underline block mt-1 truncate"
                >
                  {settings.contact_email || "info@zeekr-auto.uz"}
                </a>
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-200/60 flex items-center gap-3">
              {settings.telegram_channel && (
                <a
                  href={settings.telegram_channel}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:text-white hover:bg-slate-900 transition-colors shadow-xs"
                  aria-label="Telegram"
                >
                  <Send className="w-3.5 h-3.5" />
                </a>
              )}
              {settings.instagram_url && (
                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:text-white hover:bg-slate-900 transition-colors shadow-xs"
                  aria-label="Instagram"
                >
                  <svg className="w-3.5 h-3.5 fill-none stroke-currentColor stroke-2" viewBox="0 0 24 24">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                  </svg>
                </a>
              )}
            </div>
          </div>

        </div>

        {/* MAP SECTION */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">
              Interaktiv Lokatsiya Xaritasi
            </h2>
            <span className="text-xs text-slate-400">
              Yandex Maps / Google Maps
            </span>
          </div>
          <InteractiveMap
            mapUrl={settings.map_iframe_url}
            address={settings.showroom_address}
          />
        </div>

      </div>
    </main>
  );
}
