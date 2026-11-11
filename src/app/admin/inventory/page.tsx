import { prisma } from '@/lib/prisma';
import { getSiteSettings } from '@/lib/settings';
import { InventoryTable } from '@/components/admin/InventoryTable';
import Link from 'next/link';
import { Plus, Package } from 'lucide-react';

export default async function AdminInventoryPage() {
  const [items, settings] = await Promise.all([
    prisma.inventoryItem.findMany({
      include: {
        trim: {
          include: {
            model: {
              select: {
                name: true,
                mainImage: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    getSiteSettings(),
  ]);

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Ombordagi Mashinalar Boshqaruvi
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Salonda mavjud, yo&apos;lda kelayotgan va zaxiradagi real avtomobillar ro&apos;yxati
          </p>
        </div>
        <Link
          href="/admin/inventory/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold tracking-wider uppercase shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Mashina qo&apos;shish</span>
        </Link>
      </div>

      <InventoryTable
        initialItems={items as any}
        usdRate={settings.usd_to_uzs_rate}
      />

    </div>
  );
}
