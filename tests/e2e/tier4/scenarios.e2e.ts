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
import { importOptionalModule, resolveRepoPath } from '../helpers/module-loader';

import { calculateMonthlyLoanPayment } from '@/lib/calculator';
import { getCarModels } from '@/lib/data-provider';
import { loginAdminAction } from '@/app/actions/authActions';
import { createTestDriveLeadAction } from '@/app/actions/leadActions';
import { updateLeadStatusAction } from '@/app/actions/adminLeadActions';
import { updateSettingsAction } from '@/app/actions/adminSettingsActions';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { TrimSelector } from '@/components/models/TrimSelector';
import { LoanCalculator } from '@/components/models/LoanCalculator';

function pickAction(mod: Record<string, any> | null, names: string[]) {
  if (!mod) return null;
  for (const n of names) {
    if (typeof mod[n] === 'function') return mod[n];
  }
  return null;
}

describe('Tier 4 — Realistic End-to-End Application Scenarios (uz & ru)', () => {
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

  it('T4-S1: Customer (uz) discovery on / -> /models/zeekr-001 configurator -> /test-drive booking -> Admin CRM visibility', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));

    // 1. Land on / in default uz
    const home = await renderServerPage('src/app/(public)/page.tsx', {}, { withRootLayout: true });
    expect(home.status).toBe(200);
    expect(home.html).toContain('<html lang="uz"');
    expect(home.html).toContain('Zeekr 001');
    expect(home.html).toContain('Sergeli');

    // 2. Navigate to /models/zeekr-001 and inspect configurator + gallery
    const modelPage = await renderServerPage('src/app/(public)/models/[slug]/page.tsx', {
      params: Promise.resolve({ slug: 'zeekr-001' }),
    });
    expect(modelPage.status).toBe(200);
    expect(modelPage.html).toContain('WE Version');
    expect(modelPage.html).toContain('YOU Version');
    expect(modelPage.html).toContain('Komplektatsiyani Tanlang');
    expect(modelPage.html).toContain('/images/cars/zeekr-001/interior.jpg');

    // 3. Verify top trim calculator math
    const topTrimCalc = renderComponentHtml(
      React.createElement(LoanCalculator, { carPriceUSD: 58000, rate: 12850, apr: 22 })
    );
    const calcResult = calculateMonthlyLoanPayment({
      carPriceUSD: 58000,
      downPaymentPercent: 30,
      termMonths: 36,
      annualInterestRatePercent: 22,
    });
    expect(topTrimCalc).toContain(calcResult.monthlyUSD.toLocaleString('en-US'));

    // 4. Navigate to /test-drive?model=zeekr-001 and book
    const tdPage = await renderServerPage('src/app/(public)/test-drive/page.tsx', {
      searchParams: Promise.resolve({ model: 'zeekr-001' }),
    });
    expect(tdPage.status).toBe(200);

    const booking = await createTestDriveLeadAction({
      fullName: 'Alisher Usmonov',
      phone: '90 555 66 77',
      modelId: 'zeekr-001',
      preferredDate: '2026-12-20',
      preferredTime: '14:00 — 16:00',
      notes: 'Zeekr 001 YOU Version test-drive',
      source: 'test_drive_wizard',
    });
    expect(booking.success).toBe(true);

    // 5. Admin CRM visibility
    const leadsPage = await renderServerPage('src/app/admin/leads/page.tsx');
    expect(leadsPage.status).toBe(200);
    expect(leadsPage.html).toContain('Alisher Usmonov');
    expect(leadsPage.html).toContain('Test-drayv');
  });

  it('T4-S2: Russian-speaking customer (ru) /inventory?reserve=<id> -> phone normalization -> locale restore (uz)', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));

    mockCookieStore.set('locale', 'ru');
    mockCookieStore.set('NEXT_LOCALE', 'ru');
    mockHeadersMap.set('accept-language', 'ru');

    const homeRu = await renderServerPage('src/app/(public)/page.tsx', {}, { withRootLayout: true });
    expect(homeRu.html).toContain('<html lang="ru"');
    expect(homeRu.html).toMatch(/[\u0400-\u04FF]{4,}/);

    const invRu = await renderServerPage('src/app/(public)/inventory/page.tsx', {
      searchParams: Promise.resolve({ reserve: 'ZEEKR001-UZ-2026-001', model: 'zeekr-001' }),
    });
    expect(invRu.status).toBe(200);
    expect(invRu.html).toContain('role="dialog"');
    expect(invRu.html).toContain('ZEEKR001-UZ-2026-001');

    const reserveRes = await dispatchApiRequest('/api/leads', 'src/app/api/leads/route.ts', {
      method: 'POST',
      headers: { 'x-forwarded-for': '203.0.113.101' },
      body: {
        fullName: 'Алексей Смирнов',
        phone: '901234567',
        type: 'CAR_RESERVE',
        modelId: 'zeekr-001',
        inventoryItemId: 'ZEEKR001-UZ-2026-001',
      },
    });
    expect(reserveRes.status).toBe(200);
    const saved = await prismaMemoryClient.lead.findUnique({ where: { id: reserveRes.json.leadId } });
    expect(saved?.phone).toBe('+998901234567');
    expect(saved?.type).toBe('CAR_RESERVE');

    // Restore uz locale
    mockCookieStore.set('locale', 'uz');
    mockCookieStore.set('NEXT_LOCALE', 'uz');
    const homeUz = await renderServerPage('src/app/(public)/page.tsx', {}, { withRootLayout: true });
    expect(homeUz.html).toContain('<html lang="uz"');
  });

  it('T4-S3: Existing owner (ru) /service booking -> Admin login -> Servis dashboard badge -> CRM transition', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));

    mockCookieStore.set('locale', 'ru');
    mockCookieStore.set('NEXT_LOCALE', 'ru');

    const serviceRu = await renderServerPage('src/app/(public)/service/page.tsx');
    expect(serviceRu.status).toBe(200);
    expect(serviceRu.html).toContain('<form');
    expect(serviceRu.html).toMatch(/[\u0400-\u04FF]{4,}/);

    const postRes = await dispatchApiRequest('/api/leads', 'src/app/api/leads/route.ts', {
      method: 'POST',
      headers: { 'x-forwarded-for': '203.0.113.102' },
      body: {
        fullName: 'Тимур Рахимов',
        phone: '+998 93 777 88 99',
        type: 'SERVICE',
        modelId: 'zeekr-009',
        preferredDate: '2026-12-22',
        preferredTime: '10:00 — 12:00',
        notes: 'ТО-2 и обновление ПО',
        source: 'service_page',
      },
    });
    expect(postRes.status).toBe(200);

    // Admin login & middleware verification
    const loginRes = await loginAdminAction({ email: 'admin@zeekr-auto.uz', password: 'Admin123!' });
    expect(loginRes.success).toBe(true);
    const token = mockCookieStore.get('admin_token')?.value;
    expect((await callMiddleware('/admin', { token })).status).toBe(200);

    const dash = await renderServerPage('src/app/admin/page.tsx');
    expect(dash.html).toContain('Servis');
    expect(dash.html).toContain('Тимур Рахимов');

    // CRM transitions: NEW -> CONTACTED -> SCHEDULED
    const t1 = await updateLeadStatusAction(postRes.json.leadId, 'CONTACTED', 'Mijozga qo’ng’iroq qilindi');
    expect(t1.success).toBe(true);
    const t2 = await updateLeadStatusAction(postRes.json.leadId, 'SCHEDULED', 'Boks #2 belgilandi');
    expect(t2.success).toBe(true);

    const updatedLead = await prismaMemoryClient.lead.findUnique({ where: { id: postRes.json.leadId } });
    expect(updatedLead?.status).toBe('SCHEDULED');
    expect(updatedLead?.managerNotes).toContain('Boks #2 belgilandi');
  });

  it('T4-S4: Admin local upload -> create Zeekr 8X model + trim + color -> visible on /, Footer & /models/zeekr-8x', async () => {
    const token = signValidAdminJwt();
    setAuthCookie(token);

    const pngBytes = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
    const fd = new FormData();
    fd.append('file', new File([pngBytes], 'zeekr-8x-hero.png', { type: 'image/png' }));

    const uploadRes = await dispatchApiRequest('/api/admin/upload', 'src/app/api/admin/upload/route.ts', {
      method: 'POST',
      token,
      formData: fd,
    });
    expect([200, 201]).toContain(uploadRes.status);
    const uploadedUrl = uploadRes.json.url;
    uploadedFilesToCleanup.push(uploadedUrl);

    const actions = await importOptionalModule<Record<string, any>>('src/app/actions/adminCarActions.ts');
    const createTrim = pickAction(actions, ['createCarTrimAction', 'createTrimAction']);
    const createColor = pickAction(actions, ['createCarColorAction', 'createColorAction']);
    expect(typeof createTrim).toBe('function');
    expect(typeof createColor).toBe('function');

    const modelRes = await actions!.createCarModelAction({
      name: 'Zeekr 8X',
      slug: 'zeekr-8x',
      tagline: 'Oila va sarguzashtlar SUVi',
      basePriceUSD: 44000,
      rangeKm: 705,
      acceleration0100: 3.8,
      batteryKwh: 100,
      powerHp: 645,
      topSpeedKmH: 210,
      chargingTimeMin: 15,
      mainImage: uploadedUrl,
      description: 'Yangi avlod premium SUV.',
      galleryImages: [uploadedUrl],
      isActive: true,
    });
    expect(modelRes.success).toBe(true);

    await createTrim!({
      modelId: modelRes.modelId,
      name: 'Long Range AWD',
      priceUSD: 48500,
      driveType: 'AWD',
      rangeKm: 705,
      acceleration: 3.8,
      features: ['800V Architecture'],
    });
    await createColor!({
      modelId: modelRes.modelId,
      name: 'Forest Green',
      hexCode: '#1E3A2F',
      imageUrl: uploadedUrl,
      isInterior: false,
    });

    const home = await renderServerPage('src/app/(public)/page.tsx');
    expect(home.html).toContain('Zeekr 8X');
    expect(home.html).toContain(uploadedUrl);

    const footerHtml = renderComponentHtml(await Footer());
    expect(footerHtml).toContain('/models/zeekr-8x');

    const detail = await renderServerPage('src/app/(public)/models/[slug]/page.tsx', {
      params: Promise.resolve({ slug: 'zeekr-8x' }),
    });
    expect(detail.status).toBe(200);
    expect(detail.html).toContain('Long Range AWD');
    expect(detail.html).toContain('Forest Green');
  });

  it('T4-S5: Admin inventory lifecycle: create -> full edit (/admin/inventory/[id]) -> reserve -> mark SOLD -> hidden from public', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    setAuthCookie(signValidAdminJwt());

    const actions = await importOptionalModule<Record<string, any>>('src/app/actions/adminCarActions.ts');
    const updateInv = pickAction(actions, ['updateInventoryItemAction', 'editInventoryItemAction']);
    expect(typeof updateInv, 'updateInventoryItemAction must exist').toBe('function');

    const created = await actions!.createInventoryItemAction({
      trimId: 'zeekr-001-trim-1',
      vinOrCode: 'ZEEKR001-LIFE-777',
      exteriorColor: 'White',
      interiorColor: 'Black',
      year: 2026,
      status: 'IN_TRANSIT',
      priceUSD: 46000,
      images: ['/images/cars/zeekr-001/main.jpg'],
    });
    expect(created.success).toBe(true);

    const editPage = await renderServerPage('src/app/admin/inventory/[id]/page.tsx', {
      params: Promise.resolve({ id: created.itemId }),
    });
    expect(editPage.status).toBe(200);

    const edited = await updateInv!(created.itemId, {
      trimId: 'zeekr-001-trim-1',
      vinOrCode: 'ZEEKR001-LIFE-777',
      exteriorColor: 'Emerald Green',
      interiorColor: 'Cream Nappa',
      year: 2026,
      status: 'IN_STOCK',
      priceUSD: 47900,
      notes: 'Arrived at Sergeli showroom',
      images: ['/images/cars/zeekr-001/main.jpg'],
    });
    expect(edited.success).toBe(true);

    const invPublic = await renderServerPage('src/app/(public)/inventory/page.tsx', {
      searchParams: Promise.resolve({ reserve: created.itemId }),
    });
    expect(invPublic.html).toContain('ZEEKR001-LIFE-777');
    expect(invPublic.html).toContain('role="dialog"');

    // Customer reserves, then Admin marks SOLD
    await actions!.updateInventoryStatusAction(created.itemId, 'SOLD');

    const invAfterSold = await renderServerPage('src/app/(public)/inventory/page.tsx', {
      searchParams: Promise.resolve({}),
    });
    expect(invAfterSold.html).not.toContain('ZEEKR001-LIFE-777');
  });

  it('T4-S6: Public intake resilience: malformed JSON, invalid phones & rapid bursts return 400/429 without blocking clean IPs', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));

    const badJson = await dispatchApiRequest('/api/leads', 'src/app/api/leads/route.ts', {
      method: 'POST',
      headers: { 'x-forwarded-for': '198.51.100.240' },
      rawBody: '{invalid',
    });
    expect(badJson.status).toBe(400);

    const badPhone = await dispatchApiRequest('/api/leads', 'src/app/api/leads/route.ts', {
      method: 'POST',
      headers: { 'x-forwarded-for': '198.51.100.240' },
      body: { fullName: 'Abuser', phone: '000', type: 'SERVICE' },
    });
    expect(badPhone.status).toBe(400);

    const burstCodes: number[] = [];
    for (let i = 0; i < 15; i++) {
      const r = await dispatchApiRequest('/api/leads', 'src/app/api/leads/route.ts', {
        method: 'POST',
        headers: { 'x-forwarded-for': '198.51.100.241' },
        body: { fullName: `Bot ${i}`, phone: '+998901234567', type: 'CAR_RESERVE' },
      });
      burstCodes.push(r.status);
    }
    expect(burstCodes).toContain(429);

    const cleanRes = await dispatchApiRequest('/api/leads', 'src/app/api/leads/route.ts', {
      method: 'POST',
      headers: { 'x-forwarded-for': '198.51.100.242' },
      body: { fullName: 'Clean Customer', phone: '+998909876543', type: 'TEST_DRIVE' },
    });
    expect(cleanRes.status).toBe(200);
  });

  it('T4-S7: Unauthorized & non-ADMIN privilege-escalation defense across /admin/*, CRUD actions & /api/admin/upload', async () => {
    clearAuthCookie();
    expect((await callMiddleware('/admin/cars/zeekr-001')).status).toBe(307);
    expect((await callMiddleware('/admin/inventory/ZEEKR001-UZ-2026-001')).status).toBe(307);
    expect((await callMiddleware('/admin/cars', { token: signWrongSecretAdminJwt() })).status).toBe(307);
    expect((await callMiddleware('/admin/cars', { token: signRoleJwt('MANAGER') })).status).toBe(307);

    setAuthCookie(signRoleJwt('MANAGER'));
    const actions = await importOptionalModule<Record<string, any>>('src/app/actions/adminCarActions.ts');
    expect((await actions!.toggleCarModelActiveAction('zeekr-001', false)).success).toBe(false);

    const fd = new FormData();
    fd.append('file', new File([Uint8Array.from([0xff, 0xd8, 0xff])], 'hack.jpg', { type: 'image/jpeg' }));
    const uploadBlocked = await dispatchApiRequest('/api/admin/upload', 'src/app/api/admin/upload/route.ts', {
      method: 'POST',
      token: signRoleJwt('MANAGER'),
      formData: fd,
    });
    expect([401, 403]).toContain(uploadBlocked.status);
  });

  it('T4-S8: Resilient offline-DB fallback across all 6 public routes in both uz & ru', async () => {
    simulateDbDown(true);

    const routes: Array<{ path: string; props: Record<string, any> }> = [
      { path: 'src/app/(public)/page.tsx', props: {} },
      { path: 'src/app/(public)/models/[slug]/page.tsx', props: { params: Promise.resolve({ slug: 'zeekr-001' }) } },
      { path: 'src/app/(public)/inventory/page.tsx', props: { searchParams: Promise.resolve({ reserve: 'ZEEKR001-UZ-2026-001' }) } },
      { path: 'src/app/(public)/test-drive/page.tsx', props: { searchParams: Promise.resolve({}) } },
      { path: 'src/app/(public)/service/page.tsx', props: {} },
      { path: 'src/app/(public)/contacts/page.tsx', props: {} },
    ];

    for (const loc of ['uz', 'ru'] as const) {
      mockCookieStore.set('locale', loc);
      mockCookieStore.set('NEXT_LOCALE', loc);
      mockHeadersMap.set('accept-language', loc);

      for (const route of routes) {
        const res = await renderServerPage(route.path, route.props, { withRootLayout: true });
        expect(res.status, `${route.path} failed in ${loc} when DB down`).toBe(200);
        expect(res.html).toContain(`<html lang="${loc}"`);
      }
    }
  });

  it('T4-S9: Admin settings updates propagate across Showroom, Header, Footer, Contacts & Calculator', async () => {
    setAuthCookie(signValidAdminJwt());
    const upd = await updateSettingsAction({
      showroom_address: 'Toshkent, Bunyodkor ko’chasi 55',
      primary_phone: '+998712334455',
      secondary_phone: '+998712334456',
      contact_email: 'concierge@zeekr.uz',
      working_hours: '08:30 — 21:30',
      map_iframe_url: 'https://maps.google.com/?q=tashkent',
      telegram_channel: 'https://t.me/zeekruz',
      instagram_url: 'https://instagram.com/zeekruz',
      youtube_url: '',
      usd_to_uzs_rate: 13000,
      default_loan_apr: 19,
      telegram_bot_token: '',
      telegram_chat_id: '',
    });
    expect(upd.success).toBe(true);

    const home = await renderServerPage('src/app/(public)/page.tsx');
    const contacts = await renderServerPage('src/app/(public)/contacts/page.tsx');
    const model = await renderServerPage('src/app/(public)/models/[slug]/page.tsx', {
      params: Promise.resolve({ slug: 'zeekr-001' }),
    });
    const headerHtml = renderComponentHtml(await Header());
    const footerHtml = renderComponentHtml(await Footer());

    expect(home.html).toContain('Toshkent, Bunyodkor');
    expect(home.html).toContain('+998712334455');
    expect(contacts.html).toContain('08:30 — 21:30');
    expect(headerHtml).toContain('+998712334455');
    expect(footerHtml).toContain('concierge@zeekr.uz');
    expect(model.html).toContain('19%');
  });

  it('T4-S10: Dealer model deactivation & deletion consistency across ModelShowcase, Footer, /test-drive & /models/[slug] 404', async () => {
    setAuthCookie(signValidAdminJwt());
    const actions = await importOptionalModule<Record<string, any>>('src/app/actions/adminCarActions.ts');
    const deleteModel = pickAction(actions, ['deleteCarModelAction', 'removeCarModelAction']);
    expect(typeof deleteModel, 'deleteCarModelAction must exist').toBe('function');

    // Deactivate Zeekr 009
    await actions!.toggleCarModelActiveAction('zeekr-009', false);
    const activeModels = await getCarModels();
    expect(activeModels.some((m: any) => m.slug === 'zeekr-009')).toBe(false);

    const homeAfterHide = await renderServerPage('src/app/(public)/page.tsx');
    expect(homeAfterHide.html).not.toContain('href="/models/zeekr-009"');

    const footerAfterHide = renderComponentHtml(await Footer());
    expect(footerAfterHide).not.toContain('/models/zeekr-009');

    const tdAfterHide = await renderServerPage('src/app/(public)/test-drive/page.tsx', {
      searchParams: Promise.resolve({}),
    });
    expect(tdAfterHide.html).not.toContain('Zeekr 009');

    const detail404 = await renderServerPage('src/app/(public)/models/[slug]/page.tsx', {
      params: Promise.resolve({ slug: 'zeekr-009' }),
    });
    expect(detail404.status).toBe(404);

    // Delete Zeekr 009 permanently while keeping remaining models intact
    const delRes = await deleteModel!('zeekr-009');
    expect(delRes.success).toBe(true);
    const remaining = await getCarModels();
    expect(remaining.length).toBe(5);
  });
});
