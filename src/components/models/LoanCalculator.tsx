'use client';

import { useState } from 'react';
import { Calculator, ShieldAlert, ArrowRight } from 'lucide-react';
import { calculateMonthlyLoanPayment } from '@/lib/calculator';
import { formatCurrencyUSD, formatCurrencyUZS } from '@/lib/utils';

interface LoanCalculatorProps {
  carPriceUSD: number;
  rate: number;
  apr: number;
}

export function LoanCalculator({ carPriceUSD, rate, apr }: LoanCalculatorProps) {
  const [downPercent, setDownPercent] = useState(30);
  const [termMonths, setTermMonths] = useState(36);

  const result = calculateMonthlyLoanPayment({
    carPriceUSD,
    downPaymentPercent: downPercent,
    termMonths,
    annualInterestRatePercent: apr,
  });

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 border border-slate-800 shadow-xl space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400">
            <Calculator className="w-4 h-4" />
            Kredit & Lizing Kalkulyatori
          </div>
          <h3 className="text-2xl font-extrabold text-white mt-1">
            Qulay Oylik To&apos;lovni Hisoblang
          </h3>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300">
          Yillik stavka: <b className="text-white">{apr}%</b>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* SLIDERS */}
        <div className="lg:col-span-7 space-y-6">
          {/* DOWN PAYMENT SLIDER */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-400">Boshlang&apos;ich to&apos;lov ({downPercent}%)</span>
              <span className="text-white font-bold">
                {formatCurrencyUSD(result.downPaymentUSD)} (
                {formatCurrencyUZS(result.downPaymentUSD, rate)})
              </span>
            </div>
            <input
              type="range"
              min={20}
              max={70}
              step={5}
              value={downPercent}
              onChange={(e) => setDownPercent(Number(e.target.value))}
              className="w-full accent-sky-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>20% (Minimal)</span>
              <span>50%</span>
              <span>70%</span>
            </div>
          </div>

          {/* TERM BUTTONS */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-400">Kredit muddati</div>
            <div className="grid grid-cols-4 gap-2">
              {[12, 24, 36, 48].map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setTermMonths(term)}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${
                    termMonths === term
                      ? 'bg-sky-500 text-white border-sky-400 shadow'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {term} oy
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-start gap-2 text-xs text-slate-400 pt-2">
            <ShieldAlert className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              Hisob-kitob taqribiy ko&apos;rsatkich hisoblanadi. Yakuniy foiz stavkasi va shartlari O&apos;zbekiston banklarining lizing/kredit dasturiga ko&apos;ra belgilanadi.
            </p>
          </div>
        </div>

        {/* RESULTS CARD */}
        <div className="lg:col-span-5 bg-slate-950/80 rounded-2xl border border-slate-800 p-6 space-y-4 text-center">
          <div className="text-xs uppercase font-semibold text-slate-400">
            Kutilayotgan oylik to&apos;lov:
          </div>

          <div>
            <div className="text-3xl sm:text-4xl font-black text-sky-400">
              {formatCurrencyUSD(result.monthlyUSD)}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              ~ {formatCurrencyUZS(result.monthlyUSD, rate)} / oy
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 text-xs text-slate-400 space-y-2 text-left">
            <div className="flex justify-between">
              <span>Kredit summasi:</span>
              <strong className="text-white">{formatCurrencyUSD(result.loanAmountUSD)}</strong>
            </div>
            <div className="flex justify-between">
              <span>Boshlang&apos;ich to&apos;lov:</span>
              <strong className="text-white">{formatCurrencyUSD(result.downPaymentUSD)}</strong>
            </div>
          </div>

          <a
            href="#booking"
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white text-slate-950 font-bold text-xs hover:bg-slate-100 transition-colors shadow-lg shadow-white/5"
          >
            Lizing uchun ariza berish
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

