import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import {
  resetTestState,
  mockCookieStore,
  mockHeadersMap,
  prismaMemoryClient,
  simulateDbDown,
} from '../helpers/setup';
import {
  signValidAdminJwt,
  setAuthCookie,
} from '../helpers/auth-helper';
import {
  dispatchApiRequest,
  renderServerPage,
  renderComponentHtml,
} from '../helpers/http-client';
import { fileExistsInRepo, importOptionalModule, resolveRepoPath } from '../helpers/module-loader';

import { carModelFormSchema, inventoryItemFormSchema } from '@/lib/validations/car';
import { createCarModelAction } from '@/app/actions/adminCarActions';
import { updateSettingsAction } from '@/app/actions/adminSettingsActions';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import AdminNewCarPage from '@/app/admin/cars/new/page';
import { InventoryFormClient } from '@/components/admin/InventoryFormClient';

function setTestLocale(locale: 'uz' | 'ru') {
  mockCookieStore.set('locale', locale);
  mockCookieStore.set('NEXT_LOCALE', locale);
  mockCookieStore.set('zeekr_locale', locale);
  mockHeadersMap.set('accept-language', locale === 'ru' ? 'ru-RU,ru;q=0.9' : 'uz-UZ,uz;q=0.9');
}

function makeFakeImageFile(type: 'jpeg' | 'png' | 'webp', filename: string): File {
  const bytes =
    type === 'jpeg'
      ? Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01])
      : type === 'png'
        ? Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d])
        : Uint8Array.from([0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50]);

  const mime = type === 'jpeg' ? 'image/jpeg' : type === 'png' ? 'image/png' : 'image/webp';
  return new File([bytes], filename, { type: mime });
}

describe('Tier 1 — Part C: Localization, Local Upload, Showroom & Vercel Readiness (F12–F15)', () => {
  const uploadedFilesToCleanup: string[] = [];

  beforeEach(() => {
    resetTestState();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    for (const relOrUrl of uploadedFilesToCleanup.splice(0)) {
      const cleaned = relOrUrl.replace(/^\/+/, '');
      const candidates = [
        resolveRepoPath(path.join('public', cleaned)),
        resolveRepoPath(cleaned),
      ];
      for (const candidate of candidates) {
        if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
          fs.unlinkSync(candidate);
        }
      }
    }
  });

  // =========================================================================
  // F12: Multi-Language Localization (uz / ru) (6 tests)
  // =========================================================================
  describe('F12: Multi-Language Localization (uz / ru)', () => {
    it('T1-F12-01: Default visit without locale cookie renders <html lang="uz"> and Uzbek UI', async () => {
      const pageRes = await renderServerPage(
        'src/app/(public)/page.tsx',
        {},
        { withRootLayout: true }
      );
      expect(pageRes.status).toBe(200);
      expect(pageRes.html).toContain('<html lang="uz"');
      expect(pageRes.html).toContain('Modellar');
      expect(pageRes.html).toContain('Test-drayv');
    });

    it('T1-F12-02: Switching locale to ru updates <html lang="ru"> and translates Header, Footer & Homepage', async () => {
      setTestLocale('ru');
      const homeRes = await renderServerPage(
        'src/app/(public)/page.tsx',
        {},
        { withRootLayout: true }
      );
      const headerHtml = renderComponentHtml(await Header());
      const footerHtml = renderComponentHtml(await Footer());

      expect(homeRes.status).toBe(200);
      expect(homeRes.html).toContain('<html lang="ru"');
      // Russian Cyrillic UI copy must be rendered in Header, Footer, and Homepage
      expect(headerHtml).toMatch(/[\u0400-\u04FF]{3,}/);
      expect(footerHtml).toMatch(/[\u0400-\u04FF]{3,}/);
      expect(homeRes.html).toMatch(/[\u0400-\u04FF]{4,}/);
    });

    it('T1-F12-03: Locale ru translates all public sub-routes (/models/[slug], /inventory, /test-drive, /service, /contacts)', async () => {
      setTestLocale('ru');
      const routes: Array<{ path: string; props: Record<string, any> }> = [
        { path: 'src/app/(public)/models/[slug]/page.tsx', props: { params: Promise.resolve({ slug: 'zeekr-001' }) } },
        { path: 'src/app/(public)/inventory/page.tsx', props: { searchParams: Promise.resolve({}) } },
        { path: 'src/app/(public)/test-drive/page.tsx', props: { searchParams: Promise.resolve({}) } },
        { path: 'src/app/(public)/service/page.tsx', props: {} },
        { path: 'src/app/(public)/contacts/page.tsx', props: {} },
      ];

      for (const route of routes) {
        const res = await renderServerPage(route.path, route.props);
        expect(res.status, `Failed to render ${route.path}`).toBe(200);
        expect(res.html, `${route.path} missing Russian Cyrillic translation`).toMatch(/[\u0400-\u04FF]{4,}/);
      }
    });

    it('T1-F12-04: Switching back from ru to uz restores <html lang="uz"> and Uzbek copy', async () => {
      setTestLocale('ru');
      const ruRes = await renderServerPage('src/app/(public)/page.tsx', {}, { withRootLayout: true });
      expect(ruRes.html).toContain('<html lang="ru"');

      setTestLocale('uz');
      const uzRes = await renderServerPage('src/app/(public)/page.tsx', {}, { withRootLayout: true });
      expect(uzRes.html).toContain('<html lang="uz"');
      expect(uzRes.html).toContain('Modellar');
    });

    it('T1-F12-05: Rendered uz and ru HTML contains zero undefined, [object Object], or raw dotted key leaks', async () => {
      for (const loc of ['uz', 'ru'] as const) {
        setTestLocale(loc);
        const home = await renderServerPage('src/app/(public)/page.tsx', {}, { withRootLayout: true });
        const service = await renderServerPage('src/app/(public)/service/page.tsx');
        for (const html of [home.html, service.html]) {
          expect(html).not.toContain('undefined');
          expect(html).not.toContain('[object Object]');
          expect(html).not.toMatch(/\b(nav|home|footer|common|service)\.[a-zA-Z_]+\b/);
        }
      }
    });

    it('T1-F12-06: Header exposes an interactive uz / ru locale switcher control', async () => {
      const headerHtml = renderComponentHtml(await Header());
      expect(headerHtml).toMatch(/\bUZ\b/i);
      expect(headerHtml).toMatch(/\bRU\b/i);
    });
  });

  // =========================================================================
  // F13: Local-Disk Image Upload & Admin Integration (6 tests)
  // =========================================================================
  describe('F13: Local-Disk Image Upload & Admin Form Integration', () => {
    it('T1-F13-01: Authenticated ADMIN uploads valid JPEG and receives relative path saved on disk', async () => {
      const token = signValidAdminJwt();
      const formData = new FormData();
      formData.append('file', makeFakeImageFile('jpeg', 'zeekr-upload.jpg'));

      const res = await dispatchApiRequest('/api/admin/upload', 'src/app/api/admin/upload/route.ts', {
        method: 'POST',
        token,
        formData,
      });
      expect([200, 201]).toContain(res.status);
      expect(typeof res.json?.url).toBe('string');
      expect(res.json.url.startsWith('/')).toBe(true);
      uploadedFilesToCleanup.push(res.json.url);

      const publicPath = resolveRepoPath(path.join('public', res.json.url.replace(/^\/+/, '')));
      const directPath = resolveRepoPath(res.json.url.replace(/^\/+/, ''));
      expect(fs.existsSync(publicPath) || fs.existsSync(directPath)).toBe(true);
    });

    it('T1-F13-02: Authenticated ADMIN uploads valid PNG and WebP with collision-free unique filenames', async () => {
      const token = signValidAdminJwt();

      const fdPng = new FormData();
      fdPng.append('file', makeFakeImageFile('png', 'car.png'));
      const pngRes = await dispatchApiRequest('/api/admin/upload', 'src/app/api/admin/upload/route.ts', {
        method: 'POST',
        token,
        formData: fdPng,
      });
      expect([200, 201]).toContain(pngRes.status);
      uploadedFilesToCleanup.push(pngRes.json.url);

      const fdWebp = new FormData();
      fdWebp.append('file', makeFakeImageFile('webp', 'car.webp'));
      const webpRes = await dispatchApiRequest('/api/admin/upload', 'src/app/api/admin/upload/route.ts', {
        method: 'POST',
        token,
        formData: fdWebp,
      });
      expect([200, 201]).toContain(webpRes.status);
      uploadedFilesToCleanup.push(webpRes.json.url);

      expect(pngRes.json.url).not.toBe(webpRes.json.url);
    });

    it('T1-F13-03: Uploaded relative URL maps to exact uploaded bytes inside project folder', async () => {
      const token = signValidAdminJwt();
      const file = makeFakeImageFile('jpeg', 'verify-bytes.jpg');
      const expectedBytes = Buffer.from(await file.arrayBuffer());

      const fd = new FormData();
      fd.append('file', file);
      const res = await dispatchApiRequest('/api/admin/upload', 'src/app/api/admin/upload/route.ts', {
        method: 'POST',
        token,
        formData: fd,
      });
      expect([200, 201]).toContain(res.status);
      uploadedFilesToCleanup.push(res.json.url);

      const publicPath = resolveRepoPath(path.join('public', res.json.url.replace(/^\/+/, '')));
      expect(fs.existsSync(publicPath)).toBe(true);
      const actualBytes = fs.readFileSync(publicPath);
      expect(actualBytes.equals(expectedBytes)).toBe(true);
    });

    it('T1-F13-04: Returned upload URL passes carModelFormSchema, inventoryItemFormSchema, and createCarModelAction', async () => {
      const token = signValidAdminJwt();
      setAuthCookie(token);

      const fd = new FormData();
      fd.append('file', makeFakeImageFile('png', 'model-hero.png'));
      const uploadRes = await dispatchApiRequest('/api/admin/upload', 'src/app/api/admin/upload/route.ts', {
        method: 'POST',
        token,
        formData: fd,
      });
      expect([200, 201]).toContain(uploadRes.status);
      const uploadedUrl = uploadRes.json.url;
      uploadedFilesToCleanup.push(uploadedUrl);

      const modelPayload = {
        name: 'Zeekr Upload Car',
        slug: 'zeekr-upload-car',
        tagline: 'Uploaded Image Test',
        basePriceUSD: 46000,
        rangeKm: 700,
        acceleration0100: 3.8,
        batteryKwh: 100,
        powerHp: 544,
        topSpeedKmH: 200,
        chargingTimeMin: 15,
        mainImage: uploadedUrl,
        description: 'Testing uploaded local path persistence.',
        galleryImages: [uploadedUrl],
        isActive: true,
      };
      expect(carModelFormSchema.safeParse(modelPayload).success).toBe(true);
      expect(
        inventoryItemFormSchema.safeParse({
          trimId: 'zeekr-001-trim-1',
          exteriorColor: 'White',
          interiorColor: 'Black',
          year: 2026,
          status: 'IN_STOCK',
          priceUSD: 47000,
          images: [uploadedUrl],
        }).success
      ).toBe(true);

      const created = await createCarModelAction(modelPayload);
      expect(created.success).toBe(true);
    });

    it('T1-F13-05: Admin model and inventory forms render file upload input controls', () => {
      const newCarHtml = renderComponentHtml(React.createElement(AdminNewCarPage));
      expect(newCarHtml).toMatch(/type="file"/i);

      const invFormHtml = renderComponentHtml(
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
      expect(invFormHtml).toMatch(/type="file"/i);
    });

    it('T1-F13-06: Repeated uploads of the same filename generate distinct unique paths', async () => {
      const token = signValidAdminJwt();
      const urls: string[] = [];
      for (let i = 0; i < 2; i++) {
        const fd = new FormData();
        fd.append('file', makeFakeImageFile('jpeg', 'same-name.jpg'));
        const res = await dispatchApiRequest('/api/admin/upload', 'src/app/api/admin/upload/route.ts', {
          method: 'POST',
          token,
          formData: fd,
        });
        expect([200, 201]).toContain(res.status);
        urls.push(res.json.url);
        uploadedFilesToCleanup.push(res.json.url);
      }
      expect(urls[0]).not.toBe(urls[1]);
    });
  });

  // =========================================================================
  // F14: Homepage Showroom Information Block (6 tests)
  // =========================================================================
  describe('F14: Homepage Showroom Information Block (uz & ru)', () => {
    it('T1-F14-01: Homepage renders showroom block with settings.showroom_address and settings.working_hours', async () => {
      const homeRes = await renderServerPage('src/app/(public)/page.tsx');
      expect(homeRes.status).toBe(200);
      expect(homeRes.html).toContain('Sergeli');
      expect(homeRes.html).toContain('09:00');
    });

    it('T1-F14-02: Homepage showroom block displays clickable tel: link and /contacts or /test-drive link', async () => {
      const homeRes = await renderServerPage('src/app/(public)/page.tsx');
      expect(homeRes.status).toBe(200);
      expect(homeRes.html).toContain('href="tel:+998712000000"');
      expect(homeRes.html).toMatch(/href="\/(contacts|test-drive)"/);
    });

    it('T1-F14-03: Homepage showroom block translates headings and labels when locale is ru', async () => {
      setTestLocale('ru');
      const homeRes = await renderServerPage('src/app/(public)/page.tsx');
      expect(homeRes.status).toBe(200);
      expect(homeRes.html).toContain('Sergeli');
      expect(homeRes.html).toMatch(/[\u0400-\u04FF]{4,}/);
    });

    it('T1-F14-04: Updating settings via updateSettingsAction reflects updated address/phone/hours on Homepage', async () => {
      setAuthCookie(signValidAdminJwt());
      const res = await updateSettingsAction({
        showroom_address: 'Toshkent, Yunusobod tumani, 12-uy',
        primary_phone: '+998712554433',
        secondary_phone: '',
        contact_email: 'showroom@zeekr.uz',
        working_hours: '10:00 — 21:00',
        map_iframe_url: '',
        telegram_channel: '',
        instagram_url: '',
        youtube_url: '',
        usd_to_uzs_rate: 12900,
        default_loan_apr: 20,
        telegram_bot_token: '',
        telegram_chat_id: '',
      });
      expect(res.success).toBe(true);

      const homeRes = await renderServerPage('src/app/(public)/page.tsx');
      expect(homeRes.html).toContain('Toshkent, Yunusobod tumani, 12-uy');
      expect(homeRes.html).toContain('+998712554433');
      expect(homeRes.html).toContain('10:00 — 21:00');
    });

    it('T1-F14-05: Homepage showroom block renders data/settings.json fallback when DB is down', async () => {
      simulateDbDown(true);
      const homeRes = await renderServerPage('src/app/(public)/page.tsx');
      expect(homeRes.status).toBe(200);
      expect(homeRes.html).toContain('Sergeli');
      expect(homeRes.html).toContain('+998712000000');
    });

    it('T1-F14-06: Homepage showroom block renders contact_email mailto link when configured', async () => {
      const homeRes = await renderServerPage('src/app/(public)/page.tsx');
      expect(homeRes.status).toBe(200);
      expect(homeRes.html).toContain('info@zeekr-auto.uz');
    });
  });

  // =========================================================================
  // F15: ESLint & Vercel Deployment Readiness (6 tests)
  // =========================================================================
  describe('F15: ESLint & Vercel Deployment Readiness', () => {
    it('T1-F15-01: ESLint configuration exists and runs non-interactively with exit code 0', () => {
      const hasEslintConfig =
        fileExistsInRepo('eslint.config.mjs') ||
        fileExistsInRepo('eslint.config.js') ||
        fileExistsInRepo('eslint.config.ts') ||
        fileExistsInRepo('.eslintrc.json') ||
        fileExistsInRepo('.eslintrc.js');
      expect(hasEslintConfig, 'Missing ESLint configuration file').toBe(true);
      expect(fileExistsInRepo('node_modules/eslint')).toBe(true);

      const eslintBin = resolveRepoPath('node_modules/eslint/bin/eslint.js');
      execFileSync(process.execPath, [eslintBin, 'src/lib/calculator.ts'], {
        stdio: 'pipe',
        encoding: 'utf-8',
      });
    });

    it('T1-F15-02: vercel.json and package.json build script satisfy Vercel deployment config & security headers', () => {
      const vercelCfg = JSON.parse(fs.readFileSync(resolveRepoPath('vercel.json'), 'utf-8'));
      expect(vercelCfg.framework).toBe('nextjs');
      const headerJson = JSON.stringify(vercelCfg.headers || []);
      expect(headerJson).toContain('X-Content-Type-Options');
      expect(headerJson).toContain('nosniff');
      expect(headerJson).toContain('X-Frame-Options');
      expect(headerJson).toContain('DENY');

      const pkg = JSON.parse(fs.readFileSync(resolveRepoPath('package.json'), 'utf-8'));
      expect(pkg.scripts.build).toContain('prisma generate');
      expect(pkg.scripts.build).toContain('db-deploy.js');
      expect(pkg.scripts.build).toContain('next build');
    });

    it('T1-F15-03: .env.example documents all required production variables with placeholder values only', () => {
      const envEx = fs.readFileSync(resolveRepoPath('.env.example'), 'utf-8');
      for (const key of [
        'DATABASE_URL',
        'DIRECT_URL',
        'JWT_SECRET',
        'TELEGRAM_BOT_TOKEN',
        'TELEGRAM_CHAT_ID',
      ]) {
        expect(envEx).toContain(`${key}=`);
      }
    });

    it('T1-F15-04: prisma/schema.prisma includes directUrl and scripts/db-deploy.js exits 0 without DB URL', () => {
      const schema = fs.readFileSync(resolveRepoPath('prisma/schema.prisma'), 'utf-8');
      expect(schema).toMatch(/directUrl\s*=\s*env\("DIRECT_URL"\)/);

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

    it('T1-F15-05: TypeScript check (tsc --noEmit) passes cleanly with 0 errors', { timeout: 30000 }, () => {
      const tscBin = resolveRepoPath('node_modules/typescript/bin/tsc');
      execFileSync(process.execPath, [tscBin, '--noEmit'], {
        cwd: process.cwd(),
        stdio: 'pipe',
        encoding: 'utf-8',
      });
    });

    it('T1-F15-06: Next.js config has reactStrictMode enabled and valid image configuration', async () => {
      const cfg = (await import('../../../next.config')).default;
      expect(cfg.reactStrictMode).toBe(true);
      expect(cfg.images).toBeTruthy();
    });
  });
});
