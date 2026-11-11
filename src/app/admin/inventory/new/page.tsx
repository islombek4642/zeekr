import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { InventoryFormClient } from '@/components/admin/InventoryFormClient';

export const dynamic = 'force-dynamic';

export default async function AdminNewInventoryPage() {
  let models: any[] = [];
  try {
    models = await prisma.carModel.findMany({
      where: { isActive: true },
      include: {
        trims: true,
        colors: true,
      },
      orderBy: { orderIndex: 'asc' },
    });
  } catch (err) {
    console.error('Error fetching models for new inventory:', err);
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/inventory"
          className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Omborga Yangi Avtomobil Kiritish
          </h1>
          <p className="text-xs text-slate-500">
            Salonga kelgan yoki yo&apos;ldagi aniq mashinani VIN kodi va ranglari bilan biriktirish
          </p>
        </div>
      </div>

      <InventoryFormClient models={models as any} />
    </div>
  );
}
