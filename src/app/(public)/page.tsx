import { getSiteSettings } from '@/lib/settings';
import { getCarModels, getInStockVehicles } from '@/lib/data-provider';
import { HeroSection } from '@/components/home/HeroSection';
import { ModelShowcase } from '@/components/home/ModelShowcase';
import { InStockCarousel } from '@/components/home/InStockCarousel';
import { TechnologySection } from '@/components/home/TechnologySection';
import { QuickBookingSection } from '@/components/home/QuickBookingSection';

export default async function HomePage() {
  const settings = await getSiteSettings();
  const models = await getCarModels();
  const inStockItems = await getInStockVehicles(6);

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
