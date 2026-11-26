'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Gauge,
  BatteryCharging,
  Zap,
  SlidersHorizontal,
  Scale,
  X,
  Check,
  CheckCircle2,
  Sparkles,
  Info,
} from 'lucide-react';
import { formatCurrencyUSD, formatCurrencyUZS } from '@/lib/utils';
import { CarImage } from '@/components/ui/CarImage';

interface ModelItem {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  basePriceUSD: number;
  acceleration0100: number;
  rangeKm: number;
  batteryKwh: number;
  mainImage: string;
}

interface ModelShowcaseProps {
  models: ModelItem[];
  rate: number;
}

// Category mapping helper
function getModelCategory(slug: string): 'suv' | 'shooting-brake' | 'sedan' | 'mpv' {
  if (slug === 'zeekr-007') return 'sedan';
  if (slug === 'zeekr-009') return 'mpv';
  if (slug.includes('001') || slug.includes('007-gt')) return 'shooting-brake';
  return 'suv';
}

function getModelDrive(slug: string): 'awd' | 'rwd' {
  if (slug === 'zeekr-007') return 'rwd';
  return 'awd';
}

export function ModelShowcase({ models, rate }: ModelShowcaseProps) {
  const [activeCategory, setActiveCategory] = useState<'all' | 'suv' | 'shooting-brake' | 'sedan' | 'mpv'>('all');
  const [activeDrive, setActiveDrive] = useState<'all' | 'awd' | 'rwd'>('all');
  const [compareSlugs, setCompareSlugs] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    return {
      all: models.length,
      suv: models.filter((m) => getModelCategory(m.slug) === 'suv').length,
      'shooting-brake': models.filter((m) => getModelCategory(m.slug) === 'shooting-brake').length,
      sedan: models.filter((m) => getModelCategory(m.slug) === 'sedan').length,
      mpv: models.filter((m) => getModelCategory(m.slug) === 'mpv').length,
    };
  }, [models]);

  // Filtered models
  const filteredModels = useMemo(() => {
    return models.filter((model) => {
      const cat = getModelCategory(model.slug);
      const drive = getModelDrive(model.slug);

      if (activeCategory !== 'all' && cat !== activeCategory) return false;
      if (activeDrive !== 'all' && drive !== activeDrive) return false;
      return true;
    });
  }, [models, activeCategory, activeDrive]);

  // Toggle compare selection
  const toggleCompare = (slug: string) => {
    setCompareSlugs((prev) => {
      if (prev.includes(slug)) {
        return prev.filter((s) => s !== slug);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), slug];
      }
      return [...prev, slug];
    });
  };

  const comparedModels = useMemo(() => {
    return models.filter((m) => compareSlugs.includes(m.slug));
  }, [models, compareSlugs]);

  return (
    <section id="models" className="py-24 bg-slate-50 border-b border-slate-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* SECTION HEADER */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs uppercase font-bold tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-sky-500" />
            Rasmiy Modellar Qatori
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            O&apos;zingizga Mos Zeekr Modelini Tanlang
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Barcha modellar studio xolis dizaynida, rasmiy O&apos;zbekiston dilerlik kafolati va to&apos;liq servis ko&apos;magi bilan taqdim etiladi.
          </p>
        </div>

        {/* INTERACTIVE FILTERS BAR */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10 pb-6 border-b border-slate-200/80">
          
          {/* CATEGORY PILLS */}
          <div className="flex items-center flex-wrap gap-2 w-full md:w-auto">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeCategory === 'all'
                  ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Barchasi ({categoryCounts.all})
            </button>
            <button
              onClick={() => setActiveCategory('suv')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeCategory === 'suv'
                  ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              SUV & Krossover ({categoryCounts.suv})
            </button>
            <button
              onClick={() => setActiveCategory('shooting-brake')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeCategory === 'shooting-brake'
                  ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Shooting Brake & GT ({categoryCounts['shooting-brake']})
            </button>
            <button
              onClick={() => setActiveCategory('sedan')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeCategory === 'sedan'
                  ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Sedan ({categoryCounts.sedan})
            </button>
            <button
              onClick={() => setActiveCategory('mpv')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeCategory === 'mpv'
                  ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              MPV ({categoryCounts.mpv})
            </button>
          </div>

          {/* SECONDARY QUICK FILTER: DRIVE TYPE */}
          <div className="flex items-center gap-2 text-xs font-medium self-end md:self-auto">
            <span className="text-slate-400 flex items-center gap-1 hidden sm:inline-flex">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              Privod:
            </span>
            <div className="bg-white border border-slate-200 rounded-xl p-1 flex items-center gap-1">
              <button
                onClick={() => setActiveDrive('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeDrive === 'all'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Barchasi
              </button>
              <button
                onClick={() => setActiveDrive('awd')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeDrive === 'awd'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                AWD (To&apos;liq)
              </button>
              <button
                onClick={() => setActiveDrive('rwd')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeDrive === 'rwd'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                RWD (Orqa)
              </button>
            </div>
          </div>

        </div>

        {/* MODELS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredModels.map((model) => {
            const isCompared = compareSlugs.includes(model.slug);
            const category = getModelCategory(model.slug);
            const categoryLabel =
              category === 'suv'
                ? 'SUV'
                : category === 'shooting-brake'
                ? 'Shooting Brake'
                : category === 'sedan'
                ? 'Sedan'
                : 'Luxury MPV';

            return (
              <div
                key={model.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col h-full justify-between group hover:-translate-y-1"
              >
                {/* Rigid Image Container with Studio Background & Clean Contrast */}
                <div className="relative w-full aspect-[16/10] overflow-hidden bg-slate-100 shrink-0">
                  <CarImage
                    src={model.mainImage}
                    alt={model.name}
                    className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded bg-slate-950/75 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider">
                      EV
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-900/60 backdrop-blur-md text-[10px] font-semibold text-slate-200">
                      {categoryLabel}
                    </span>
                  </div>

                  {/* TAQQOSLASH (COMPARE) TOGGLE BUTTON */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleCompare(model.slug);
                    }}
                    title={isCompared ? "Taqqoslashdan chiqarish" : "Taqqoslashga qo'shish"}
                    className={`absolute top-3 right-3 p-1.5 rounded-lg text-xs font-semibold backdrop-blur-md transition-all ${
                      isCompared
                        ? 'bg-sky-600 text-white shadow-md'
                        : 'bg-white/80 text-slate-700 hover:bg-white border border-slate-200/50 hover:text-sky-600'
                    }`}
                  >
                    <Scale className="w-3.5 h-3.5" />
                  </button>
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
                  <div className="space-y-3 pt-1 mt-auto">
                    <div>
                      <div className="text-[11px] text-slate-500 font-medium">Boshlang&apos;ich narx:</div>
                      <div className="text-lg font-black text-slate-900">
                        {formatCurrencyUSD(model.basePriceUSD)}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {formatCurrencyUZS(model.basePriceUSD, rate)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/models/${model.slug}`}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-lg bg-slate-100 hover:bg-slate-900 text-slate-900 hover:text-white font-semibold text-xs transition-colors"
                      >
                        Batafsil & Narxlar
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => toggleCompare(model.slug)}
                        title={isCompared ? "Taqqoslashdan chiqarish" : "Taqqoslash"}
                        className={`p-2.5 rounded-lg text-xs font-semibold border transition-all ${
                          isCompared
                            ? 'bg-sky-50 border-sky-300 text-sky-700'
                            : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        <Scale className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* FLOATING COMPARE DOCK */}
        {compareSlugs.length > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 shadow-2xl rounded-2xl p-4 flex items-center gap-4 text-white animate-in fade-in slide-in-from-bottom-6 duration-300 max-w-xl w-[90vw]">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                <Scale className="w-4 h-4" />
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-white">
                  Taqqoslash ({compareSlugs.length}/3 model)
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  {comparedModels.map((m) => m.name).join(', ')}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsCompareModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-sky-500/20"
              >
                Taqqosni ko&apos;rish
              </button>
              <button
                type="button"
                onClick={() => setCompareSlugs([])}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Barchasini bekor qilish"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* SIDE-BY-SIDE COMPARISON MODAL */}
        {isCompareModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs uppercase font-bold tracking-wider text-sky-600 block">
                    Modellar Taqqoslovi
                  </span>
                  <h3 className="text-2xl font-black text-slate-900 mt-0.5">
                    Texnik Imkoniyatlar Taqqoslovi
                  </h3>
                </div>
                <button
                  onClick={() => setIsCompareModalOpen(false)}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* TABLE MATRIX */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="py-4 px-4 text-xs font-semibold text-slate-400 uppercase w-1/4">
                        Xarakteristika
                      </th>
                      {comparedModels.map((m) => (
                        <th key={m.slug} className="py-4 px-4 text-center">
                          <div className="text-base font-extrabold text-slate-900">{m.name}</div>
                          <div className="text-xs font-bold text-sky-600 mt-1">
                            {formatCurrencyUSD(m.basePriceUSD)}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {/* Acceleration */}
                    <tr>
                      <td className="py-3 px-4 font-medium text-slate-500">0–100 km/s Tezlanish</td>
                      {comparedModels.map((m) => (
                        <td key={m.slug} className="py-3 px-4 text-center font-bold text-slate-900">
                          {m.acceleration0100} s
                        </td>
                      ))}
                    </tr>
                    {/* Range */}
                    <tr>
                      <td className="py-3 px-4 font-medium text-slate-500">Zaxira Masofasi (CLTC)</td>
                      {comparedModels.map((m) => (
                        <td key={m.slug} className="py-3 px-4 text-center font-bold text-slate-900">
                          {m.rangeKm} km
                        </td>
                      ))}
                    </tr>
                    {/* Battery */}
                    <tr>
                      <td className="py-3 px-4 font-medium text-slate-500">Batareya Sig&apos;imi</td>
                      {comparedModels.map((m) => (
                        <td key={m.slug} className="py-3 px-4 text-center font-bold text-slate-900">
                          {m.batteryKwh} kVt/soat
                        </td>
                      ))}
                    </tr>
                    {/* Price UZS */}
                    <tr>
                      <td className="py-3 px-4 font-medium text-slate-500">O&apos;zbek so&apos;mida narx</td>
                      {comparedModels.map((m) => (
                        <td key={m.slug} className="py-3 px-4 text-center font-medium text-slate-600 text-xs">
                          {formatCurrencyUZS(m.basePriceUSD, rate)}
                        </td>
                      ))}
                    </tr>
                    {/* Action */}
                    <tr>
                      <td className="py-4 px-4"></td>
                      {comparedModels.map((m) => (
                        <td key={m.slug} className="py-4 px-4 text-center">
                          <Link
                            href={`/models/${m.slug}`}
                            onClick={() => setIsCompareModalOpen(false)}
                            className="inline-flex items-center justify-center gap-1 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors"
                          >
                            Sahifaga o&apos;tish
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        )}

      </div>
    </section>
  );
}
