'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, ShieldCheck, Zap, Gauge, Compass } from 'lucide-react';
import { formatCurrencyUSD, formatCurrencyUZS } from '@/lib/utils';
import { VehicleReservationItem } from './ReserveModal';

interface VehicleCardProps {
  item: VehicleReservationItem & {
    status: string;
    images?: string[];
  };
  usdRate: number;
  onReserve: (item: VehicleReservationItem) => void;
}

export function VehicleCard({
  item,
  usdRate,
  onReserve,
}: VehicleCardProps) {
  const isInStock = item.status === 'IN_STOCK';
  const displayImage = (item.images && item.images.length > 0) ? item.images[0] : item.trim.model.mainImage;

  return (
    <div className="group bg-white rounded-3xl border border-slate-200/80 overflow-hidden hover:border-slate-400 hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* IMAGE & STATUS HEADER */}
        <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={displayImage}
            alt={`${item.trim.model.name} ${item.trim.name}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-4 left-4 flex flex-col gap-1.5">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md shadow-sm ${
                isInStock
                  ? 'bg-emerald-500/90 text-white'
                  : 'bg-sky-600/90 text-white'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              {isInStock ? 'Salonda mavjud' : "Yo'lda (Tez kunda)"}
            </span>
          </div>

          <div className="absolute top-4 right-4">
            <span className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium bg-black/60 text-white backdrop-blur-md">
              {item.year}
            </span>
          </div>
        </div>

        {/* DETAILS SECTION */}
        <div className="p-6">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-slate-800 transition-colors">
                {item.trim.model.name}
              </h3>
              <p className="text-xs font-medium text-slate-500">
                {item.trim.name}
              </p>
            </div>
            {item.vinOrCode && (
              <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 shrink-0">
                VIN: {item.vinOrCode}
              </span>
            )}
          </div>

          {/* COLOR & ATTRIBUTES */}
          <div className="grid grid-cols-2 gap-2 text-xs py-3 border-y border-slate-100 my-4">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Tashqi rang</span>
              <span className="font-medium text-slate-700">{item.exteriorColor}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Interyer</span>
              <span className="font-medium text-slate-700">{item.interiorColor}</span>
            </div>
          </div>

          {/* KEY SPECS BADGES */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs py-1">
            <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
              <Zap className="w-3.5 h-3.5 text-slate-400 mx-auto mb-1" />
              <div className="font-bold text-slate-900">{item.trim.acceleration}s</div>
              <div className="text-[10px] text-slate-400">0-100 km/s</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
              <Compass className="w-3.5 h-3.5 text-slate-400 mx-auto mb-1" />
              <div className="font-bold text-slate-900">{item.trim.rangeKm} km</div>
              <div className="text-[10px] text-slate-400">Masofa</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
              <Gauge className="w-3.5 h-3.5 text-slate-400 mx-auto mb-1" />
              <div className="font-bold text-slate-900">{item.trim.driveType}</div>
              <div className="text-[10px] text-slate-400">Yuritma</div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER & ACTIONS */}
      <div className="p-6 pt-0 border-t border-slate-100 mt-2">
        <div className="flex items-baseline justify-between pt-4 mb-4">
          <div>
            <div className="text-xl font-black text-slate-900">
              {formatCurrencyUSD(item.priceUSD)}
            </div>
            <div className="text-xs text-slate-500 font-medium">
              {formatCurrencyUZS(item.priceUSD, usdRate)}
            </div>
          </div>
          <Link
            href={`/models/${item.trim.model.slug}`}
            className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-0.5 font-medium transition-colors"
          >
            Model tafsiloti <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <button
          onClick={() => onReserve(item)}
          className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold tracking-wide uppercase transition-all shadow-sm flex items-center justify-center gap-2"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Avtomobilni bron qilish
        </button>
      </div>
    </div>
  );
}

