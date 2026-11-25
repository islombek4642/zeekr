import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import {
  resetTestState,
  prismaMemoryClient,
} from '../helpers/setup';
import {
  signValidAdminJwt,
  signRoleJwt,
  setAuthCookie,
  clearAuthCookie,
} from '../helpers/auth-helper';
import {
  callMiddleware,
  dispatchApiRequest,
  renderServerPage,
  renderComponentHtml,
} from '../helpers/http-client';
import { importOptionalModule } from '../helpers/module-loader';

import { calculateMonthlyLoanPayment } from '@/lib/calculator';
import { ColorVisualizer } from '@/components/models/ColorVisualizer';
import { LoanCalculator } from '@/components/models/LoanCalculator';
import { TrimSelector } from '@/components/models/TrimSelector';

function pickAction(mod: Record<string, any> | null, names: string[]) {
  if (!mod) return null;
  for (const n of names) {
    if (typeof mod[n] === 'function') return mod[n];
  }
  return null;
}

describe('Tier 2 — Part B: Boundary & Negative Cases (F9–F11)', () => {
  beforeEach(() => {
    resetTestState();
    vi.restoreAllMocks();
  });

  // =========================================================================
  // F9: Admin CRUD Security, Constraints & Error Boundaries (6 tests)
  // =========================================================================
  describe('F9: Admin CRUD Boundary & Auth Rejection', () => {
    it('T2-F9-01: Unauthenticated requests to Admin CRUD actions and /admin/cars/[id] are blocked', async () => {
      clearAuthCookie();
      const mwRes = await callMiddleware('/admin/cars/zeekr-001');
      expect(mwRes.status).toBe(307);
      expect(mwRes.location).toContain('/admin/login');

      const actions = await importOptionalModule<Record<string, any>>('src/app/actions/adminCarActions.ts');
      const createRes = await actions!.createCarModelAction({
        name: 'Unauth Car',
        slug: 'unauth-car',
        tagline: 'No Auth',
        basePriceUSD: 40000,
        rangeKm: 600,
        acceleration0100: 4.0,
        batteryKwh: 90,
        powerHp: 400,
        topSpeedKmH: 200,
        chargingTimeMin: 15,
        mainImage: '/images/cars/zeekr-001/main.jpg',
        description: 'Should not create',
        galleryImages: [],
        isActive: true,
      });
      expect(createRes.success).toBe(false);

      const updateModel = pickAction(actions, ['updateCarModelAction', 'editCarModelAction']);
      expect(typeof updateModel, 'updateCarModelAction must exist').toBe('function');
      const updateRes = await updateModel!('zeekr-001', { name: 'Hacked' });
      expect(updateRes.success).toBe(false);
    });

    it('T2-F9-02: Non-ADMIN roles (MANAGER / USER) are rejected by Admin CRUD actions', async () => {
      const actions = await importOptionalModule<Record<string, any>>('src/app/actions/adminCarActions.ts');
      for (const role of ['MANAGER', 'USER']) {
        setAuthCookie(signRoleJwt(role));
        const res = await actions!.toggleCarModelActiveAction('zeekr-001', false);
        expect(res.success, `Role ${role} must not be allowed to mutate car models`).toBe(false);

        const invRes = await actions!.deleteInventoryItemAction('ZEEKR001-UZ-2026-001');
        expect(invRes.success, `Role ${role} must not be allowed to delete inventory`).toBe(false);
      }
    });

    it('T2-F9-03: Duplicate slug on model creation and duplicate vinOrCode on inventory return clean { success: false }', async () => {
      setAuthCookie(signValidAdminJwt());
      const actions = await importOptionalModule<Record<string, any>>('src/app/actions/adminCarActions.ts');

      const dupModel = await actions!.createCarModelAction({
        name: 'Duplicate 001',
        slug: 'zeekr-001',
        tagline: 'Dup',
        basePriceUSD: 45000,
        rangeKm: 700,
        acceleration0100: 3.8,
        batteryKwh: 100,
        powerHp: 544,
        topSpeedKmH: 200,
        chargingTimeMin: 15,
        mainImage: '/images/cars/zeekr-001/main.jpg',
        description: 'Duplicate slug test',
        galleryImages: [],
        isActive: true,
      });
      expect(dupModel.success).toBe(false);
      expect(dupModel.error).toBeTruthy();

      const dupVin = await actions!.createInventoryItemAction({
        trimId: 'zeekr-001-trim-1',
        vinOrCode: 'ZEEKR001-UZ-2026-001',
        exteriorColor: 'White',
        interiorColor: 'Black',
        year: 2026,
        status: 'IN_STOCK',
        priceUSD: 49500,
        images: ['/images/cars/zeekr-001/main.jpg'],
      });
      expect(dupVin.success).toBe(false);
      expect(dupVin.error).toBeTruthy();
    });

    it('T2-F9-04: Invalid boundary values in Trim/Color/Inventory actions are rejected without DB writes', async () => {
      setAuthCookie(signValidAdminJwt());
      const actions = await importOptionalModule<Record<string, any>>('src/app/actions/adminCarActions.ts');
      const createTrim = pickAction(actions, ['createCarTrimAction', 'createTrimAction']);
      const createColor = pickAction(actions, ['createCarColorAction', 'createColorAction']);
      expect(typeof createTrim, 'createCarTrimAction/createTrimAction must exist').toBe('function');
      expect(typeof createColor, 'createCarColorAction/createColorAction must exist').toBe('function');

      const badTrim = await createTrim!({
        modelId: 'zeekr-001',
        name: '',
        priceUSD: -100,
        driveType: 'AWD',
        rangeKm: 0,
        acceleration: -1,
        features: [],
      });
      expect(badTrim.success).toBe(false);

      const badColor = await createColor!({
        modelId: 'zeekr-001',
        name: 'Bad Hex',
        hexCode: 'not-a-hex',
        imageUrl: '',
        isInterior: false,
      });
      expect(badColor.success).toBe(false);
    });

    it('T2-F9-05: Non-existent IDs on update/delete actions return { success: false, error } without crashing', async () => {
      setAuthCookie(signValidAdminJwt());
      const actions = await importOptionalModule<Record<string, any>>('src/app/actions/adminCarActions.ts');
      const updateModel = pickAction(actions, ['updateCarModelAction', 'editCarModelAction']);
      const deleteModel = pickAction(actions, ['deleteCarModelAction', 'removeCarModelAction']);
      const updateInv = pickAction(actions, ['updateInventoryItemAction', 'editInventoryItemAction']);

      expect(typeof updateModel, 'updateCarModelAction must exist').toBe('function');
      expect(typeof deleteModel, 'deleteCarModelAction must exist').toBe('function');
      expect(typeof updateInv, 'updateInventoryItemAction must exist').toBe('function');

      const r1 = await deleteModel!('non-existent-model-id');
      expect(r1.success).toBe(false);

      const r2 = await actions!.deleteInventoryItemAction('non-existent-inv-id');
      expect(r2.success).toBe(false);

      const r3 = await updateInv!('non-existent-inv-id', {
        trimId: 'zeekr-001-trim-1',
        exteriorColor: 'White',
        interiorColor: 'Black',
        year: 2026,
        status: 'IN_STOCK',
        priceUSD: 45000,
        images: [],
      });
      expect(r3.success).toBe(false);
    });

    it('T2-F9-06: Script payloads in model name/description are HTML-escaped when rendered on /models/[slug]', async () => {
      setAuthCookie(signValidAdminJwt());
      const actions = await importOptionalModule<Record<string, any>>('src/app/actions/adminCarActions.ts');
      const res = await actions!.createCarModelAction({
        name: 'Zeekr <script>alert(1)</script>',
        slug: 'zeekr-xss-test',
        tagline: 'Safe Tagline',
        basePriceUSD: 42000,
        rangeKm: 620,
        acceleration0100: 4.1,
        batteryKwh: 86,
        powerHp: 422,
        topSpeedKmH: 200,
        chargingTimeMin: 15,
        mainImage: '/images/cars/zeekr-001/main.jpg',
        description: 'Description <script>evil()</script> safe text',
        galleryImages: [],
        isActive: true,
      });
      expect(res.success).toBe(true);

      const detail = await renderServerPage('src/app/(public)/models/[slug]/page.tsx', {
        params: Promise.resolve({ slug: 'zeekr-xss-test' }),
      });
      expect(detail.status).toBe(200);
      expect(detail.html).not.toContain('<script>alert(1)</script>');
      expect(detail.html).not.toContain('<script>evil()</script>');
    });
  });

  // =========================================================================
  // F10: Interactive /models/[slug] Boundaries (6 tests)
  // =========================================================================
  describe('F10: Model Configurator & Gallery Boundaries', () => {
    it('T2-F10-01: Model with trims=[] renders /models/[slug] cleanly using basePriceUSD in LoanCalculator', async () => {
      await prismaMemoryClient.carModel.create({
        data: {
          slug: 'zeekr-notrim',
          name: 'Zeekr Concept',
          tagline: 'No trims yet',
          basePriceUSD: 52000,
          acceleration0100: 3.9,
          rangeKm: 700,
          batteryKwh: 100,
          powerHp: 544,
          topSpeedKmH: 200,
          chargingTimeMin: 15,
          mainImage: '/images/cars/zeekr-001/main.jpg',
          galleryImages: ['/images/cars/zeekr-001/main.jpg'],
          description: 'Concept model without trims.',
          isActive: true,
          orderIndex: 9,
        },
      });
      const res = await renderServerPage('src/app/(public)/models/[slug]/page.tsx', {
        params: Promise.resolve({ slug: 'zeekr-notrim' }),
      });
      expect(res.status).toBe(200);
      expect(res.html).toContain('$52,000');
      expect(res.html).toContain('Kalkulyator');
    });

    it('T2-F10-02: Model with galleryImages=[] renders cleanly without empty src="" img attributes', async () => {
      await prismaMemoryClient.carModel.create({
        data: {
          slug: 'zeekr-nogallery',
          name: 'Zeekr NoGallery',
          tagline: 'Minimal',
          basePriceUSD: 41000,
          acceleration0100: 4.5,
          rangeKm: 600,
          batteryKwh: 80,
          powerHp: 400,
          topSpeedKmH: 190,
          chargingTimeMin: 20,
          mainImage: '/images/cars/zeekr-x/main.jpg',
          galleryImages: [],
          description: 'Model without extra gallery images.',
          isActive: true,
          orderIndex: 10,
        },
      });
      const res = await renderServerPage('src/app/(public)/models/[slug]/page.tsx', {
        params: Promise.resolve({ slug: 'zeekr-nogallery' }),
      });
      expect(res.status).toBe(200);
      expect(res.html).not.toMatch(/<img[^>]*src=""/);
    });

    it('T2-F10-03: Unknown or inactive model slug returns 404 from /models/[slug]', async () => {
      const unknownRes = await renderServerPage('src/app/(public)/models/[slug]/page.tsx', {
        params: Promise.resolve({ slug: 'unknown-model-xyz' }),
      });
      expect(unknownRes.status).toBe(404);

      await prismaMemoryClient.carModel.update({
        where: { slug: 'zeekr-009' },
        data: { isActive: false },
      });
      const inactiveRes = await renderServerPage('src/app/(public)/models/[slug]/page.tsx', {
        params: Promise.resolve({ slug: 'zeekr-009' }),
      });
      expect(inactiveRes.status).toBe(404);
    });

    it('T2-F10-04: LoanCalculator handles boundary values (0 price, 100% down, 0% APR) without NaN or Infinity', () => {
      const zeroRes = calculateMonthlyLoanPayment({
        carPriceUSD: 0,
        downPaymentPercent: 30,
        termMonths: 36,
        annualInterestRatePercent: 22,
      });
      expect(zeroRes.monthlyUSD).toBe(0);
      expect(Number.isFinite(zeroRes.monthlyUSD)).toBe(true);

      const fullDown = calculateMonthlyLoanPayment({
        carPriceUSD: 45000,
        downPaymentPercent: 100,
        termMonths: 36,
        annualInterestRatePercent: 22,
      });
      expect(fullDown.monthlyUSD).toBe(0);

      const zeroApr = calculateMonthlyLoanPayment({
        carPriceUSD: 45000,
        downPaymentPercent: 20,
        termMonths: 36,
        annualInterestRatePercent: 0,
      });
      expect(zeroApr.monthlyUSD).toBe(1000);

      const zeroHtml = renderComponentHtml(
        React.createElement(LoanCalculator, { carPriceUSD: 0, rate: 12850, apr: 22 })
      );
      expect(zeroHtml).not.toContain('NaN');
      expect(zeroHtml).not.toContain('Infinity');
    });

    it('T2-F10-05: ColorVisualizer omits Interyer tab when interiorColors is empty', () => {
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
          ],
        })
      );
      expect(html).not.toContain('>Interyer<');
      expect(html).toContain('/images/cars/zeekr-001/main.jpg');
    });

    it('T2-F10-06: TrimSelector renders single-trim model cleanly without layout errors', () => {
      const singleTrim = [
        {
          id: 't-only',
          name: 'Standard Edition',
          priceUSD: 36000,
          driveType: 'RWD',
          rangeKm: 560,
          acceleration: 5.8,
          features: ['66 kWh'],
        },
      ];
      const html = renderComponentHtml(
        React.createElement(TrimSelector, {
          trims: singleTrim,
          selectedTrim: singleTrim[0],
          onSelectTrim: () => {},
          rate: 12850,
        })
      );
      expect(html).toContain('1 ta versiya');
      expect(html).toContain('Standard Edition');
    });
  });

  // =========================================================================
  // F11: /service Booking Validation & Abuse Boundaries (6 tests)
  // =========================================================================
  describe('F11: /service Booking Validation Boundaries', () => {
    it('T2-F11-01: Empty or 1-char fullName on SERVICE lead returns 400 and creates 0 DB rows', async () => {
      const before = await prismaMemoryClient.lead.count();
      for (const badName of ['', '   ', 'A']) {
        const res = await dispatchApiRequest('/api/leads', 'src/app/api/leads/route.ts', {
          method: 'POST',
          headers: { 'x-forwarded-for': '203.0.113.160' },
          body: { fullName: badName, phone: '+998901234567', type: 'SERVICE' },
        });
        expect(res.status).toBe(400);
      }
      expect(await prismaMemoryClient.lead.count()).toBe(before);
    });

    it('T2-F11-02: Invalid non-Uzbek phone numbers on SERVICE lead return 400', async () => {
      for (const badPhone of ['12345', '+1234567890', 'abcdefghij']) {
        const res = await dispatchApiRequest('/api/leads', 'src/app/api/leads/route.ts', {
          method: 'POST',
          headers: { 'x-forwarded-for': '203.0.113.161' },
          body: { fullName: 'Valid Name', phone: badPhone, type: 'SERVICE' },
        });
        expect(res.status).toBe(400);
      }
    });

    it('T2-F11-03: Invalid preferredDate or malformed JSON on SERVICE lead returns 400 (never 500)', async () => {
      const badJson = await dispatchApiRequest('/api/leads', 'src/app/api/leads/route.ts', {
        method: 'POST',
        headers: { 'x-forwarded-for': '203.0.113.162' },
        rawBody: '{bad',
      });
      expect(badJson.status).toBe(400);

      const badDate = await dispatchApiRequest('/api/leads', 'src/app/api/leads/route.ts', {
        method: 'POST',
        headers: { 'x-forwarded-for': '203.0.113.163' },
        body: {
          fullName: 'Valid Name',
          phone: '+998901234567',
          type: 'SERVICE',
          preferredDate: 'not-a-date',
        },
      });
      expect(badDate.status).toBe(400);
    });

    it('T2-F11-04: Non-existent modelId FK on SERVICE lead returns controlled 400 without stack trace', async () => {
      const res = await dispatchApiRequest('/api/leads', 'src/app/api/leads/route.ts', {
        method: 'POST',
        headers: { 'x-forwarded-for': '203.0.113.164' },
        body: {
          fullName: 'Valid Name',
          phone: '+998901234567',
          type: 'SERVICE',
          modelId: 'non-existent-model',
        },
      });
      expect(res.status).toBe(400);
      expect(res.text).not.toContain('at ');
    });

    it('T2-F11-05: Rapid repeated SERVICE submissions from same IP trigger HTTP 429 rate limit', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
      const ip = '198.51.100.199';
      const codes: number[] = [];
      for (let i = 0; i < 15; i++) {
        const res = await dispatchApiRequest('/api/leads', 'src/app/api/leads/route.ts', {
          method: 'POST',
          headers: { 'x-forwarded-for': ip },
          body: { fullName: `Service Burst ${i}`, phone: '+998901234567', type: 'SERVICE' },
        });
        codes.push(res.status);
      }
      expect(codes).toContain(429);
    });

    it('T2-F11-06: Oversized notes (>2000 chars) or fullName (>120 chars) on SERVICE lead rejected with 400', async () => {
      const longNotes = await dispatchApiRequest('/api/leads', 'src/app/api/leads/route.ts', {
        method: 'POST',
        headers: { 'x-forwarded-for': '203.0.113.165' },
        body: {
          fullName: 'Valid Name',
          phone: '+998901234567',
          type: 'SERVICE',
          notes: 'X'.repeat(2500),
        },
      });
      expect(longNotes.status).toBe(400);

      const longName = await dispatchApiRequest('/api/leads', 'src/app/api/leads/route.ts', {
        method: 'POST',
        headers: { 'x-forwarded-for': '203.0.113.166' },
        body: {
          fullName: 'Y'.repeat(150),
          phone: '+998901234567',
          type: 'SERVICE',
        },
      });
      expect(longName.status).toBe(400);
    });
  });
});
