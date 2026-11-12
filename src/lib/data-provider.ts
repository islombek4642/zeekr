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
    .map((m) => ({
      id: m.slug,
      ...m,
    }));
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

