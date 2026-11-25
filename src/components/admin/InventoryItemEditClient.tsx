'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Save, Trash2 } from 'lucide-react';
import { updateInventoryItemAction, deleteInventoryItemAction } from '@/app/actions/adminCarActions';

interface InventoryItemEditClientProps {
  item: any;
  models: any[];
}

export function InventoryItemEditClient({ item, models }: InventoryItemEditClientProps) {
  const router = useRouter();

  const [trimId, setTrimId] = useState(item.trimId || '');
  const [vinOrCode, setVinOrCode] = useState(item.vinOrCode || '');
  const [exteriorColor, setExteriorColor] = useState(item.exteriorColor || '');
  const [interiorColor, setInteriorColor] = useState(item.interiorColor || '');
  const [year, setYear] = useState(item.year || 2026);
  const [status, setStatus] = useState(item.status || 'IN_STOCK');
  const [priceUSD, setPriceUSD] = useState(item.priceUSD || 45000);
  const [priceUZS, setPriceUZS] = useState(item.priceUZS || '');
  const [notes, setNotes] = useState(item.notes || '');
  const [images, setImages] = useState<string[]>(item.images || []);
  const [newImage, setNewImage] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Collect all trims across models
  const allTrims = models.flatMap((m) =>
    (m.trims || []).map((t: any) => ({
      ...t,
      modelName: m.name,
    }))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const res = await updateInventoryItemAction(item.id, {
        trimId,
        vinOrCode: vinOrCode.trim() || null,
        exteriorColor,
        interiorColor,
        year: Number(year),
        status,
        priceUSD: Number(priceUSD),
        priceUZS: priceUZS ? Number(priceUZS) : null,
        notes: notes || null,
        images,
      });

      if (!res.success) {
        setErrorMsg(res.error || 'Avtomobilni yangilashda xatolik');
        setIsLoading(false);
        return;
      }

      setSuccessMsg('Avtomobil ma\'lumotlari muvaffaqiyatli saqlandi');
      setIsLoading(false);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Tarmoq xatosi');
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Ushbu avtomobilni o\'chirishni tasdiqlaysizmi?')) return;
    setIsLoading(true);
    try {
      const res = await deleteInventoryItemAction(item.id);
      if (res.success) {
        router.push('/admin/inventory');
        router.refresh();
      } else {
        setErrorMsg(res.error || 'Avtomobilni o\'chirishda xatolik');
        setIsLoading(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Xatolik');
      setIsLoading(false);
    }
  };

  const handleAddImage = () => {
    if (!newImage.trim()) return;
    setImages([...images, newImage.trim()]);
    setNewImage('');
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, idx) => idx !== index));
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/inventory"
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Avtomobilni Tahrirlash
            </h1>
            <p className="text-xs text-slate-500">
              VIN: <span className="font-mono text-slate-800 font-bold">{item.vinOrCode || item.id}</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDelete}
          className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors flex items-center gap-1.5"
        >
          <Trash2 className="w-4 h-4" />
          O&apos;chirish
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs font-semibold text-red-600">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700">
          {successMsg}
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Komplektatsiya *
            </label>
            <select
              required
              value={trimId}
              onChange={(e) => setTrimId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950"
            >
              <option value="">Komplektatsiyani tanlang</option>
              {allTrims.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.modelName} — {t.name} (${t.priceUSD?.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              VIN yoki Unikal Kod
            </label>
            <input
              type="text"
              value={vinOrCode}
              onChange={(e) => setVinOrCode(e.target.value)}
              placeholder="ZEEKR001-UZ-2026-001"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Status *
            </label>
            <select
              required
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950"
            >
              <option value="IN_STOCK">Mavjud (Salonda)</option>
              <option value="IN_TRANSIT">Yo&apos;lda</option>
              <option value="RESERVED">Band qilingan</option>
              <option value="SOLD">Sotilgan</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Tashqi Rang *
            </label>
            <input
              type="text"
              required
              value={exteriorColor}
              onChange={(e) => setExteriorColor(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Interyer Rangi *
            </label>
            <input
              type="text"
              required
              value={interiorColor}
              onChange={(e) => setInteriorColor(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Ishlab Chiqarilgan Yil *
            </label>
            <input
              type="number"
              required
              min={2020}
              max={2030}
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Narx (USD) *
            </label>
            <input
              type="number"
              required
              min={1000}
              value={priceUSD}
              onChange={(e) => setPriceUSD(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Qo&apos;shimcha Izoh (Notes)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950"
            />
          </div>

          {/* IMAGES */}
          <div className="sm:col-span-2 space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase">
              Rasmlar
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="/images/cars/zeekr-001/main.jpg"
                value={newImage}
                onChange={(e) => setNewImage(e.target.value)}
                className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950"
              />
              <button
                type="button"
                onClick={handleAddImage}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
              >
                Qo&apos;shish
              </button>
            </div>
            {images.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <span className="font-mono text-slate-600 truncate max-w-xs">{img}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="text-red-500 hover:text-red-700 font-bold"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isLoading ? 'Saqlanmoqda...' : 'O\'zgarishlarni Saqlash'}
          </button>
        </div>
      </form>
    </div>
  );
}
