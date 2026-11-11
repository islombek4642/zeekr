import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Plus, Car, Zap, Check, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { formatCurrencyUSD } from '@/lib/utils';
import { toggleCarModelActiveAction } from '@/app/actions/adminCarActions';

export const dynamic = 'force-dynamic';

export default async function AdminCarsPage() {
  let models: any[] = [];
  try {
    models = await prisma.carModel.findMany({
      include: {
        trims: true,
        colors: true,
        _count: {
          select: { leads: true },
        },
      },
      orderBy: {
        orderIndex: 'asc',
      },
    });
  } catch (err) {
    console.error('Error fetching admin cars:', err);
  }

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Modellar Katalogi
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Sayt vitrinasidagi Zeekr elektromobillari modellari va komplektatsiyalari
          </p>
        </div>
        <Link
          href="/admin/cars/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold tracking-wider uppercase shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi model qo&apos;shish</span>
        </Link>
      </div>

      {/* MODELS LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {models.map((model) => (
          <div
            key={model.id}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="aspect-[16/9] bg-slate-100 relative overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={model.mainImage}
                  alt={model.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md shadow-sm ${
                      model.isActive
                        ? 'bg-emerald-500/90 text-white'
                        : 'bg-slate-700/90 text-slate-300'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    {model.isActive ? 'Faol (Saytda ko’rinadi)' : 'Nofaol (Yashiringan)'}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-black/60 text-white backdrop-blur-md">
                    slug: /{model.slug}
                  </span>
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {model.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{model.tagline}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-slate-900">
                      {formatCurrencyUSD(model.basePriceUSD)}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-normal">boshlang&apos;ich narx</span>
                  </div>
                </div>

                {/* SPECS ROW */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs py-3 border-y border-slate-100 my-3 font-mono">
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <div className="font-bold text-slate-900">{model.acceleration0100}s</div>
                    <div className="text-[10px] text-slate-400">0-100 km/s</div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <div className="font-bold text-slate-900">{model.rangeKm} km</div>
                    <div className="text-[10px] text-slate-400">Masofa</div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <div className="font-bold text-slate-900">{model.powerHp} ot kuchi</div>
                    <div className="text-[10px] text-slate-400">Quvvat</div>
                  </div>
                </div>

                {/* TRIMS & COLORS BADGES */}
                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span>
                    Komplektatsiyalar: <strong className="text-slate-800">{model.trims.length} ta</strong>
                  </span>
                  <span>
                    Ranglar: <strong className="text-slate-800">{model.colors.length} xil</strong>
                  </span>
                  <span>
                    Arizalar: <strong className="text-slate-800">{model._count.leads} ta</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* ACTION FOOTER */}
            <div className="p-5 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between">
              <Link
                href={`/models/${model.slug}`}
                target="_blank"
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors"
              >
                Vitrinada ko&apos;rish
              </Link>
              <form
                action={async () => {
                  'use server';
                  await toggleCarModelActiveAction(model.id, !model.isActive);
                }}
              >
                <button
                  type="submit"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    model.isActive
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {model.isActive ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" /> Yashirish
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" /> Faollashtirish
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
