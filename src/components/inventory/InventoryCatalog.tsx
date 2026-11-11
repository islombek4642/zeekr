'use client';

import React, { useState } from 'react';
import { InventoryFilter } from './InventoryFilter';
import { VehicleCard } from './VehicleCard';
import { ReserveModal, VehicleReservationItem } from './ReserveModal';
import { filterInventoryItems } from '@/lib/inventory-filter';
import { Car, Search } from 'lucide-react';

interface ModelOption {
  id: string;
  name: string;
  slug: string;
}

interface InventoryCatalogProps {
  initialItems: (VehicleReservationItem & {
    status: string;
    images?: string[];
  })[];
  models: ModelOption[];
  usdRate: number;
}

export function InventoryCatalog({
  initialItems,
  models,
  usdRate,
}: InventoryCatalogProps) {
  const [selectedModel, setSelectedModel] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleReservationItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredItems = filterInventoryItems(initialItems, {
    modelSlug: selectedModel,
    status: selectedStatus,
  });

  const handleOpenReserve = (vehicle: VehicleReservationItem) => {
    setSelectedVehicle(vehicle);
    setIsModalOpen(true);
  };

  const handleCloseReserve = () => {
    setIsModalOpen(false);
    setSelectedVehicle(null);
  };

  return (
    <div>
      <InventoryFilter
        models={models}
        selectedModel={selectedModel}
        selectedStatus={selectedStatus}
        onModelChange={setSelectedModel}
        onStatusChange={setSelectedStatus}
        totalCount={filteredItems.length}
      />

      {filteredItems.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-12 text-center my-8">
          <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            Ushbu parametrlar bo&apos;yicha avtomobillar topilmadi
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
            Filtr sozlamalarini o&apos;zgartirib ko&apos;ring yoki dilerlik markazimiz bilan bog&apos;lanib, buyurtma asosida yetkazish muddatini aniqlang.
          </p>
          <button
            onClick={() => {
              setSelectedModel('all');
              setSelectedStatus('all');
            }}
            className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Filtrlarni tozalash
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredItems.map((item) => (
            <VehicleCard
              key={item.id}
              item={item}
              usdRate={usdRate}
              onReserve={handleOpenReserve}
            />
          ))}
        </div>
      )}

      <ReserveModal
        item={selectedVehicle}
        isOpen={isModalOpen}
        onClose={handleCloseReserve}
        usdRate={usdRate}
      />
    </div>
  );
}

