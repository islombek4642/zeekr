'use client';

import React, { useState } from 'react';
import { formatCurrencyUSD, formatCurrencyUZS } from '@/lib/utils';
import { updateInventoryStatusAction, deleteInventoryItemAction } from '@/app/actions/adminCarActions';
import { Package, Trash2, ShieldCheck, Car } from 'lucide-react';

interface InventoryItemType {
  id: string;
  vinOrCode: string | null;
  exteriorColor: string;
  interiorColor: string;
  year: number;
  status: string;
  priceUSD: number;
  images: string[];
  trim: {
    id: string;
    name: string;
    model: {
      name: string;
      mainImage: string;
    };
  };
}

interface InventoryTableProps {
  initialItems: InventoryItemType[];
  usdRate: number;
}

export function InventoryTable({ initialItems, usdRate }: InventoryTableProps) {
  const [items, setItems] = useState<InventoryItemType[]>(initialItems);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusChange = async (itemId: string, newStatus: string) => {
    setUpdatingId(itemId);
    const res = await updateInventoryStatusAction(itemId, newStatus);
    if (res.success) {
      setItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, status: newStatus } : i))
      );
    }
    setUpdatingId(null);
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Ushbu avtomobilni ombordan o’chirishni tasdiqlaysizmi?')) {
      return;
    }
    setUpdatingId(itemId);
    const res = await deleteInventoryItemAction(itemId);
    if (res.success) {
      setItems((prev) => prev.filter((i) => i.id !== itemId));
    }
    setUpdatingId(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      {items.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-400">
          Omborda hozircha kiritilgan avtomobillar mavjud emas.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3">Avtomobil / VIN</th>
                <th className="px-5 py-3">Komplektatsiya</th>
                <th className="px-5 py-3">Ranglar (Tashqi / Ichki)</th>
                <th className="px-5 py-3">Yili</th>
                <th className="px-5 py-3">Narxi</th>
                <th className="px-5 py-3">Holati</th>
                <th className="px-5 py-3 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => {
                const img = item.images?.[0] || item.trim.model.mainImage;
                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* CAR IMAGE & VIN */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-9 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img} alt={item.trim.model.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm">
                            {item.trim.model.name}
                          </div>
                          <div className="font-mono text-[10px] text-slate-400">
                            {item.vinOrCode ? `VIN: ${item.vinOrCode}` : 'Kod kiritilmagan'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* TRIM */}
                    <td className="px-5 py-4 font-semibold text-slate-800">
                      {item.trim.name}
                    </td>

                    {/* COLORS */}
                    <td className="px-5 py-4 text-slate-600">
                      <div><strong className="text-slate-800">{item.exteriorColor}</strong></div>
                      <div className="text-[11px] text-slate-400">{item.interiorColor}</div>
                    </td>

                    {/* YEAR */}
                    <td className="px-5 py-4 font-mono font-semibold text-slate-800">
                      {item.year}
                    </td>

                    {/* PRICE */}
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900 font-mono text-xs">
                        {formatCurrencyUSD(item.priceUSD)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {formatCurrencyUZS(item.priceUSD, usdRate)}
                      </div>
                    </td>

                    {/* STATUS SELECTOR */}
                    <td className="px-5 py-4">
                      <select
                        value={item.status}
                        disabled={updatingId === item.id}
                        onChange={(e) => handleStatusChange(item.id, e.target.value)}
                        className={`text-[11px] font-semibold rounded-lg px-2.5 py-1 border focus:outline-none ${
                          item.status === 'IN_STOCK'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : item.status === 'IN_TRANSIT'
                            ? 'bg-sky-50 text-sky-800 border-sky-200'
                            : item.status === 'RESERVED'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <option value="IN_STOCK">Salonda mavjud</option>
                        <option value="IN_TRANSIT">Yo’lda (Tez kunda)</option>
                        <option value="RESERVED">Band qilingan</option>
                        <option value="SOLD">Sotilgan</option>
                      </select>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={updatingId === item.id}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="O’chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

