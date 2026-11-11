import { prisma } from '@/lib/prisma';
import { getSiteSettings } from '@/lib/settings';
import { HeroSection } from '@/components/home/HeroSection';
import { ModelShowcase } from '@/components/home/ModelShowcase';
import { InStockCarousel } from '@/components/home/InStockCarousel';
import { TechnologySection } from '@/components/home/TechnologySection';
import { QuickBookingSection } from '@/components/home/QuickBookingSection';

// Default static models fallback in case DB is during initial setup
const FALLBACK_MODELS = [
  {
    id: 'zeekr-001',
    slug: 'zeekr-001',
    name: 'Zeekr 001',
    tagline: 'Shooting Brake elektr flagmani',
    basePriceUSD: 44500,
    acceleration0100: 3.8,
    rangeKm: 741,
    batteryKwh: 100,
    mainImage: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'zeekr-007',
    slug: 'zeekr-007',
    name: 'Zeekr 007',
    tagline: 'Kelajak avlodi hashamatli sedani',
    basePriceUSD: 36500,
    acceleration0100: 2.84,
    rangeKm: 870,
    batteryKwh: 100,
    mainImage: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'zeekr-009',
    slug: 'zeekr-009',
    name: 'Zeekr 009',
    tagline: 'Birinchi klass elektr lyuks miniveni',
    basePriceUSD: 72000,
    acceleration0100: 4.5,
    rangeKm: 822,
    batteryKwh: 140,
    mainImage: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'zeekr-x',
    slug: 'zeekr-x',
    name: 'Zeekr X',
    tagline: 'Shahar uchun ixcham premium krossover',
    basePriceUSD: 29500,
    acceleration0100: 3.7,
    rangeKm: 560,
    batteryKwh: 66,
    mainImage: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
  },
];

export default async function HomePage() {
  const settings = await getSiteSettings();

  let models: any[] = [];
  let inStockItems: any[] = [];

  try {
    models = await prisma.carModel.findMany({
      where: { isActive: true },
      orderBy: { orderIndex: 'asc' },
    });

    inStockItems = await prisma.inventoryItem.findMany({
      where: { status: 'IN_STOCK' },
      include: {
        trim: {
          include: {
            model: true,
          },
        },
      },
      take: 6,
    });
  } catch (err) {
    console.error('Using fallback models data:', err);
  }

  if (models.length === 0) {
    models = FALLBACK_MODELS;
  }

  return (
    <div className="flex flex-col w-full">
      <HeroSection />
      <ModelShowcase models={models} rate={settings.usd_to_uzs_rate} />
      {inStockItems.length > 0 && (
        <InStockCarousel items={inStockItems} rate={settings.usd_to_uzs_rate} />
      )}
      <TechnologySection />
      <QuickBookingSection models={models.map((m) => ({ id: m.id, name: m.name }))} />
    </div>
  );
}
