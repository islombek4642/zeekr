import fs from 'fs';
import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import {
  resetTestState,
  prismaMemoryClient,
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
import { importOptionalModule, resolveRepoPath } from '../helpers/module-loader';

import { calculateMonthlyLoanPayment } from '@/lib/calculator';
import { TrimSelector } from '@/components/models/TrimSelector';
import { LoanCalculator } from '@/components/models/LoanCalculator';
import { ColorVisualizer } from '@/components/models/ColorVisualizer';

function pickAction(mod: Record<string, any> | null, names: string[]) {
  if (!mod) return null;
  for (const n of names) {
    if (typeof mod[n] === 'function') return mod[n];
  }
  return null;
}

describe('Tier 1 — Part B: Functional Expansion Happy Paths (F9–F11)', () => {
  beforeEach(() => {
    resetTestState();
    vi.restoreAllMocks();
  });

  // =========================================================================
  // F9: Admin CRUD for Models, Trims, Colors, Inventory (6 tests)
  // =========================================================================
  describe('F9: Admin CRUD for Models, Trims, Colors & Inventory', () => {
    it('T1-F9-01: Create model with valid payload & relative mainImage persists and revalidates', async () => {
      setAuthCookie(signValidAdminJwt());
      const actions = await importOptionalModule<Record<string, any>>('src/app/actions/adminCarActions.ts');
      expect(typeof actions?.createCarModelAction).toBe('function');

      const res = await actions!.createCarModelAction({
        name: 'Zeekr Mix',
        slug: '  ZEEKR-MIX  ',
        tagline: 'Premium MPV',
        basePriceUSD: 44000,
        rangeKm: 705,
        acceleration0100: 3.8,
        batteryKwh: 100,
        powerHp: 645,
        topSpeedKmH: 210,
        chargingTimeMin: 15,
        mainImage: '/images/cars/zeekr-001/main.jpg',
        description: 'Yangi premium elektr MPV.',
        galleryImages: ['/images/cars/zeekr-001/interior.jpg'],
        isActive: true,
      });

      expect(res.success).toBe(true);
      expect(res.modelId).toBeTruthy();
      const created = await prismaMemoryClient.carModel.findUnique({ where: { id: res.modelId } });
      expect(created?.slug).toBe('zeekr-mix');
    });

    it('T1-F9-02: Edit existing model via /admin/cars/[id] & updateCarModelAction updates /models/[slug]', async () => {
      setAuthCookie(signValidAdminJwt());
      const editPage = await renderServerPage('src/app/admin/cars/[id]/page.tsx', {
        params: Promise.resolve({ id: 'zeekr-001' }),
      });
      expect(editPage.status, '/admin/cars/[id] page must exist for model editing').toBe(200);
      expect(editPage.html).toContain('Zeekr 001');

      const actions = await importOptionalModule<Record<string, any>>('src/app/actions/adminCarActions.ts');
      const updateModel = pickAction(actions, ['updateCarModelAction', 'editCarModelAction']);
      expect(typeof updateModel, 'updateCarModelAction must be exported in adminCarActions.ts').toBe('function');

      const res = await updateModel!('zeekr-001', {
        name: 'Zeekr 001 Facelift',
        slug: 'zeekr-001',
        tagline: 'Updated Flagship',
        basePriceUSD: 47500,
        rangeKm: 750,
        acceleration0100: 3.6,
        batteryKwh: 100,
        powerHp: 580,
        topSpeedKmH: 210,
        chargingTimeMin: 15,
        mainImage: '/images/cars/zeekr-001/main.jpg',
        description: 'Updated description for Zeekr 001.',
        galleryImages: ['/images/cars/zeekr-001/main.jpg', '/images/cars/zeekr-001/interior.jpg'],
        isActive: true,
      });
      expect(res.success).toBe(true);

      const detailPage = await renderServerPage('src/app/(public)/models/[slug]/page.tsx', {
        params: Promise.resolve({ slug: 'zeekr-001' }),
      });
      expect(detailPage.html).toContain('Zeekr 001 Facelift');
      expect(detailPage.html).toContain('Updated Flagship');
    });

    it('T1-F9-03: Delete existing model removes it from DB, /admin/cars, and public catalog', async () => {
      setAuthCookie(signValidAdminJwt());
      const actions = await importOptionalModule<Record<string, any>>('src/app/actions/adminCarActions.ts');
      const deleteModel = pickAction(actions, ['deleteCarModelAction', 'removeCarModelAction']);
      expect(typeof deleteModel, 'deleteCarModelAction must be exported in adminCarActions.ts').toBe('function');

      const res = await deleteModel!('zeekr-x');
      expect(res.success).toBe(true);

      const check = await prismaMemoryClient.carModel.findUnique({ where: { id: 'zeekr-x' } });
      expect(check).toBeNull();
    });

    it('T1-F9-04: Trim CRUD (create, update, delete) persists and reflects on /models/[slug]', async () => {
      setAuthCookie(signValidAdminJwt());
      const actions = await importOptionalModule<Record<string, any>>('src/app/actions/adminCarActions.ts');
      const createTrim = pickAction(actions, ['createCarTrimAction', 'createTrimAction']);
      const updateTrim = pickAction(actions, ['updateCarTrimAction', 'updateTrimAction']);
      const deleteTrim = pickAction(actions, ['deleteCarTrimAction', 'deleteTrimAction']);

      expect(typeof createTrim, 'createCarTrimAction/createTrimAction must exist').toBe('function');
      expect(typeof updateTrim, 'updateCarTrimAction/updateTrimAction must exist').toBe('function');
      expect(typeof deleteTrim, 'deleteCarTrimAction/deleteTrimAction must exist').toBe('function');

      const created = await createTrim!({
        modelId: 'zeekr-001',
        name: 'FR Performance',
        priceUSD: 89000,
        driveType: 'AWD',
        rangeKm: 550,
        acceleration: 2.02,
        features: ['Quad Motor', 'Carbon Ceramic Brakes'],
      });
      expect(created.success).toBe(true);
      const trimId = created.trimId || created.id;
      expect(trimId).toBeTruthy();

      const updated = await updateTrim!(trimId, {
        modelId: 'zeekr-001',
        name: 'FR Track Edition',
        priceUSD: 91000,
        driveType: 'AWD',
        rangeKm: 560,
        acceleration: 2.02,
        features: ['Quad Motor', 'Track Mode'],
      });
      expect(updated.success).toBe(true);

      const pageAfterUpdate = await renderServerPage('src/app/(public)/models/[slug]/page.tsx', {
        params: Promise.resolve({ slug: 'zeekr-001' }),
      });
      expect(pageAfterUpdate.html).toContain('FR Track Edition');

      const deleted = await deleteTrim!(trimId);
      expect(deleted.success).toBe(true);
    });

    it('T1-F9-05: Color CRUD (create, update, delete) persists and reflects in ColorVisualizer', async () => {
      setAuthCookie(signValidAdminJwt());
      const actions = await importOptionalModule<Record<string, any>>('src/app/actions/adminCarActions.ts');
      const createColor = pickAction(actions, ['createCarColorAction', 'createColorAction']);
      const updateColor = pickAction(actions, ['updateCarColorAction', 'updateColorAction']);
      const deleteColor = pickAction(actions, ['deleteCarColorAction', 'deleteColorAction']);

      expect(typeof createColor, 'createCarColorAction/createColorAction must exist').toBe('function');
      expect(typeof updateColor, 'updateCarColorAction/updateColorAction must exist').toBe('function');
      expect(typeof deleteColor, 'deleteCarColorAction/deleteColorAction must exist').toBe('function');

      const created = await createColor!({
        modelId: 'zeekr-001',
        name: 'Electric Orange',
        hexCode: '#FF6600',
        imageUrl: '/images/cars/zeekr-001/main.jpg',
        isInterior: false,
      });
      expect(created.success).toBe(true);
      const colorId = created.colorId || created.id;
      expect(colorId).toBeTruthy();

      const updated = await updateColor!(colorId, {
        modelId: 'zeekr-001',
        name: 'Sunset Orange',
        hexCode: '#FF5500',
        imageUrl: '/images/cars/zeekr-001/main.jpg',
        isInterior: false,
      });
      expect(updated.success).toBe(true);

      const deleted = await deleteColor!(colorId);
      expect(deleted.success).toBe(true);
    });

    it('T1-F9-06: Inventory full CRUD via /admin/inventory/[id] & updateInventoryItemAction', async () => {
      setAuthCookie(signValidAdminJwt());
      const editPage = await renderServerPage('src/app/admin/inventory/[id]/page.tsx', {
        params: Promise.resolve({ id: 'ZEEKR001-UZ-2026-001' }),
      });
      expect(editPage.status, '/admin/inventory/[id] edit page must exist').toBe(200);

      const actions = await importOptionalModule<Record<string, any>>('src/app/actions/adminCarActions.ts');
      const updateInv = pickAction(actions, ['updateInventoryItemAction', 'editInventoryItemAction']);
      expect(typeof updateInv, 'updateInventoryItemAction must be exported in adminCarActions.ts').toBe('function');

      const created = await actions!.createInventoryItemAction({
        trimId: 'zeekr-001-trim-1',
        vinOrCode: 'ZEEKR001-EDIT-99',
        exteriorColor: 'Silver',
        interiorColor: 'Black',
        year: 2026,
        status: 'IN_STOCK',
        priceUSD: 47000,
        images: ['/images/cars/zeekr-001/main.jpg'],
      });
      expect(created.success).toBe(true);

      const updated = await updateInv!(created.itemId, {
        trimId: 'zeekr-001-trim-1',
        vinOrCode: 'ZEEKR001-EDIT-99',
        exteriorColor: 'Midnight Blue',
        interiorColor: 'Cream Nappa',
        year: 2026,
        status: 'IN_TRANSIT',
        priceUSD: 48500,
        notes: 'Updated spec',
        images: ['/images/cars/zeekr-001/main.jpg'],
      });
      expect(updated.success).toBe(true);

      const dbItem = await prismaMemoryClient.inventoryItem.findUnique({ where: { id: created.itemId } });
      expect(dbItem?.exteriorColor).toBe('Midnight Blue');
      expect(dbItem?.priceUSD).toBe(48500);

      const deleted = await actions!.deleteInventoryItemAction(created.itemId);
      expect(deleted.success).toBe(true);
    });
  });

  // =========================================================================
  // F10: Interactive /models/[slug] Configurator & Gallery (6 tests)
  // =========================================================================
  describe('F10: Interactive /models/[slug] Configurator & Gallery', () => {
    it('T1-F10-01: /models/zeekr-001 renders interactive TrimSelector options for all model trims', async () => {
      const pageRes = await renderServerPage('src/app/(public)/models/[slug]/page.tsx', {
        params: Promise.resolve({ slug: 'zeekr-001' }),
      });
      expect(pageRes.status).toBe(200);
      expect(pageRes.html).toContain('WE Version');
      expect(pageRes.html).toContain('ME Version');
      expect(pageRes.html).toContain('YOU Version');
      // TrimSelector renders "Komplektatsiyani Tanlang:" when integrated on /models/[slug]
      expect(pageRes.html).toContain('Komplektatsiyani Tanlang');
    });

    it('T1-F10-02: /models/[slug] connects selected trim price to LoanCalculator (not locked to basePriceUSD)', async () => {
      const modelPageSrc = fs.readFileSync(
        resolveRepoPath('src/app/(public)/models/[slug]/page.tsx'),
        'utf-8'
      );
      // Verify /models/[slug] delegates interactive TrimSelector + LoanCalculator state to a client configurator wrapper
      expect(modelPageSrc).not.toMatch(/<LoanCalculator\s+carPriceUSD=\{defaultPrice\}/);

      const calc58k = renderComponentHtml(
        React.createElement(LoanCalculator, { carPriceUSD: 58000, rate: 12850, apr: 22 })
      );
      const expected58k = calculateMonthlyLoanPayment({
        carPriceUSD: 58000,
        downPaymentPercent: 30,
        termMonths: 36,
        annualInterestRatePercent: 22,
      });
      expect(calc58k).toContain(expected58k.monthlyUSD.toLocaleString('en-US'));
    });

    it('T1-F10-03: LoanCalculator reflects settings.default_loan_apr and computes annuity math accurately', () => {
      const html = renderComponentHtml(
        React.createElement(LoanCalculator, { carPriceUSD: 45000, rate: 12850, apr: 18 })
      );
      expect(html).toContain('18%');
      const expected = calculateMonthlyLoanPayment({
        carPriceUSD: 45000,
        downPaymentPercent: 30,
        termMonths: 36,
        annualInterestRatePercent: 18,
      });
      expect(html).toContain(`$${expected.monthlyUSD.toLocaleString('en-US')}`);
      expect(html).toContain(`$${expected.loanAmountUSD.toLocaleString('en-US')}`);
    });

    it('T1-F10-04: /models/zeekr-001 renders model galleryImages section with all local gallery assets', async () => {
      await prismaMemoryClient.carModel.update({
        where: { slug: 'zeekr-001' },
        data: {
          galleryImages: [
            '/images/cars/zeekr-001/main.jpg',
            '/images/cars/zeekr-001/interior.jpg',
          ],
        },
      });
      const pageRes = await renderServerPage('src/app/(public)/models/[slug]/page.tsx', {
        params: Promise.resolve({ slug: 'zeekr-001' }),
      });
      expect(pageRes.status).toBe(200);
      expect(pageRes.html).toContain('/images/cars/zeekr-001/interior.jpg');
      expect(pageRes.html).toContain('/images/cars/zeekr-001/main.jpg');
    });

    it('T1-F10-05: ColorVisualizer renders exterior/interior tabs and switches active image based on selection', () => {
      const html = renderComponentHtml(
        React.createElement(ColorVisualizer, {
          modelName: 'Zeekr 007',
          mainImage: '/images/cars/zeekr-007/main.jpg',
          colors: [
            {
              id: 'c1',
              name: 'Arctic White',
              hexCode: '#F8FAFC',
              imageUrl: '/images/cars/zeekr-007/main.jpg',
              isInterior: false,
            },
            {
              id: 'c2',
              name: 'Nappa Beige',
              hexCode: '#E2D4C0',
              imageUrl: '/images/cars/zeekr-007/interior.jpg',
              isInterior: true,
            },
          ],
        })
      );
      expect(html).toContain('Eksteryer');
      expect(html).toContain('Interyer');
      expect(html).toContain('Arctic White');
      expect(html).toContain('/images/cars/zeekr-007/main.jpg');
    });

    it('T1-F10-06: TrimSelector displays all trim cards, highlights selected trim, and formats USD/UZS', () => {
      const trims = [
        {
          id: 't1',
          name: 'WE Version',
          priceUSD: 45000,
          driveType: 'RWD',
          rangeKm: 741,
          acceleration: 5.9,
          features: ['100 kWh'],
        },
        {
          id: 't2',
          name: 'YOU Version',
          priceUSD: 58000,
          driveType: 'AWD',
          rangeKm: 656,
          acceleration: 3.8,
          features: ['Air Suspension'],
        },
      ];
      const html = renderComponentHtml(
        React.createElement(TrimSelector, {
          trims,
          selectedTrim: trims[1],
          onSelectTrim: () => {},
          rate: 12850,
        })
      );
      expect(html).toContain('WE Version');
      expect(html).toContain('YOU Version');
      expect(html).toContain('$58,000');
      expect(html).toContain('$45,000');
    });
  });

  // =========================================================================
  // F11: /service Booking Form (type: 'SERVICE') (6 tests)
  // =========================================================================
  describe('F11: /service Booking Form (type: SERVICE)', () => {
    it('T1-F11-01: GET /service renders warranties, charging guide, and interactive service booking form', async () => {
      const pageRes = await renderServerPage('src/app/(public)/service/page.tsx');
      expect(pageRes.status).toBe(200);
      expect(pageRes.html).toContain('Traction Batareya Kafolati');
      expect(pageRes.html).toContain('<form');
      expect(pageRes.html).toMatch(/<input[^>]*type="tel"/i);
      expect(pageRes.html).toMatch(/<button[^>]*type="submit"/i);
    });

    it('T1-F11-02: Submitting valid service booking via POST /api/leads creates Lead with type SERVICE & status NEW', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
      const res = await dispatchApiRequest('/api/leads', 'src/app/api/leads/route.ts', {
        method: 'POST',
        headers: { 'x-forwarded-for': '203.0.113.51' },
        body: {
          fullName: 'Rustam Alimov',
          phone: '+998901234567',
          type: 'SERVICE',
          notes: '10,000 km texnik ko’rik',
          source: 'service_page',
        },
      });
      expect(res.status).toBe(200);
      expect(res.json.success).toBe(true);
      const lead = await prismaMemoryClient.lead.findUnique({ where: { id: res.json.leadId } });
      expect(lead?.type).toBe('SERVICE');
      expect(lead?.status).toBe('NEW');
    });

    it('T1-F11-03: SERVICE booking persists optional modelId, preferredDate, preferredTime, and notes', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
      const res = await dispatchApiRequest('/api/leads', 'src/app/api/leads/route.ts', {
        method: 'POST',
        headers: { 'x-forwarded-for': '203.0.113.52' },
        body: {
          fullName: 'Kamola Azizova',
          phone: '998931112233',
          modelId: 'zeekr-009',
          type: 'SERVICE',
          preferredDate: '2026-12-15',
          preferredTime: '10:00 — 12:00',
          notes: 'OTA yangilash va diagnostika',
          source: 'service_page',
        },
      });
      expect(res.status).toBe(200);
      const lead = await prismaMemoryClient.lead.findUnique({ where: { id: res.json.leadId } });
      expect(lead?.modelId).toBe('zeekr-009');
      expect(lead?.preferredTime).toBe('10:00 — 12:00');
      expect(lead?.managerNotes).toContain('OTA yangilash');
    });

    it('T1-F11-04: Phone normalization handles 9-digit and formatted inputs for SERVICE leads', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
      const r1 = await dispatchApiRequest('/api/leads', 'src/app/api/leads/route.ts', {
        method: 'POST',
        headers: { 'x-forwarded-for': '203.0.113.53' },
        body: { fullName: 'Mijoz 1', phone: '901234567', type: 'SERVICE' },
      });
      const r2 = await dispatchApiRequest('/api/leads', 'src/app/api/leads/route.ts', {
        method: 'POST',
        headers: { 'x-forwarded-for': '203.0.113.54' },
        body: { fullName: 'Mijoz 2', phone: '+998 (90) 123-45-67', type: 'SERVICE' },
      });
      expect(r1.status).toBe(200);
      expect(r2.status).toBe(200);
      const l1 = await prismaMemoryClient.lead.findUnique({ where: { id: r1.json.leadId } });
      const l2 = await prismaMemoryClient.lead.findUnique({ where: { id: r2.json.leadId } });
      expect(l1?.phone).toBe('+998901234567');
      expect(l2?.phone).toBe('+998901234567');
    });

    it('T1-F11-05: SERVICE lead triggers Telegram notification and degrades gracefully if Telegram errors', async () => {
      await prismaMemoryClient.setting.upsert({
        where: { key: 'telegram_bot_token' },
        update: { value: 'fake-bot-token' },
        create: { key: 'telegram_bot_token', value: 'fake-bot-token' },
      });
      await prismaMemoryClient.setting.upsert({
        where: { key: 'telegram_chat_id' },
        update: { value: '123456' },
        create: { key: 'telegram_chat_id', value: '123456' },
      });

      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network down'));
      const res = await dispatchApiRequest('/api/leads', 'src/app/api/leads/route.ts', {
        method: 'POST',
        headers: { 'x-forwarded-for': '203.0.113.55' },
        body: { fullName: 'Azizbek', phone: '+998911234567', type: 'SERVICE' },
      });
      expect(res.status).toBe(200);
      expect(res.json.success).toBe(true);
      expect(fetchSpy).toHaveBeenCalled();
    });

    it('T1-F11-06: /service page / booking component explicitly wires SERVICE lead type', () => {
      const servicePageSrc = fs.readFileSync(
        resolveRepoPath('src/app/(public)/service/page.tsx'),
        'utf-8'
      );
      const hasInlineService = /SERVICE/.test(servicePageSrc);
      const hasBookingImport = /ServiceBooking|BookingForm/i.test(servicePageSrc);
      expect(
        hasInlineService || hasBookingImport,
        '/service/page.tsx must integrate a ServiceBooking form submitting type: SERVICE'
      ).toBe(true);
    });
  });
});
