import { Zap, ShieldCheck, Cpu, Flame } from 'lucide-react';

export function TechnologySection() {
  const techCards = [
    {
      icon: Zap,
      title: '800V Yuqori Tezlikdagi Arxitektura',
      desc: '15 daqiqada 500 km gacha quvvatlanish imkoniyati. Zaryadlash stansiyasida uzoq kutish davri ortda qoldi.',
    },
    {
      icon: Cpu,
      title: 'Geely SEA (Sustainable Experience Architecture)',
      desc: 'Volvo va Geely muhandislari tomonidan ishlab chiqilgan modulli intellektual elektr platformasi.',
    },
    {
      icon: ShieldCheck,
      title: '5 Yulduzli Xavfsizlik Kafolati',
      desc: 'Euro NCAP xavfsizlik sinovlaridan eng yuqori ball. Kuchaytirilgan titan-alyuminiy batareya himoyasi.',
    },
    {
      icon: Flame,
      title: 'Termal Boshqaruv & Qishki Rejim',
      desc: 'O‘zbekistonning yozgi issiq va qishki sovuq iqlimiga to‘liq moslashtirilgan batareya haroratini boshqarish tizimi.',
    },
  ];

  return (
    <section className="py-24 bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-2xl mb-16 space-y-3">
          <div className="text-xs uppercase font-bold tracking-widest text-sky-400">
            Ilg&apos;or Texnologiyalar
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Kelajak Muhandisligi Bugun Siz Bilan
          </h2>
          <p className="text-sm text-slate-400">
            Zeekr avtomobillari faqatgina hashamatli emas, balki eng yangi xavfsizlik va akkumulyator muhandisligining cho&apos;qqisidir.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {techCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div
                key={i}
                className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mb-6">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 leading-snug">
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

