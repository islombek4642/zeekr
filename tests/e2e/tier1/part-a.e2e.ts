import fs from 'fs';
import path from 'path';
import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { NextRequest, NextResponse } from 'next/server';
import Link from 'next/link';

import {
  resetTestState,
  mockCookieStore,
  revalidatedPaths,
  prismaMemoryClient,
  simulateDbDown,
} from '../helpers/setup';
import {
  signValidAdminJwt,
  setAuthCookie,
} from '../helpers/auth-helper';
import {
  callMiddleware,
  dispatchApiRequest,
  renderServerPage,
  renderComponentHtml,
} from '../helpers/http-client';
import { fileExistsInRepo, resolveRepoPath } from '../helpers/module-loader';

import { loadJsonFile, getCarModels, getCarModelBySlug } from '@/lib/data-provider';
import { signToken, verifyToken } from '@/lib/auth';
import { leadFormSchema } from '@/lib/validations/lead';
import { carModelFormSchema, inventoryItemFormSchema } from '@/lib/validations/car';
import { loginAdminAction, logoutAdminAction } from '@/app/actions/authActions';
import { createTestDriveLeadAction } from '@/app/actions/leadActions';
import { createCarModelAction, createInventoryItemAction } from '@/app/actions/adminCarActions';

import { CarImage } from '@/components/ui/CarImage';
import { HeroSection } from '@/components/home/HeroSection';
import { ModelShowcase } from '@/components/home/ModelShowcase';
import { InStockCarousel } from '@/components/home/InStockCarousel';
import { VehicleCard } from '@/components/inventory/VehicleCard';
import { ColorVisualizer } from '@/components/models/ColorVisualizer';
import { Footer } from '@/components/layout/Footer';
import AdminNewCarPage from '@/app/admin/cars/new/page';
import { InventoryFormClient } from '@/components/admin/InventoryFormClient';

describe('Tier 1 — Part A: Plan Completion & Audit Fixes (F1–F8)', () => {
  beforeEach(() => {
    resetTestState();
    vi.restoreAllMocks();
  });

  // =========================================================================
  // F1: Dependency Sync & Project Health (6 tests)
  // =========================================================================
  describe('F1: Dependency Sync & Project Health', () => {
    it('T1-F1-01: package.json, package-lock.json, and required node_modules exist and resolve', () => {
      const pkg = JSON.parse(fs.readFileSync(resolveRepoPath('package.json'), 'utf-8'));
      const lockExists = fileExistsInRepo('package-lock.json');
      expect(lockExists).toBe(true);

      const requiredDeps = [
        'next',
        'react',
        'react-dom',
        'zod',
        '@prisma/client',
        'bcryptjs',
        'jsonwebtoken',
        'lucide-react',
        'jose',
      ];
      for (const dep of requiredDeps) {
        expect(pkg.dependencies?.[dep]).toBeTruthy();
        expect(fileExistsInRepo(path.join('node_modules', dep))).toBe(true);
      }
    });

    it('T1-F1-02: package.json defines required scripts and build runs prisma generate + next build', () => {
      const pkg = JSON.parse(fs.readFileSync(resolveRepoPath('package.json'), 'utf-8'));
      const requiredScripts = ['dev', 'build', 'start', 'lint', 'test', 'prisma:generate'];
      for (const script of requiredScripts) {
        expect(typeof pkg.scripts?.[script]).toBe('string');
        expect(pkg.scripts[script].length).toBeGreaterThan(0);
      }
      expect(pkg.scripts.build).toContain('prisma generate');
      expect(pkg.scripts.build).toContain('next build');
    });

    it('T1-F1-03: Prisma schema client & adapter expose all 7 domain models', async () => {
      const { PrismaClient } = await import('@prisma/client');
      const client = new PrismaClient();
      const expectedModels = [
        'user',
        'carModel',
        'carTrim',
        'carColor',
        'inventoryItem',
        'lead',
        'setting',
      ] as const;
      for (const modelKey of expectedModels) {
        expect(typeof (client as any)[modelKey]).toBe('object');
        expect(typeof (prismaMemoryClient as any)[modelKey].findMany).toBe('function');
      }
    });

    it('T1-F1-04: NextRequest, NextResponse, Link, and renderToStaticMarkup operate natively in Node', () => {
      const req = new NextRequest('http://localhost:3000/inventory');
      expect(req.nextUrl.pathname).toBe('/inventory');
      const res = NextResponse.next();
      expect(res.status).toBe(200);
      const html = renderToStaticMarkup(React.createElement(Link, { href: '/models/zeekr-001' }, 'Zeekr 001'));
      expect(html).toContain('href="/models/zeekr-001"');
      expect(html).toContain('Zeekr 001');
    });

    it('T1-F1-05: All 6 JSON datasets in data/ load and parse as non-empty valid structures', () => {
      const models = loadJsonFile<any[]>('models.json');
      const trims = loadJsonFile<any[]>('trims.json');
      const colors = loadJsonFile<any[]>('colors.json');
      const inventory = loadJsonFile<any[]>('inventory.json');
      const settings = loadJsonFile<Record<string, unknown>>('settings.json');
      const technologies = loadJsonFile<any[]>('technologies.json');

      expect(Array.isArray(models) && models.length >= 4).toBe(true);
      expect(Array.isArray(trims) && trims.length >= 4).toBe(true);
      expect(Array.isArray(colors) && colors.length >= 4).toBe(true);
      expect(Array.isArray(inventory) && inventory.length >= 1).toBe(true);
      expect(settings && typeof settings === 'object' && 'usd_to_uzs_rate' in settings).toBe(true);
      expect(Array.isArray(technologies) && technologies.length >= 1).toBe(true);
    });

    it('T1-F1-06: Core Part A modules resolve via @ alias and tsconfig strict mode is enabled', async () => {
      const tsconfig = JSON.parse(fs.readFileSync(resolveRepoPath('tsconfig.json'), 'utf-8'));
      expect(tsconfig.compilerOptions?.strict).toBe(true);
      expect(tsconfig.compilerOptions?.paths?.['@/*']).toEqual(['./src/*']);

      expect(typeof signToken).toBe('function');
      expect(typeof getCarModels).toBe('function');
      expect(typeof leadFormSchema.safeParse).toBe('function');
      const mw = await import('@/middleware');
      expect(typeof mw.middleware).toBe('function');
    });
  });

  // =========================================================================
  // F2: Local Car Image Assets & Unsplash Elimination (6 tests)
  // =========================================================================
  describe('F2: Local Car Image Assets & Unsplash Elimination', () => {
    const modelSlugs = ['zeekr-001', 'zeekr-007', 'zeekr-009', 'zeekr-x'];

    it('T1-F2-01: All 8 local car assets (main.jpg & interior.jpg) exist and are web-optimized (10KB–500KB)', () => {
      for (const slug of modelSlugs) {
        for (const filename of ['main.jpg', 'interior.jpg']) {
          const abs = resolveRepoPath(`public/images/cars/${slug}/${filename}`);
          expect(fs.existsSync(abs), `Missing asset: ${abs}`).toBe(true);
          const size = fs.statSync(abs).size;
          expect(size, `${slug}/${filename} too small (${size} bytes)`).toBeGreaterThan(10 * 1024);
          expect(size, `${slug}/${filename} exceeds 500KB (${size} bytes)`).toBeLessThanOrEqual(512_000);
        }
      }
    });

    it('T1-F2-02: Every .jpg file in public/images/cars/** has valid JPEG magic bytes (FF D8 FF)', () => {
      for (const slug of modelSlugs) {
        for (const filename of ['main.jpg', 'interior.jpg']) {
          const abs = resolveRepoPath(`public/images/cars/${slug}/${filename}`);
          const buf = fs.readFileSync(abs);
          expect(
            buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff,
            `${slug}/${filename} must start with JPEG magic bytes FF D8 FF, got ${buf.subarray(0, 4).toString('hex')}`
          ).toBe(true);
        }
      }
    });

    it('T1-F2-03: Every mainImage and galleryImages entry in data/models.json resolves to an existing public/ file', () => {
      const models = loadJsonFile<any[]>('models.json');
      for (const m of models) {
        expect(String(m.mainImage).startsWith('/images/cars/')).toBe(true);
        expect(fileExistsInRepo(path.join('public', m.mainImage.replace(/^\/+/, '')))).toBe(true);
        for (const img of m.galleryImages || []) {
          expect(String(img).startsWith('/images/cars/')).toBe(true);
          expect(fileExistsInRepo(path.join('public', String(img).replace(/^\/+/, '')))).toBe(true);
        }
      }
    });

    it('T1-F2-04: Every imageUrl in data/colors.json resolves to an existing local file under public/images/cars/', () => {
      const colors = loadJsonFile<any[]>('colors.json');
      for (const c of colors) {
        expect(String(c.imageUrl).startsWith('/images/cars/')).toBe(true);
        expect(fileExistsInRepo(path.join('public', String(c.imageUrl).replace(/^\/+/, '')))).toBe(true);
      }
    });

    it('T1-F2-05: Every image in data/inventory.json resolves to an existing local file under public/images/cars/', () => {
      const inventory = loadJsonFile<any[]>('inventory.json');
      for (const item of inventory) {
        expect(Array.isArray(item.images) && item.images.length > 0).toBe(true);
        for (const img of item.images) {
          expect(String(img).startsWith('/images/cars/')).toBe(true);
          expect(fileExistsInRepo(path.join('public', String(img).replace(/^\/+/, '')))).toBe(true);
        }
      }
    });

    it('T1-F2-06: HeroSection and ModelShowcase render local /images/cars/... paths in SSR HTML', () => {
      const models = loadJsonFile<any[]>('models.json').map((m) => ({ id: m.slug, ...m }));
      const heroHtml = renderComponentHtml(React.createElement(HeroSection));
      const showcaseHtml = renderComponentHtml(
        React.createElement(ModelShowcase, { models, rate: 12850 })
      );

      expect(heroHtml).toContain('src="/images/cars/zeekr-001/main.jpg"');
      for (const slug of modelSlugs) {
        expect(showcaseHtml).toContain(`src="/images/cars/${slug}/main.jpg"`);
      }
    });
  });

  // =========================================================================
  // F3: Card CSS Architecture & Fallback Behavior (6 tests)
  // =========================================================================
  describe('F3: Card CSS Architecture & Fallback Behavior', () => {
    it('T1-F3-01: tests/components/card-layout.test.ts exists and covers card layout / CarImage', () => {
      const testPath = 'tests/components/card-layout.test.ts';
      expect(fileExistsInRepo(testPath), 'Missing tests/components/card-layout.test.ts').toBe(true);
      const src = fs.readFileSync(resolveRepoPath(testPath), 'utf-8');
      expect(src).toMatch(/CarImage|ModelShowcase|InStockCarousel|VehicleCard/);
    });

    it('T1-F3-02: CarImage renders <img> with src, alt, and object-cover class for valid paths', () => {
      const html = renderComponentHtml(
        React.createElement(CarImage, {
          src: '/images/cars/zeekr-001/main.jpg',
          alt: 'Zeekr 001',
        })
      );
      expect(html).toContain('<img');
      expect(html).toContain('src="/images/cars/zeekr-001/main.jpg"');
      expect(html).toContain('alt="Zeekr 001"');
      expect(html).toContain('object-cover');
    });

    it('T1-F3-03: ModelShowcase renders 4 equal-height cards with aspect-[16/10], prices, and model links', () => {
      const models = loadJsonFile<any[]>('models.json').map((m) => ({ id: m.slug, ...m }));
      const html = renderComponentHtml(
        React.createElement(ModelShowcase, { models, rate: 12850 })
      );
      expect(html).toContain('aspect-[16/10]');
      expect(html).toContain('flex-col');
      expect(html).toContain('h-full');
      expect(html).toContain('justify-between');
      expect(html).toContain('href="/models/zeekr-001"');
      expect(html).toContain('href="/models/zeekr-x"');
      expect(html).toContain('$');
    });

    it('T1-F3-04: InStockCarousel renders cards with aspect-[16/10], Salonda bor badge, and ?reserve= links', async () => {
      simulateDbDown(true);
      const { getInStockVehicles } = await import('@/lib/data-provider');
      const items = await getInStockVehicles(6);
      const html = renderComponentHtml(
        React.createElement(InStockCarousel, { items, rate: 12850 })
      );
      expect(html).toContain('aspect-[16/10]');
      expect(html).toContain('flex-col');
      expect(html).toContain('h-full');
      expect(html).toContain('Salonda bor');
      expect(html).toContain('/inventory?reserve=');
    });

    it('T1-F3-05: VehicleCard renders rigid image container, status badges, and reserve button', () => {
      const baseItem = {
        id: 'inv-1',
        vinOrCode: 'ZEEKR001-UZ-2026-001',
        exteriorColor: 'Polar White',
        interiorColor: 'Black',
        year: 2026,
        status: 'IN_STOCK',
        priceUSD: 49500,
        images: ['/images/cars/zeekr-001/main.jpg'],
        trim: {
          id: 't1',
          name: 'ME Version',
          driveType: 'AWD',
          rangeKm: 656,
          acceleration: 3.8,
          model: {
            id: 'zeekr-001',
            name: 'Zeekr 001',
            slug: 'zeekr-001',
            mainImage: '/images/cars/zeekr-001/main.jpg',
          },
        },
      };
      const stockHtml = renderComponentHtml(
        React.createElement(VehicleCard, { item: baseItem, usdRate: 12850, onReserve: () => {} })
      );
      expect(stockHtml).toContain('aspect-[16/10]');
      expect(stockHtml).toContain('flex-col');
      expect(stockHtml).toContain('h-full');
      expect(stockHtml).toContain('Salonda mavjud');
      expect(stockHtml).toContain('Avtomobilni bron qilish');

      const transitHtml = renderComponentHtml(
        React.createElement(VehicleCard, {
          item: { ...baseItem, status: 'IN_TRANSIT' },
          usdRate: 12850,
          onReserve: () => {},
        })
      );
      expect(transitHtml).toContain("Yo&#x27;lda");
    });

    it('T1-F3-06: ColorVisualizer renders aspect-[16/9] preview and selected exterior image', () => {
      const html = renderComponentHtml(
        React.createElement(ColorVisualizer, {
          modelName: 'Zeekr 001',
          mainImage: '/images/cars/zeekr-001/main.jpg',
          colors: [
            {
              id: 'c1',
              name: 'Polar White',
              hexCode: '#FFFFFF',
              imageUrl: '/images/cars/zeekr-001/main.jpg',
              isInterior: false,
            },
            {
              id: 'c2',
              name: 'Charcoal Nappa',
              hexCode: '#222222',
              imageUrl: '/images/cars/zeekr-001/interior.jpg',
              isInterior: true,
            },
          ],
        })
      );
      expect(html).toContain('aspect-[16/9]');
      expect(html).toContain('src="/images/cars/zeekr-001/main.jpg"');
      expect(html).toContain('Polar White');
    });
  });

  // =========================================================================
  // F4: Public Catalog/Detail/Test-Drive JSON Fallback & ?reserve= Modal (6 tests)
  // =========================================================================
  describe('F4: JSON Fallback & /inventory?reserve= Modal', () => {
    it('T1-F4-01: With DB down, getCarModels() returns 4 active models sorted by orderIndex', async () => {
      simulateDbDown(true);
      const models = await getCarModels();
      expect(models.map((m: any) => m.slug)).toEqual([
        'zeekr-001',
        'zeekr-007',
        'zeekr-009',
        'zeekr-x',
      ]);
    });

    it('T1-F4-02: With DB down, getCarModelBySlug("zeekr-007") returns model with trims & colors from JSON', async () => {
      simulateDbDown(true);
      const model = await getCarModelBySlug('zeekr-007');
      expect(model).not.toBeNull();
      expect(model.name).toBe('Zeekr 007');
      expect(model.trims.length).toBeGreaterThanOrEqual(2);
      expect(model.colors.length).toBeGreaterThanOrEqual(2);
    });

    it('T1-F4-03: With DB down, InventoryPage renders all JSON vehicles cleanly', async () => {
      simulateDbDown(true);
      const result = await renderServerPage('src/app/(public)/inventory/page.tsx', {
        searchParams: Promise.resolve({}),
      });
      expect(result.status).toBe(200);
      expect(result.html).toContain('Mavjud Avtomobillar');
      expect(result.html).toContain('ZEEKR001-UZ-2026-001');
      expect(result.html).toContain('ZEEKR007-UZ-2026-002');
      expect(result.html).toContain('ZEEKR009-UZ-2026-003');
      expect(result.html).toContain('ZEEKRX-UZ-2026-004');
    });

    it('T1-F4-04: With DB down, ModelDetailPage renders Zeekr 001 trims, colors, and LoanCalculator', async () => {
      simulateDbDown(true);
      const result = await renderServerPage('src/app/(public)/models/[slug]/page.tsx', {
        params: Promise.resolve({ slug: 'zeekr-001' }),
      });
      expect(result.status).toBe(200);
      expect(result.html).toContain('Zeekr 001');
      expect(result.html).toContain('WE Version');
      expect(result.html).toContain('Polar White');
      expect(result.html).toContain('Kalkulyator');
    });

    it('T1-F4-05: With DB down, TestDrivePage preselects ?model=zeekr-009', async () => {
      simulateDbDown(true);
      const result = await renderServerPage('src/app/(public)/test-drive/page.tsx', {
        searchParams: Promise.resolve({ model: 'zeekr-009' }),
      });
      expect(result.status).toBe(200);
      expect(result.html).toContain('Zeekr 009');
      expect(result.html).toContain('Zeekr 001');
    });

    it('T1-F4-06: With DB down, /inventory?reserve=ZEEKR001-UZ-2026-001 opens ReserveModal (role="dialog")', async () => {
      simulateDbDown(true);
      const result = await renderServerPage('src/app/(public)/inventory/page.tsx', {
        searchParams: Promise.resolve({ reserve: 'ZEEKR001-UZ-2026-001' }),
      });
      expect(result.status).toBe(200);
      expect(result.html).toContain('role="dialog"');
      expect(result.html).toContain('Avtomobilni bron qilish');
      expect(result.html).toContain('ZEEKR001-UZ-2026-001');
    });
  });

  // =========================================================================
  // F5: Admin Form Relative Asset Paths (6 tests)
  // =========================================================================
  describe('F5: Admin Form Relative Asset Paths', () => {
    const validModelPayload = {
      name: 'Zeekr 7X',
      slug: 'zeekr-7x',
      tagline: 'Premium SUV',
      basePriceUSD: 44000,
      rangeKm: 705,
      acceleration0100: 3.8,
      batteryKwh: 100,
      powerHp: 645,
      topSpeedKmH: 210,
      chargingTimeMin: 15,
      mainImage: '/images/cars/zeekr-001/main.jpg',
      description: 'Zamonaviy premium elektr krossover.',
      galleryImages: ['/images/cars/zeekr-001/interior.jpg'],
      isActive: true,
    };

    it('T1-F5-01: carModelFormSchema accepts /images/cars/... relative asset paths', () => {
      const parsed = carModelFormSchema.safeParse(validModelPayload);
      expect(parsed.success).toBe(true);
    });

    it('T1-F5-02: carModelFormSchema accepts /uploads/... local uploaded relative paths', () => {
      const parsed = carModelFormSchema.safeParse({
        ...validModelPayload,
        mainImage: '/uploads/zeekr-7x.webp',
        galleryImages: ['/uploads/zeekr-7x-cabin.png'],
      });
      expect(parsed.success).toBe(true);
    });

    it('T1-F5-03: carModelFormSchema also accepts valid https:// CDN image URLs', () => {
      const parsed = carModelFormSchema.safeParse({
        ...validModelPayload,
        mainImage: 'https://cdn.zeekr.uz/001.jpg',
      });
      expect(parsed.success).toBe(true);
    });

    it('T1-F5-04: inventoryItemFormSchema accepts relative asset paths in images[]', () => {
      const parsed = inventoryItemFormSchema.safeParse({
        trimId: 'zeekr-007-trim-4',
        vinOrCode: 'ZEEKR007-TEST-100',
        exteriorColor: 'Polar White',
        interiorColor: 'Dark Slate',
        year: 2026,
        status: 'IN_STOCK',
        priceUSD: 39000,
        images: ['/images/cars/zeekr-007/main.jpg'],
      });
      expect(parsed.success).toBe(true);
    });

    it('T1-F5-05: AdminNewCarPage renders image input without type="url" restriction', () => {
      const html = renderComponentHtml(React.createElement(AdminNewCarPage));
      expect(html).not.toMatch(/type="url"/i);
    });

    it('T1-F5-06: InventoryFormClient omits type="url" and admin actions persist relative paths', async () => {
      const formHtml = renderComponentHtml(
        React.createElement(InventoryFormClient, {
          models: [
            {
              id: 'zeekr-001',
              name: 'Zeekr 001',
              mainImage: '/images/cars/zeekr-001/main.jpg',
              trims: [{ id: 'zeekr-001-trim-1', name: 'WE Version', priceUSD: 45000 }],
              colors: [{ name: 'Polar White', isInterior: false }],
            },
          ],
        })
      );
      expect(formHtml).not.toMatch(/type="url"/i);

      setAuthCookie(signValidAdminJwt());
      const modelRes = await createCarModelAction(validModelPayload);
      expect(modelRes.success).toBe(true);

      const invRes = await createInventoryItemAction({
        trimId: 'zeekr-001-trim-1',
        vinOrCode: 'ZEEKR001-REL-001',
        exteriorColor: 'Polar White',
        interiorColor: 'Charcoal',
        year: 2026,
        status: 'IN_STOCK',
        priceUSD: 46000,
        images: ['/images/cars/zeekr-001/main.jpg'],
      });
      expect(invRes.success).toBe(true);
    });
  });

  // =========================================================================
  // F6: Auth & Middleware JWT Verification (6 tests)
  // =========================================================================
  describe('F6: Auth & Middleware JWT Verification', () => {
    it('T1-F6-01: signToken and verifyToken roundtrip returns matching ADMIN payload', async () => {
      const token = await signToken({
        userId: 'u-admin',
        email: 'admin@zeekr-auto.uz',
        role: 'ADMIN',
      });
      expect(typeof token).toBe('string');
      const verified = await verifyToken(token);
      expect(verified).toMatchObject({
        userId: 'u-admin',
        email: 'admin@zeekr-auto.uz',
        role: 'ADMIN',
      });
    });

    it('T1-F6-02: middleware allows /admin/leads with valid ADMIN JWT cookie', async () => {
      const token = signValidAdminJwt();
      const res = await callMiddleware('/admin/leads', { token });
      expect(res.status).toBe(200);
      expect(res.location).toBeNull();
    });

    it('T1-F6-03: middleware allows /admin, /admin/cars, /admin/inventory, /admin/settings with valid ADMIN JWT', async () => {
      const token = signValidAdminJwt();
      for (const route of ['/admin', '/admin/cars', '/admin/inventory', '/admin/settings']) {
        const res = await callMiddleware(route, { token });
        expect(res.status, `Expected 200 on ${route}`).toBe(200);
        expect(res.location).toBeNull();
      }
    });

    it('T1-F6-04: middleware allows /admin/login with no cookie without redirect loop', async () => {
      const res = await callMiddleware('/admin/login');
      expect(res.status).toBe(200);
      expect(res.location).toBeNull();
    });

    it('T1-F6-05: loginAdminAction authenticates valid admin and sets verifiable admin_token cookie', async () => {
      const res = await loginAdminAction({
        email: 'admin@zeekr-auto.uz',
        password: 'Admin123!',
      });
      expect(res.success).toBe(true);
      const token = mockCookieStore.get('admin_token')?.value;
      expect(token).toBeTruthy();
      const payload = await verifyToken(token!);
      expect(payload?.role).toBe('ADMIN');
    });

    it('T1-F6-06: logoutAdminAction deletes admin_token cookie and triggers redirect to /admin/login', async () => {
      setAuthCookie(signValidAdminJwt());
      await expect(logoutAdminAction()).rejects.toThrow('NEXT_REDIRECT:/admin/login');
      expect(mockCookieStore.get('admin_token')).toBeUndefined();
    });
  });

  // =========================================================================
  // F7: Lead Intake Validation & Rate-Limiting (6 tests)
  // =========================================================================
  describe('F7: Lead Intake Validation & Rate-Limiting', () => {
    it('T1-F7-01: POST /api/leads creates TEST_DRIVE lead and normalizes phone to +998...', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
      const res = await dispatchApiRequest('/api/leads', 'src/app/api/leads/route.ts', {
        method: 'POST',
        headers: { 'x-forwarded-for': '203.0.113.11' },
        body: {
          fullName: 'Alisher Valiyev',
          phone: '90 123 45 67',
          modelId: 'zeekr-001',
          type: 'TEST_DRIVE',
        },
      });
      expect(res.status).toBe(200);
      expect(res.json.success).toBe(true);
      expect(res.json.leadId).toBeTruthy();

      const saved = await prismaMemoryClient.lead.findUnique({ where: { id: res.json.leadId } });
      expect(saved?.phone).toBe('+998901234567');
      expect(saved?.type).toBe('TEST_DRIVE');
    });

    it('T1-F7-02: POST /api/leads supports CAR_RESERVE linked to inventoryItemId and modelId', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
      const res = await dispatchApiRequest('/api/leads', 'src/app/api/leads/route.ts', {
        method: 'POST',
        headers: { 'x-forwarded-for': '203.0.113.12' },
        body: {
          fullName: 'Bobur Karimov',
          phone: '+998912345678',
          type: 'CAR_RESERVE',
          modelId: 'zeekr-001',
          inventoryItemId: 'ZEEKR001-UZ-2026-001',
        },
      });
      expect(res.status).toBe(200);
      const saved = await prismaMemoryClient.lead.findUnique({ where: { id: res.json.leadId } });
      expect(saved?.type).toBe('CAR_RESERVE');
      expect(saved?.inventoryItemId).toBe('ZEEKR001-UZ-2026-001');
    });

    it('T1-F7-03: POST /api/leads accepts SERVICE and CONSULTATION with preferredDate/Time/notes', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
      for (const leadType of ['SERVICE', 'CONSULTATION'] as const) {
        const res = await dispatchApiRequest('/api/leads', 'src/app/api/leads/route.ts', {
          method: 'POST',
          headers: { 'x-forwarded-for': `203.0.113.13` },
          body: {
            fullName: 'Dilnoza Tursunova',
            phone: '931234567',
            type: leadType,
            preferredDate: '2026-12-01',
            preferredTime: '14:00 — 16:00',
            notes: 'Rejali texnik xizmat',
          },
        });
        expect(res.status).toBe(200);
        const saved = await prismaMemoryClient.lead.findUnique({ where: { id: res.json.leadId } });
        expect(saved?.type).toBe(leadType);
        expect(saved?.preferredDate instanceof Date).toBe(true);
      }
    });

    it('T1-F7-04: createTestDriveLeadAction persists lead and revalidates /admin/leads', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
      const res = await createTestDriveLeadAction({
        fullName: 'Sardor Rahimiy',
        phone: '998931112233',
        modelId: 'zeekr-007',
        preferredDate: '2026-12-05',
        preferredTime: '10:00 — 12:00',
      });
      expect(res.success).toBe(true);
      expect(res.leadId).toBeTruthy();
      expect(revalidatedPaths.some((r) => r.path === '/admin/leads')).toBe(true);
    });

    it('T1-F7-05: POST /api/leads degrades gracefully when Telegram notification fetch fails', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Telegram timeout'));
      const res = await dispatchApiRequest('/api/leads', 'src/app/api/leads/route.ts', {
        method: 'POST',
        headers: { 'x-forwarded-for': '203.0.113.15' },
        body: {
          fullName: 'Javohir Azimov',
          phone: '+998941112233',
          type: 'TEST_DRIVE',
        },
      });
      expect(res.status).toBe(200);
      expect(res.json.success).toBe(true);
      expect(res.json.leadId).toBeTruthy();
    });

    it('T1-F7-06: leadFormSchema trims fullName and normalizes formatted Uzbek phone numbers', () => {
      const parsed = leadFormSchema.safeParse({
        fullName: '  Dilshod Karimov  ',
        phone: '+998 (90) 555-44-33',
      });
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.fullName).toBe('Dilshod Karimov');
        expect(parsed.data.phone).toBe('+998905554433');
      }
    });
  });

  // =========================================================================
  // F8: Prisma directUrl, SERVICE Label, Dynamic Footer (6 tests)
  // =========================================================================
  describe('F8: Prisma directUrl, SERVICE Label & Dynamic Footer', () => {
    it('T1-F8-01: prisma/schema.prisma declares postgresql, DATABASE_URL, and directUrl = env("DIRECT_URL")', () => {
      const schema = fs.readFileSync(resolveRepoPath('prisma/schema.prisma'), 'utf-8');
      expect(schema).toMatch(/provider\s*=\s*"postgresql"/);
      expect(schema).toMatch(/url\s*=\s*env\("DATABASE_URL"\)/);
      expect(schema).toMatch(/directUrl\s*=\s*env\("DIRECT_URL"\)/);
    });

    it('T1-F8-02: prisma/schema.prisma LeadType enum includes TEST_DRIVE, CONSULTATION, CAR_RESERVE, SERVICE', () => {
      const schema = fs.readFileSync(resolveRepoPath('prisma/schema.prisma'), 'utf-8');
      const enumMatch = schema.match(/enum\s+LeadType\s*\{([^}]+)\}/);
      expect(enumMatch).not.toBeNull();
      const body = enumMatch![1];
      for (const variant of ['TEST_DRIVE', 'CONSULTATION', 'CAR_RESERVE', 'SERVICE']) {
        expect(body).toContain(variant);
      }
    });

    it('T1-F8-03: AdminDashboardPage renders Test-drayv, Bron qilish, Konsultatsiya, and Servis labels', async () => {
      for (const type of ['TEST_DRIVE', 'CAR_RESERVE', 'CONSULTATION', 'SERVICE'] as const) {
        await prismaMemoryClient.lead.create({
          data: {
            type,
            fullName: `Client ${type}`,
            phone: '+998901234567',
            status: 'NEW',
          },
        });
      }
      const res = await renderServerPage('src/app/admin/page.tsx');
      expect(res.status).toBe(200);
      expect(res.html).toContain('Test-drayv');
      expect(res.html).toContain('Bron qilish');
      expect(res.html).toContain('Konsultatsiya');
      expect(res.html).toContain('Servis');
    });

    it('T1-F8-04: Footer renders links for all 4 default active models', async () => {
      const element = await Footer();
      const html = renderComponentHtml(element);
      for (const slug of ['zeekr-001', 'zeekr-007', 'zeekr-009', 'zeekr-x']) {
        expect(html).toContain(`/models/${slug}`);
      }
    });

    it('T1-F8-05: Footer dynamically renders newly added active model from database', async () => {
      await prismaMemoryClient.carModel.create({
        data: {
          slug: 'zeekr-7x',
          name: 'Zeekr 7X',
          tagline: 'Premium SUV',
          basePriceUSD: 44000,
          acceleration0100: 3.8,
          rangeKm: 705,
          batteryKwh: 100,
          powerHp: 645,
          topSpeedKmH: 210,
          chargingTimeMin: 15,
          mainImage: '/images/cars/zeekr-001/main.jpg',
          description: 'Yangi SUV modeli',
          isActive: true,
          orderIndex: 5,
        },
      });
      const element = await Footer();
      const html = renderComponentHtml(element);
      expect(html).toContain('/models/zeekr-7x');
      expect(html).toContain('Zeekr 7X');
    });

    it('T1-F8-06: Footer renders dynamic contact settings from database', async () => {
      await prismaMemoryClient.setting.upsert({
        where: { key: 'showroom_address' },
        update: { value: 'Toshkent, Amir Temur 108' },
        create: { key: 'showroom_address', value: 'Toshkent, Amir Temur 108' },
      });
      await prismaMemoryClient.setting.upsert({
        where: { key: 'primary_phone' },
        update: { value: '+998712998877' },
        create: { key: 'primary_phone', value: '+998712998877' },
      });
      await prismaMemoryClient.setting.upsert({
        where: { key: 'contact_email' },
        update: { value: 'sales@zeekr.uz' },
        create: { key: 'contact_email', value: 'sales@zeekr.uz' },
      });

      const element = await Footer();
      const html = renderComponentHtml(element);
      expect(html).toContain('Toshkent, Amir Temur 108');
      expect(html).toContain('+998712998877');
      expect(html).toContain('sales@zeekr.uz');
    });
  });
});
