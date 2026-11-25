'use client';

import React, { useState } from 'react';
import { TrimSelector } from './TrimSelector';
import { LoanCalculator } from './LoanCalculator';

interface ModelConfiguratorProps {
  trims: any[];
  basePriceUSD: number;
  rate: number;
  apr: number;
}

export function ModelConfigurator({ trims, basePriceUSD, rate, apr }: ModelConfiguratorProps) {
  const [selectedTrim, setSelectedTrim] = useState<any>(
    trims && trims.length > 0 ? trims[0] : null
  );

  const activePrice = selectedTrim ? selectedTrim.priceUSD : basePriceUSD;

  return (
    <div className="space-y-12">
      {trims && trims.length > 0 && (
        <div className="space-y-4">
          <TrimSelector
            trims={trims}
            selectedTrim={selectedTrim || trims[0]}
            onSelectTrim={setSelectedTrim}
            rate={rate}
          />
        </div>
      )}

      <LoanCalculator
        carPriceUSD={activePrice}
        rate={rate}
        apr={apr}
      />
    </div>
  );
}
