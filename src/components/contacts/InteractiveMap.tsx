'use client';

import React, { useState } from 'react';
import { MapPin, ExternalLink, Navigation } from 'lucide-react';

interface InteractiveMapProps {
  mapUrl?: string;
  address: string;
}

export function InteractiveMap({ mapUrl, address }: InteractiveMapProps) {
  const [isLoading, setIsLoading] = useState(true);

  const defaultYandexSearch = `https://yandex.uz/maps/?text=${encodeURIComponent(
    address || 'Zeekr Tashkent'
  )}`;

  return (
    <div className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-3xl overflow-hidden border border-slate-200/80 shadow-lg bg-slate-100">
      {mapUrl ? (
        <>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-slate-400 text-xs">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 animate-bounce text-slate-500" />
                <span>Xarita yuklanmoqda...</span>
              </div>
            </div>
          )}
          <iframe
            src={mapUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            title="Dilerlik markazi lokatsiyasi"
            onLoad={() => setIsLoading(false)}
            className="w-full h-full"
          />
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-slate-50">
          <MapPin className="w-10 h-10 text-slate-400 mb-3" />
          <h4 className="font-bold text-slate-900 text-base mb-1">
            Dilerlik markazi manzili
          </h4>
          <p className="text-xs text-slate-600 max-w-sm mb-4">
            {address}
          </p>
          <a
            href={defaultYandexSearch}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Navigation className="w-3.5 h-3.5" />
            Yandex Xaritada ochish
          </a>
        </div>
      )}

      {/* FLOATING ACTION PILL */}
      <div className="absolute bottom-4 right-4 z-10">
        <a
          href={defaultYandexSearch}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/90 hover:bg-white text-slate-900 rounded-xl text-xs font-semibold backdrop-blur-md shadow-md border border-slate-200/60 transition-all"
        >
          <span>Navigator</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
        </a>
      </div>
    </div>
  );
}
