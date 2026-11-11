'use client';

import React, { useState } from 'react';
import { Check, Calendar, Clock, User, Phone, CheckCircle2, ChevronRight, ChevronLeft, Car, ShieldCheck } from 'lucide-react';
import { createTestDriveLeadAction } from '@/app/actions/leadActions';

interface CarModelOption {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  mainImage: string;
  acceleration0100: number;
  rangeKm: number;
}

interface TestDriveWizardProps {
  models: CarModelOption[];
  preselectedModelSlug?: string;
  showroomAddress: string;
}

const TIME_SLOTS = [
  '10:00 — 12:00',
  '12:00 — 14:00',
  '14:00 — 16:00',
  '16:00 — 18:00',
  '18:00 — 20:00',
];

export function TestDriveWizard({
  models,
  preselectedModelSlug,
  showroomAddress,
}: TestDriveWizardProps) {
  const defaultModel = models.find((m) => m.slug === preselectedModelSlug) || models[0];

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedModelId, setSelectedModelId] = useState<string>(defaultModel ? defaultModel.id : '');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('14:00 — 16:00');
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const selectedModel = models.find((m) => m.id === selectedModelId);

  // Tomorrow as minimum date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateString = tomorrow.toISOString().split('T')[0];

  const handleNextFromStep1 = () => {
    if (!selectedModelId) {
      setErrorMessage('Iltimos, test-drayv uchun modelni tanlang');
      return;
    }
    setErrorMessage('');
    setStep(2);
  };

  const handleNextFromStep2 = () => {
    if (!selectedDate) {
      setErrorMessage('Iltimos, tashrif buyurmoqchi bo\'lgan sanangizni tanlang');
      return;
    }
    setErrorMessage('');
    setStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim() || !phone.trim()) {
      setErrorMessage('Ism va telefon raqamini kiritish shart');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createTestDriveLeadAction({
        fullName,
        phone,
        modelId: selectedModelId,
        preferredDate: selectedDate,
        preferredTime: selectedTimeSlot,
        notes,
        source: 'test_drive_wizard',
      });

      if (!result.success) {
        throw new Error(result.error || 'Arizani qabul qilishda xatolik yuz berdi');
      }

      setIsSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Tarmoq xatosi. Iltimos qaytadan urinib ko\'ring.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-14 text-center max-w-2xl mx-auto shadow-xl">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3">
          Test-drayv arizangiz qabul qilindi!
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed mb-8 max-w-md mx-auto">
          Hurmatli <span className="font-semibold text-slate-900">{fullName}</span>, menejerimiz ko&apos;rsatilgan raqamingizga qo&apos;ng&apos;iroq qilib, {selectedDate} sanasi {selectedTimeSlot} vaqti uchun broningizni tasdiqlaydi.
        </p>

        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 mb-8 text-left space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Tashrif tafsilotlari:
          </div>
          <div className="flex justify-between text-sm py-1 border-b border-slate-200/60">
            <span className="text-slate-500">Tanlangan model:</span>
            <span className="font-bold text-slate-900">{selectedModel?.name}</span>
          </div>
          <div className="flex justify-between text-sm py-1 border-b border-slate-200/60">
            <span className="text-slate-500">Sana va vaqt:</span>
            <span className="font-bold text-slate-900">{selectedDate} ({selectedTimeSlot})</span>
          </div>
          <div className="flex justify-between text-sm py-1">
            <span className="text-slate-500">Manzil:</span>
            <span className="font-semibold text-slate-800 text-right max-w-xs">{showroomAddress}</span>
          </div>
        </div>

        <button
          onClick={() => {
            setIsSuccess(false);
            setStep(1);
            setFullName('');
            setPhone('');
            setNotes('');
            setSelectedDate('');
          }}
          className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold tracking-wider uppercase transition-all shadow-md"
        >
          Yana boshqa modelni sinab ko&apos;rish
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-xl max-w-3xl mx-auto">
      
      {/* STEP PROGRESS BAR */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-md mx-auto relative mb-3">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 -translate-y-1/2 z-0" />
          <div
            className="absolute top-1/2 left-0 h-0.5 bg-slate-900 -translate-y-1/2 z-0 transition-all duration-300"
            style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
          />

          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                step >= s
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-400 border border-slate-200'
              }`}
            >
              {step > s ? <Check className="w-4 h-4" /> : s}
            </div>
          ))}
        </div>
        <div className="flex justify-between max-w-md mx-auto text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          <span className={step >= 1 ? 'text-slate-900' : ''}>1. Model</span>
          <span className={step >= 2 ? 'text-slate-900' : ''}>2. Vaqt</span>
          <span className={step >= 3 ? 'text-slate-900' : ''}>3. Ma&apos;lumot</span>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-xs font-medium text-red-600">
          {errorMessage}
        </div>
      )}

      {/* STEP 1: CHOOSE MODEL */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="text-center max-w-md mx-auto mb-6">
            <h3 className="text-xl font-bold text-slate-900">
              Qaysi modelni haydab ko&apos;rmoqchisiz?
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Test-drayv davomida Zeekr elektromobilining barcha quvvati va intellektual tizimlarini his qilasiz.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {models.map((model) => {
              const isSelected = selectedModelId === model.id;
              return (
                <div
                  key={model.id}
                  onClick={() => setSelectedModelId(model.id)}
                  className={`cursor-pointer rounded-2xl border p-4 transition-all duration-200 flex flex-col justify-between ${
                    isSelected
                      ? 'border-slate-900 bg-slate-50/70 shadow-md ring-1 ring-slate-900'
                      : 'border-slate-200 bg-white hover:border-slate-400'
                  }`}
                >
                  <div className="aspect-[16/10] bg-slate-100 rounded-xl overflow-hidden mb-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={model.mainImage}
                      alt={model.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-slate-900 text-base">{model.name}</h4>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mb-3">{model.tagline}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-600 font-mono bg-white p-2 rounded-lg border border-slate-100">
                      <span>0-100: <strong className="text-slate-900">{model.acceleration0100}s</strong></span>
                      <span>•</span>
                      <span>Masofa: <strong className="text-slate-900">{model.rangeKm} km</strong></span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="button"
              onClick={handleNextFromStep1}
              className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold tracking-wider uppercase flex items-center gap-2 shadow-sm transition-all"
            >
              Keyingi qadam <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: DATE & TIME */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="text-center max-w-md mx-auto mb-6">
            <h3 className="text-xl font-bold text-slate-900">
              Sizga qulay kun va vaqt oralig&apos;ini tanlang
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Dilerlik markazimiz har kuni soat 09:00 dan 20:00 gacha faoliyat yuritadi.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                Sinov kuni *
              </label>
              <input
                type="date"
                min={minDateString}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" />
                Vaqt oralig&apos;i *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {TIME_SLOTS.map((slot) => {
                  const isSelected = selectedTimeSlot === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedTimeSlot(slot)}
                      className={`py-3 px-3 rounded-xl text-xs font-semibold transition-all border ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-6 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold tracking-wider uppercase flex items-center gap-1.5 transition-all"
            >
              <ChevronLeft className="w-4 h-4" /> Orqaga
            </button>
            <button
              type="button"
              onClick={handleNextFromStep2}
              className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold tracking-wider uppercase flex items-center gap-2 shadow-sm transition-all"
            >
              Keyingi qadam <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: CONTACT INFORMATION & REVIEW */}
      {step === 3 && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center max-w-md mx-auto mb-6">
            <h3 className="text-xl font-bold text-slate-900">
              Aloqa ma&apos;lumotlaringiz
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Bron tafsilotlarini tekshiring va kontaktlaringizni qoldiring.
            </p>
          </div>

          {/* SUMMARY PILL */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Tanlangan:</span>
              <span className="font-bold text-slate-900 text-sm">{selectedModel?.name}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Sana va vaqt:</span>
              <span className="font-semibold text-slate-700">{selectedDate} ({selectedTimeSlot})</span>
            </div>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-xs text-slate-500 underline hover:text-slate-900 self-start sm:self-auto"
            >
              O&apos;zgartirish
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Ism va familiyangiz *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Misol: Sardor Rahimiy"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Telefon raqamingiz *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+998 (90) 123-45-67"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Izoh yoki savollar (ixtiyoriy)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Haydovchilik staji, o'zingiz bilan sherik kelishi va boshqalar..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 resize-none"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-6 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold tracking-wider uppercase flex items-center gap-1.5 transition-all"
            >
              <ChevronLeft className="w-4 h-4" /> Orqaga
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white rounded-xl text-xs font-semibold tracking-wider uppercase flex items-center gap-2 shadow-md transition-all"
            >
              {isSubmitting ? 'Yuborilmoqda...' : 'Test-drayvni tasdiqlash'}
            </button>
          </div>
        </form>
      )}

    </div>
  );
}
