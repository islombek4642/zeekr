import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export interface SeedResult {
  adminCreated: boolean;
  settingsCount: number;
  modelsCount: number;
  trimsCount: number;
  colorsCount: number;
  inventoryCount: number;
}

export async function seedDatabase(client: PrismaClient = prisma): Promise<SeedResult> {
  console.log('[SEED] Starting database seed from JSON data...');

  const dataDir = fs.existsSync(path.join(process.cwd(), 'data'))
    ? path.join(process.cwd(), 'data')
    : path.join(__dirname, '..', 'data');

  // Load JSON datasets
  const modelsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'models.json'), 'utf-8'));
  const trimsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'trims.json'), 'utf-8'));
  const colorsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'colors.json'), 'utf-8'));
  const inventoryData = JSON.parse(fs.readFileSync(path.join(dataDir, 'inventory.json'), 'utf-8'));
  const settingsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'settings.json'), 'utf-8'));

  // 1. Admin User
  const passwordHash = await bcrypt.hash('ZeekrAdmin2026!', 10);
  await client.user.upsert({
    where: { email: 'admin@zeekr-auto.uz' },
    update: {},
    create: {
      email: 'admin@zeekr-auto.uz',
      name: 'Bosh Menejer',
      passwordHash,
      role: 'ADMIN',
    },
  });

  // 2. Settings
  let settingsCount = 0;
  for (const [key, value] of Object.entries(settingsData)) {
    await client.setting.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    });
    settingsCount++;
  }

  // 3. Models
  const createdModelsMap = new Map<string, string>(); // slug -> id
  let modelsCount = 0;

  for (const m of modelsData) {
    const createdModel = await client.carModel.upsert({
      where: { slug: m.slug },
      update: {
        name: m.name,
        tagline: m.tagline,
        basePriceUSD: m.basePriceUSD,
        acceleration0100: m.acceleration0100,
        rangeKm: m.rangeKm,
        batteryKwh: m.batteryKwh,
        powerHp: m.powerHp,
        topSpeedKmH: m.topSpeedKmH,
        chargingTimeMin: m.chargingTimeMin,
        mainImage: m.mainImage,
        galleryImages: m.galleryImages || [],
        description: m.description,
        orderIndex: m.orderIndex || 0,
        isActive: m.isActive !== undefined ? m.isActive : true,
      },
      create: {
        slug: m.slug,
        name: m.name,
        tagline: m.tagline,
        basePriceUSD: m.basePriceUSD,
        acceleration0100: m.acceleration0100,
        rangeKm: m.rangeKm,
        batteryKwh: m.batteryKwh,
        powerHp: m.powerHp,
        topSpeedKmH: m.topSpeedKmH,
        chargingTimeMin: m.chargingTimeMin,
        mainImage: m.mainImage,
        galleryImages: m.galleryImages || [],
        description: m.description,
        orderIndex: m.orderIndex || 0,
        isActive: m.isActive !== undefined ? m.isActive : true,
      },
    });
    createdModelsMap.set(m.slug, createdModel.id);
    modelsCount++;
  }

  // 4. Trims
  const createdTrimsMap = new Map<string, string>(); // modelSlug:trimName -> id
  let trimsCount = 0;

  for (const t of trimsData) {
    const modelId = createdModelsMap.get(t.modelSlug);
    if (!modelId) continue;

    const existingTrim = await client.carTrim.findFirst({
      where: { modelId, name: t.name },
    });

    let trimId = existingTrim?.id;

    if (existingTrim) {
      await client.carTrim.update({
        where: { id: existingTrim.id },
        data: {
          priceUSD: t.priceUSD,
          driveType: t.driveType,
          rangeKm: t.rangeKm,
          acceleration: t.acceleration,
          features: t.features || [],
        },
      });
    } else {
      const newTrim = await client.carTrim.create({
        data: {
          modelId,
          name: t.name,
          priceUSD: t.priceUSD,
          driveType: t.driveType,
          rangeKm: t.rangeKm,
          acceleration: t.acceleration,
          features: t.features || [],
        },
      });
      trimId = newTrim.id;
    }

    if (trimId) {
      createdTrimsMap.set(`${t.modelSlug}:${t.name}`, trimId);
      trimsCount++;
    }
  }

  // 5. Colors
  let colorsCount = 0;
  for (const c of colorsData) {
    const modelId = createdModelsMap.get(c.modelSlug);
    if (!modelId) continue;

    const existingColor = await client.carColor.findFirst({
      where: { modelId, name: c.name, isInterior: c.isInterior },
    });

    if (existingColor) {
      await client.carColor.update({
        where: { id: existingColor.id },
        data: {
          hexCode: c.hexCode,
          imageUrl: c.imageUrl,
        },
      });
    } else {
      await client.carColor.create({
        data: {
          modelId,
          name: c.name,
          hexCode: c.hexCode,
          imageUrl: c.imageUrl,
          isInterior: c.isInterior,
        },
      });
    }
    colorsCount++;
  }

  // 6. Inventory Items
  let inventoryCount = 0;
  for (const item of inventoryData) {
    const trimId = createdTrimsMap.get(`${item.modelSlug}:${item.trimName}`);
    if (!trimId) continue;

    await client.inventoryItem.upsert({
      where: { vinOrCode: item.vinOrCode },
      update: {
        trimId,
        exteriorColor: item.exteriorColor,
        interiorColor: item.interiorColor,
        year: item.year,
        status: item.status,
        priceUSD: item.priceUSD,
        priceUZS: item.priceUZS,
        images: item.images || [],
        notes: item.notes,
      },
      create: {
        vinOrCode: item.vinOrCode,
        trimId,
        exteriorColor: item.exteriorColor,
        interiorColor: item.interiorColor,
        year: item.year,
        status: item.status,
        priceUSD: item.priceUSD,
        priceUZS: item.priceUZS,
        images: item.images || [],
        notes: item.notes,
      },
    });
    inventoryCount++;
  }

  console.log(
    `[SEED] Done! Seeded ${modelsCount} models, ${trimsCount} trims, ${colorsCount} colors, ${inventoryCount} inventory units, ${settingsCount} settings.`
  );

  return {
    adminCreated: true,
    settingsCount,
    modelsCount,
    trimsCount,
    colorsCount,
    inventoryCount,
  };
}

// Auto-run when executed directly
if (require.main === module || (typeof process !== 'undefined' && process.argv[1]?.includes('seed.ts'))) {
  seedDatabase()
    .catch((e) => {
      console.error('[SEED ERROR]', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
