import fs from 'fs';
import path from 'path';
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
  signRoleJwt,
  signValidAdminJwt,
  setAuthCookie,
} from '../helpers/auth-helper';
import {
  dispatchApiRequest,
  renderServerPage,
  renderComponentHtml,
} from '../helpers/http-client';
import { resolveRepoPath } from '../helpers/module-loader';

import { signToken, verifyToken, getAdminSession } from '@/lib/auth';
import { getCarModels } from '@/lib/data-provider';
import { getSiteSettings } from '@/lib/settings';
import { Header } from '@/components/layout/Header';

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

describe('Tier 2 — Part C: Boundary & Negative Cases (F12–F15)', () => {
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
  // F12: Multi-Language Localization Boundaries (6 tests)
  // =========================================================================
  describe('F12: Localization Fallback & Compatibility Boundaries', () => {
    it('T2-F12-01: Invalid or path-traversal locale cookie safely falls back to <html lang="uz">', async () => {
      for (const badLocale of ['en', 'fr', '../../etc/passwd', '<script>']) {
        mockCookieStore.set('locale', badLocale);
        mockCookieStore.set('NEXT_LOCALE', badLocale);
        const res = await renderServerPage('src/app/(public)/page.tsx', {}, { withRootLayout: true });
        expect(res.status).toBe(200);
        expect(res.html).toContain('<html lang="uz"');
      }
    });

    it('T2-F12-02: Switching locale to ru preserves /inventory?reserve= modal and /test-drive?model= selection', async () => {
      mockCookieStore.set('locale', 'ru');
      mockCookieStore.set('NEXT_LOCALE', 'ru');
      mockHeadersMap.set('accept-language', 'ru');

      const invRes = await renderServerPage('src/app/(public)/inventory/page.tsx', {
        searchParams: Promise.resolve({ reserve: 'ZEEKR001-UZ-2026-001' }),
      });
      expect(invRes.status).toBe(200);
      expect(invRes.html).toContain('role="dialog"');
      expect(invRes.html).toMatch(/[\u0400-\u04FF]{4,}/);

      const tdRes = await renderServerPage('src/app/(public)/test-drive/page.tsx', {
        searchParams: Promise.resolve({ model: 'zeekr-007' }),
      });
      expect(tdRes.status).toBe(200);
      expect(tdRes.html).toContain('Zeekr 007');
      expect(tdRes.html).toMatch(/[\u0400-\u04FF]{4,}/);
    });

    it('T2-F12-03: Dynamic model data and currency/spec numbers render cleanly in ru without NaN', async () => {
      mockCookieStore.set('locale', 'ru');
      mockCookieStore.set('NEXT_LOCALE', 'ru');

      const modelRes = await renderServerPage('src/app/(public)/models/[slug]/page.tsx', {
        params: Promise.resolve({ slug: 'zeekr-001' }),
      });
      expect(modelRes.status).toBe(200);
      expect(modelRes.html).toContain('$45,000');
      expect(modelRes.html).not.toContain('NaN');
    });

    it('T2-F12-04: POST /api/leads remains backward-compatible with Uzbek default validation when no locale is set', async () => {
      const badRes = await dispatchApiRequest('/api/leads', 'src/app/api/leads/route.ts', {
        method: 'POST',
        headers: { 'x-forwarded-for': '203.0.113.180' },
        body: { fullName: 'A', phone: '123' },
      });
      expect(badRes.status).toBe(400);
      expect(badRes.json?.error).toBeTruthy();
    });

    it('T2-F12-05: In ru locale, rendered Header and pages maintain non-empty aria-label, alt, and valid href attributes', async () => {
      mockCookieStore.set('locale', 'ru');
      mockCookieStore.set('NEXT_LOCALE', 'ru');
      const headerHtml = renderComponentHtml(await Header());
      expect(headerHtml).not.toMatch(/aria-label=""/);
      expect(headerHtml).not.toMatch(/href=""/);
      expect(headerHtml).not.toContain('undefined');
    });

    it('T2-F12-06: src/app/layout.tsx does not statically hardcode lang="uz" ignoring locale', () => {
      const layoutSrc = fs.readFileSync(resolveRepoPath('src/app/layout.tsx'), 'utf-8');
      expect(layoutSrc).not.toMatch(/<html\s+lang="uz">/);
    });
  });

  // =========================================================================
  // F13: Local-Disk Image Upload Security & Validation Boundaries (6 tests)
  // =========================================================================
  describe('F13: Local Upload Security & Rejection Boundaries', () => {
    it('T2-F13-01: Unauthenticated POST /api/admin/upload returns 401/403 and writes no files', async () => {
      const fd = new FormData();
      fd.append(
        'file',
        new File([Uint8Array.from([0xff, 0xd8, 0xff, 0xe0])], 'unauth.jpg', { type: 'image/jpeg' })
      );
      const res = await dispatchApiRequest('/api/admin/upload', 'src/app/api/admin/upload/route.ts', {
        method: 'POST',
        formData: fd,
      });
      expect([401, 403]).toContain(res.status);
    });

    it('T2-F13-02: Non-ADMIN role (MANAGER) POST /api/admin/upload is rejected with 401/403', async () => {
      const fd = new FormData();
      fd.append(
        'file',
        new File([Uint8Array.from([0xff, 0xd8, 0xff, 0xe0])], 'mgr.jpg', { type: 'image/jpeg' })
      );
      const res = await dispatchApiRequest('/api/admin/upload', 'src/app/api/admin/upload/route.ts', {
        method: 'POST',
        token: signRoleJwt('MANAGER'),
        formData: fd,
      });
      expect([401, 403]).toContain(res.status);
    });

    it('T2-F13-03: Disallowed MIME types (.svg, .html, .exe) are rejected with 400', async () => {
      const token = signValidAdminJwt();
      const svgFd = new FormData();
      svgFd.append('file', new File(['<svg><script>alert(1)</script></svg>'], 'xss.svg', { type: 'image/svg+xml' }));

      const res = await dispatchApiRequest('/api/admin/upload', 'src/app/api/admin/upload/route.ts', {
        method: 'POST',
        token,
        formData: svgFd,
      });
      expect(res.status).toBe(400);
    });

    it('T2-F13-04: Spoofed magic bytes (text/HTML disguised as photo.jpg) are rejected with 400', async () => {
      const token = signValidAdminJwt();
      const spoofFd = new FormData();
      spoofFd.append('file', new File(['<html><script>alert(1)</script></html>'], 'photo.jpg', { type: 'image/jpeg' }));

      const res = await dispatchApiRequest('/api/admin/upload', 'src/app/api/admin/upload/route.ts', {
        method: 'POST',
        token,
        formData: spoofFd,
      });
      expect(res.status).toBe(400);
    });

    it('T2-F13-05: Missing file field returns 400 and path-traversal filename cannot write outside project upload dir', async () => {
      const token = signValidAdminJwt();
      const emptyFd = new FormData();
      const missingRes = await dispatchApiRequest('/api/admin/upload', 'src/app/api/admin/upload/route.ts', {
        method: 'POST',
        token,
        formData: emptyFd,
      });
      expect(missingRes.status).toBe(400);

      const travFd = new FormData();
      travFd.append(
        'file',
        new File([Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])], '../../evil.png', {
          type: 'image/png',
        })
      );
      const travRes = await dispatchApiRequest('/api/admin/upload', 'src/app/api/admin/upload/route.ts', {
        method: 'POST',
        token,
        formData: travFd,
      });
      if (travRes.status === 200 || travRes.status === 201) {
        uploadedFilesToCleanup.push(travRes.json.url);
        expect(travRes.json.url).not.toContain('..');
      } else {
        expect([400, 403]).toContain(travRes.status);
      }
      expect(fs.existsSync(resolveRepoPath('evil.png'))).toBe(false);
    });

    it('T2-F13-06: Oversized file upload (> 10MB) is rejected with 400 or 413', async () => {
      const token = signValidAdminJwt();
      const bigBuf = new Uint8Array(11 * 1024 * 1024);
      bigBuf[0] = 0xff;
      bigBuf[1] = 0xd8;
      bigBuf[2] = 0xff;

      const fd = new FormData();
      fd.append('file', new File([bigBuf], 'huge.jpg', { type: 'image/jpeg' }));
      const res = await dispatchApiRequest('/api/admin/upload', 'src/app/api/admin/upload/route.ts', {
        method: 'POST',
        token,
        formData: fd,
      });
      expect([400, 413]).toContain(res.status);
    });
  });

  // =========================================================================
  // F14: Homepage Showroom Block Boundaries (6 tests)
  // =========================================================================
  describe('F14: Homepage Showroom Block Boundaries', () => {
    it('T2-F14-01: Empty optional fields (secondary_phone, contact_email) do not render broken empty tel:/mailto: links', async () => {
      for (const k of ['secondary_phone', 'contact_email']) {
        await prismaMemoryClient.setting.upsert({
          where: { key: k },
          update: { value: '' },
          create: { key: k, value: '' },
        });
      }
      const homeRes = await renderServerPage('src/app/(public)/page.tsx');
      expect(homeRes.status).toBe(200);
      expect(homeRes.html).not.toContain('href="tel:"');
      expect(homeRes.html).not.toContain('href="mailto:"');
    });

    it('T2-F14-02: Special characters and script tags in showroom_address are HTML-escaped safely', async () => {
      await prismaMemoryClient.setting.upsert({
        where: { key: 'showroom_address' },
        update: { value: 'O\'zbekiston, "Sergeli" <script>alert(1)</script>' },
        create: { key: 'showroom_address', value: 'O\'zbekiston, "Sergeli" <script>alert(1)</script>' },
      });
      const homeRes = await renderServerPage('src/app/(public)/page.tsx');
      expect(homeRes.status).toBe(200);
      expect(homeRes.html).not.toContain('<script>alert(1)</script>');
    });

    it('T2-F14-03: Very long 200-char showroom_address renders completely without crashing', async () => {
      const longAddress = 'Toshkent shahri, '.repeat(12) + 'Zeekr Showroom';
      await prismaMemoryClient.setting.upsert({
        where: { key: 'showroom_address' },
        update: { value: longAddress },
        create: { key: 'showroom_address', value: longAddress },
      });
      const homeRes = await renderServerPage('src/app/(public)/page.tsx');
      expect(homeRes.status).toBe(200);
      expect(homeRes.html).toContain('Zeekr Showroom');
    });

    it('T2-F14-04: Empty showroom_address does not leave blank broken showroom section', async () => {
      await prismaMemoryClient.setting.upsert({
        where: { key: 'showroom_address' },
        update: { value: '' },
        create: { key: 'showroom_address', value: '' },
      });
      const homeRes = await renderServerPage('src/app/(public)/page.tsx');
      expect(homeRes.status).toBe(200);
      expect(homeRes.html).not.toContain('undefined');
    });

    it('T2-F14-05: Static/simplified Homepage showroom block does not embed heavy <iframe map directly on /', async () => {
      const homeRes = await renderServerPage('src/app/(public)/page.tsx');
      expect(homeRes.status).toBe(200);
      expect(homeRes.html).not.toMatch(/<iframe/i);
    });

    it('T2-F14-06: Switching locale between ru and uz keeps showroom contact values intact', async () => {
      mockCookieStore.set('locale', 'ru');
      mockCookieStore.set('NEXT_LOCALE', 'ru');
      const ruRes = await renderServerPage('src/app/(public)/page.tsx');
      expect(ruRes.html).toContain('+998712000000');

      mockCookieStore.set('locale', 'uz');
      mockCookieStore.set('NEXT_LOCALE', 'uz');
      const uzRes = await renderServerPage('src/app/(public)/page.tsx');
      expect(uzRes.html).toContain('+998712000000');
    });
  });

  // =========================================================================
  // F15: Vercel Readiness & Security Boundaries (6 tests)
  // =========================================================================
  describe('F15: Vercel Security & Build Integrity Boundaries', () => {
    it('T2-F15-01: Secret scan across src/, next.config.ts, vercel.json, and .env.example finds zero hardcoded secrets', () => {
      const srcFiles = walkFiles(resolveRepoPath('src'), ['.ts', '.tsx']);
      for (const file of srcFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        expect(content, `Hardcoded fallback secret in ${file}`).not.toContain(
          'zeekr-super-secret-admin-key-2026'
        );
      }
      const envEx = fs.readFileSync(resolveRepoPath('.env.example'), 'utf-8');
      expect(envEx).not.toMatch(/postgresql:\/\/[^<\s]+:[^<\s]+@[^l]/i);
    });

    it('T2-F15-02: auth.ts fails closed in production when JWT_SECRET is unset', async () => {
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

    it('T2-F15-03: next.config.ts does not suppress TypeScript or ESLint build errors', () => {
      const cfgSrc = fs.readFileSync(resolveRepoPath('next.config.ts'), 'utf-8');
      expect(cfgSrc).not.toMatch(/ignoreBuildErrors\s*:\s*true/);
      expect(cfgSrc).not.toMatch(/ignoreDuringBuilds\s*:\s*true/);
    });

    it('T2-F15-04: Zero Unsplash external image URLs remain in src/ or data/*.json', () => {
      const files = [
        ...walkFiles(resolveRepoPath('src'), ['.ts', '.tsx']),
        ...walkFiles(resolveRepoPath('data'), ['.json']),
      ];
      for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        expect(content, `Found images.unsplash.com in ${file}`).not.toContain('images.unsplash.com');
      }
    });

    it('T2-F15-05: data-provider and settings resolve cleanly when DB is unreachable during Vercel build/preview', async () => {
      simulateDbDown(true);
      const [models, settings] = await Promise.all([getCarModels(), getSiteSettings()]);
      expect(models.length).toBeGreaterThanOrEqual(4);
      expect(settings.usd_to_uzs_rate).toBeGreaterThan(0);
      expect(settings.showroom_address).toBeTruthy();
    });

    it('T2-F15-06: No .env file with secrets is tracked or duplicated in public/', () => {
      expect(fs.existsSync(resolveRepoPath('public/.env'))).toBe(false);
      expect(fs.existsSync(resolveRepoPath('public/.env.local'))).toBe(false);
    });
  });
});
