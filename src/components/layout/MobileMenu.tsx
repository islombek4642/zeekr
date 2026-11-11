'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Phone, Calendar } from 'lucide-react';
import { formatPhoneNumber } from '@/lib/utils';

interface MobileMenuProps {
  primaryPhone: string;
}

export function MobileMenu({ primaryPhone }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-slate-800 hover:text-slate-950 focus:outline-none"
        aria-label="Menyu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {isOpen && (
        <div className="fixed inset-x-0 top-16 bg-white/95 backdrop-blur-xl border-b border-slate-200 p-6 shadow-xl z-50 flex flex-col gap-4 animate-in fade-in slide-in-from-top-4">
          <nav className="flex flex-col gap-4 text-base font-medium text-slate-800">
            <Link
              href="/#models"
              onClick={() => setIsOpen(false)}
              className="hover:text-sky-600 transition-colors py-1"
            >
              Modellar
            </Link>
            <Link
              href="/inventory"
              onClick={() => setIsOpen(false)}
              className="hover:text-sky-600 transition-colors py-1"
            >
              Mavjud avtomobillar
            </Link>
            <Link
              href="/test-drive"
              onClick={() => setIsOpen(false)}
              className="hover:text-sky-600 transition-colors py-1"
            >
              Test-drayv
            </Link>
            <Link
              href="/service"
              onClick={() => setIsOpen(false)}
              className="hover:text-sky-600 transition-colors py-1"
            >
              Servis va Kafolat
            </Link>
            <Link
              href="/contacts"
              onClick={() => setIsOpen(false)}
              className="hover:text-sky-600 transition-colors py-1"
            >
              Kontaktlar
            </Link>
          </nav>

          <div className="pt-4 border-t border-slate-200 flex flex-col gap-3">
            <a
              href={`tel:${primaryPhone}`}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-slate-100 text-slate-900 font-semibold text-sm hover:bg-slate-200 transition-colors"
            >
              <Phone className="w-4 h-4 text-sky-600" />
              {formatPhoneNumber(primaryPhone)}
            </a>
            <Link
              href="/test-drive"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-slate-950 text-white font-semibold text-sm hover:bg-slate-800 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              Test-drayvga yozilish
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

