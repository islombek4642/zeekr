import { prisma } from '@/lib/prisma';
import { getSiteSettings } from '@/lib/settings';
import { formatPhoneNumber, formatCurrencyUZS } from '@/lib/utils';
import Link from 'next/link';
import {
  Users,
  Car,
  Package,
  TrendingUp,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default async function AdminDashboardPage() {
  const [
    totalLeads,
    newLeads,
    inStockCount,
    inTransitCount,
    recentLeads,
    settings,
  ] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { status: 'NEW' } }),
    prisma.inventoryItem.count({ where: { status: 'IN_STOCK' } }),
    prisma.inventoryItem.count({ where: { status: 'IN_TRANSIT' } }),
    prisma.lead.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        model: true,
        inventoryItem: {
          include: { trim: true },
        },
      },
    }),
    getSiteSettings(),
  ]);

  const stats = [
    {
      label: 'Yangi arizalar',
      value: newLeads,
      icon: AlertCircle,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      description: 'Zudlik bilan bog’lanish zarur',
    },
    {
      label: 'Jami arizalar',
      value: totalLeads,
      icon: Users,
      color: 'text-sky-600 bg-sky-50 border-sky-200',
      description: 'Barcha test-drayv va bronlar',
    },
    {
      label: 'Salonda tayyor',
      value: inStockCount,
      icon: Package,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      description: 'Toshkent shou-rumida mavjud',
    },
    {
      label: 'Yo’lda kelayotgan',
      value: inTransitCount,
      icon: Car,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      description: '10-15 kunda yetib keladi',
    },
  ];

  return (
    <div className="space-y-8">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Boshqaruv Paneli
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Dilerlik markazining joriy ko&apos;rsatkichlari va so&apos;nggi arizalar
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-mono">
            <span className="text-slate-400">USD kursi: </span>
            <span className="font-bold text-slate-900">
              {settings.usd_to_uzs_rate.toLocaleString()} so&apos;m
            </span>
          </div>
          <Link
            href="/admin/leads"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold tracking-wider uppercase transition-all shadow-sm"
          >
            Arizalar CRM
          </Link>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {s.label}
                </span>
                <div className={`p-2 rounded-xl border ${s.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-black text-slate-900 tracking-tight">
                  {s.value}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  {s.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* RECENT LEADS SECTION */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              So&apos;nggi tushgan arizalar
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Sayt orqali yuborilgan oxirgi 5 ta murojaat
            </p>
          </div>
          <Link
            href="/admin/leads"
            className="text-xs font-semibold text-slate-900 hover:text-slate-600 flex items-center gap-1 transition-colors"
          >
            Barchasini ko&apos;rish <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentLeads.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            Hozircha arizalar mavjud emas.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3">Mijoz</th>
                  <th className="px-5 py-3">Telefon</th>
                  <th className="px-5 py-3">Ariza turi</th>
                  <th className="px-5 py-3">Model</th>
                  <th className="px-5 py-3">Vaqt</th>
                  <th className="px-5 py-3">Holat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentLeads.map((lead) => {
                  const isNew = lead.status === 'NEW';
                  return (
                    <tr key={lead.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-slate-900">
                        {lead.fullName}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-slate-600">
                        <a href={`tel:${lead.phone}`} className="hover:underline">
                          {formatPhoneNumber(lead.phone)}
                        </a>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          {lead.type === 'TEST_DRIVE' ? 'Test-drayv' : lead.type === 'CAR_RESERVE' ? 'Bron qilish' : 'Konsultatsiya'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-800">
                        {lead.model?.name || lead.inventoryItem?.trim.name || 'Umumiy'}
                      </td>
                      <td className="px-5 py-3.5 text-slate-400">
                        {new Date(lead.createdAt).toLocaleDateString('uz-UZ', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isNew
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isNew ? 'Yangi' : lead.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
