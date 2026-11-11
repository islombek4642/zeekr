import Link from 'next/link';
import { Phone, Mail, MapPin, Clock, Send, Instagram, Youtube } from 'lucide-react';
import { getSiteSettings } from '@/lib/settings';
import { formatPhoneNumber } from '@/lib/utils';

export async function Footer() {
  const settings = await getSiteSettings();

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
              Zeekr elektromobillarining O&apos;zbekistondagi rasmiy dilerlik platformasi. Hashamat, xavfsizlik va yuqori elektr innovatsiyalari.
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
                  <Instagram className="w-4 h-4" />
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
                  <Youtube className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* COL 2: MODELLAR */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Modellar</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/models/zeekr-001" className="hover:text-white transition-colors">
                  Zeekr 001 — Shooting Brake
                </Link>
              </li>
              <li>
                <Link href="/models/zeekr-007" className="hover:text-white transition-colors">
                  Zeekr 007 — Luxury Sedan
                </Link>
              </li>
              <li>
                <Link href="/models/zeekr-009" className="hover:text-white transition-colors">
                  Zeekr 009 — Executive MPV
                </Link>
              </li>
              <li>
                <Link href="/models/zeekr-x" className="hover:text-white transition-colors">
                  Zeekr X — Urban SUV
                </Link>
              </li>
            </ul>
          </div>

          {/* COL 3: MIJOZLARGA */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Mijozlarga</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/inventory" className="hover:text-white transition-colors">
                  Salonda mavjud avtomobillar
                </Link>
              </li>
              <li>
                <Link href="/test-drive" className="hover:text-white transition-colors">
                  Test-drayvga yozilish
                </Link>
              </li>
              <li>
                <Link href="/service" className="hover:text-white transition-colors">
                  Rasmiy kafolat & Servis
                </Link>
              </li>
              <li>
                <Link href="/contacts" className="hover:text-white transition-colors">
                  Dilerlik manzili va xarita
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="text-slate-600 hover:text-slate-400 transition-colors">
                  Admin Panelga kirish
                </Link>
              </li>
            </ul>
          </div>

          {/* COL 4: ALOQA VA SHOWROOM */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Dilerlik Aloqasi</h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                <span className="leading-snug text-slate-300">{settings.showroom_address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-sky-500 shrink-0" />
                <a href={`tel:${settings.primary_phone}`} className="hover:text-white font-medium text-slate-200">
                  {formatPhoneNumber(settings.primary_phone)}
                </a>
              </li>
              {settings.secondary_phone && (
                <li className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-slate-600 shrink-0" />
                  <a href={`tel:${settings.secondary_phone}`} className="hover:text-white text-slate-400">
                    {formatPhoneNumber(settings.secondary_phone)}
                  </a>
                </li>
              )}
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-sky-500 shrink-0" />
                <a href={`mailto:${settings.contact_email}`} className="hover:text-white text-slate-300">
                  {settings.contact_email}
                </a>
              </li>
              <li className="flex items-start gap-2.5 pt-1">
                <Clock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <span className="text-slate-400">{settings.working_hours}</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Zeekr Uzbekistan. Barcha huquqlar himoyalangan.</p>
          <p className="text-[11px] text-slate-600">
            Dizayn va arxitektura: Nordic Minimalist Standard
          </p>
        </div>
      </div>
    </footer>
  );
}
