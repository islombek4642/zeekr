'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, Car, Phone, User, MessageSquare } from 'lucide-react';
import { formatCurrencyUSD, formatCurrencyUZS } from '@/lib/utils';

export interface VehicleReservationItem {
  id: string;
  vinOrCode: string | null;
  year: number;
  exteriorColor: string;
  interiorColor: string;
  priceUSD: number;
  trim: {
    id: string;
    name: string;
    driveType: string;
    rangeKm: number;
    acceleration: number;
    model: {
      id: string;
      name: string;
      slug: string;
      mainImage: string;
    };
  };
}

interface ReserveModalProps {
  item: VehicleReservationItem | null;
  isOpen: boolean;
  onClose: () => void;
  usdRate: number;
}

export function ReserveModal({
  item,
  isOpen,
  onClose,
  usdRate,
}: ReserveModalProps) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen || !item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim() || !phone.trim()) {
      setErrorMessage('Ism va telefon raqamini kiritish majburiy');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          phone,
          type: 'RESERVATION',
          inventoryItemId: item.id,
          modelId: item.trim.model.id,
          source: 'inventory_reserve_modal',
          notes: notes || `Mijoz tanlagan avtomobil VIN: ${item.vinOrCode || 'Mavjud emas'}, Rang: ${item.exteriorColor}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Ariza yuborishda xatolik yuz berdi');
      }

      setIsSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Tarmoq xatosi yuz berdi. Iltimos qaytadan urinib ko\'ring.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    setErrorMessage('');
    setFullName('');
    setPhone('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Yopish"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              Bron arizangiz qabul qilindi!
            </h3>
            <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
              Menejerimiz tez orada siz bilan bog&apos;lanib, ushbu avtomobil holati va shartnoma shartlarini tasdiqlaydi.
            </p>
            <div className="pt-4">
              <button
                onClick={handleClose}
                className="w-full py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
              >
                Tushunarli, rahmat
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="space-y-1 mb-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Rasmiy dilerlik zaxirasi
              </span>
              <h2 className="text-xl font-bold text-slate-900">
                Avtomobilni bron qilish
              </h2>
            </div>

            {/* VEHICLE SUMMARY CARD */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 mb-6 flex gap-4 items-center">
              <div className="w-20 h-14 bg-white rounded-lg flex items-center justify-center overflow-hidden border border-slate-200 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.trim.model.mainImage}
                  alt={item.trim.model.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1 text-xs space-y-0.5">
                <div className="font-bold text-sm text-slate-900 truncate">
                  {item.trim.model.name} — {item.trim.name}
                </div>
                <div className="text-slate-500">
                  {item.exteriorColor} / {item.interiorColor} • {item.year}
                </div>
                {item.vinOrCode && (
                  <div className="font-mono text-[11px] text-slate-400">
                    VIN: {item.vinOrCode}
                  </div>
                )}
                <div className="font-bold text-slate-900 pt-1">
                  {formatCurrencyUSD(item.priceUSD)} <span className="text-slate-400 font-normal">({formatCurrencyUZS(item.priceUSD, usdRate)})</span>
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 font-medium">
                {errorMessage}
              </div>
            )}

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  F.I.SH *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ismingiz va familiyangiz"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Telefon raqam *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+998 (90) 123-45-67"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Qo&apos;shimcha istaklar (ixtiyoriy)
                </label>
                <div className="relative">
                  <MessageSquare className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Kredit, to'lov turi yoki qo'shimcha savollaringiz..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all text-slate-900 resize-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-semibold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {isSubmitting ? 'Yuborilmoqda...' : 'Bron qilish arizasini tasdiqlash'}
                </button>
              </div>

              <p className="text-[11px] text-slate-400 text-center leading-normal">
                Ariza yuborish bepul va hech qanday dastlabki to&apos;lov talab qilmaydi.
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
