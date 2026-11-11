import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Zeekr database...');

  // 1. Admin User
  const passwordHash = await bcrypt.hash('ZeekrAdmin2026!', 10);
  await prisma.user.upsert({
    where: { email: 'admin@zeekr-auto.uz' },
    update: {},
    create: {
      email: 'admin@zeekr-auto.uz',
      name: 'Bosh Menejer',
      passwordHash,
      role: 'ADMIN',
    },
  });

  // 2. Dynamic Settings (Zero hardcoded data)
  const defaultSettings: Record<string, string> = {
    showroom_address: "Toshkent shahri, Sergeli tumani, Yangi Sergeli ko'chasi, 45-uy",
    primary_phone: '+998712000000',
    secondary_phone: '+998901234567',
    contact_email: 'info@zeekr-auto.uz',
    working_hours: 'Har kuni 09:00 dan 20:00 gacha (dam olish kunlarisiz)',
    map_iframe_url: 'https://yandex.uz/map-widget/v1/?ll=69.2163%2C41.2255&z=15',
    telegram_channel: 'https://t.me/zeekr_uzbekistan',
    instagram_url: 'https://instagram.com/zeekr.uzbekistan',
    youtube_url: 'https://youtube.com/@zeekruzbekistan',
    usd_to_uzs_rate: '12850',
    default_loan_apr: '22',
    telegram_bot_token: '',
    telegram_chat_id: '',
  };

  for (const [key, value] of Object.entries(defaultSettings)) {
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  // 3. Zeekr Models
  const models = [
    {
      slug: 'zeekr-001',
      name: 'Zeekr 001',
      tagline: 'Shooting Brake elektr flagmani',
      basePriceUSD: 44500,
      acceleration0100: 3.8,
      rangeKm: 741,
      batteryKwh: 100,
      powerHp: 544,
      topSpeedKmH: 200,
      chargingTimeMin: 15,
      mainImage: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80',
      ],
      description: 'Zeekr 001 — zamonaviy aerodinamik Shooting Brake kuzovi, 800V yuqori tezlikdagi zaryadlash va pnevmatik osma bilan jihozlangan premium sportbek.',
      orderIndex: 1,
      trims: [
        {
          name: 'WE Version 100kWh (RWD)',
          priceUSD: 44500,
          driveType: 'RWD',
          rangeKm: 741,
          acceleration: 5.9,
          features: ['100 kVt/s batareya', 'Orqa g’ildirakli privod', 'Matrix LED chiroqlar', 'Yamaha audio tizimi (11 dinamik)'],
        },
        {
          name: 'ME Version 100kWh (AWD)',
          priceUSD: 49500,
          driveType: 'AWD',
          rangeKm: 656,
          acceleration: 3.8,
          features: ['Ikki motorli to’liq privod', '544 ot kuchi', '3.8 soniyada 100 km/s', 'Massaj va ventilyatsiyali o’rindiqlar'],
        },
        {
          name: 'YOU Version 100kWh (AWD Air Suspension)',
          priceUSD: 54900,
          driveType: 'AWD',
          rangeKm: 656,
          acceleration: 3.8,
          features: ['Pnevmatik podveska (balandlikni sozlash)', 'Avtomatik eshik ochilish tizimi', 'Nappa teri saloni', 'Brembo tormoz tizimi'],
        },
      ],
      colors: [
        { name: 'Polar White', hexCode: '#F8FAFC', imageUrl: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80', isInterior: false },
        { name: 'Phantom Black', hexCode: '#0F172A', imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80', isInterior: false },
        { name: 'Electric Orange', hexCode: '#EA580C', imageUrl: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80', isInterior: false },
        { name: 'Krem & Kulrang Nappa', hexCode: '#E2E8F0', imageUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80', isInterior: true },
      ],
    },
    {
      slug: 'zeekr-007',
      name: 'Zeekr 007',
      tagline: 'Kelajak avlodi hashamatli sedani',
      basePriceUSD: 36500,
      acceleration0100: 2.84,
      rangeKm: 870,
      batteryKwh: 100,
      powerHp: 646,
      topSpeedKmH: 210,
      chargingTimeMin: 15,
      mainImage: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
      ],
      description: 'Zeekr 007 — 90 dyuymli Zeekr Stargate interaktiv chiroqlar paneli, 800V Golden Battery texnologiyasi va 15 daqiqada 500 km quvvat oluvchi super sedan.',
      orderIndex: 2,
      trims: [
        {
          name: 'Long Range RWD 100kWh',
          priceUSD: 36500,
          driveType: 'RWD',
          rangeKm: 870,
          acceleration: 5.4,
          features: ['870 km CLTC masofa', 'Stargate LED ekran', 'Qualcomm 8295 chip', 'AR-HUD 35.5 dyuym'],
        },
        {
          name: 'AWD Performance 100kWh',
          priceUSD: 42900,
          driveType: 'AWD',
          rangeKm: 770,
          acceleration: 2.84,
          features: ['0-100 km/s: 2.84 soniya', 'CCD elektromagnit podveska', '646 ot kuchi', '21 dyuymli sport disklar'],
        },
      ],
      colors: [
        { name: 'Dawn Silver', hexCode: '#CBD5E1', imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80', isInterior: false },
        { name: 'Obsidian Black', hexCode: '#020617', imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80', isInterior: false },
      ],
    },
    {
      slug: 'zeekr-009',
      name: 'Zeekr 009',
      tagline: 'Birinchi klass elektr lyuks miniveni',
      basePriceUSD: 72000,
      acceleration0100: 4.5,
      rangeKm: 822,
      batteryKwh: 140,
      powerHp: 544,
      topSpeedKmH: 190,
      chargingTimeMin: 28,
      mainImage: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
      ],
      description: 'Zeekr 009 — xususiy samolyot qulayligidagi ikkinchi qator Sofaro kreslolari, CATL Qilin batareyasi va dunyodagi eng xavfsiz MPV korpusi.',
      orderIndex: 3,
      trims: [
        {
          name: 'WE Version 116kWh',
          priceUSD: 72000,
          driveType: 'AWD',
          rangeKm: 702,
          acceleration: 4.5,
          features: ['Sofaro birinchi klass o’rindiqlari', '15.6 dyuymli shift monitori', 'Yamaha surround audio (20 dinamik)'],
        },
        {
          name: 'ME Version 140kWh (CATL Qilin)',
          priceUSD: 84000,
          driveType: 'AWD',
          rangeKm: 822,
          acceleration: 4.5,
          features: ['140 kVt/s jahon rekordi batareyasi', '822 km masofa', 'Pnevmatik podveska', 'VIP 4-o’rinli yoki 6-o’rinli salon'],
        },
      ],
      colors: [
        { name: 'Crystal White', hexCode: '#FFFFFF', imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80', isInterior: false },
        { name: 'Midnight Blue', hexCode: '#1E293B', imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80', isInterior: false },
      ],
    },
    {
      slug: 'zeekr-x',
      name: 'Zeekr X',
      tagline: 'Shahar uchun ixcham premium krossover',
      basePriceUSD: 29500,
      acceleration0100: 3.7,
      rangeKm: 560,
      batteryKwh: 66,
      powerHp: 428,
      topSpeedKmH: 185,
      chargingTimeMin: 20,
      mainImage: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
      ],
      description: 'Zeekr X — ramkasiz eshiklar, harakatlanuvchi markaziy ekran va mini-muzlatgichga ega urban premium krossover.',
      orderIndex: 4,
      trims: [
        {
          name: 'ME Version 5-Seater RWD',
          priceUSD: 29500,
          driveType: 'RWD',
          rangeKm: 560,
          acceleration: 5.8,
          features: ['66 kVt/s batareya', '560 km CLTC', 'Ramkasiz oynalar', '5G multimedia'],
        },
        {
          name: 'YOU Version 4-Seater AWD',
          priceUSD: 34500,
          driveType: 'AWD',
          rangeKm: 512,
          acceleration: 3.7,
          features: ['Zero Gravity o’rindiqlari', 'Muzlatgich / isitgich kamerasi', 'Suriluvchi 14.6 dyuym ekran', '428 ot kuchi'],
        },
      ],
      colors: [
        { name: 'Berlin Gray', hexCode: '#94A3B8', imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80', isInterior: false },
        { name: 'Athens Cloud White', hexCode: '#F1F5F9', imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80', isInterior: false },
      ],
    },
  ];

  for (const m of models) {
    const createdModel = await prisma.carModel.upsert({
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
        galleryImages: m.galleryImages,
        description: m.description,
        orderIndex: m.orderIndex,
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
        galleryImages: m.galleryImages,
        description: m.description,
        orderIndex: m.orderIndex,
      },
    });

    // Trims
    for (const t of m.trims) {
      const existingTrim = await prisma.carTrim.findFirst({
        where: { modelId: createdModel.id, name: t.name },
      });
      if (!existingTrim) {
        const createdTrim = await prisma.carTrim.create({
          data: {
            modelId: createdModel.id,
            name: t.name,
            priceUSD: t.priceUSD,
            driveType: t.driveType,
            rangeKm: t.rangeKm,
            acceleration: t.acceleration,
            features: t.features,
          },
        });

        // Add 1 in-stock vehicle for demo showroom
        if (m.slug === 'zeekr-001' && t.name.includes('YOU')) {
          await prisma.inventoryItem.upsert({
            where: { vinOrCode: 'ZEEKR001-UZ-2026-001' },
            update: {},
            create: {
              trimId: createdTrim.id,
              vinOrCode: 'ZEEKR001-UZ-2026-001',
              exteriorColor: 'Phantom Black',
              interiorColor: 'Krem & Kulrang Nappa',
              year: 2026,
              status: 'IN_STOCK',
              priceUSD: 54900,
              priceUZS: 54900 * 12850,
              images: ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80'],
              notes: 'Toshkent salonida tayyor turibdi, bojxona to’langan.',
            },
          });
        }
      }
    }

    // Colors
    for (const c of m.colors) {
      const existingColor = await prisma.carColor.findFirst({
        where: { modelId: createdModel.id, name: c.name },
      });
      if (!existingColor) {
        await prisma.carColor.create({
          data: {
            modelId: createdModel.id,
            name: c.name,
            hexCode: c.hexCode,
            imageUrl: c.imageUrl,
            isInterior: c.isInterior,
          },
        });
      }
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

