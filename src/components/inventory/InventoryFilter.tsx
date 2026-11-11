'use client';

import React from 'react';
import { Filter, Check } from 'lucide-react';

interface ModelOption {
  id: string;
  name: string;
  slug: string;
}

interface InventoryFilterProps {
  models: ModelOption[];
  selectedModel: string;
  selectedStatus: string;
  onModelChange: (modelSlug: string) => void;
  onStatusChange: (status: string) => void;
  totalCount: number;
}

export function InventoryFilter({
  models,
  selectedModel,
  selectedStatus,
  onModelChange,
  onStatusChange,
  totalCount,
}: InventoryFilterProps) {
  const statusOptions = [
    { label: 'Barchasi', value: 'all' },
    { label: 'Salonda mavjud', value: 'IN_STOCK' },
    { label: "Yo'lda (Tez kunda)", value: 'IN_TRANSIT' },
  ];

  return (
    <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-5 mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* MODEL FILTER BUTTONS */}
        <div className="space-y-2">
          <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
            Model bo&apos;yicha:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onModelChange('all')}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                selectedModel === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Barcha modellar
            </button>
            {models.map((m) => (
              <button
                key={m.id}
                onClick={() => onModelChange(m.slug)}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                  selectedModel === m.slug
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>

        {/* STATUS FILTER PILLS & COUNT */}
        <div className="space-y-2">
          <div className="flex items-center justify-between md:justify-end gap-2">
            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              Mavjudlik holati:
            </span>
            <span className="text-xs text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200 font-mono">
              {totalCount} ta avtomobil
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {statusOptions.map((st) => (
              <button
                key={st.value}
                onClick={() => onStatusChange(st.value)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                  selectedStatus === st.value
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {selectedStatus === st.value && <Check className="w-3.5 h-3.5" />}
                {st.label}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

