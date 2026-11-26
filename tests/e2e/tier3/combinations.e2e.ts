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
  signValidAdminJwt,
  signRoleJwt,
  signWrongSecretAdminJwt,
  setAuthCookie,
  clearAuthCookie,
} from '../helpers/auth-helper';
import {
  callMiddleware,
  dispatchApiRequest,
  renderServerPage,
  renderComponentHtml,
} from '../helpers/http-client';
import { fileExistsInRepo, importOptionalModule, resolveRepoPath } from '../helpers/module-loader';

import { getCarModels, loadJsonFile } from '@/lib/data-provider';
import { signToken, verifyToken, getAdminSession } from '@/lib/auth';
import { updateSettingsAction } from '@/app/actions/adminSettingsActions';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ModelShowcase } from '@/components/home/ModelShowcase';
import { InStockCarousel } from '@/components/home/InStockCarousel';
import { VehicleCard } from '@/components/inventory/VehicleCard';
import { TrimSelector } from '@/components/models/TrimSelector';
import { LoanCalculator } from '@/components/models/LoanCalculator';

function pickAction(mod: Record<string, any> | null, names: string[]) {
  if (!mod) return null;
  for (const n of names) {
    if (typeof mod[n] === 'function') return mod[n];
  }
  return null;
}

function makePngFile(filename: string): File {
  const bytes = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
  return new File([bytes], filename, { type: 'image/png' });
}

describe('Tier 3 — Pairwise Cross-Feature Combinations (Parts A × B × C)', () => {
  const uploadedFilesToCleanup: string[] = [];

  beforeEach(() => {
    resetTestState();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    for (const relOrUrl of uploadedFilesToCleanup.splice(0)) {
      const cleaned = relOrUrl.replace(/^\/+/, '');
      for (const candidate of [
        resolveRepoPath(path.join('public', cleaned)),
        resolveRepoPath(cleaned),
      ]) {
        if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
          fs.unlinkSync(candidate);
        }
      }
    }
  });

  it('T3-01 (F5 × F9): Relative asset paths pass Admin CRUD creation and editing', async () => {
    setAuthCookie(signValidAdminJwt());
    const actions = await importOptionalModule<Record<string, any>>('src/app/actions/adminCarActions.ts');
    const updateModel = pickAction(actions, ['updateCarModelAction', 'editCarModelAction']);
    expect(typeof updateModel, 'updateCarModelAction must exist').toBe('function');

    const created = await actions!.createCarModelAction({
      name: 'Zeekr Mix',
      slug: 'zeekr-mix',
      tagline: 'Compact MPV',
      basePriceUSD: 39000,
      rangeKm: 550,
      acceleration0100: 6.8,
      batteryKwh: 76,
      powerHp: 422,
      topSpeedKmH: 180,
      chargingTimeMin: 15,
      mainImage: '/images/cars/zeekr-x/main.jpg',
      description: 'Relativ rasm bilan yaratilgan model.',
      galleryImages: ['/images/cars/zeekr-x/interior.jpg'],
      isActive: true,
    });
    expect(created.success).toBe(true);

    const updated = await updateModel!(created.modelId, {
      name: 'Zeekr Mix Pro',
      slug: 'zeekr-mix',
      tagline: 'Updated Compact MPV',
      basePriceUSD: 41000,
      rangeKm: 580,
      acceleration0100: 6.5,
      batteryKwh: 80,
      powerHp: 422,
      topSpeedKmH: 180,
      chargingTimeMin: 15,
      mainImage: '/uploads/custom.webp',
      description: 'Updated with relative upload path.',
      galleryImages: ['/uploads/custom.webp'],
      isActive: true,
    });
    expect(updated.success).toBe(true);
  });

  it('T3-02 (F6 × F9): Tampered/wrong-secret JWT or MANAGER role fails middleware & CRUD actions on /admin/cars/[id] & /admin/inventory/[id]', async () => {
    const mwBad = await callMiddleware('/admin/cars/zeekr-001', { token: signWrongSecretAdminJwt() });
    expect(mwBad.status).toBe(307);

    const mwInv = await callMiddleware('/admin/inventory/ZEEKR001-UZ-2026-001', { token: signRoleJwt('MANAGER') });
    expect(mwInv.status).toBe(307);

    setAuthCookie(signRoleJwt('MANAGER'));
    const actions = await importOptionalModule<Record<string, any>>('src/app/actions/adminCarActions.ts');
    const updateInv = pickAction(actions, ['updateInventoryItemAction', 'editInventoryItemAction']);
    expect(typeof updateInv, 'updateInventoryItemAction must exist').toBe('function');
    const res = await updateInv!('ZEEKR001-UZ-2026-001', {
      trimId: 'zeekr-001-trim-1',
      exteriorColor: 'Red',
      interiorColor: 'Black',
      year: 2026,
      status: 'IN_STOCK',
      priceUSD: 49500,
      images: [],
    });
    expect(res.success).toBe(false);
  });

  it('T3-03 (F6 × F13): JWT enforcement protects POST /api/admin/upload against unauthenticated/tampered requests', async () => {
    const fd1 = new FormData();
    fd1.append('file', makePngFile('unauth.png'));
    const unauth = await dispatchApiRequest('/api/admin/upload', 'src/app/api/admin/upload/route.ts', {
      method: 'POST',
      formData: fd1,
    });
    expect([401, 403]).toContain(unauth.status);

    const fd2 = new FormData();
    fd2.append('file', makePngFile('tampered.png'));
    const tampered = await dispatchApiRequest('/api/admin/upload', 'src/app/api/admin/upload/route.ts', {
      method: 'POST',
      token: signWrongSecretAdminJwt(),
      formData: fd2,
    });
    expect([401, 403]).toContain(tampered.status);

    const fd3 = new FormData();
    fd3.append('file', makePngFile('valid.png'));
    const valid = await dispatchApiRequest('/api/admin/upload', 'src/app/api/admin/upload/route.ts', {
      method: 'POST',
      token: signValidAdminJwt(),
      formData: fd3,
    });
    expect([200, 201]).toContain(valid.status);
    uploadedFilesToCleanup.push(valid.json.url);
  });

  it('T3-04 (F13 × F9): Uploaded PNG URL from /api/admin/upload is immediately accepted by Admin Model & Inventory CRUD', async () => {
    const token = signValidAdminJwt();
    setAuthCookie(token);

    const fd = new FormData();
    fd.append('file', makePngFile('zeekr-combo.png'));
    const uploadRes = await dispatchApiRequest('/api/admin/upload', 'src/app/api/admin/upload/route.ts', {
      method: 'POST',
      token,
      formData: fd,
    });
    expect([200, 201]).toContain(uploadRes.status);
    const url = uploadRes.json.url;
    uploadedFilesToCleanup.push(url);

    const actions = await importOptionalModule<Record<string, any>>('src/app/actions/adminCarActions.ts');
    const modelRes = await actions!.createCarModelAction({
      name: 'Zeekr Combo',
      slug: 'zeekr-combo',
      tagline: 'Uploaded Hero',
      basePriceUSD: 43000,
      rangeKm: 640,
      acceleration0100: 4.0,
      batteryKwh: 86,
      powerHp: 422,
      topSpeedKmH: 200,
      chargingTimeMin: 15,
      mainImage: url,
      description: 'Created directly with uploaded image URL.',
      galleryImages: [url],
      isActive: true,
    });
    expect(modelRes.success).toBe(true);

    const invRes = await actions!.createInventoryItemAction({
      trimId: 'zeekr-001-trim-1',
      vinOrCode: 'ZEEKR-COMBO-INV-1',
      exteriorColor: 'Blue',
      interiorColor: 'White',
      year: 2026,
      status: 'IN_STOCK',
      priceUSD: 46500,
      images: [url],
    });
    expect(invRes.success).toBe(true);
  });

  it('T3-05 (F13 × F3): Uploaded local image path renders cleanly across ModelShowcase, InStockCarousel & VehicleCard', () => {
    const uploadedPath = '/uploads/sample-car.jpg';
    const modelHtml = renderComponentHtml(
      React.createElement(ModelShowcase, {
        models: [
          {
            id: 'm1',
            slug: 'zeekr-001',
            name: 'Zeekr 001',
            tagline: 'Flagship',
            basePriceUSD: 45000,
            acceleration0100: 3.8,
            rangeKm: 741,
            batteryKwh: 100,
            mainImage: uploadedPath,
          },
        ],
        rate: 12850,
      })
    );
    expect(modelHtml).toContain(`src="${uploadedPath}"`);
    expect(modelHtml).toContain('aspect-[16/10]');

    const carouselHtml = renderComponentHtml(
      React.createElement(InStockCarousel, {
        items: [
          {
            id: 'i1',
            vinOrCode: 'VIN-1',
            exteriorColor: 'White',
            interiorColor: 'Black',
            year: 2026,
            status: 'IN_STOCK',
            priceUSD: 45000,
            images: [uploadedPath],
            trim: { name: 'WE', model: { name: 'Zeekr 001', slug: 'zeekr-001' } },
          },
        ],
        rate: 12850,
      })
    );
    expect(carouselHtml).toContain(`src="${uploadedPath}"`);

    const cardHtml = renderComponentHtml(
      React.createElement(VehicleCard, {
        item: {
          id: 'i1',
          vinOrCode: 'VIN-1',
          exteriorColor: 'White',
          interiorColor: 'Black',
          year: 2026,
          status: 'IN_STOCK',
          priceUSD: 45000,
          images: [uploadedPath],
          trim: {
            id: 't1',
            name: 'WE',
            driveType: 'RWD',
            rangeKm: 741,
            acceleration: 5.9,
            model: { id: 'm1', name: 'Zeekr 001', slug: 'zeekr-001', mainImage: uploadedPath },
          },
        },
        usdRate: 12850,
        onReserve: () => {},
      })
    );
    expect(cardHtml).toContain(`src="${uploadedPath}"`);
  });

  it('T3-06 (F9 × F4): Deactivating a model hides it from getCarModels() & causes /models/[slug] 404; re-activating restores it', async () => {
    setAuthCookie(signValidAdminJwt());
    const actions = await importOptionalModule<Record<string, any>>('src/app/actions/adminCarActions.ts');

    await actions!.toggleCarModelActiveAction('zeekr-x', false);
    const activeAfterHide = await getCarModels();
    expect(activeAfterHide.some((m: any) => m.slug === 'zeekr-x')).toBe(false);

    const hiddenPage = await renderServerPage('src/app/(public)/models/[slug]/page.tsx', {
      params: Promise.resolve({ slug: 'zeekr-x' }),
    });
    expect(hiddenPage.status).toBe(404);

    await actions!.toggleCarModelActiveAction('zeekr-x', true);
    const restoredPage = await renderServerPage('src/app/(public)/models/[slug]/page.tsx', {
      params: Promise.resolve({ slug: 'zeekr-x' }),
    });
    expect(restoredPage.status).toBe(200);
  });

  it('T3-07 (F9 × F10): Adding a trim & color via Admin CRUD updates /models/[slug] configurator & ColorVisualizer', async () => {
    setAuthCookie(signValidAdminJwt());
    const actions = await importOptionalModule<Record<string, any>>('src/app/actions/adminCarActions.ts');
    const createTrim = pickAction(actions, ['createCarTrimAction', 'createTrimAction']);
    const createColor = pickAction(actions, ['createCarColorAction', 'createColorAction']);
    expect(typeof createTrim, 'createCarTrimAction/createTrimAction must exist').toBe('function');
    expect(typeof createColor, 'createCarColorAction/createColorAction must exist').toBe('function');

    await createTrim!({
      modelId: 'zeekr-007',
      name: 'Kungfu Edition',
      priceUSD: 62000,
      driveType: 'AWD',
      rangeKm: 660,
      acceleration: 2.84,
      features: ['Track Suspension'],
    });
    await createColor!({
      modelId: 'zeekr-007',
      name: 'Laser Yellow',
      hexCode: '#EAB308',
      imageUrl: '/images/cars/zeekr-007/main.jpg',
      isInterior: false,
    });

    const page = await renderServerPage('src/app/(public)/models/[slug]/page.tsx', {
      params: Promise.resolve({ slug: 'zeekr-007' }),
    });
    expect(page.status).toBe(200);
    expect(page.html).toContain('Kungfu Edition');
    expect(page.html).toContain('Laser Yellow');
  });

  it('T3-08 (F9 × F8): Creating a new active model dynamically updates Footer links across public pages', async () => {
    setAuthCookie(signValidAdminJwt());
    const actions = await importOptionalModule<Record<string, any>>('src/app/actions/adminCarActions.ts');
    await actions!.createCarModelAction({
      name: 'Zeekr Mix',
      slug: 'zeekr-mix',
      tagline: 'Dynamic Footer MPV',
      basePriceUSD: 44000,
      rangeKm: 705,
      acceleration0100: 3.8,
      batteryKwh: 100,
      powerHp: 645,
      topSpeedKmH: 210,
      chargingTimeMin: 15,
      mainImage: '/images/cars/zeekr-001/main.jpg',
      description: 'Should appear dynamically in Footer.',
      galleryImages: [],
      isActive: true,
      orderIndex: 11,
    });

    const footerHtml = renderComponentHtml(await Footer());
    expect(footerHtml).toContain('/models/zeekr-mix');
    expect(footerHtml).toContain('Zeekr Mix');
  });

  it('T3-09 (F10 × F7): Model detail booking enforces phone validation, rate-limiting & binds modelId', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    const detail = await renderServerPage('src/app/(public)/models/[slug]/page.tsx', {
      params: Promise.resolve({ slug: 'zeekr-001' }),
    });
    expect(detail.html).toContain('id="booking"');

    const bad = await dispatchApiRequest('/api/leads', 'src/app/api/leads/route.ts', {
      method: 'POST',
      headers: { 'x-forwarded-for': '203.0.113.190' },
      body: { fullName: 'Mijoz', phone: 'bad', modelId: 'zeekr-001', source: 'model_page' },
    });
    expect(bad.status).toBe(400);

    const ok = await dispatchApiRequest('/api/leads', 'src/app/api/leads/route.ts', {
      method: 'POST',
      headers: { 'x-forwarded-for': '203.0.113.191' },
      body: { fullName: 'Mijoz', phone: '901234567', modelId: 'zeekr-001', source: 'model_page' },
    });
    expect(ok.status).toBe(200);
    const lead = await prismaMemoryClient.lead.findUnique({ where: { id: ok.json.leadId } });
    expect(lead?.modelId).toBe('zeekr-001');
  });

  it('T3-10 (F10 × F12): /models/zeekr-001 in ru translates TrimSelector & LoanCalculator while keeping USD/UZS math identical', async () => {
    mockCookieStore.set('locale', 'ru');
    mockCookieStore.set('NEXT_LOCALE', 'ru');
    mockHeadersMap.set('accept-language', 'ru');

    const res = await renderServerPage('src/app/(public)/models/[slug]/page.tsx', {
      params: Promise.resolve({ slug: 'zeekr-001' }),
    });
    expect(res.status).toBe(200);
    expect(res.html).toMatch(/[\u0400-\u04FF]{4,}/);
    expect(res.html).toContain('$45,000');
  });

  it('T3-11 (F11 × F7): Rapid /service bookings validate fields, persist type SERVICE, and enforce HTTP 429 rate-limit', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    const ip = '198.51.100.210';
    const codes: number[] = [];
    for (let i = 0; i < 15; i++) {
      const res = await dispatchApiRequest('/api/leads', 'src/app/api/leads/route.ts', {
        method: 'POST',
        headers: { 'x-forwarded-for': ip },
        body: { fullName: `Owner ${i}`, phone: '+998901234567', type: 'SERVICE' },
      });
      codes.push(res.status);
    }
    expect(codes[0]).toBe(200);
    expect(codes).toContain(429);
  });

  it('T3-12 (F11 × F8): Submitting a SERVICE lead renders "Servis" badge on both /admin dashboard and /admin/leads CRM', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    const postRes = await dispatchApiRequest('/api/leads', 'src/app/api/leads/route.ts', {
      method: 'POST',
      headers: { 'x-forwarded-for': '203.0.113.192' },
      body: { fullName: 'Servis Mijoz', phone: '+998931234567', type: 'SERVICE', modelId: 'zeekr-001' },
    });
    expect(postRes.status).toBe(200);

    const dash = await renderServerPage('src/app/admin/page.tsx');
    expect(dash.status).toBe(200);
    expect(dash.html).toContain('Servis');
    expect(dash.html).toContain('Servis Mijoz');

    const leadsPage = await renderServerPage('src/app/admin/leads/page.tsx');
    expect(leadsPage.status).toBe(200);
    expect(leadsPage.html).toContain('Servis');
    expect(leadsPage.html).toContain('Servis Mijoz');
  });

  it('T3-13 (F11 × F12): /service in ru translates warranties, charging guide & form while submitting canonical type SERVICE', async () => {
    mockCookieStore.set('locale', 'ru');
    mockCookieStore.set('NEXT_LOCALE', 'ru');
    mockHeadersMap.set('accept-language', 'ru');

    const servicePage = await renderServerPage('src/app/(public)/service/page.tsx');
    expect(servicePage.status).toBe(200);
    expect(servicePage.html).toMatch(/[\u0400-\u04FF]{4,}/);
    expect(servicePage.html).toContain('<form');
  });

  it('T3-14 (F12 × F14): Switching locale between uz and ru translates Homepage showroom block while keeping address & phone consistent', async () => {
    mockCookieStore.set('locale', 'uz');
    mockCookieStore.set('NEXT_LOCALE', 'uz');
    const uzHome = await renderServerPage('src/app/(public)/page.tsx');
    expect(uzHome.html).toContain('Sergeli');
    expect(uzHome.html).toContain('+998712000000');

    mockCookieStore.set('locale', 'ru');
    mockCookieStore.set('NEXT_LOCALE', 'ru');
    const ruHome = await renderServerPage('src/app/(public)/page.tsx');
    expect(ruHome.html).toContain('Sergeli');
    expect(ruHome.html).toContain('+998712000000');
    expect(ruHome.html).toMatch(/[\u0400-\u04FF]{4,}/);
  });

  it('T3-15 (F12 × F4): Navigating to /inventory?reserve=<id> in ru with DB down opens ReserveModal in Russian', async () => {
    simulateDbDown(true);
    mockCookieStore.set('locale', 'ru');
    mockCookieStore.set('NEXT_LOCALE', 'ru');
    mockHeadersMap.set('accept-language', 'ru');

    const res = await renderServerPage('src/app/(public)/inventory/page.tsx', {
      searchParams: Promise.resolve({ reserve: 'ZEEKR001-UZ-2026-001' }),
    });
    expect(res.status).toBe(200);
    expect(res.html).toContain('role="dialog"');
    expect(res.html).toContain('ZEEKR001-UZ-2026-001');
    expect(res.html).toMatch(/[\u0400-\u04FF]{4,}/);
  });

  it('T3-16 (F14 × F8): Updating settings syncs primary_phone and showroom_address across Homepage Showroom, Header, Footer & Contacts', async () => {
    setAuthCookie(signValidAdminJwt());
    const upd = await updateSettingsAction({
      showroom_address: 'Toshkent, Mirzo Ulugbek 77',
      primary_phone: '+998712778899',
      secondary_phone: '',
      contact_email: 'vip@zeekr.uz',
      working_hours: '09:00 — 21:00',
      map_iframe_url: '',
      telegram_channel: '',
      instagram_url: '',
      youtube_url: '',
      usd_to_uzs_rate: 12950,
      default_loan_apr: 21,
      telegram_bot_token: '',
      telegram_chat_id: '',
    });
    expect(upd.success).toBe(true);

    const home = await renderServerPage('src/app/(public)/page.tsx');
    const contacts = await renderServerPage('src/app/(public)/contacts/page.tsx');
    const headerHtml = renderComponentHtml(await Header());
    const footerHtml = renderComponentHtml(await Footer());

    for (const html of [home.html, contacts.html, footerHtml]) {
      expect(html).toContain('Toshkent, Mirzo Ulugbek 77');
      expect(html).toContain('+998712778899');
    }
    expect(headerHtml).toContain('+998712778899');
  });

  it('T3-17 (F15 × F6): Removing JWT_SECRET in production makes both auth.ts and middleware.ts reject sessions', async () => {
    const validToken = signValidAdminJwt();
    const prevSecret = process.env.JWT_SECRET;
    const prevEnv = process.env.NODE_ENV;
    try {
      delete process.env.JWT_SECRET;
      (process.env as Record<string, string | undefined>).NODE_ENV = 'production';
      let verified: unknown = 'UNSET';
      try {
        verified = await verifyToken(validToken);
      } catch {
        verified = null;
      }
      expect(verified).toBeNull();
      setAuthCookie(validToken);
      expect(await getAdminSession()).toBeNull();
      const mwRes = await callMiddleware('/admin/leads', { token: validToken });
      expect(mwRes.status).toBe(307);
    } finally {
      process.env.JWT_SECRET = prevSecret;
      (process.env as Record<string, string | undefined>).NODE_ENV = prevEnv;
    }
  });

  it('T3-18 (F2 × F15): Every image path in data/*.json resolves to an existing local asset with zero Unsplash URLs', () => {
    const models = loadJsonFile<any[]>('models.json');
    const colors = loadJsonFile<any[]>('colors.json');
    const inventory = loadJsonFile<any[]>('inventory.json');
    const allPaths = [
      ...models.flatMap((m) => [m.mainImage, ...(m.galleryImages || [])]),
      ...colors.map((c) => c.imageUrl),
      ...inventory.flatMap((i) => i.images || []),
    ];
    for (const p of allPaths) {
      expect(p).not.toMatch(/unsplash\.com/i);
      expect(p.startsWith('/')).toBe(true);
      expect(fileExistsInRepo(path.join('public', p.replace(/^\/+/, '')))).toBe(true);
    }
  });
});
