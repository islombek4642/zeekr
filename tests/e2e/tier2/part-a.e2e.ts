import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import {
  resetTestState,
  mockCookieStore,
  prismaMemoryClient,
  simulateDbDown,
} from '../helpers/setup';
import {
  signRoleJwt,
  signExpiredAdminJwt,
  signWrongSecretAdminJwt,
  signValidAdminJwt,
  setAuthCookie,
} from '../helpers/auth-helper';
import {
  callMiddleware,
  dispatchApiRequest,
  renderServerPage,
  renderComponentHtml,
} from '../helpers/http-client';
import { resolveRepoPath } from '../helpers/module-loader';

import { loadJsonFile, getCarModelBySlug } from '@/lib/data-provider';
import { signToken, verifyToken, getAdminSession } from '@/lib/auth';
import { carModelFormSchema, inventoryItemFormSchema } from '@/lib/validations/car';
import { loginAdminAction } from '@/app/actions/authActions';
import { createTestDriveLeadAction } from '@/app/actions/leadActions';
import { createCarModelAction, createInventoryItemAction } from '@/app/actions/adminCarActions';

import { CarImage } from '@/components/ui/CarImage';
import { InStockCarousel } from '@/components/home/InStockCarousel';
import { ModelShowcase } from '@/components/home/ModelShowcase';
import { VehicleCard } from '@/components/inventory/VehicleCard';
import { InventoryCatalog } from '@/components/inventory/InventoryCatalog';
import { Footer } from '@/components/layout/Footer';
import AdminNewCarPage from '@/app/admin/cars/new/page';

function walkFiles(dir: string, exts: string[]): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkFiles(full, exts));
    } else if (exts.some((ext) => entry.name.endsWith(ext))) {
      results.push(full);
    }
  }
  return results;
}

describe('Tier 2 — Part A: Boundary & Negative Cases (F1–F8)', () => {
  beforeEach(() => {
    resetTestState();
    vi.restoreAllMocks();
  });

  // =========================================================================
  // F1: Dependency Sync & Project Health (6 tests)
  // =========================================================================
  describe('F1: Dependency & Project Health Boundaries', () => {
    it('T2-F1-01: next.config.ts exports valid config with reactStrictMode: true', async () => {
      const cfgMod = await import('../../../next.config');
      const cfg = cfgMod.default;
      expect(cfg).toBeTruthy();
      expect(cfg.reactStrictMode).toBe(true);
    });

    it('T2-F1-02: package.json has zero unpinned file: or link: local path dependencies', () => {
      const pkg = JSON.parse(fs.readFileSync(resolveRepoPath('package.json'), 'utf-8'));
      const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
      for (const [name, version] of Object.entries<string>(allDeps)) {
        expect(version, `Broken local dep ${name}: ${version}`).not.toMatch(/^(file:|link:)/);
      }
    });

    it('T2-F1-03: scripts/db-deploy.js exits 0 gracefully when DATABASE_URL is unset', () => {
      const env = { ...process.env };
      delete env.DATABASE_URL;
      delete env.POSTGRES_PRISMA_URL;
      delete env.POSTGRES_URL;
      const out = execFileSync(process.execPath, [resolveRepoPath('scripts/db-deploy.js')], {
        env,
        encoding: 'utf-8',
      });
      expect(out).toContain('Skipping');
    });

    it('T2-F1-04: tsconfig.json enforces noEmit: true and strict: true', () => {
      const tsconfig = JSON.parse(fs.readFileSync(resolveRepoPath('tsconfig.json'), 'utf-8'));
      expect(tsconfig.compilerOptions?.noEmit).toBe(true);
      expect(tsconfig.compilerOptions?.strict).toBe(true);
    });

    it('T2-F1-05: data/models.json slugs are unique and trims/colors/inventory reference valid modelSlugs', () => {
      const models = loadJsonFile<any[]>('models.json');
      const trims = loadJsonFile<any[]>('trims.json');
      const colors = loadJsonFile<any[]>('colors.json');
      const inventory = loadJsonFile<any[]>('inventory.json');

      const slugs = models.map((m) => m.slug);
      expect(new Set(slugs).size).toBe(slugs.length);
      const slugSet = new Set(slugs);

      for (const t of trims) expect(slugSet.has(t.modelSlug)).toBe(true);
      for (const c of colors) expect(slugSet.has(c.modelSlug)).toBe(true);
      for (const i of inventory) expect(slugSet.has(i.modelSlug)).toBe(true);
    });

    it('T2-F1-06: data/inventory.json trimName entries match existing trims for their modelSlug', () => {
      const trims = loadJsonFile<any[]>('trims.json');
      const inventory = loadJsonFile<any[]>('inventory.json');
      for (const item of inventory) {
        const match = trims.some(
          (t) => t.modelSlug === item.modelSlug && t.name === item.trimName
        );
        expect(match, `Missing trim ${item.trimName} for ${item.modelSlug}`).toBe(true);
      }
    });
  });

  // =========================================================================
  // F2: Local Car Image Assets & Unsplash Elimination (6 tests)
  // =========================================================================
  describe('F2: Asset Integrity & Unsplash Elimination Boundaries', () => {
    it('T2-F2-01: Zero unsplash.com URLs remain in data/*.json or src/**/*.{ts,tsx}', () => {
      const dataFiles = walkFiles(resolveRepoPath('data'), ['.json']);
      const srcFiles = walkFiles(resolveRepoPath('src'), ['.ts', '.tsx']);
      const offenders: string[] = [];
      for (const file of [...dataFiles, ...srcFiles]) {
        const content = fs.readFileSync(file, 'utf-8');
        if (/unsplash\.com/i.test(content)) {
          offenders.push(path.relative(process.cwd(), file));
        }
      }
      expect(offenders, `Unsplash URLs found in: ${offenders.join(', ')}`).toEqual([]);
    });

    it('T2-F2-02: No .jpg/.jpeg in public/images/cars/ contains PNG, HTML, SVG, or WebP magic bytes', () => {
      const files = walkFiles(resolveRepoPath('public/images/cars'), ['.jpg', '.jpeg']);
      expect(files.length).toBeGreaterThanOrEqual(8);
      for (const file of files) {
        const buf = fs.readFileSync(file);
        const headerStr = buf.subarray(0, 16).toString('utf-8').toLowerCase();
        const isPng = buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
        const isWebp = buf.subarray(0, 4).toString('ascii') === 'RIFF';
        const isText = headerStr.includes('<html') || headerStr.includes('<!doc') || headerStr.includes('<svg');
        expect(isPng || isWebp || isText, `Invalid image format inside ${file}`).toBe(false);
      }
    });

    it('T2-F2-03: No file in public/images/cars/ is 0 bytes or > 512,000 bytes', () => {
      const files = walkFiles(resolveRepoPath('public/images/cars'), ['.jpg', '.jpeg', '.png', '.webp']);
      for (const file of files) {
        const size = fs.statSync(file).size;
        expect(size, `Empty file ${file}`).toBeGreaterThan(0);
        expect(size, `Oversized image ${file}: ${size} bytes`).toBeLessThanOrEqual(512_000);
      }
    });

    it('T2-F2-04: data/models.json, colors.json, and inventory.json contain zero http:// or https:// image URLs', () => {
      const models = loadJsonFile<any[]>('models.json');
      const colors = loadJsonFile<any[]>('colors.json');
      const inventory = loadJsonFile<any[]>('inventory.json');

      for (const m of models) {
        expect(m.mainImage).not.toMatch(/^https?:\/\//i);
        for (const g of m.galleryImages || []) expect(g).not.toMatch(/^https?:\/\//i);
      }
      for (const c of colors) expect(c.imageUrl).not.toMatch(/^https?:\/\//i);
      for (const i of inventory) {
        for (const img of i.images || []) expect(img).not.toMatch(/^https?:\/\//i);
      }
    });

    it('T2-F2-05: Every image path in data/*.json begins with a leading slash /', () => {
      const models = loadJsonFile<any[]>('models.json');
      const colors = loadJsonFile<any[]>('colors.json');
      const inventory = loadJsonFile<any[]>('inventory.json');

      for (const m of models) {
        expect(String(m.mainImage).startsWith('/')).toBe(true);
        for (const g of m.galleryImages || []) expect(String(g).startsWith('/')).toBe(true);
      }
      for (const c of colors) expect(String(c.imageUrl).startsWith('/')).toBe(true);
      for (const i of inventory) {
        for (const img of i.images || []) expect(String(img).startsWith('/')).toBe(true);
      }
    });

    it('T2-F2-06: AdminNewCarPage SSR output contains no unsplash.com default value', () => {
      const html = renderComponentHtml(React.createElement(AdminNewCarPage));
      expect(html.toLowerCase()).not.toContain('unsplash.com');
    });
  });

  // =========================================================================
  // F3: Card CSS Architecture & Fallback Boundaries (6 tests)
  // =========================================================================
  describe('F3: Card Layout & Fallback Boundaries', () => {
    it('T2-F3-01: CarImage with empty src="" omits <img> and renders accessible Zeekr fallback', () => {
      const html = renderComponentHtml(
        React.createElement(CarImage, { src: '', alt: 'Zeekr X' })
      );
      expect(html).not.toContain('<img');
      expect(html).toContain('role="img"');
      expect(html).toContain('aria-label="Zeekr X"');
      expect(html).toContain('Zeekr');
    });

    it('T2-F3-02: CarImage resets hasError state when src prop changes', () => {
      const srcCode = fs.readFileSync(resolveRepoPath('src/components/ui/CarImage.tsx'), 'utf-8');
      expect(srcCode).toMatch(/useEffect\s*\(/);
      expect(srcCode).toMatch(/setHasError\s*\(\s*false\s*\)/);
      expect(srcCode).toMatch(/\[\s*src\s*\]/);
    });

    it('T2-F3-03: InStockCarousel with empty items=[] renders null/empty string', () => {
      const html = renderComponentHtml(
        React.createElement(InStockCarousel, { items: [], rate: 12850 })
      );
      expect(html).toBe('');
    });

    it('T2-F3-04: VehicleCard with images=[] falls back to item.trim.model.mainImage', () => {
      const html = renderComponentHtml(
        React.createElement(VehicleCard, {
          item: {
            id: 'inv-fallback',
            vinOrCode: 'VIN-FALLBACK',
            exteriorColor: 'White',
            interiorColor: 'Black',
            year: 2026,
            status: 'IN_STOCK',
            priceUSD: 45000,
            images: [],
            trim: {
              id: 't1',
              name: 'WE Version',
              driveType: 'RWD',
              rangeKm: 700,
              acceleration: 5.0,
              model: {
                id: 'zeekr-001',
                name: 'Zeekr 001',
                slug: 'zeekr-001',
                mainImage: '/images/cars/zeekr-001/main.jpg',
              },
            },
          },
          usdRate: 12850,
          onReserve: () => {},
        })
      );
      expect(html).toContain('src="/images/cars/zeekr-001/main.jpg"');
    });

    it('T2-F3-05: InStockCarousel with images=[] falls back to /images/cars/<slug>/main.jpg', () => {
      const html = renderComponentHtml(
        React.createElement(InStockCarousel, {
          items: [
            {
              id: 'inv-fb-2',
              vinOrCode: 'VIN-FB-2',
              exteriorColor: 'Black',
              interiorColor: 'Beige',
              year: 2026,
              status: 'IN_STOCK',
              priceUSD: 42000,
              images: [],
              trim: {
                name: 'ME Version',
                model: {
                  name: 'Zeekr 007',
                  slug: 'zeekr-007',
                },
              },
            },
          ],
          rate: 12850,
        })
      );
      expect(html).toContain('src="/images/cars/zeekr-007/main.jpg"');
    });

    it('T2-F3-06: ModelShowcase with models=[] renders header cleanly with zero model links', () => {
      const html = renderComponentHtml(
        React.createElement(ModelShowcase, { models: [], rate: 12850 })
      );
      expect(html).toContain('Modellar Qatori');
      expect(html).not.toContain('href="/models/');
    });
  });

  // =========================================================================
  // F4: JSON Fallback & ?reserve= Modal Boundaries (6 tests)
  // =========================================================================
  describe('F4: JSON Fallback & Modal Boundaries', () => {
    it('T2-F4-01: Unknown slug returns null from getCarModelBySlug and 404 from ModelDetailPage', async () => {
      simulateDbDown(true);
      const model = await getCarModelBySlug('does-not-exist');
      expect(model).toBeNull();

      const res = await renderServerPage('src/app/(public)/models/[slug]/page.tsx', {
        params: Promise.resolve({ slug: 'does-not-exist' }),
      });
      expect(res.status).toBe(404);
    });

    it('T2-F4-02: Inactive model (isActive: false) in DB is NOT exposed by getCarModelBySlug', async () => {
      await prismaMemoryClient.carModel.update({
        where: { slug: 'zeekr-x' },
        data: { isActive: false },
      });
      const model = await getCarModelBySlug('zeekr-x');
      expect(model).toBeNull();
    });

    it('T2-F4-03: /inventory?reserve=NON-EXISTENT-VIN keeps ReserveModal closed (no role="dialog")', async () => {
      simulateDbDown(true);
      const res = await renderServerPage('src/app/(public)/inventory/page.tsx', {
        searchParams: Promise.resolve({ reserve: 'NON-EXISTENT-VIN' }),
      });
      expect(res.status).toBe(200);
      expect(res.html).not.toContain('role="dialog"');
    });

    it('T2-F4-04: /inventory?model=zeekr-x filters catalog to Zeekr X vehicles only', async () => {
      simulateDbDown(true);
      const res = await renderServerPage('src/app/(public)/inventory/page.tsx', {
        searchParams: Promise.resolve({ model: 'zeekr-x' }),
      });
      expect(res.status).toBe(200);
      expect(res.html).toContain('ZEEKRX-UZ-2026-004');
      expect(res.html).not.toContain('ZEEKR001-UZ-2026-001');
    });

    it('T2-F4-05: /test-drive?model=unknown-slug renders cleanly defaulting to first active model', async () => {
      simulateDbDown(true);
      const res = await renderServerPage('src/app/(public)/test-drive/page.tsx', {
        searchParams: Promise.resolve({ model: 'unknown-slug' }),
      });
      expect(resultStatusIsOk(res.status)).toBe(true);
      expect(res.html).toContain('Zeekr 001');
    });

    it('T2-F4-06: InventoryCatalog opens ReserveModal when initialReserveId matches either item.id or item.vinOrCode', () => {
      const sampleItems = [
        {
          id: 'cuid-item-123',
          vinOrCode: 'VIN-ABC-999',
          exteriorColor: 'White',
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
        },
      ];
      const models = [{ id: 'zeekr-001', name: 'Zeekr 001', slug: 'zeekr-001' }];

      const byIdHtml = renderComponentHtml(
        React.createElement(InventoryCatalog, {
          initialItems: sampleItems,
          models,
          usdRate: 12850,
          initialReserveId: 'cuid-item-123',
        })
      );
      expect(byIdHtml).toContain('role="dialog"');

      const byVinHtml = renderComponentHtml(
        React.createElement(InventoryCatalog, {
          initialItems: sampleItems,
          models,
          usdRate: 12850,
          initialReserveId: 'VIN-ABC-999',
        })
      );
      expect(byVinHtml).toContain('role="dialog"');
    });
  });

  // =========================================================================
  // F5: Admin Form Relative Asset Paths Boundaries (6 tests)
  // =========================================================================
  describe('F5: Admin Asset Path Validation Boundaries', () => {
    const baseModel = {
      name: 'Zeekr Test',
      slug: 'zeekr-test',
      tagline: 'Test Tagline',
      basePriceUSD: 40000,
      rangeKm: 600,
      acceleration0100: 4.5,
      batteryKwh: 86,
      powerHp: 422,
      topSpeedKmH: 200,
      chargingTimeMin: 20,
      mainImage: '/images/cars/zeekr-001/main.jpg',
      description: 'Valid description text.',
      galleryImages: [],
      isActive: true,
    };

    const baseInv = {
      trimId: 'zeekr-001-trim-1',
      vinOrCode: 'VIN-VALID-1',
      exteriorColor: 'White',
      interiorColor: 'Black',
      year: 2026,
      status: 'IN_STOCK' as const,
      priceUSD: 45000,
      images: [],
    };

    it('T2-F5-01: carModelFormSchema rejects empty or whitespace-only mainImage', () => {
      expect(carModelFormSchema.safeParse({ ...baseModel, mainImage: '' }).success).toBe(false);
      expect(carModelFormSchema.safeParse({ ...baseModel, mainImage: '   ' }).success).toBe(false);
    });

    it('T2-F5-02: carModelFormSchema rejects unsafe javascript: schemes and non-path strings', () => {
      expect(
        carModelFormSchema.safeParse({ ...baseModel, mainImage: 'javascript:alert(1)' }).success
      ).toBe(false);
      expect(
        carModelFormSchema.safeParse({ ...baseModel, mainImage: 'not-a-valid-path' }).success
      ).toBe(false);
    });

    it('T2-F5-03: inventoryItemFormSchema rejects unsafe javascript: image URLs', () => {
      expect(
        inventoryItemFormSchema.safeParse({ ...baseInv, images: ['javascript:alert(1)'] }).success
      ).toBe(false);
    });

    it('T2-F5-04: inventoryItemFormSchema permits optional empty images[] array', () => {
      expect(inventoryItemFormSchema.safeParse({ ...baseInv, images: [] }).success).toBe(true);
    });

    it('T2-F5-05: createCarModelAction rejects basePriceUSD <= 0', async () => {
      setAuthCookie(signValidAdminJwt());
      const resZero = await createCarModelAction({ ...baseModel, basePriceUSD: 0 });
      expect(resZero.success).toBe(false);
      const resNeg = await createCarModelAction({ ...baseModel, basePriceUSD: -500 });
      expect(resNeg.success).toBe(false);
    });

    it('T2-F5-06: createInventoryItemAction rejects out-of-range year (1995) and negative priceUSD', async () => {
      setAuthCookie(signValidAdminJwt());
      const badYear = await createInventoryItemAction({ ...baseInv, year: 1995 });
      expect(badYear.success).toBe(false);
      const badPrice = await createInventoryItemAction({ ...baseInv, priceUSD: -100 });
      expect(badPrice.success).toBe(false);
    });
  });

  // =========================================================================
  // F6: Auth & Middleware JWT Security Boundaries (6 tests)
  // =========================================================================
  describe('F6: Auth & Middleware Security Boundaries', () => {
    it('T2-F6-01: middleware redirects unauthenticated /admin/leads to /admin/login?from=%2Fadmin%2Fleads', async () => {
      const res = await callMiddleware('/admin/leads');
      expect(res.status).toBe(307);
      expect(res.location).toContain('/admin/login');
      expect(res.location).toContain('from=%2Fadmin%2Fleads');
    });

    it('T2-F6-02: middleware rejects malformed JWT token cookie with 307 redirect', async () => {
      const res = await callMiddleware('/admin/cars', { token: 'garbage.jwt.here' });
      expect(res.status).toBe(307);
      expect(res.location).toContain('/admin/login');
    });

    it('T2-F6-03: middleware rejects JWT signed with wrong secret', async () => {
      const res = await callMiddleware('/admin', { token: signWrongSecretAdminJwt() });
      expect(res.status).toBe(307);
      expect(res.location).toContain('/admin/login');
    });

    it('T2-F6-04: middleware rejects expired JWT token', async () => {
      const res = await callMiddleware('/admin', { token: signExpiredAdminJwt() });
      expect(res.status).toBe(307);
      expect(res.location).toContain('/admin/login');
    });

    it('T2-F6-05: middleware rejects valid JWT with non-ADMIN role ("USER")', async () => {
      const res = await callMiddleware('/admin', { token: signRoleJwt('USER') });
      expect(res.status).toBe(307);
      expect(res.location).toContain('/admin/login');
    });

    it('T2-F6-06: auth.ts contains no hardcoded secret literal, fails closed when JWT_SECRET is unset, and rejects wrong password', async () => {
      const authSource = fs.readFileSync(resolveRepoPath('src/lib/auth.ts'), 'utf-8');
      expect(authSource).not.toContain('zeekr-super-secret-admin-key-2026');

      const badLogin = await loginAdminAction({
        email: 'admin@zeekr-auto.uz',
        password: 'WrongPassword!',
      });
      expect(badLogin.success).toBe(false);
      expect(mockCookieStore.get('admin_token')).toBeUndefined();

      const prevSecret = process.env.JWT_SECRET;
      const prevEnv = process.env.NODE_ENV;
      try {
        delete process.env.JWT_SECRET;
        (process.env as Record<string, string | undefined>).NODE_ENV = 'production';
        await expect(
          signToken({ userId: 'u1', email: 'admin@zeekr-auto.uz', role: 'ADMIN' })
        ).rejects.toThrow();

        const validPrevToken = signValidAdminJwt(prevSecret);
        let verified: unknown = 'UNSET';
        try {
          verified = await verifyToken(validPrevToken);
        } catch {
          verified = null;
        }
        expect(verified).toBeNull();
        setAuthCookie(validPrevToken);
        expect(await getAdminSession()).toBeNull();
      } finally {
        process.env.JWT_SECRET = prevSecret;
        (process.env as Record<string, string | undefined>).NODE_ENV = prevEnv;
      }
    });
  });

  // =========================================================================
  // F7: Lead Validation & Rate-Limiting Boundaries (6 tests)
  // =========================================================================
  describe('F7: Lead Validation & Rate-Limiting Boundaries', () => {
    it('T2-F7-01: POST /api/leads returns HTTP 400 (not 500) on malformed JSON body', async () => {
      const res = await dispatchApiRequest('/api/leads', 'src/app/api/leads/route.ts', {
        method: 'POST',
        headers: { 'x-forwarded-for': '203.0.113.201' },
        rawBody: '{bad json',
      });
      expect(res.status).toBe(400);
      expect(res.json?.error).toBeTruthy();
    });

    it('T2-F7-02: POST /api/leads rejects invalid phones, whitespace-only name, and oversized strings with 400', async () => {
      const badPayloads = [
        { fullName: 'Ali', phone: '+14155552671' },
        { fullName: 'Ali', phone: '12345' },
        { fullName: '   ', phone: '+998901234567' },
        { fullName: 'A'.repeat(150), phone: '+998901234567' },
        { fullName: 'Alisher', phone: '+998901234567', notes: 'N'.repeat(2500) },
      ];
      for (let i = 0; i < badPayloads.length; i++) {
        const res = await dispatchApiRequest('/api/leads', 'src/app/api/leads/route.ts', {
          method: 'POST',
          headers: { 'x-forwarded-for': `203.0.113.${210 + i}` },
          body: badPayloads[i],
        });
        expect(res.status, `Expected 400 for payload #${i}`).toBe(400);
      }
    });

    it('T2-F7-03: POST /api/leads rejects invalid preferredDate ("not-a-date", "2026-02-30") and invalid type with 400', async () => {
      const badDates = [
        { fullName: 'Alisher', phone: '+998901234567', preferredDate: 'not-a-date' },
        { fullName: 'Alisher', phone: '+998901234567', preferredDate: '2026-02-30' },
        { fullName: 'Alisher', phone: '+998901234567', type: 'INVALID_TYPE' },
      ];
      for (let i = 0; i < badDates.length; i++) {
        const res = await dispatchApiRequest('/api/leads', 'src/app/api/leads/route.ts', {
          method: 'POST',
          headers: { 'x-forwarded-for': `203.0.113.${220 + i}` },
          body: badDates[i],
        });
        expect(res.status, `Expected 400 for bad date/type #${i}`).toBe(400);
      }
    });

    it('T2-F7-04: POST /api/leads returns controlled 400 (not 500) on non-existent modelId or inventoryItemId FK', async () => {
      const badModelRes = await dispatchApiRequest('/api/leads', 'src/app/api/leads/route.ts', {
        method: 'POST',
        headers: { 'x-forwarded-for': '203.0.113.230' },
        body: {
          fullName: 'Alisher',
          phone: '+998901234567',
          modelId: 'non-existent-model-id',
        },
      });
      expect(badModelRes.status).toBe(400);

      const badInvRes = await dispatchApiRequest('/api/leads', 'src/app/api/leads/route.ts', {
        method: 'POST',
        headers: { 'x-forwarded-for': '203.0.113.231' },
        body: {
          fullName: 'Alisher',
          phone: '+998901234567',
          inventoryItemId: 'non-existent-inv-id',
        },
      });
      expect(badInvRes.status).toBe(400);
    });

    it('T2-F7-05: POST /api/leads enforces per-IP rate limiting returning HTTP 429 without blocking distinct IPs', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
      const spamIp = '198.51.100.77';
      const statuses: number[] = [];

      for (let i = 0; i < 15; i++) {
        const res = await dispatchApiRequest('/api/leads', 'src/app/api/leads/route.ts', {
          method: 'POST',
          headers: { 'x-forwarded-for': spamIp },
          body: {
            fullName: `Spammer ${i}`,
            phone: '+998901234567',
            type: 'TEST_DRIVE',
          },
        });
        statuses.push(res.status);
      }

      expect(statuses).toContain(429);

      const cleanIpRes = await dispatchApiRequest('/api/leads', 'src/app/api/leads/route.ts', {
        method: 'POST',
        headers: { 'x-forwarded-for': '198.51.100.88' },
        body: {
          fullName: 'Legit User',
          phone: '+998901234568',
          type: 'TEST_DRIVE',
        },
      });
      expect(cleanIpRes.status).toBe(200);
    });

    it('T2-F7-06: createTestDriveLeadAction rejects invalid input without creating DB lead', async () => {
      const before = await prismaMemoryClient.lead.count();
      const res = await createTestDriveLeadAction({
        fullName: 'A',
        phone: '123',
      });
      expect(res.success).toBe(false);
      expect(res.error).toBeTruthy();
      const after = await prismaMemoryClient.lead.count();
      expect(after).toBe(before);
    });
  });

  // =========================================================================
  // F8: Prisma directUrl, SERVICE Dashboard Label, Dynamic Footer Boundaries (6 tests)
  // =========================================================================
  describe('F8: Dashboard SERVICE Label & Dynamic Footer Boundaries', () => {
    it('T2-F8-01: AdminDashboardPage labels SERVICE leads as "Servis" and NOT "Konsultatsiya"', async () => {
      await prismaMemoryClient.lead.create({
        data: {
          type: 'SERVICE',
          fullName: 'Servis Mijoz',
          phone: '+998901112233',
          status: 'NEW',
        },
      });
      const res = await renderServerPage('src/app/admin/page.tsx');
      expect(res.status).toBe(200);
      expect(res.html).toContain('Servis');
      expect(res.html).not.toContain('Konsultatsiya');
    });

    it('T2-F8-02: AdminDashboardPage renders empty-state message cleanly with 0 leads or DB outage', async () => {
      const emptyRes = await renderServerPage('src/app/admin/page.tsx');
      expect(emptyRes.status).toBe(200);
      expect(emptyRes.html).toContain('Hozircha arizalar mavjud emas.');

      simulateDbDown(true);
      const downRes = await renderServerPage('src/app/admin/page.tsx');
      expect(downRes.status).toBe(200);
      expect(downRes.html).toContain('Hozircha arizalar mavjud emas.');
    });

    it('T2-F8-03: Footer omits models marked isActive: false in database', async () => {
      await prismaMemoryClient.carModel.create({
        data: {
          slug: 'zeekr-hidden',
          name: 'Zeekr Hidden',
          tagline: 'Hidden Model',
          basePriceUSD: 50000,
          acceleration0100: 3.5,
          rangeKm: 600,
          batteryKwh: 100,
          powerHp: 500,
          topSpeedKmH: 200,
          chargingTimeMin: 15,
          mainImage: '/images/cars/zeekr-001/main.jpg',
          description: 'Hidden',
          isActive: false,
          orderIndex: 10,
        },
      });
      const element = await Footer();
      const html = renderComponentHtml(element);
      expect(html).not.toContain('/models/zeekr-hidden');
      expect(html).not.toContain('Zeekr Hidden');
    });

    it('T2-F8-04: Footer renders cleanly without throwing even when zero active models exist', async () => {
      for (const slug of ['zeekr-001', 'zeekr-007', 'zeekr-009', 'zeekr-x']) {
        await prismaMemoryClient.carModel.update({
          where: { slug },
          data: { isActive: false },
        });
      }
      // Note: if data-provider falls back when DB returns [], active JSON models appear; either way Footer must not crash
      const element = await Footer();
      const html = renderComponentHtml(element);
      expect(html).toContain('<footer');
      expect(html).toContain('ZEEKR');
    });

    it('T2-F8-05: Footer omits optional social/secondary links when settings values are empty strings', async () => {
      for (const key of ['secondary_phone', 'telegram_channel', 'instagram_url', 'youtube_url']) {
        await prismaMemoryClient.setting.upsert({
          where: { key },
          update: { value: '' },
          create: { key, value: '' },
        });
      }
      const element = await Footer();
      const html = renderComponentHtml(element);
      expect(html).not.toContain('aria-label="Telegram"');
      expect(html).not.toContain('aria-label="Instagram"');
      expect(html).not.toContain('aria-label="YouTube"');
      expect(html).not.toContain('href="tel:"');
    });

    it('T2-F8-06: AdminDashboardPage displays USD rate and accurate lead/inventory counts', async () => {
      await prismaMemoryClient.lead.create({
        data: {
          type: 'TEST_DRIVE',
          fullName: 'Test Count',
          phone: '+998901234567',
          status: 'NEW',
        },
      });
      const res = await renderServerPage('src/app/admin/page.tsx');
      expect(res.status).toBe(200);
      expect(res.html).toContain('12,850');
      expect(res.html).toContain('Yangi arizalar');
      expect(res.html).toContain('Salonda tayyor');
    });
  });
});

function resultStatusIsOk(status: number): boolean {
  return status === 200;
}
