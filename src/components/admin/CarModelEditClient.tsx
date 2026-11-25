'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Save, Trash2, Plus } from 'lucide-react';
import {
  updateCarModelAction,
  deleteCarModelAction,
  createCarTrimAction,
  deleteCarTrimAction,
  createCarColorAction,
  deleteCarColorAction,
} from '@/app/actions/adminCarActions';

interface CarModelEditClientProps {
  model: any;
}

export function CarModelEditClient({ model }: CarModelEditClientProps) {
  const router = useRouter();

  const [name, setName] = useState(model.name || '');
  const [slug, setSlug] = useState(model.slug || '');
  const [tagline, setTagline] = useState(model.tagline || '');
  const [basePriceUSD, setBasePriceUSD] = useState(model.basePriceUSD || 40000);
  const [rangeKm, setRangeKm] = useState(model.rangeKm || 700);
  const [acceleration0100, setAcceleration0100] = useState(model.acceleration0100 || 3.8);
  const [batteryKwh, setBatteryKwh] = useState(model.batteryKwh || 100);
  const [powerHp, setPowerHp] = useState(model.powerHp || 544);
  const [topSpeedKmH, setTopSpeedKmH] = useState(model.topSpeedKmH || 200);
  const [chargingTimeMin, setChargingTimeMin] = useState(model.chargingTimeMin || 15);
  const [mainImage, setMainImage] = useState(model.mainImage || '');
  const [description, setDescription] = useState(model.description || '');
  const [galleryImages, setGalleryImages] = useState<string[]>(model.galleryImages || []);
  const [newGalleryImg, setNewGalleryImg] = useState('');
  const [isActive, setIsActive] = useState(model.isActive ?? true);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const res = await updateCarModelAction(model.id, {
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
        mainImage: mainImage.trim(),
        description,
        galleryImages,
        isActive,
      });

      if (!res.success) {
        setErrorMsg(res.error || 'Modelni yangilashda xatolik yuz berdi');
        setIsLoading(false);
        return;
      }

      setSuccessMsg('Model muvaffaqiyatli yangilandi');
      setIsLoading(false);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Tarmoq xatosi');
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Ushbu modelni o\'chirishni tasdiqlaysizmi?')) return;
    setIsLoading(true);
    try {
      const res = await deleteCarModelAction(model.id);
      if (res.success) {
        router.push('/admin/cars');
        router.refresh();
      } else {
        setErrorMsg(res.error || 'Modelni o\'chirishda xatolik');
        setIsLoading(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Xatolik');
      setIsLoading(false);
    }
  };

  const handleAddGalleryImage = () => {
    if (!newGalleryImg.trim()) return;
    setGalleryImages([...galleryImages, newGalleryImg.trim()]);
    setNewGalleryImg('');
  };

  const handleRemoveGalleryImage = (index: number) => {
    setGalleryImages(galleryImages.filter((_, idx) => idx !== index));
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/cars"
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {model.name} — Tahrirlash
            </h1>
            <p className="text-xs text-slate-500">
              Model parametrlari, komplektatsiyalar va ranglarni o&apos;zgartirish
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

      {/* EDIT FORM */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Model Nomi *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Slug (URL) *
            </label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 font-mono text-xs"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Shior (Tagline) *
            </label>
            <input
              type="text"
              required
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Boshlang&apos;ich Narx (USD) *
            </label>
            <input
              type="number"
              required
              min={1000}
              value={basePriceUSD}
              onChange={(e) => setBasePriceUSD(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Masofa (CLTC, km) *
            </label>
            <input
              type="number"
              required
              min={100}
              value={rangeKm}
              onChange={(e) => setRangeKm(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              0-100 km/s Tezlanish (sekund) *
            </label>
            <input
              type="number"
              step="0.1"
              required
              min={1}
              value={acceleration0100}
              onChange={(e) => setAcceleration0100(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Batareya Hajmi (kVt/soat) *
            </label>
            <input
              type="number"
              required
              min={10}
              value={batteryKwh}
              onChange={(e) => setBatteryKwh(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Ot Kuchi (HP) *
            </label>
            <input
              type="number"
              required
              min={50}
              value={powerHp}
              onChange={(e) => setPowerHp(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Maksimal Tezlik (km/s) *
            </label>
            <input
              type="number"
              required
              min={100}
              value={topSpeedKmH}
              onChange={(e) => setTopSpeedKmH(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Tez Zaryadlash Vaqti (daqiqa) *
            </label>
            <input
              type="number"
              required
              min={5}
              value={chargingTimeMin}
              onChange={(e) => setChargingTimeMin(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Asosiy Rasm Yo&apos;li *
            </label>
            <input
              type="text"
              required
              value={mainImage}
              onChange={(e) => setMainImage(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Tavsif (Description) *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950"
            />
          </div>

          {/* GALLERY IMAGES */}
          <div className="sm:col-span-2 space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase">
              Galereya Rasmlari
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="/images/cars/zeekr-001/interior.jpg"
                value={newGalleryImg}
                onChange={(e) => setNewGalleryImg(e.target.value)}
                className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950"
              />
              <button
                type="button"
                onClick={handleAddGalleryImage}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
              >
                Qo&apos;shish
              </button>
            </div>
            {galleryImages.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {galleryImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <span className="font-mono text-slate-600 truncate max-w-xs">{img}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveGalleryImage(idx)}
                      className="text-red-500 hover:text-red-700 font-bold"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ACTIVE STATUS */}
          <div className="sm:col-span-2 flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded text-slate-950 focus:ring-slate-950"
            />
            <label htmlFor="isActive" className="text-sm font-semibold text-slate-700">
              Faol model (Saytda va vitrinada ko&apos;rsatiladi)
            </label>
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
