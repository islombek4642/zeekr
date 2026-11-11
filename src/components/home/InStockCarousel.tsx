import Link from 'next/link';
import { ArrowRight, CheckCircle2, Shield } from 'lucide-react';
import { formatCurrencyUSD, formatCurrencyUZS } from '@/lib/utils';

interface InStockCarouselProps {
  items: Array<{
    id: string;
    vinOrCode: string | null;
    exteriorColor: string;
    interiorColor: string;
    year: number;
    status: string;
    priceUSD: number;
    images: string[];
    trim: {
      name: string;
      model: {
        name: string;
        slug: string;
      };
    };
  }>;
  rate: number;
}

export function InStockCarousel({ items, rate }: InStockCarouselProps) {
  if (items.length === 0) return null;

  return (
    <section className="py-20 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="text-xs uppercase font-bold tracking-widest text-emerald-600 mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Ombordagi Avtomobillar
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Toshkent Showroomida Mavjud
            </h2>
          </div>
          <Link
            href="/inventory"
            className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700"
          >
            Barcha mashinalarni ko&apos;rish
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="relative aspect-[16/10] bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.images[0] || 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80'}
                  alt={item.trim.model.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  Salonda bor
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">
                    {item.trim.model.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {item.trim.name} • {item.year}
                  </p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1">
                      Rang: <b>{item.exteriorColor}</b>
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      Salon: <b>{item.interiorColor}</b>
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-base font-black text-slate-900">
                      {formatCurrencyUSD(item.priceUSD)}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {formatCurrencyUZS(item.priceUSD, rate)}
                    </div>
                  </div>

                  <Link
                    href={`/inventory?reserve=${item.id}`}
                    className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
                  >
                    Bron qilish
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

