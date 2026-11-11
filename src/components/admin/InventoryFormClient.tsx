'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createInventoryItemAction } from '@/app/actions/adminCarActions';
import Link from 'next/link';

interface ModelWithTrims {
  id: string;
  name: string;
  mainImage: string;
  trims: {
    id: string;
    name: string;
    priceUSD: number;
  }[];
  colors: {
    name: string;
    isInterior: boolean;
  }[];
}

interface InventoryFormClientProps {
  models: ModelWithTrims[];
}

export function InventoryFormClient({ models }: InventoryFormClientProps) {
  const router = useRouter();

  const [selectedModelId, setSelectedModelId] = useState<string>(models[0]?.id || '');
  const activeModel = models.find((m) => m.id === selectedModelId) || models[0];

  const [trimId, setTrimId] = useState<string>(activeModel?.trims[0]?.id || '');
  const [vinOrCode, setVinOrCode] = useState('');
  const [exteriorColor, setExteriorColor] = useState('Polar White');
  const [interiorColor, setInteriorColor] = useState('Krem Nappa');
  const [year, setYear] = useState<number>(2026);
  const [status, setStatus] = useState<'IN_STOCK' | 'IN_TRANSIT'>('IN_STOCK');
  const [priceUSD, setPriceUSD] = useState<number>(activeModel?.trims[0]?.priceUSD || 45000);
  const [notes, setNotes] = useState('');
  const [imageUrl, setImageUrl] = useState(activeModel?.mainImage || '');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleModelChange = (id: string) => {
    setSelectedModelId(id);
    const m = models.find((item) => item.id === id);
    if (m && m.trims.length > 0) {
      setTrimId(m.trims[0].id);
      setPriceUSD(m.trims[0].priceUSD);
      setImageUrl(m.mainImage);
    }
  };

  const handleTrimChange = (id: string) => {
    setTrimId(id);
    const t = activeModel?.trims.find((trim) => trim.id === id);
    if (t) {
      setPriceUSD(t.priceUSD);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!trimId) {
      setErrorMsg('Iltimos komplektatsiyani tanlang');
      return;
    }

    setIsLoading(true);
    try {
      const res = await createInventoryItemAction({
        trimId,
        vinOrCode: vinOrCode.trim() || null,
        exteriorColor,
        interiorColor,
        year: Number(year),
        status,
        priceUSD: Number(priceUSD),
        notes: notes.trim() || null,
        images: imageUrl ? [imageUrl] : [],
      });

      if (!res.success) {
        setErrorMsg(res.error || 'Avtomobilni kiritishda xatolik yuz berdi');
        setIsLoading(false);
        return;
      }

      router.push('/admin/inventory');
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Tarmoq xatosi');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
      
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs font-semibold text-red-600">
          {errorMsg}
        </div>
      )}

      {/* MODEL & TRIM SELECT */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Model *
          </label>
          <select
            value={selectedModelId}
            onChange={(e) => handleModelChange(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
          >
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Komplektatsiya (Trim) *
          </label>
          <select
            value={trimId}
            onChange={(e) => handleTrimChange(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
          >
            {activeModel?.trims.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} (${t.priceUSD.toLocaleString()})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* VIN & COLORS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            VIN / Ombor kodi
          </label>
          <input
            type="text"
            value={vinOrCode}
            onChange={(e) => setVinOrCode(e.target.value)}
            placeholder="ZEEKR001-UZ-2026-003"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono text-slate-900"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Tashqi rang *
          </label>
          <input
            type="text"
            required
            value={exteriorColor}
            onChange={(e) => setExteriorColor(e.target.value)}
            placeholder="Polar White / Phantom Black"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Interyer rangi *
          </label>
          <input
            type="text"
            required
            value={interiorColor}
            onChange={(e) => setInteriorColor(e.target.value)}
            placeholder="Krem Nappa / To'q rang"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900"
          />
        </div>
      </div>

      {/* STATUS & PRICE & YEAR */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Mavjudlik holati *
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-white"
          >
            <option value="IN_STOCK">Salonda mavjud (Tayyor)</option>
            <option value="IN_TRANSIT">Yo’lda (Tez kunda keladi)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Ishlab chiqarilgan yili *
          </label>
          <input
            type="number"
            required
            min={2022}
            max={2030}
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono text-slate-900"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Narxi (USD) *
          </label>
          <input
            type="number"
            required
            min={1000}
            value={priceUSD}
            onChange={(e) => setPriceUSD(Number(e.target.value))}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono font-bold text-slate-900"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
          Avtomobil fotosurati URL
        </label>
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://..."
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-900"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
          Qo&apos;shimcha izoh yoki tavsif
        </label>
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Bojxona to'langan, Toshkent shou-rumida ko'rish mumkin..."
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 resize-none"
        />
      </div>

      <div className="pt-2 flex justify-end gap-3">
        <Link
          href="/admin/inventory"
          className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
        >
          Bekor qilish
        </Link>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-md"
        >
          {isLoading ? 'Saqlanmoqda...' : 'Mashinani omborga kiritish'}
        </button>
      </div>

    </form>
  );
}
