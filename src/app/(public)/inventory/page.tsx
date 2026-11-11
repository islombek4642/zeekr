import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { getSiteSettings } from '@/lib/settings';
import { InventoryCatalog } from '@/components/inventory/InventoryCatalog';
import { ShieldCheck, MapPin } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Mavjud Avtomobillar Saloni — Zeekr Uzbekistan',
  description: 'Toshkent shou-rumida tayyor turgan va yo’lda kelayotgan rasmiy Zeekr avtomobillari. Shaffof narxlar, texnik ko’rsatkichlar va onlayn bron qilish.',
};

export default async function InventoryPage() {
  let items: any[] = [];
  let models: any[] = [];
  let settings = await getSiteSettings();

  try {
    const [fetchedItems, fetchedModels] = await Promise.all([
      prisma.inventoryItem.findMany({
        where: {
          status: { in: ['IN_STOCK', 'IN_TRANSIT'] },
        },
        include: {
          trim: {
            include: {
              model: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.carModel.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          slug: true,
        },
        orderBy: {
          orderIndex: 'asc',
        },
      }),
    ]);
    items = fetchedItems;
    models = fetchedModels;
  } catch (err) {
    console.error('Error fetching inventory items from database:', err);
  }

  const usdRate = settings.usd_to_uzs_rate || 12850;

  // Format data for client component
  const formattedItems = items.map((item) => ({
    id: item.id,
    vinOrCode: item.vinOrCode,
    year: item.year,
    exteriorColor: item.exteriorColor,
    interiorColor: item.interiorColor,
    status: item.status,
    priceUSD: item.priceUSD,
    images: item.images,
    trim: {
      id: item.trim.id,
      name: item.trim.name,
      driveType: item.trim.driveType,
      rangeKm: item.trim.rangeKm,
      acceleration: item.trim.acceleration,
      model: {
        id: item.trim.model.id,
        name: item.trim.model.name,
        slug: item.trim.model.slug,
        mainImage: item.trim.model.mainImage,
      },
    },
  }));

  return (
    <main className="min-h-screen bg-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER SECTION */}
        <div className="mb-10 text-left border-b border-slate-100 pb-8">
          <div className="flex items-center gap-2 text-emerald-600 text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Rasmiy Dilerlik Ombori & Vitrina</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            Mavjud Avtomobillar
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-3">
            <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
              Toshkent ko&apos;rgazma zalida tayyor turgan yoki qisqa muddatda yetib keladigan rasmiy kafolatli Zeekr elektromobillari.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 shrink-0">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{settings.showroom_address || "Toshkent shahri"}</span>
            </div>
          </div>
        </div>

        {/* INTERACTIVE CATALOG */}
        <InventoryCatalog
          initialItems={formattedItems}
          models={models}
          usdRate={usdRate}
        />

      </div>
    </main>
  );
}
