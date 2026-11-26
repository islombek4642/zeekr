import fs from 'fs';
import path from 'path';
import { prisma } from './prisma';
import { SiteSettings } from '@/types/settings';

function getDataDir(): string {
  const p1 = path.join(process.cwd(), 'data');
  if (fs.existsSync(p1)) return p1;
  return path.join(__dirname, '..', '..', 'data');
}

export function loadJsonFile<T>(filename: string): T {
  const filePath = path.join(getDataDir(), filename);
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

export function getDefaultSettings(): SiteSettings {
  return loadJsonFile<SiteSettings>('settings.json');
}

export interface TechnologyItem {
  icon: string;
  title: string;
  desc: string;
}

export function getTechnologies(): TechnologyItem[] {
  return loadJsonFile<TechnologyItem[]>('technologies.json');
}

export async function getCarModels() {
  try {
    const dbModels = await prisma.carModel.findMany({
      where: { isActive: true },
      orderBy: { orderIndex: 'asc' },
    });
    if (dbModels && dbModels.length > 0) {
      return dbModels;
    }
  } catch (err) {
    console.warn('[DATA_PROVIDER] DB model query error, falling back to JSON:', err);
  }

  // Fallback to JSON database
  const jsonModels = loadJsonFile<any[]>('models.json');
  return jsonModels
    .filter((m) => m.isActive !== false)
    .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
    .map((m) => ({
      id: m.slug,
      ...m,
    }));
}

export async function getCarModelBySlug(slug: string) {
  const targetSlug = slug === 'zeekr-001-2025' ? 'zeekr-001' : slug;
  try {
    const dbModel = await prisma.carModel.findUnique({
      where: { slug: targetSlug },
      include: {
        trims: true,
        colors: true,
      },
    });
    if (dbModel) {
      return dbModel.isActive ? dbModel : null;
    }
    const dbCount = await prisma.carModel.count();
    if (dbCount > 0) {
      return null;
    }
  } catch (err) {
    console.warn(`[DATA_PROVIDER] DB model detail query error for "${slug}", falling back to JSON:`, err);
  }

  // Fallback to JSON database
  const jsonModels = loadJsonFile<any[]>('models.json');
  const model = jsonModels.find((m) => (m.slug === targetSlug || m.slug === slug) && m.isActive !== false);
  if (!model) {
    return null;
  }

  const resolvedSlug = model.slug;
  const jsonTrims = loadJsonFile<any[]>('trims.json');
  const jsonColors = loadJsonFile<any[]>('colors.json');

  const trims = jsonTrims
    .filter((t) => t.modelSlug === resolvedSlug)
    .map((t, idx) => ({
      id: `${resolvedSlug}-trim-${idx + 1}`,
      modelId: resolvedSlug,
      ...t,
    }));

  const colors = jsonColors
    .filter((c) => c.modelSlug === resolvedSlug)
    .map((c, idx) => ({
      id: `${resolvedSlug}-color-${idx + 1}`,
      modelId: resolvedSlug,
      ...c,
    }));

  return {
    id: model.slug,
    ...model,
    trims,
    colors,
  };
}

export async function getInStockVehicles(take = 6) {
  try {
    const items = await prisma.inventoryItem.findMany({
      where: { status: 'IN_STOCK' },
      include: {
        trim: {
          include: {
            model: true,
          },
        },
      },
      take,
    });
    if (items && items.length > 0) {
      return items;
    }
  } catch (err) {
    console.warn('[DATA_PROVIDER] DB inventory query error, falling back to JSON:', err);
  }

  // Fallback to JSON database
  const jsonInventory = loadJsonFile<any[]>('inventory.json');
  const jsonModels = loadJsonFile<any[]>('models.json');

  return jsonInventory
    .filter((item) => item.status === 'IN_STOCK')
    .slice(0, take)
    .map((item) => {
      const model = jsonModels.find((m) => m.slug === item.modelSlug) || {
        name: item.modelSlug,
        slug: item.modelSlug,
      };
      return {
        id: item.vinOrCode,
        vinOrCode: item.vinOrCode,
        exteriorColor: item.exteriorColor,
        interiorColor: item.interiorColor,
        year: item.year,
        status: item.status,
        priceUSD: item.priceUSD,
        priceUZS: item.priceUZS,
        images: item.images || [],
        trim: {
          name: item.trimName,
          model: {
            name: model.name,
            slug: model.slug,
          },
        },
      };
    });
}

export async function getInventoryCatalogData() {
  try {
    const [fetchedItems, fetchedModels] = await Promise.all([
      prisma.inventoryItem.findMany({
        where: {
          status: { in: ['IN_STOCK', 'IN_TRANSIT'] },
          trim: {
            model: {
              isActive: true,
            },
          },
        },
        include: {
          trim: {
            include: {
              model: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.carModel.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          slug: true,
        },
        orderBy: {
          orderIndex: 'asc',
        },
      }),
    ]);

    if (fetchedModels.length > 0) {
      const items = fetchedItems
        .filter((item) => item.trim?.model?.isActive !== false)
        .map((item) => ({
          id: item.id,
          vinOrCode: item.vinOrCode,
          year: item.year,
          exteriorColor: item.exteriorColor,
          interiorColor: item.interiorColor,
          status: item.status,
          priceUSD: item.priceUSD,
          images: item.images,
          trim: {
            id: item.trim.id,
            name: item.trim.name,
            driveType: item.trim.driveType,
            rangeKm: item.trim.rangeKm,
            acceleration: item.trim.acceleration,
            model: {
              id: item.trim.model.id,
              name: item.trim.model.name,
              slug: item.trim.model.slug,
              mainImage: item.trim.model.mainImage,
            },
          },
        }));
      return { items, models: fetchedModels };
    }
  } catch (err) {
    console.warn('[DATA_PROVIDER] DB inventory catalog error, falling back to JSON:', err);
  }

  // Fallback to JSON database
  const jsonInventory = loadJsonFile<any[]>('inventory.json');
  const jsonModels = loadJsonFile<any[]>('models.json');
  const jsonTrims = loadJsonFile<any[]>('trims.json');

  const activeModels = jsonModels
    .filter((m) => m.isActive !== false)
    .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
  const activeModelBySlug = new Map(activeModels.map((m) => [m.slug, m]));

  const models = activeModels.map((m) => ({
    id: m.slug,
    name: m.name,
    slug: m.slug,
  }));

  const items = jsonInventory
    .filter(
      (item) =>
        (item.status === 'IN_STOCK' || item.status === 'IN_TRANSIT') &&
        activeModelBySlug.has(item.modelSlug)
    )
    .map((item) => {
      const model = activeModelBySlug.get(item.modelSlug)!;
      const trim = jsonTrims.find(
        (t) => t.modelSlug === item.modelSlug && t.name === item.trimName
      );
      return {
        id: item.vinOrCode,
        vinOrCode: item.vinOrCode,
        year: item.year,
        exteriorColor: item.exteriorColor,
        interiorColor: item.interiorColor,
        status: item.status,
        priceUSD: item.priceUSD,
        images: item.images || [],
        trim: {
          id: `${item.modelSlug}:${item.trimName}`,
          name: item.trimName,
          driveType: trim?.driveType || 'AWD',
          rangeKm: trim?.rangeKm || model.rangeKm || 700,
          acceleration: trim?.acceleration || model.acceleration0100 || 3.8,
          model: {
            id: model.slug,
            name: model.name,
            slug: model.slug,
            mainImage: model.mainImage,
          },
        },
      };
    });

  return { items, models };
}
