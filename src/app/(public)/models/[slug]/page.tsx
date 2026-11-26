import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCarModelBySlug } from '@/lib/data-provider';
import { getSiteSettings } from '@/lib/settings';
import { getCurrentLocale, getTranslations } from '@/lib/i18n';
import { ColorVisualizer } from '@/components/models/ColorVisualizer';
import { SpecsComparison } from '@/components/models/SpecsComparison';
import { ModelConfigurator } from '@/components/models/ModelConfigurator';
import { QuickBookingSection } from '@/components/home/QuickBookingSection';
import { ArrowLeft, Calendar } from 'lucide-react';
import { formatCurrencyUSD, formatCurrencyUZS } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface ModelPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ModelDetailPage({ params }: ModelPageProps) {
  const { slug } = await params;
  const [settings, locale] = await Promise.all([
    getSiteSettings(),
    getCurrentLocale(),
  ]);
  const model = await getCarModelBySlug(slug);

  if (!model || model.isActive === false) {
    notFound();
  }

  const t = getTranslations(locale);
  const defaultPrice = model.basePriceUSD;
  const validGalleryImages = (model.galleryImages || []).filter(
    (img: string) => typeof img === 'string' && img.trim().length > 0
  );

  const modelVideos: Record<string, string> = {
    'zeekr-001': '/videos/cars/zeekr-001-hero.mp4',
    'zeekr-001-2025': '/videos/cars/zeekr-001-hero.mp4',
    'zeekr-001-all-new': '/videos/cars/zeekr-001-hero.mp4',
    'zeekr-007': '/videos/cars/zeekr-007-hero.mp4',
    'zeekr-007-gt': '/videos/cars/zeekr-007-hero.mp4',
    'zeekr-7x': '/videos/cars/zeekr-7x-hero.mp4',
    'zeekr-8x': '/videos/cars/zeekr-7x-hero.mp4',
    'zeekr-8x-yaoying': '/videos/cars/zeekr-9x-hero.mp4',
    'zeekr-9x': '/videos/cars/zeekr-9x-hero.mp4',
  };
  const modelVideo = modelVideos[slug];

  return (
    <div className="bg-white min-h-screen py-10 space-y-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* BREADCRUMB & BACK */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <Link
            href="/#models"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-950 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.models.backToModels}
          </Link>
          <span className="text-xs uppercase font-bold text-sky-600 tracking-wider">
            {t.models.pageTitle}
          </span>
        </div>

        {/* TOP HERO OVERVIEW */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider">
              {model.name}
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-slate-950 tracking-tight leading-none">
              {model.name}
            </h1>

            <p className="text-lg text-slate-600 font-normal max-w-xl">
              {model.tagline}
            </p>

            <p className="text-sm text-slate-500 leading-relaxed max-w-xl">
              {model.description}
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div>
                <span className="text-xs text-slate-400 font-medium block">
                  {t.common.priceFrom}:
                </span>
                <span className="text-3xl font-black text-slate-950">
                  {formatCurrencyUSD(defaultPrice)}
                </span>
                <span className="text-xs text-slate-500 block">
                  ~ {formatCurrencyUZS(defaultPrice, settings.usd_to_uzs_rate)}
                </span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <a
                  href="#booking"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-950 text-white font-bold text-xs hover:bg-slate-800 transition-colors shadow-sm"
                >
                  <Calendar className="w-4 h-4" />
                  {t.common.testDrive}
                </a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative aspect-[16/10] rounded-2xl overflow-hidden border border-slate-200 shadow-xl bg-slate-900 group">
            {modelVideo ? (
              <video
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                poster={model.mainImage}
                className="w-full h-full object-cover object-center"
              >
                <source src={modelVideo} type="video/mp4" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={model.mainImage}
                  alt={model.name}
                  className="w-full h-full object-cover object-center"
                />
              </video>
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={model.mainImage}
                alt={model.name}
                className="w-full h-full object-cover object-center"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>

        {/* 1. INTERACTIVE COLOR VISUALIZER */}
        <ColorVisualizer
          modelName={model.name}
          mainImage={model.mainImage}
          colors={model.colors}
        />

        {/* 2. SPECS COMPARISON */}
        <SpecsComparison specs={model} />

        {/* 3. DYNAMIC CONFIGURATOR (TRIM SELECTOR & LOAN CALCULATOR) */}
        <ModelConfigurator
          trims={model.trims || []}
          basePriceUSD={model.basePriceUSD}
          rate={settings.usd_to_uzs_rate}
          apr={settings.default_loan_apr}
        />

        {/* 4. GALLERY IMAGES SECTION */}
        {validGalleryImages.length > 0 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-sky-600 block">
                {t.models.galleryTitle}
              </span>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                {model.name} {t.models.gallerySubtitle}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {validGalleryImages.map((imgUrl: string, idx: number) => (
                <div
                  key={idx}
                  className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-sm"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imgUrl}
                    alt={`${model.name} galereya ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. MODEL-SPECIFIC TEST DRIVE BOOKING */}
        <div id="booking">
          <QuickBookingSection models={[{ id: model.id, name: model.name }]} />
        </div>

      </div>
    </div>
  );
}
