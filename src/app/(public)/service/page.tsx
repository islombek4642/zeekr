import { Metadata } from 'next';
import { getSiteSettings } from '@/lib/settings';
import { ShieldCheck, BatteryCharging, Wrench, Zap, CheckCircle2, Phone, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Rasmiy Servis va Kafolat — Zeekr Uzbekistan',
  description: 'Zeekr elektromobillari uchun rasmiy dilerlik kafolati (8 yil batareya, 5 yil avtomobil) va sertifikatlangan servis xizmatlari.',
};

export default async function ServicePage() {
  const settings = await getSiteSettings();

  const warranties = [
    {
      title: 'Traction Batareya Kafolati',
      period: '8 yil yoki 160,000 km',
      description: 'Lityum-temir-fosfat (LFP) va Uch valentli (NMC) yuqori voltli akkumulyator bloklari degradatsiyasidan to’liq rasmiy himoya.',
      icon: BatteryCharging,
      highlight: true,
    },
    {
      title: 'Elektr Dvigatel & Reduktor',
      period: '8 yil yoki 160,000 km',
      description: 'Silikon-karbid (SiC) invertorlari, old va orqa sinxron elektr motorlar tizimi.',
      icon: Zap,
      highlight: false,
    },
    {
      title: 'Avtomobil Umumiy Kafolati',
      period: '5 yil yoki 100,000 km',
      description: 'Osma qismlari, havo kompressori, multimedia, elektron boshqaruv bloklari va konditsioner tizimi.',
      icon: ShieldCheck,
      highlight: false,
    },
    {
      title: 'Kuzov Korroziyadan Himoyasi',
      period: '10 yil',
      description: 'Alyuminiy-magniy qotishmali karkas va zanglashga qarshi galvanik qoplama kafolati.',
      icon: Wrench,
      highlight: false,
    },
  ];

  const chargingTypes = [
    {
      name: 'DC Tezkor Zaryadlash (GB/T DC)',
      speed: '360 - 800 kVt',
      duration: '10% dan 80% gacha 15 daqiqa',
      description: 'O’zbekistondagi TOK BOR, Megawatt va dilerlik markazimizdagi eng so’nggi 800V supercharger stansiyalariga mos.',
    },
    {
      name: 'AC Uy / Ofis Zaryadlash (GB/T AC)',
      speed: '7 kVt / 11 kVt / 22 kVt',
      duration: 'To’liq zaryad 6-8 soat',
      description: 'Xususiy uy yoki yer osti garaji uchun devorga o’rnatiladigan intellektual Zeekr Wallbox stansiyasi.',
    },
  ];

  return (
    <main className="min-h-screen bg-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER */}
        <div className="mb-14 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold uppercase tracking-wider mb-3 border border-emerald-200">
            <ShieldCheck className="w-4 h-4" />
            <span>Rasmiy Dilerlik Servis Markazi</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            Kafolat va Premium Texnik Xizmat
          </h1>
          <p className="text-sm text-slate-600 mt-3 leading-relaxed">
            Zeekr avtomobillariga faqat ishlab chiqaruvchi tomonidan o&apos;qitilgan sertifikatlangan muhandislar, original ehtiyot qismlar va litsenziyalangan diagnostika uskunalari bilan xizmat ko&apos;rsatiladi.
          </p>
        </div>

        {/* WARRANTY CARDS */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900">
              Ishlab Chiqaruvchi Rasmiy Kafolatlari
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Har bir Zeekr elektromobili dilerlik shartnomasi asosida himoyalangan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {warranties.map((w, idx) => {
              const Icon = w.icon;
              return (
                <div
                  key={idx}
                  className={`rounded-3xl p-6 border transition-all duration-300 flex flex-col justify-between ${
                    w.highlight
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xl'
                      : 'bg-slate-50 border-slate-200 text-slate-900 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${
                        w.highlight
                          ? 'bg-white/10 text-emerald-400'
                          : 'bg-white text-slate-900 shadow-sm border border-slate-200'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="text-xs font-mono uppercase tracking-wider text-emerald-500 font-bold mb-1">
                      {w.period}
                    </div>
                    <h3 className="text-lg font-bold mb-2">
                      {w.title}
                    </h3>
                    <p className={`text-xs leading-relaxed ${w.highlight ? 'text-slate-300' : 'text-slate-500'}`}>
                      {w.description}
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-200/20 flex items-center gap-1.5 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Rasmiy sertifikat</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CHARGING GUIDE */}
        <div className="bg-slate-50 rounded-3xl border border-slate-200/80 p-8 sm:p-12 mb-16">
          <div className="max-w-2xl mb-8">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              <Zap className="w-4 h-4 text-slate-700" /> Zaryadlash Ekotizimi
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              O&apos;zbekistonda Zeekr&apos;ni Zaryadlash Qulayligi
            </h2>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              800V SEA arxitekturasi tufayli Zeekr zaryadlash stansiyasida eng kam vaqt kutishingizni ta&apos;minlaydi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {chargingTypes.map((c, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm">{c.name}</h3>
                  <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                    {c.speed}
                  </span>
                </div>
                <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {c.duration}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {c.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA BANNER */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <h3 className="text-2xl font-black tracking-tight">
              Servis xizmatiga yozilmoqchimisiz?
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Muntazam texnik ko&apos;rik, dasturiy ta&apos;minot (OTA) yangilanishi yoki qo&apos;shimcha aksessuarlar o&apos;rnatish bo&apos;yicha mutaxassislarimiz bilan bog&apos;laning.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <a
              href={`tel:${settings.primary_phone}`}
              className="px-6 py-3.5 bg-white text-slate-900 rounded-xl text-xs font-semibold tracking-wider uppercase hover:bg-slate-100 transition-colors flex items-center gap-2 shadow-sm"
            >
              <Phone className="w-4 h-4 text-slate-900" />
              <span>Qo&apos;ng&apos;iroq qilish</span>
            </a>
            <Link
              href="/contacts"
              className="px-6 py-3.5 bg-slate-800 text-white border border-slate-700 rounded-xl text-xs font-semibold tracking-wider uppercase hover:bg-slate-700 transition-colors"
            >
              Showroom manzili
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}
