import Link from 'next/link';
import { ArrowRight, Zap, ShieldCheck, Gauge } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950 text-white py-20 lg:py-32">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(2,132,199,0.15),transparent_50%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* TEXT CONTENT */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/20 text-sky-400 text-xs font-semibold tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              O&apos;zbekistonda Rasmiy Taqdimot
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
              Kelajak Shakli. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">
                Elektr Quvvati.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Skandinaviya estetikasi va Geely ilg&apos;or SEA platformasi uyg&apos;unligi. 
              Zeekr 001, 007, 009 va X modellarini O&apos;zbekistondagi rasmiy dilerlik kafolati bilan xarid qiling.
            </p>

            {/* CTAS */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <Link
                href="/test-drive"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg bg-white text-slate-950 hover:bg-slate-100 font-bold text-sm tracking-wide transition-all shadow-lg shadow-white/5"
              >
                Test-drayvga yozilish
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#models"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg bg-slate-900/80 border border-slate-700 text-white hover:bg-slate-800 font-semibold text-sm transition-all"
              >
                Modellar katalogi
              </Link>
            </div>

            {/* SPECS STRIP */}
            <div className="grid grid-cols-3 gap-6 pt-10 border-t border-slate-800/80 max-w-lg mx-auto lg:mx-0">
              <div>
                <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                  <Gauge className="w-3.5 h-3.5 text-sky-400" />
                  0–100 km/s
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white">2.84 s</div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                  <Zap className="w-3.5 h-3.5 text-sky-400" />
                  Zaxira masofasi
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white">870 km</div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                  Batareya kafolati
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white">8 yil</div>
              </div>
            </div>

          </div>

          {/* HERO CAR VISUAL */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-md lg:max-w-none aspect-[16/10] rounded-2xl overflow-hidden border border-slate-800/60 shadow-2xl bg-slate-900 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80"
                alt="Zeekr 001 Flagman Elektr Avtomobili"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-slate-300">
                <span className="font-semibold text-white tracking-wider">ZEEKR 001 FR</span>
                <span className="px-2 py-0.5 rounded bg-slate-900/80 backdrop-blur border border-slate-700">Flagman</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

