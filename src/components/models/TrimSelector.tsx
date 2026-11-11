'use client';

import { Check, Zap, Gauge } from 'lucide-react';
import { formatCurrencyUSD, formatCurrencyUZS } from '@/lib/utils';

interface CarTrim {
  id: string;
  name: string;
  priceUSD: number;
  driveType: string;
  rangeKm: number;
  acceleration: number;
  features: string[];
}

interface TrimSelectorProps {
  trims: CarTrim[];
  selectedTrim: CarTrim;
  onSelectTrim: (trim: CarTrim) => void;
  rate: number;
}

export function TrimSelector({ trims, selectedTrim, onSelectTrim, rate }: TrimSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900">
          Komplektatsiyani Tanlang:
        </h4>
        <span className="text-xs text-slate-500">{trims.length} ta versiya</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {trims.map((trim) => {
          const isSelected = selectedTrim.id === trim.id;
          return (
            <div
              key={trim.id}
              onClick={() => onSelectTrim(trim)}
              className={`cursor-pointer rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                isSelected
                  ? 'border-slate-950 bg-slate-950 text-white shadow-lg ring-2 ring-slate-950/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 text-slate-900'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h5 className="font-bold text-base leading-snug">{trim.name}</h5>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      isSelected ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {trim.driveType}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs mt-3 mb-4">
                  <div className="flex items-center gap-1">
                    <Gauge className={`w-3.5 h-3.5 ${isSelected ? 'text-sky-400' : 'text-slate-400'}`} />
                    <span>{trim.acceleration} s</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className={`w-3.5 h-3.5 ${isSelected ? 'text-sky-400' : 'text-slate-400'}`} />
                    <span>{trim.rangeKm} km</span>
                  </div>
                </div>

                <ul className="space-y-1.5 text-xs">
                  {trim.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 leading-snug">
                      <Check
                        className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                          isSelected ? 'text-sky-400' : 'text-emerald-600'
                        }`}
                      />
                      <span className={isSelected ? 'text-slate-300' : 'text-slate-600'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100/20">
                <div className="text-lg font-black">{formatCurrencyUSD(trim.priceUSD)}</div>
                <div className={`text-[11px] ${isSelected ? 'text-slate-400' : 'text-slate-400'}`}>
                  {formatCurrencyUZS(trim.priceUSD, rate)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
