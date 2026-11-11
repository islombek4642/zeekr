'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';

interface CarColor {
  id: string;
  name: string;
  hexCode: string;
  imageUrl: string;
  isInterior: boolean;
}

interface ColorVisualizerProps {
  modelName: string;
  mainImage: string;
  colors: CarColor[];
}

export function ColorVisualizer({ modelName, mainImage, colors }: ColorVisualizerProps) {
  const exteriorColors = colors.filter((c) => !c.isInterior);
  const interiorColors = colors.filter((c) => c.isInterior);

  const [activeTab, setActiveTab] = useState<'exterior' | 'interior'>('exterior');
  const [selectedExterior, setSelectedExterior] = useState<CarColor | null>(
    exteriorColors[0] || null
  );
  const [selectedInterior, setSelectedInterior] = useState<CarColor | null>(
    interiorColors[0] || null
  );

  const activeImage =
    activeTab === 'exterior'
      ? selectedExterior?.imageUrl || mainImage
      : selectedInterior?.imageUrl || mainImage;

  const activeColorName =
    activeTab === 'exterior'
      ? selectedExterior?.name || 'Standart'
      : selectedInterior?.name || 'Standart';

  return (
    <div className="bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden shadow-sm p-6 sm:p-8 space-y-6">
      
      {/* HEADER WITH TOGGLE TABS */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-sky-600 block">
            Interaktiv Visualizator
          </span>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
            {activeTab === 'exterior' ? 'Eksteryer Ranglari' : 'Interyer & Salon'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Tanlangan: <strong className="text-slate-900">{activeColorName}</strong>
          </p>
        </div>

        {interiorColors.length > 0 && (
          <div className="inline-flex rounded-lg bg-slate-200/80 p-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('exterior')}
              className={`px-4 py-1.5 rounded-md transition-all ${
                activeTab === 'exterior'
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              Eksteryer
            </button>
            <button
              onClick={() => setActiveTab('interior')}
              className={`px-4 py-1.5 rounded-md transition-all ${
                activeTab === 'interior'
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              Interyer
            </button>
          </div>
        )}
      </div>

      {/* CAR PREVIEW CANVAS */}
      <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-inner flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={activeImage}
          src={activeImage}
          alt={`${modelName} - ${activeColorName}`}
          className="w-full h-full object-cover object-center animate-in fade-in duration-500"
        />

        <div className="absolute bottom-4 left-4 px-3 py-1 rounded-full bg-slate-950/70 backdrop-blur text-xs font-medium text-white">
          {modelName} • {activeColorName}
        </div>
      </div>

      {/* COLOR SWATCHES */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        {(activeTab === 'exterior' ? exteriorColors : interiorColors).map((color) => {
          const isSelected =
            activeTab === 'exterior'
              ? selectedExterior?.id === color.id
              : selectedInterior?.id === color.id;

          return (
            <button
              key={color.id}
              onClick={() => {
                if (activeTab === 'exterior') setSelectedExterior(color);
                else setSelectedInterior(color);
              }}
              className={`group flex items-center gap-2.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                isSelected
                  ? 'border-slate-900 bg-white shadow-sm ring-2 ring-slate-900/10 text-slate-950'
                  : 'border-slate-200 bg-white/60 hover:bg-white text-slate-600'
              }`}
            >
              <span
                className="w-4 h-4 rounded-full border border-slate-300 shadow-sm flex items-center justify-center"
                style={{ backgroundColor: color.hexCode }}
              >
                {isSelected && <Check className="w-2.5 h-2.5 text-slate-900 drop-shadow" />}
              </span>
              <span>{color.name}</span>
            </button>
          );
        })}
      </div>

    </div>
  );
}

