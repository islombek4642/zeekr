import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { getSiteSettings } from '@/lib/settings';
import { TestDriveWizard } from '@/components/test-drive/TestDriveWizard';
import { Sparkles, MapPin, Clock, ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Test-drayvga yozilish — Zeekr Uzbekistan',
  description: 'Rasmiy Zeekr avtomobillarini Toshkentda bepul sinovdan o’tkazing. 0-100 km/s tezlanish, intellektual haydash tizimlari va yuqori darajadagi xavfsizlik.',
};

interface TestDrivePageProps {
  searchParams: Promise<{ model?: string }>;
}

export default async function TestDrivePage({ searchParams }: TestDrivePageProps) {
  const params = await searchParams;
  const preselectedModelSlug = params?.model;

  let models: any[] = [];
  let settings = await getSiteSettings();

  try {
    models = await prisma.carModel.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        tagline: true,
        mainImage: true,
        acceleration0100: true,
        rangeKm: true,
      },
      orderBy: { orderIndex: 'asc' },
    });
  } catch (err) {
    console.error('Error fetching models for test-drive:', err);
  }

  return (
    <main className="min-h-screen bg-slate-50/50 pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER SECTION */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 text-white text-xs font-semibold uppercase tracking-wider mb-3 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Bepul sinov haydovi</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            Zeekr&apos;ni Yo&apos;lda His Qiling
          </h1>
          <p className="text-sm text-slate-600 mt-3 leading-relaxed">
            Ilg&apos;or 800V platforma, 3.8 soniyalik tezlanish va Skandinaviya hashamatini professional maslahatchimiz hamrohligida Toshkent ko&apos;chalarida sinab ko&apos;ring.
          </p>
        </div>

        {/* WIZARD CARD */}
        <TestDriveWizard
          models={models}
          preselectedModelSlug={preselectedModelSlug}
          showroomAddress={settings.showroom_address || "Toshkent shahri, Sergeli tumani"}
        />

        {/* BENEFITS BANNER */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-xs text-slate-600">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col items-center">
            <Clock className="w-5 h-5 text-slate-800 mb-2" />
            <div className="font-bold text-slate-900 text-sm">30-45 daqiqa</div>
            <div className="text-slate-500 mt-0.5">To&apos;liq yo&apos;l sinovi va xususiyatlar namoyishi</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col items-center">
            <ShieldCheck className="w-5 h-5 text-emerald-600 mb-2" />
            <div className="font-bold text-slate-900 text-sm">To&apos;liq sug&apos;urtalangan</div>
            <div className="text-slate-500 mt-0.5">Barcha sinov avtomobillari rasmiy KASKO bilan himoyalangan</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col items-center">
            <MapPin className="w-5 h-5 text-slate-800 mb-2" />
            <div className="font-bold text-slate-900 text-sm">Dilerlik markazida</div>
            <div className="text-slate-500 mt-0.5">Qulay kutish zali va espresso kofe xizmati</div>
          </div>
        </div>

      </div>
    </main>
  );
}
