import { Metadata } from 'next';
import { getInventoryCatalogData } from '@/lib/data-provider';
import { getSiteSettings } from '@/lib/settings';
import { getCurrentLocale, getTranslations } from '@/lib/i18n';
import { InventoryCatalog } from '@/components/inventory/InventoryCatalog';
import { ShieldCheck, MapPin } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Mavjud Avtomobillar Saloni — Zeekr Uzbekistan',
  description: 'Toshkent shou-rumida tayyor turgan va yo’lda kelayotgan rasmiy Zeekr avtomobillari. Shaffof narxlar, texnik ko’rsatkichlar va onlayn bron qilish.',
};

interface InventoryPageProps {
  searchParams: Promise<{ reserve?: string; model?: string }>;
}

export default async function InventoryPage({ searchParams }: InventoryPageProps) {
  const resolvedParams = await searchParams;
  const [settings, { items, models }, locale] = await Promise.all([
    getSiteSettings(),
    getInventoryCatalogData(),
    getCurrentLocale(),
  ]);

  const t = getTranslations(locale);
  const usdRate = settings.usd_to_uzs_rate || 12850;

  return (
    <main className="min-h-screen bg-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER SECTION */}
        <div className="mb-10 text-left border-b border-slate-100 pb-8">
          <div className="flex items-center gap-2 text-emerald-600 text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>{t.inventory.badge}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            {t.inventory.title}
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-3">
            <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
              {t.inventory.subtitle}
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 shrink-0">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{settings.showroom_address || "Toshkent shahri"}</span>
            </div>
          </div>
        </div>

        {/* INTERACTIVE CATALOG */}
        <InventoryCatalog
          initialItems={items}
          models={models}
          usdRate={usdRate}
          initialReserveId={resolvedParams?.reserve}
          initialModelSlug={resolvedParams?.model}
        />

      </div>
    </main>
  );
}
