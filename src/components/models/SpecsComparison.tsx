'use client';

import { useState } from 'react';
import {
  Gauge,
  Zap,
  BatteryCharging,
  Shield,
  Activity,
  Clock,
  ArrowRightLeft,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  X,
} from 'lucide-react';

interface CarModelSpecs {
  name: string;
  acceleration0100: number;
  rangeKm: number;
  batteryKwh: number;
  powerHp: number;
  topSpeedKmH: number;
  chargingTimeMin: number;
}

const ALL_MODELS_SPECS: Array<CarModelSpecs & { slug: string; priceUSD: number }> = [
  { slug: 'zeekr-9x', name: 'Zeekr 9X', acceleration0100: 3.1, rangeKm: 800, batteryKwh: 140, powerHp: 780, topSpeedKmH: 220, chargingTimeMin: 18, priceUSD: 89000 },
  { slug: 'zeekr-8x', name: 'Zeekr 8X', acceleration0100: 3.8, rangeKm: 1000, batteryKwh: 55, powerHp: 650, topSpeedKmH: 215, chargingTimeMin: 20, priceUSD: 58000 },
  { slug: 'zeekr-8x-yaoying', name: 'Zeekr 8X Yaoying', acceleration0100: 3.5, rangeKm: 1000, batteryKwh: 55, powerHp: 720, topSpeedKmH: 225, chargingTimeMin: 20, priceUSD: 68000 },
  { slug: 'zeekr-7x', name: 'Zeekr 7X', acceleration0100: 3.8, rangeKm: 780, batteryKwh: 100, powerHp: 646, topSpeedKmH: 210, chargingTimeMin: 15, priceUSD: 39500 },
  { slug: 'zeekr-x', name: 'Zeekr X', acceleration0100: 3.7, rangeKm: 560, batteryKwh: 66, powerHp: 428, topSpeedKmH: 185, chargingTimeMin: 20, priceUSD: 29500 },
  { slug: 'zeekr-001', name: 'Zeekr 001 2025', acceleration0100: 3.8, rangeKm: 750, batteryKwh: 100, powerHp: 544, topSpeedKmH: 200, chargingTimeMin: 15, priceUSD: 45000 },
  { slug: 'zeekr-001-all-new', name: 'Zeekr 001 All New 2026', acceleration0100: 3.3, rangeKm: 780, batteryKwh: 100, powerHp: 789, topSpeedKmH: 240, chargingTimeMin: 11, priceUSD: 49000 },
  { slug: 'zeekr-007', name: 'Zeekr 007', acceleration0100: 2.84, rangeKm: 870, batteryKwh: 100, powerHp: 646, topSpeedKmH: 210, chargingTimeMin: 15, priceUSD: 36500 },
  { slug: 'zeekr-007-gt', name: 'Zeekr 007 GT', acceleration0100: 2.7, rangeKm: 820, batteryKwh: 100, powerHp: 720, topSpeedKmH: 220, chargingTimeMin: 15, priceUSD: 42500 },
  { slug: 'zeekr-009', name: 'Zeekr 009', acceleration0100: 4.5, rangeKm: 822, batteryKwh: 140, powerHp: 544, topSpeedKmH: 190, chargingTimeMin: 28, priceUSD: 72000 },
];

export function SpecsComparison({ specs }: { specs: CarModelSpecs }) {
  const [compareSlug, setCompareSlug] = useState<string>('');

  const compareTarget = ALL_MODELS_SPECS.find((m) => m.slug === compareSlug);

  const specItems = [
    {
      icon: Gauge,
      label: '0–100 km/s Tezlanish',
      value: `${specs.acceleration0100} soniya`,
      desc: 'Ikki motorli elektr to‘liq uzatma tizimi',
      currentNum: specs.acceleration0100,
      targetNum: compareTarget?.acceleration0100,
      unit: 's',
      lowerIsBetter: true,
    },
    {
      icon: Zap,
      label: 'Zaxira Masofasi (CLTC)',
      value: `${specs.rangeKm} km`,
      desc: 'Bitta to‘liq quvvatlanishda bosib o‘tish masofasi',
      currentNum: specs.rangeKm,
      targetNum: compareTarget?.rangeKm,
      unit: 'km',
      lowerIsBetter: false,
    },
    {
      icon: BatteryCharging,
      label: 'Akkumulyator Sig‘imi',
      value: `${specs.batteryKwh} kVt/soat`,
      desc: 'CATL Qilin / Golden Battery litiy-ion bloklari',
      currentNum: specs.batteryKwh,
      targetNum: compareTarget?.batteryKwh,
      unit: 'kVt',
      lowerIsBetter: false,
    },
    {
      icon: Activity,
      label: 'Dvigatel Quvvati',
      value: `${specs.powerHp} ot kuchi`,
      desc: 'Yuqori samaradorlikka ega doimiy magnitli motor',
      currentNum: specs.powerHp,
      targetNum: compareTarget?.powerHp,
      unit: 'hp',
      lowerIsBetter: false,
    },
    {
      icon: Shield,
      label: 'Maksimal Tezlik',
      value: `${specs.topSpeedKmH} km/soat`,
      desc: 'Elektron cheklangan xavfsiz sport tezligi',
      currentNum: specs.topSpeedKmH,
      targetNum: compareTarget?.topSpeedKmH,
      unit: 'km/soat',
      lowerIsBetter: false,
    },
    {
      icon: Clock,
      label: 'Tezkor Zaryadlanish',
      value: `${specs.chargingTimeMin} daqiqa`,
      desc: '800V DC stansiyasida 10% dan 80% gacha',
      currentNum: specs.chargingTimeMin,
      targetNum: compareTarget?.chargingTimeMin,
      unit: 'min',
      lowerIsBetter: true,
    },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm space-y-8">
      {/* HEADER WITH COMPARISON SELECTOR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-sky-600 block">
            Texnik Imkoniyatlar & Taqqoslash
          </span>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
            {specs.name} Asosiy Xarakteristikalari
          </h3>
        </div>

        {/* COMPARISON DROPDOWN SELECTOR */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={compareSlug}
              onChange={(e) => setCompareSlug(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl py-2.5 pl-3 pr-8 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all cursor-pointer"
            >
              <option value="">Boshqa model bilan taqqoslash...</option>
              {ALL_MODELS_SPECS.filter((m) => m.name !== specs.name).map((m) => (
                <option key={m.slug} value={m.slug}>
                  {m.name} bilan taqqoslash
                </option>
              ))}
            </select>
            <ArrowRightLeft className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {compareSlug && (
            <button
              type="button"
              onClick={() => setCompareSlug('')}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Taqqosni bekor qilish"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* COMPARISON BANNER IF ACTIVE */}
      {compareTarget && (
        <div className="p-4 rounded-2xl bg-sky-50/80 border border-sky-200/80 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 font-bold text-sky-900">
            <Sparkles className="w-4 h-4 text-sky-600 shrink-0" />
            <span>
              Taqqoslanmoqda: <span className="underline">{specs.name}</span> vs{' '}
              <span className="underline">{compareTarget.name}</span>
            </span>
          </div>
          <span className="text-[11px] text-sky-700 hidden sm:inline">
            Yashil rang ustunlikni, ko&apos;k rang teng yoki yaqin ko&apos;rsatkichni bildiradi
          </span>
        </div>
      )}

      {/* SPECS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {specItems.map((item, i) => {
          const Icon = item.icon;

          // Difference calculation
          let diffBadge = null;
          if (compareTarget && item.targetNum !== undefined) {
            const diff = item.currentNum - item.targetNum;
            const isBetter = item.lowerIsBetter ? diff < 0 : diff > 0;
            const isEqual = diff === 0;

            if (isEqual) {
              diffBadge = (
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                  Bir xil
                </span>
              );
            } else {
              const sign = diff > 0 ? '+' : '';
              const diffText = `${sign}${diff.toFixed(1).replace('.0', '')} ${item.unit}`;
              diffBadge = (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isBetter
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {isBetter ? 'Ustun: ' : 'Farq: '} {diffText}
                </span>
              );
            }
          }

          return (
            <div
              key={i}
              className={`p-5 rounded-2xl transition-all ${
                compareTarget
                  ? 'bg-white border-2 border-slate-200 shadow-sm'
                  : 'bg-slate-50 border border-slate-100 hover:border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-900 flex items-center justify-center shrink-0 shadow-sm">
                  <Icon className="w-5 h-5 text-sky-600" />
                </div>
                {diffBadge}
              </div>

              <div className="space-y-1">
                <div className="text-xs text-slate-500 font-medium">{item.label}</div>
                <div className="text-lg font-bold text-slate-900">{item.value}</div>

                {compareTarget && item.targetNum !== undefined && (
                  <div className="pt-2 mt-2 border-t border-slate-100 text-xs flex items-center justify-between text-slate-500">
                    <span>{compareTarget.name}:</span>
                    <span className="font-bold text-slate-800">
                      {item.targetNum} {item.unit}
                    </span>
                  </div>
                )}

                <div className="text-[11px] text-slate-400 leading-snug pt-1">{item.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
