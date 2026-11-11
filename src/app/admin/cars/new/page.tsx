'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCarModelAction } from '@/app/actions/adminCarActions';
import Link from 'next/link';
import { ChevronLeft, Plus, Car, ShieldCheck } from 'lucide-react';

export default function AdminNewCarPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [tagline, setTagline] = useState('');
  const [basePriceUSD, setBasePriceUSD] = useState(40000);
  const [rangeKm, setRangeKm] = useState(700);
  const [acceleration0100, setAcceleration0100] = useState(3.8);
  const [batteryKwh, setBatteryKwh] = useState(100);
  const [powerHp, setPowerHp] = useState(544);
  const [topSpeedKmH, setTopSpeedKmH] = useState(200);
  const [chargingTimeMin, setChargingTimeMin] = useState(15);
  const [mainImage, setMainImage] = useState('https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80');
  const [description, setDescription] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleNameChange = (val: string) => {
    setName(val);
    if (!slug) {
      setSlug(val.toLowerCase().replace(/\s+/g, '-'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await createCarModelAction({
        name,
        slug,
        tagline,
        basePriceUSD: Number(basePriceUSD),
        rangeKm: Number(rangeKm),
        acceleration0100: Number(acceleration0100),
        batteryKwh: Number(batteryKwh),
        powerHp: Number(powerHp),
        topSpeedKmH: Number(topSpeedKmH),
        chargingTimeMin: Number(chargingTimeMin),
        mainImage,
        description,
        galleryImages: [mainImage],
        isActive: true,
      });

      if (!res.success) {
        setErrorMsg(res.error || 'Model yaratishda xatolik yuz berdi');
        setIsLoading(false);
        return;
      }

      router.push('/admin/cars');
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Tarmoq xatosi');
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/cars"
          className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Yangi Zeekr Modeli Qo&apos;shish
          </h1>
          <p className="text-xs text-slate-500">
            Modelning asosiy texnik xarakteristikalari va taqdimot ma&apos;lumotlari
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs font-semibold text-red-600">
          {errorMsg}
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Model Nomi *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Masalan: Zeekr 7X"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              URL Slug *
            </label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="zeekr-7x"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono text-slate-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Qisqa Shior (Tagline) *
          </label>
          <input
            type="text"
            required
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="Hashamatli premium elektr krossover"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900"
          />
        </div>

        {/* SPECS GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-200/80">
          <div>
            <label className="block text-[11px] font-semibold uppercase text-slate-600 mb-1">
              Boshlang&apos;ich narx (USD) *
            </label>
            <input
              type="number"
              required
              min={1000}
              value={basePriceUSD}
              onChange={(e) => setBasePriceUSD(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono font-bold text-slate-900 bg-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase text-slate-600 mb-1">
              Masofa (km) *
            </label>
            <input
              type="number"
              required
              min={100}
              value={rangeKm}
              onChange={(e) => setRangeKm(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono font-bold text-slate-900 bg-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase text-slate-600 mb-1">
              0-100 km/s (soniya) *
            </label>
            <input
              type="number"
              step="0.1"
              required
              min={1}
              value={acceleration0100}
              onChange={(e) => setAcceleration0100(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono font-bold text-slate-900 bg-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase text-slate-600 mb-1">
              Batareya (kVt/soat) *
            </label>
            <input
              type="number"
              required
              min={10}
              value={batteryKwh}
              onChange={(e) => setBatteryKwh(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono font-bold text-slate-900 bg-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase text-slate-600 mb-1">
              Quvvat (ot kuchi) *
            </label>
            <input
              type="number"
              required
              min={50}
              value={powerHp}
              onChange={(e) => setPowerHp(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono font-bold text-slate-900 bg-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase text-slate-600 mb-1">
              Maks. tezlik (km/s) *
            </label>
            <input
              type="number"
              required
              min={50}
              value={topSpeedKmH}
              onChange={(e) => setTopSpeedKmH(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono font-bold text-slate-900 bg-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase text-slate-600 mb-1">
              Zaryadlash (daq) *
            </label>
            <input
              type="number"
              required
              min={5}
              value={chargingTimeMin}
              onChange={(e) => setChargingTimeMin(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono font-bold text-slate-900 bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Asosiy Rasm URL *
          </label>
          <input
            type="url"
            required
            value={mainImage}
            onChange={(e) => setMainImage(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-900"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Model Tavsifi *
          </label>
          <textarea
            rows={4}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Model haqida batafsil ma'lumot..."
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 resize-none"
          />
        </div>

        <div className="pt-2 flex justify-end gap-3">
          <Link
            href="/admin/cars"
            className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
          >
            Bekor qilish
          </Link>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-md"
          >
            {isLoading ? 'Saqlanmoqda...' : 'Modelni saqlash'}
          </button>
        </div>

      </form>

    </div>
  );
}

