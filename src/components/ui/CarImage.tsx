'use client';

import { useState, useEffect } from 'react';
import { Car } from 'lucide-react';

interface CarImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
}

export function CarImage({
  src,
  alt,
  className = 'absolute inset-0 w-full h-full object-cover object-center',
  loading = 'lazy',
}: CarImageProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (hasError || !src) {
    return (
      <div
        className="absolute inset-0 w-full h-full bg-slate-100 flex flex-col items-center justify-center text-slate-400"
        role="img"
        aria-label={alt}
      >
        <Car className="w-10 h-10 text-slate-300 mb-1" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Zeekr
        </span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={loading}
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
