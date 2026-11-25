import Link from 'next/link';
import { Send } from 'lucide-react';
import { getSiteSettings } from '@/lib/settings';
import { getCarModels } from '@/lib/data-provider';
import { formatPhoneNumber } from '@/lib/utils';
import { getCurrentLocale, getTranslations } from '@/lib/i18n';

export async function Footer() {
  const [settings, models, locale] = await Promise.all([
    getSiteSettings(),
    getCarModels(),
    getCurrentLocale(),
  ]);
  const t = getTranslations(locale);

  return (
    <footer className="w-full bg-slate-950 text-slate-400 text-sm border-t border-slate-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* COL 1: BRAND */}
          <div className="space-y-4">
            <Link href="/" className="inline-block text-2xl font-black tracking-widest text-white uppercase">
              ZEEKR
            </Link>
            <p className="text-xs leading-relaxed text-slate-400 max-w-xs">
              {t.footer.brandDesc}
            </p>
            <div className="flex items-center gap-3 pt-2">
              {settings.telegram_channel && (
                <a
                  href={settings.telegram_channel}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-slate-900 hover:bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                  aria-label="Telegram"
                >
                  <Send className="w-4 h-4" />
                </a>
              )}
              {settings.instagram_url && (
                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-slate-900 hover:bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                  aria-label="Instagram"
                >
                  <svg className="w-4 h-4 fill-none stroke-currentColor stroke-2 stroke-linecap-round stroke-linejoin-round" viewBox="0 0 24 24">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                  </svg>
                </a>
              )}
              {settings.youtube_url && (
                <a
                  href={settings.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-slate-900 hover:bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                  aria-label="YouTube"
                >
                  <svg className="w-4 h-4 fill-none stroke-currentColor stroke-2 stroke-linecap-round stroke-linejoin-round" viewBox="0 0 24 24">
                    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/>
                    <path d="m10 15 5-3-5-3z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* COL 2: MODELLAR */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              {t.footer.modelsTitle}
            </h4>
            <ul className="space-y-2 text-xs">
              {models.map((model) => (
                <li key={model.slug}>
                  <Link href={`/models/${model.slug}`} className="hover:text-white transition-colors">
                    {model.name}
                    {model.tagline ? ` — ${model.tagline}` : ''}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COL 3: MIJOZLARGA */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              {t.footer.clientsTitle}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/inventory" className="hover:text-white transition-colors">
                  {t.footer.inStockCars}
                </Link>
              </li>
              <li>
                <Link href="/test-drive" className="hover:text-white transition-colors">
                  {t.footer.bookDrive}
                </Link>
              </li>
              <li>
                <Link href="/service" className="hover:text-white transition-colors">
                  {t.footer.serviceWarranty}
                </Link>
              </li>
            </ul>
          </div>

          {/* COL 4: ALOQA */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              {t.footer.contactsTitle}
            </h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <p className="leading-relaxed">
                {settings.showroom_address || "Toshkent shahri"}
              </p>
              {settings.primary_phone && (
                <p>
                  <a href={`tel:${settings.primary_phone}`} className="hover:text-white transition-colors font-medium">
                    {formatPhoneNumber(settings.primary_phone)}
                  </a>
                </p>
              )}
              {settings.contact_email && (
                <p>
                  <a href={`mailto:${settings.contact_email}`} className="hover:text-white transition-colors">
                    {settings.contact_email}
                  </a>
                </p>
              )}
              <p className="text-[11px] text-slate-500 pt-1">
                {settings.working_hours}
              </p>
            </div>
          </div>

        </div>

        {/* BOTTOM COPYRIGHT */}
        <div className="mt-12 pt-8 border-t border-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            &copy; {new Date().getFullYear()} Zeekr Uzbekistan. {t.common.allRightsReserved}.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/contacts" className="hover:text-slate-400 transition-colors">
              {t.nav.contacts}
            </Link>
            <Link href="/service" className="hover:text-slate-400 transition-colors">
              {t.nav.service}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
