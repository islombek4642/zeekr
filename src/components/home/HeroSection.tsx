'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Zap, ShieldCheck, Gauge, Play, Pause, Volume2, VolumeX, Award } from 'lucide-react';

export function HeroSection() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <section className="relative w-full overflow-hidden bg-slate-950 text-white py-20 lg:py-32">
      {/* Background cinematic video loop with enhanced clarity and visibility */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-65">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/images/cars/zeekr-001/main.jpg"
          className="w-full h-full object-cover"
        >
          <source src="/videos/cars/zeekr-001-hero.mp4" type="video/mp4" />
        </video>
        {/* Balanced, refined overlay that keeps video clear while ensuring text contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/50 to-slate-950/75" />
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(2,132,199,0.18),transparent_55%)] pointer-events-none" />

      {/* FLOATING VIDEO CONTROLS PILL */}
      <div className="absolute bottom-6 right-6 z-20 hidden sm:flex items-center gap-2 bg-slate-950/75 backdrop-blur-md border border-slate-700/80 rounded-full px-3.5 py-1.5 text-xs text-slate-200 shadow-2xl">
        <button
          type="button"
          onClick={togglePlay}
          className="flex items-center gap-1.5 hover:text-sky-400 transition-colors p-1"
          title={isPlaying ? "Videoni to'xtatish" : "Videoni qo'yish"}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span className="text-[11px] font-semibold">{isPlaying ? 'Pauza' : 'Ijro'}</span>
        </button>
        <span className="w-px h-3 bg-slate-700" />
        <button
          type="button"
          onClick={toggleMute}
          className="flex items-center gap-1.5 hover:text-sky-400 transition-colors p-1"
          title={isMuted ? "Ovozni yoqish" : "Ovozni o'chirish"}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-400" /> : <Volume2 className="w-3.5 h-3.5 text-sky-400" />}
          <span className="text-[11px] font-semibold">{isMuted ? 'Tovushsiz' : 'Ovozli'}</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* TEXT CONTENT - DIRECT, CLEAN, PROFESSIONAL (NO AI SLOP) */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-500/15 border border-sky-400/30 text-sky-400 text-xs font-bold tracking-wider uppercase">
              <Award className="w-3.5 h-3.5 text-sky-400" />
              Rasmiy dilerlik markazi
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
              Zeekr Elektromobillari <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-slate-100 to-slate-300">
                O&apos;zbekistonda.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-200 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed drop-shadow-sm">
              Toshkentdagi rasmiy dilerlik markazidan to&apos;g&apos;ridan-to&apos;g&apos;ri xarid qiling. 8 yillik rasmiy kafolat, sertifikatlangan servis xizmati va salonda mavjud modellar.
            </p>

            {/* CTAS */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/test-drive"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white text-slate-950 hover:bg-slate-100 font-bold text-sm tracking-wide transition-all shadow-xl shadow-white/10 hover:scale-[1.02]"
              >
                Test-drayvga yozilish
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#models"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white hover:bg-slate-800 font-semibold text-sm transition-all backdrop-blur-md"
              >
                Modellar katalogi
              </Link>
            </div>

            {/* KEY SPECS STRIP */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-800/80 max-w-lg mx-auto lg:mx-0">
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
                  Rasmiy kafolat
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white">8 yil</div>
              </div>
            </div>

          </div>

          {/* HERO CAR VISUAL */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-md lg:max-w-none aspect-[16/10] rounded-2xl overflow-hidden border border-slate-700/60 shadow-2xl bg-slate-900 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/cars/zeekr-001/main.jpg"
                alt="Zeekr 001 Flagman Elektr Avtomobili"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-50" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
