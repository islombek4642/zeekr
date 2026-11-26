'use client';

import { useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface ModelHeroVideoProps {
  videoSrc?: string;
  poster: string;
  alt: string;
}

export function ModelHeroVideo({ videoSrc, poster, alt }: ModelHeroVideoProps) {
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

  if (!videoSrc) {
    return (
      <div className="relative w-full h-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={poster}
          alt={alt}
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full group">
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={poster}
        className="w-full h-full object-cover object-center"
      >
        <source src={videoSrc} type="video/mp4" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={poster}
          alt={alt}
          className="w-full h-full object-cover object-center"
        />
      </video>

      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />

      {/* FLOATING CONTROLS */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 bg-slate-950/70 backdrop-blur-md border border-slate-800/80 rounded-full px-3 py-1.5 text-xs text-white shadow-lg transition-opacity duration-300">
        <button
          type="button"
          onClick={togglePlay}
          className="flex items-center gap-1.5 hover:text-sky-400 transition-colors"
          title={isPlaying ? "Videoni to'xtatish" : "Videoni qo'yish"}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span className="text-[10px] font-bold">{isPlaying ? 'Pauza' : 'Ijro'}</span>
        </button>
        <span className="w-px h-3 bg-slate-700" />
        <button
          type="button"
          onClick={toggleMute}
          className="flex items-center gap-1.5 hover:text-sky-400 transition-colors"
          title={isMuted ? "Ovozni yoqish" : "Ovozni o'chirish"}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-400" /> : <Volume2 className="w-3.5 h-3.5 text-sky-400" />}
          <span className="text-[10px] font-bold">{isMuted ? 'Tovushsiz' : 'Ovozli'}</span>
        </button>
      </div>
    </div>
  );
}
