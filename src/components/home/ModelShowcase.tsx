import Link from 'next/link';
import { ArrowRight, Gauge, BatteryCharging, Zap } from 'lucide-react';
import { formatCurrencyUSD, formatCurrencyUZS } from '@/lib/utils';

interface ModelShowcaseProps {
  models: Array<{
    id: string;
    slug: string;
    name: string;
    tagline: string;
    basePriceUSD: number;
    acceleration0100: number;
    rangeKm: number;
    batteryKwh: number;
    mainImage: string;
  }>;
  rate: number;
}

export function ModelShowcase({ models, rate }: ModelShowcaseProps) {
  return (
    <section id="models" className="py-24 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* SECTION HEADER */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="text-xs uppercase font-bold tracking-widest text-sky-600">
            Modellar Qatori
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            O&apos;zingizga Mos Zeekr Modelini Tanlang
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Har bir Zeekr modeli shaxsiy qulaylik, sport dinamikasi va ilg&apos;or avtopilot tizimi bilan jihozlangan.
          </p>
        </div>

        {/* MODELS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {models.map((model) => (
            <div
              key={model.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col group"
            >
              {/* IMAGE */}
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={model.mainImage}
                  alt={model.name}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-slate-950/70 backdrop-blur text-[10px] font-semibold text-white uppercase tracking-wider">
                  EV
                </div>
              </div>

              {/* BODY */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                    {model.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                    {model.tagline}
                  </p>
                </div>

                {/* KEY SPECS */}
                <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 text-center">
                  <div>
                    <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400">
                      <Gauge className="w-3 h-3 text-slate-400" />
                      0-100
                    </div>
                    <div className="text-xs font-bold text-slate-900 mt-0.5">
                      {model.acceleration0100} s
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400">
                      <Zap className="w-3 h-3 text-slate-400" />
                      Masofa
                    </div>
                    <div className="text-xs font-bold text-slate-900 mt-0.5">
                      {model.rangeKm} km
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400">
                      <BatteryCharging className="w-3 h-3 text-slate-400" />
                      Batareya
                    </div>
                    <div className="text-xs font-bold text-slate-900 mt-0.5">
                      {model.batteryKwh} kVt
                    </div>
                  </div>
                </div>

                {/* PRICE & BUTTON */}
                <div className="space-y-3 pt-1">
                  <div>
                    <div className="text-[11px] text-slate-500 font-medium">Boshlang&apos;ich narx:</div>
                    <div className="text-lg font-black text-slate-900">
                      {formatCurrencyUSD(model.basePriceUSD)}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {formatCurrencyUZS(model.basePriceUSD, rate)}
                    </div>
                  </div>

                  <Link
                    href={`/models/${model.slug}`}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-lg bg-slate-100 hover:bg-slate-900 text-slate-900 hover:text-white font-semibold text-xs transition-colors"
                  >
                    Batafsil & Narxlar
                    <ArrowRight className="w-3.5 h-3.5" />
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

