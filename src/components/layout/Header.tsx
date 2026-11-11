import Link from 'next/link';
import { Phone, Calendar } from 'lucide-react';
import { MobileMenu } from './MobileMenu';
import { getSiteSettings } from '@/lib/settings';
import { formatPhoneNumber } from '@/lib/utils';

export async function Header() {
  const settings = await getSiteSettings();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-xl sm:text-2xl font-black tracking-widest text-slate-950 uppercase group-hover:text-sky-600 transition-colors">
            ZEEKR
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
            Uzbekistan
          </span>
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-700">
          <Link href="/#models" className="hover:text-slate-950 transition-colors">
            Modellar
          </Link>
          <Link href="/inventory" className="hover:text-slate-950 transition-colors">
            Mavjud avtomobillar
          </Link>
          <Link href="/test-drive" className="hover:text-slate-950 transition-colors">
            Test-drayv
          </Link>
          <Link href="/service" className="hover:text-slate-950 transition-colors">
            Servis va Kafolat
          </Link>
          <Link href="/contacts" className="hover:text-slate-950 transition-colors">
            Kontaktlar
          </Link>
        </nav>

        {/* ACTIONS */}
        <div className="hidden md:flex items-center gap-4">
          <a
            href={`tel:${settings.primary_phone}`}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-950 py-1.5 px-3 rounded-md hover:bg-slate-50 transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-sky-600" />
            {formatPhoneNumber(settings.primary_phone)}
          </a>
          <Link
            href="/test-drive"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-md bg-slate-950 text-white hover:bg-slate-800 transition-all shadow-sm"
          >
            <Calendar className="w-3.5 h-3.5" />
            Test-drayv
          </Link>
        </div>

        {/* MOBILE MENU TOGGLE */}
        <MobileMenu primaryPhone={settings.primary_phone} />
      </div>
    </header>
  );
}

