'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Car,
  Package,
  Settings,
  ExternalLink,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { logoutAdminAction } from '@/app/actions/authActions';

const NAV_ITEMS = [
  { label: 'Umumiy ko’rinish', href: '/admin', icon: LayoutDashboard },
  { label: 'Arizalar CRM', href: '/admin/leads', icon: Users },
  { label: 'Modellar katalogi', href: '/admin/cars', icon: Car },
  { label: 'Ombor & Mashinalar', href: '/admin/inventory', icon: Package },
  { label: 'Sayt sozlamalari', href: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-950 text-slate-300 flex flex-col justify-between border-r border-slate-900 shrink-0 min-h-screen">
      <div>
        {/* BRAND */}
        <div className="p-6 border-b border-slate-900">
          <Link href="/admin" className="block">
            <span className="text-xl font-black tracking-widest text-white uppercase block">
              ZEEKR
            </span>
            <span className="text-[10px] font-mono tracking-wider text-emerald-400 uppercase font-semibold flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-3 h-3" /> Management CRM
            </span>
          </Link>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="p-4 space-y-1.5">
          <div className="text-[10px] uppercase font-bold text-slate-500 px-3 mb-2">
            Asosiy Bo&apos;limlar
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="p-4 border-t border-slate-900 space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5" /> Saytni ko&apos;rish
          </span>
          <span className="text-[10px] bg-slate-900 px-1.5 py-0.5 rounded text-slate-500 font-mono">
            /
          </span>
        </Link>

        <form action={logoutAdminAction}>
          <button
            type="submit"
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Chiqish</span>
          </button>
        </form>
      </div>
    </aside>
  );
}

