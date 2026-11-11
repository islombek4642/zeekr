import { prisma } from '@/lib/prisma';
import { LeadTable } from '@/components/admin/LeadTable';
import { Users, Filter } from 'lucide-react';

export default async function AdminLeadsPage() {
  const leads = await prisma.lead.findMany({
    include: {
      model: {
        select: {
          name: true,
        },
      },
      inventoryItem: {
        include: {
          trim: {
            include: {
              model: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Arizalar & Leads CRM
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Test-drayv, avtomobil bron qilish va konsultatsiya so&apos;rovlari voronkasi
          </p>
        </div>
        <div className="text-xs text-slate-500 font-mono bg-white px-3.5 py-1.5 rounded-xl border border-slate-200">
          Jami: <strong className="text-slate-900">{leads.length}</strong> ta ariza
        </div>
      </div>

      {/* INTERACTIVE TABLE */}
      <LeadTable initialLeads={leads as any} />

    </div>
  );
}
