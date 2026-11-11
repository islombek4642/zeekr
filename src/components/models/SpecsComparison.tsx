import { Gauge, Zap, BatteryCharging, Shield, Activity, Clock } from 'lucide-react';

interface CarModelSpecs {
  name: string;
  acceleration0100: number;
  rangeKm: number;
  batteryKwh: number;
  powerHp: number;
  topSpeedKmH: number;
  chargingTimeMin: number;
}

export function SpecsComparison({ specs }: { specs: CarModelSpecs }) {
  const specItems = [
    {
      icon: Gauge,
      label: '0–100 km/s Tezlanish',
      value: `${specs.acceleration0100} soniya`,
      desc: 'Ikki motorli elektr to‘liq uzatma tizimi',
    },
    {
      icon: Zap,
      label: 'Zaxira Masofasi (CLTC)',
      value: `${specs.rangeKm} km`,
      desc: 'Bitta to‘liq quvvatlanishda bosib o‘tish masofasi',
    },
    {
      icon: BatteryCharging,
      label: 'Akkumulyator Sig‘imi',
      value: `${specs.batteryKwh} kVt/soat`,
      desc: 'CATL Qilin / Golden Battery litiy-ion bloklari',
    },
    {
      icon: Activity,
      label: 'Dvigatel Quvvati',
      value: `${specs.powerHp} ot kuchi`,
      desc: 'Yuqori samaradorlikka ega doimiy magnitli motor',
    },
    {
      icon: Shield,
      label: 'Maksimal Tezlik',
      value: `${specs.topSpeedKmH} km/soat`,
      desc: 'Elektron cheklangan xavfsiz sport tezligi',
    },
    {
      icon: Clock,
      label: 'Tezkor Zaryadlanish',
      value: `${specs.chargingTimeMin} daqiqa`,
      desc: '800V DC stansiyasida 10% dan 80% gacha',
    },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm space-y-8">
      <div>
        <span className="text-xs uppercase font-bold tracking-wider text-sky-600 block">
          Texnik Imkoniyatlar
        </span>
        <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
          {specs.name} Asosiy Xarakteristikalari
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {specItems.map((item, i) => {
          const Icon = item.icon;
          return (
            <div
              key={i}
              className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-4 hover:border-slate-200 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-900 flex items-center justify-center shrink-0 shadow-sm">
                <Icon className="w-5 h-5 text-sky-600" />
              </div>
              <div className="space-y-1">
                <div className="text-xs text-slate-500 font-medium">{item.label}</div>
                <div className="text-lg font-bold text-slate-900">{item.value}</div>
                <div className="text-[11px] text-slate-400 leading-snug">{item.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

