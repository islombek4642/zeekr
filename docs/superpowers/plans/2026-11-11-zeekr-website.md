# Zeekr O'zbekiston Rasmiy Dilerlik Veb-sayti va Admin Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** O'zbekistondagi Zeekr elektromobillari dilerlik markazi uchun Nordic Architectural (Clean Light Minimal) estetikali rasmiy veb-sayt, interaktiv modellar katalogi, kredit kalkulyatori, salondagi mavjud mashinalar vitrinasi, test-drayv arizalari voronkasi hamda dinamik ma'lumotlarni (manzil, telefonlar, narxlar) boshqaruvchi to'liq Admin CRM panelini yaratish va Vercel platformasiga tayyorlash.

**Architecture:** Next.js 15 Full-Stack (App Router, Server Actions, Route Handlers) monolit arxitekturasi. Ommaviy sayt va `/admin` CRM paneli yagona loyihada. Ma'lumotlar bazasi sifatida Prisma ORM orqali PostgreSQL (Vercel Serverless / Supabase / Neon pooler). Yangi arizalar tushganda Telegram Bot API orqali menejerlar guruhiga bir zumda bildirishnoma yuborish xizmati. Saytdagi barcha kontaktlar, ijtimoiy tarmoqlar va valyuta kurslari ma'lumotlar bazasida (`Setting` modeli) saqlanib, admin paneldan dinamik tahrirlanadi.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, Shadcn UI / Radix primitives, Lucide React, Prisma ORM, PostgreSQL, Zod, bcryptjs, Vitest, Vercel.

**Spec:** [docs/superpowers/specs/2026-11-11-zeekr-website-design.md](file:///c:/ZEEKR/docs/superpowers/specs/2026-11-11-zeekr-website-design.md)

## Global Constraints

- **Node version:** Node.js v20+ (mavjud v26.10).
- **Styling:** Nordic Architectural — toza oq (`#FFFFFF`) va arxitekturaviy och kulrang (`#F8FAFC`, `#F1F5F9`), to'q grafit tipografika (`#0F172A`), nozik havoiy chiziqlar, anti-slop tamoyillari.
- **Dinamiklik:** Manzil, telefonlar, ish vaqti, ijtimoiy tarmoqlar, xarita va kurslar kodda mutlaqo hardcode qilinmaydi; barchasi `/admin/settings` orqali boshqariladi.
- **i18n-ready:** Hozirgi interfeys to'liq o'zbek tilida, ammo barcha lug'atlar va ma'lumotlar tuzilmasi kelgusida Rus tilini oson qo'shish imkoniyatini ta'minlaydi.
- **Xavfsizlik:** Maxfiy kalitlar (`DATABASE_URL`, `JWT_SECRET`, `TELEGRAM_BOT_TOKEN`) faqat `.env` da saqlanadi, mijoz bundle'iga chiqmaydi.

## Review Focus

- Telefon raqamlarining kiritilish formati: O'zbekiston raqamlari (`+998901234567` yoki `90 123 45 67`) to'g'ri tekshirilishi va normalizatsiya qilinishi.
- Telegram bot xatosi: Agar Telegram API ishlamay qolsa yoki token noto'g'ri bo'lsa, mijoz arizasi bazada baribir saqlanishi va sayt xatolikka uchramasligi (graceful degradation).
- Valyuta konvertatsiyasi: Narxlar so'mda hisoblanganda yaxlitlash va xatoliklar (NaN/0) chiqmasligi.
- Admin avtorizatsiyasi: Himoyalangan `/admin/*` sahifalari middleware darajasida tekshirilib, ruxsatsiz foydalanuvchilar `/admin/login` ga yo'naltirilishi.
- Vercel Serverless DB connection limit: Prisma Client singleton naqshi bilan ulanishlar oqimi boshqarilishi.

---

### Task 1: Project Scaffolding & Configuration

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`, `next.config.ts`, `.env.example`, `vitest.config.ts`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`
- Test: `tests/config/scaffold.test.ts`

**Interfaces:**
- Consumes: None (Root initialization).
- Produces: Working Next.js 15 TypeScript project with Tailwind CSS, path aliases (`@/*`), and Vitest test runner.

- [ ] **Step 1: Write scaffold sanity test in `tests/config/scaffold.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';

describe('Project Setup & Environment', () => {
  it('should verify project root and node environment', () => {
    expect(process.env.NODE_ENV).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails (before setup)**

Run: `npx vitest run tests/config/scaffold.test.ts`  
Expected: FAIL (vitest not installed / not configured).

- [ ] **Step 3: Initialize Next.js 15 project with TypeScript, Tailwind CSS, Lucide, and Vitest**

Install dependencies: `next`, `react`, `react-dom`, `lucide-react`, `clsx`, `tailwind-merge`, `zod`, `bcryptjs`, and dev dependencies: `typescript`, `@types/node`, `@types/react`, `vitest`, `tailwindcss`, `postcss`, `autoprefixer`. Configure `tailwind.config.ts` for Nordic Minimal palette and `tsconfig.json` with `@/*` paths.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/config/scaffold.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add package.json tsconfig.json tailwind.config.ts vitest.config.ts src/
git commit -m "chore: scaffold Next.js 15 project with TypeScript, Tailwind CSS and Vitest"
```

---

### Task 2: Database Layer & Prisma Schema with Seeders

**Files:**
- Create: `prisma/schema.prisma`
- Create: `src/lib/prisma.ts`
- Create: `prisma/seed.ts`
- Test: `tests/db/schema.test.ts`

**Interfaces:**
- Consumes: `DATABASE_URL` environment variable.
- Produces: Prisma Client singleton export `prisma`, models: `CarModel`, `CarTrim`, `CarColor`, `InventoryItem`, `Lead`, `Setting`, `User`.

- [ ] **Step 1: Write schema and model validation test in `tests/db/schema.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { prisma } from '@/lib/prisma';

describe('Database Models & Relations', () => {
  it('should instantiate Prisma client without throwing', () => {
    expect(prisma).toBeDefined();
    expect(prisma.carModel).toBeDefined();
    expect(prisma.setting).toBeDefined();
    expect(prisma.lead).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/db/schema.test.ts`  
Expected: FAIL (`@/lib/prisma` does not exist).

- [ ] **Step 3: Define schema in `prisma/schema.prisma` and singleton in `src/lib/prisma.ts`**

Implement complete schema from spec (Section 6), including `User`, `CarModel`, `CarTrim`, `CarColor`, `InventoryItem`, `Lead`, `Setting`. Implement `seed.ts` populating:
1. Admin user (`admin@zeekr-auto.uz`)
2. Initial models: **Zeekr 001**, **Zeekr 007**, **Zeekr 009**, **Zeekr X** with realistic technical parameters and color options.
3. Default dynamic settings: `showroom_address`, `primary_phone`, `secondary_phone`, `contact_email`, `working_hours`, `usd_to_uzs_rate` (12,850), `default_loan_apr` (22), `instagram_url`, `telegram_channel`.

- [ ] **Step 4: Run Prisma generate and test**

Run: `npx prisma generate && npx vitest run tests/db/schema.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add prisma/ src/lib/prisma.ts tests/db/
git commit -m "feat(db): configure Prisma schema, client singleton and initial seed data"
```

---

### Task 3: Dynamic Settings & Telegram Notification Service

**Files:**
- Create: `src/lib/settings.ts`
- Create: `src/lib/telegram.ts`
- Create: `src/types/settings.ts`
- Test: `tests/services/settings.test.ts`
- Test: `tests/services/telegram.test.ts`

**Interfaces:**
- Consumes: `prisma.setting`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`.
- Produces: 
  - `getSiteSettings(): Promise<SiteSettings>` (returns cached/typed settings with fallback defaults).
  - `updateSiteSettings(data: Partial<SiteSettings>): Promise<void>`.
  - `sendTelegramLeadNotification(lead: LeadWithDetails): Promise<boolean>`.

- [ ] **Step 1: Write tests in `tests/services/settings.test.ts` and `tests/services/telegram.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { formatLeadTelegramMessage } from '@/lib/telegram';

describe('Telegram Notification Service', () => {
  it('should format test-drive lead message properly with Uzbek labels', () => {
    const message = formatLeadTelegramMessage({
      type: 'TEST_DRIVE',
      fullName: 'Alisher Valiyev',
      phone: '+998901234567',
      modelName: 'Zeekr 001',
      preferredDate: '2026-11-15',
      preferredTime: '14:00 - 16:00',
    });
    expect(message).toContain('Yangi Test-drayv arizasi');
    expect(message).toContain('Alisher Valiyev');
    expect(message).toContain('+998901234567');
    expect(message).toContain('Zeekr 001');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/services/`  
Expected: FAIL (`formatLeadTelegramMessage` not defined).

- [ ] **Step 3: Implement `src/lib/settings.ts` and `src/lib/telegram.ts`**

Implement fallback defaults for all site settings (phone, address, working hours, exchange rate). Implement Telegram bot API sender using `fetch` with markdown formatting. Ensure failure to send Telegram message is logged but does not throw unhandled rejection.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/services/`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/settings.ts src/lib/telegram.ts src/types/ tests/services/
git commit -m "feat(services): implement dynamic site settings provider and Telegram lead notifier"
```

---

### Task 4: Public Layout, Header & Footer (Nordic Minimal UI)

**Files:**
- Create: `src/components/layout/Header.tsx`
- Create: `src/components/layout/Footer.tsx`
- Create: `src/components/layout/MobileMenu.tsx`
- Modify: `src/app/layout.tsx`
- Test: `tests/components/layout.test.ts`

**Interfaces:**
- Consumes: `getSiteSettings()` from `src/lib/settings.ts`, models list from DB.
- Produces: Sticky minimalist navigation bar, model quick-switcher drawer, dynamic footer displaying live phone/address/hours/socials, responsive mobile navigation.

- [ ] **Step 1: Write layout and settings binding test in `tests/components/layout.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { formatPhoneNumber } from '@/lib/utils';

describe('Layout Formatting Utilities', () => {
  it('should format raw phone numbers into readable Uzbek display format', () => {
    expect(formatPhoneNumber('+998901234567')).toBe('+998 (90) 123-45-67');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/layout.test.ts`  
Expected: FAIL (`formatPhoneNumber` not defined).

- [ ] **Step 3: Implement Header, Footer, and MobileMenu components**

Implement Nordic Minimal aesthetic:
- Header: Translucent blurred white background (`backdrop-blur-md bg-white/90`), Zeekr minimalist logo, navigation links (`Modellar`, `Mavjud avtomobillar`, `Test-drayv`, `Servis va Kafolat`, `Kontaktlar`), "Test-drayvga yozilish" button.
- Footer: Dynamic phone numbers, address, working hours, Yandex map link, Telegram/Instagram/YouTube links fetched from `getSiteSettings()`.
- MobileMenu: Smooth drawer for phone viewports with click-to-call direct links.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/components/layout.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/ src/lib/utils.ts tests/components/layout.test.ts src/app/layout.tsx
git commit -m "feat(ui): implement Nordic Architectural public header, dynamic footer and mobile menu"
```

---

### Task 5: Home Page (Showroom & Lead Conversion Vitrina)

**Files:**
- Create: `src/components/home/HeroSection.tsx`
- Create: `src/components/home/ModelShowcase.tsx`
- Create: `src/components/home/InStockCarousel.tsx`
- Create: `src/components/home/TechnologySection.tsx`
- Create: `src/components/home/QuickBookingSection.tsx`
- Modify: `src/app/page.tsx`
- Test: `tests/components/home.test.ts`

**Interfaces:**
- Consumes: `prisma.carModel`, `prisma.inventoryItem`, `getSiteSettings()`.
- Produces: High-converting landing page displaying the flagship model, full lineup (001, 007, 009, X), in-stock inventory highlights, battery/SEA platform highlights, and quick test-drive booking.

- [ ] **Step 1: Write test for model card pricing and specs formatting in `tests/components/home.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { formatCurrencyUSD, formatCurrencyUZS } from '@/lib/utils';

describe('Home Page Currency and Specs Helpers', () => {
  it('should format prices correctly in USD and UZS based on exchange rate', () => {
    expect(formatCurrencyUSD(45000)).toBe('$45,000');
    expect(formatCurrencyUZS(45000, 12850)).toBe("578,250,000 so'm");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/home.test.ts`  
Expected: FAIL (`formatCurrencyUSD` not defined).

- [ ] **Step 3: Implement Home page sections**

- `HeroSection`: Full-width banner for flagship Zeekr model, high-contrast imagery, key badges (0-100 in 2.07s, 741 km range), direct CTA buttons.
- `ModelShowcase`: Grid of models with tabbed filtering, specs callouts, starting prices, and links to `/models/[slug]`.
- `InStockCarousel`: Horizontally scrollable cards of real cars in Tashkent showroom with "Salonda bor" badges.
- `TechnologySection`: 800V fast-charge architecture, CATL Qilin battery, 5-star Euro NCAP safety breakdown.
- `QuickBookingSection`: 3-input quick lead form (Ism, Telefon, Model) posting to Server Action.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/components/home.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/home/ src/app/page.tsx tests/components/home.test.ts
git commit -m "feat(ui): implement Home page showroom with model lineup, stock carousel and quick booking"
```

---

### Task 6: Model Detail Page & Interactive Configurator

**Files:**
- Create: `src/app/models/[slug]/page.tsx`
- Create: `src/components/models/ColorVisualizer.tsx`
- Create: `src/components/models/SpecsComparison.tsx`
- Create: `src/components/models/LoanCalculator.tsx`
- Create: `src/components/models/TrimSelector.tsx`
- Test: `tests/components/calculator.test.ts`

**Interfaces:**
- Consumes: Dynamic route param `params.slug`, `prisma.carModel` (including `trims`, `colors`), `getSiteSettings()`.
- Produces: Detailed car presentation, interactive exterior/interior color preview switcher, trims comparison table (WE/ME/YOU), and real-time auto loan calculator using the dynamic APR setting.

- [ ] **Step 1: Write test for loan annuity formula in `tests/components/calculator.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { calculateMonthlyLoanPayment } from '@/lib/calculator';

describe('Auto Loan / Leasing Calculator', () => {
  it('should calculate monthly payment with standard annuity formula', () => {
    // Car price: $50,000; Down payment: 30% ($15,000); Loan: $35,000; 36 months; APR 22%
    const payment = calculateMonthlyLoanPayment({
      carPriceUSD: 50000,
      downPaymentPercent: 30,
      termMonths: 36,
      annualInterestRatePercent: 22,
    });
    expect(payment.monthlyUSD).toBeGreaterThan(1300);
    expect(payment.monthlyUSD).toBeLessThan(1400);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/calculator.test.ts`  
Expected: FAIL (`calculateMonthlyLoanPayment` not defined).

- [ ] **Step 3: Implement `src/lib/calculator.ts` and Model detail components**

- Implement `calculateMonthlyLoanPayment` in `src/lib/calculator.ts`.
- `ColorVisualizer`: Swatches for exterior/interior colors; clicking updates active preview image smoothly.
- `TrimSelector`: Radio tabs for trims with instant price and specs updates.
- `LoanCalculator`: Sliders for down payment (20% - 70%) and loan term (12 - 48 months), displaying both USD and UZS monthly payments based on live exchange rate and admin-configured APR.
- Model-specific test-drive booking drawer/modal.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/components/calculator.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/models/ src/components/models/ src/lib/calculator.ts tests/components/calculator.test.ts
git commit -m "feat(models): implement model detail page with interactive color visualizer, trims and loan calculator"
```

---

### Task 7: In-Stock Vehicle Inventory Page & Reservation Modal

**Files:**
- Create: `src/app/inventory/page.tsx`
- Create: `src/components/inventory/InventoryFilter.tsx`
- Create: `src/components/inventory/VehicleCard.tsx`
- Create: `src/components/inventory/ReserveModal.tsx`
- Test: `tests/components/inventory.test.ts`

**Interfaces:**
- Consumes: `prisma.inventoryItem` (joined with `trim.model`), `getSiteSettings()`.
- Produces: Showroom stock catalog with status filters (*Salonda mavjud* / *Yo'lda*), color and model filters, car inspection cards, and vehicle reservation inquiry modal.

- [ ] **Step 1: Write test for inventory filtering logic in `tests/components/inventory.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { filterInventoryItems } from '@/lib/inventory-filter';

describe('Inventory Filter Utility', () => {
  it('should filter items by model and availability status', () => {
    const items = [
      { id: '1', modelSlug: 'zeekr-001', status: 'IN_STOCK' },
      { id: '2', modelSlug: 'zeekr-007', status: 'IN_TRANSIT' },
    ];
    const filtered = filterInventoryItems(items as any, { modelSlug: 'zeekr-001' });
    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe('1');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/inventory.test.ts`  
Expected: FAIL (`filterInventoryItems` not defined).

- [ ] **Step 3: Implement Inventory page and components**

- `InventoryFilter`: Dropdowns and pill buttons for model selection and stock status.
- `VehicleCard`: Real vehicle images, VIN badge, exact exterior/interior color names, year, price in USD & UZS, "Bron qilish" button.
- `ReserveModal`: Form capturing customer name, phone number, and optional comment, linking `inventoryItemId` to the created `Lead` record, triggering Telegram notification.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/components/inventory.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/inventory/ src/components/inventory/ src/lib/inventory-filter.ts tests/components/inventory.test.ts
git commit -m "feat(inventory): implement showroom inventory catalog with filtering and vehicle reservation"
```

---

### Task 8: Dedicated Test-Drive Booking Page & Lead Actions

**Files:**
- Create: `src/app/test-drive/page.tsx`
- Create: `src/components/test-drive/TestDriveWizard.tsx`
- Create: `src/app/actions/leadActions.ts`
- Create: `src/lib/validations/lead.ts`
- Test: `tests/actions/lead.test.ts`

**Interfaces:**
- Consumes: `prisma.carModel`, `prisma.lead`, `sendTelegramLeadNotification`.
- Produces: Multi-step booking experience (Choose Model -> Date & Time Slot -> Contact Info), Zod validation schema, server action creating `Lead` and sending Telegram alert.

- [ ] **Step 1: Write test for lead validation schema in `tests/actions/lead.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { leadFormSchema } from '@/lib/validations/lead';

describe('Lead Form Zod Validation', () => {
  it('should validate valid Uzbekistan phone number and reject invalid ones', () => {
    const valid = leadFormSchema.safeParse({
      fullName: 'Sardor Rahimiy',
      phone: '+998901234567',
      modelId: 'model-123',
    });
    expect(valid.success).toBe(true);

    const invalid = leadFormSchema.safeParse({
      fullName: 'S',
      phone: '123',
    });
    expect(invalid.success).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/actions/lead.test.ts`  
Expected: FAIL (`leadFormSchema` not defined).

- [ ] **Step 3: Implement validation schema, server action, and UI wizard**

- Implement `leadFormSchema` with phone regex `/^(\+?998)?[0-9]{9}$/`.
- `createTestDriveLeadAction`: Validates form data, saves record to PostgreSQL via Prisma with `status: NEW`, calls `sendTelegramLeadNotification`, revalidates `/admin/leads` path.
- `TestDriveWizard`: 3-step clean progress bar with date-picker and time slots (10:00 - 12:00, 14:00 - 16:00, 16:00 - 18:00), showing immediate success confirmation on submission.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/actions/lead.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/test-drive/ src/components/test-drive/ src/app/actions/ src/lib/validations/ tests/actions/
git commit -m "feat(leads): implement test-drive booking wizard, Zod validation and server action"
```

---

### Task 9: Service, Warranty & Dynamic Contacts Pages

**Files:**
- Create: `src/app/service/page.tsx`
- Create: `src/app/contacts/page.tsx`
- Create: `src/components/contacts/InteractiveMap.tsx`
- Test: `tests/components/contacts.test.ts`

**Interfaces:**
- Consumes: `getSiteSettings()`.
- Produces: Service & Warranty information page (8-year battery warranty, service inquiry form) and Contacts page with zero hardcoded values (address, phones, email, working hours, dynamic map embed).

- [ ] **Step 1: Write test verifying no hardcoded contact fallback values in `tests/components/contacts.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { getContactDisplayInfo } from '@/lib/settings';

describe('Dynamic Contacts Helper', () => {
  it('should correctly format company contact info from settings object', () => {
    const mockSettings = {
      showroom_address: 'Toshkent sh., Yunusobod tumani, 4-mavze',
      primary_phone: '+998712000000',
      working_hours: '09:00 - 20:00',
    };
    const display = getContactDisplayInfo(mockSettings as any);
    expect(display.address).toBe('Toshkent sh., Yunusobod tumani, 4-mavze');
    expect(display.phone).toBe('+998712000000');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/contacts.test.ts`  
Expected: FAIL (`getContactDisplayInfo` not defined).

- [ ] **Step 3: Implement Service and Contacts pages**

- `src/app/service/page.tsx`: Official warranty cards (8 years / 160,000 km battery, 5 years body/motor), charging station types in Uzbekistan (GB/T DC fast charging), and service appointment form.
- `src/app/contacts/page.tsx`: Reads all fields dynamically via `getSiteSettings()`, renders showroom cards, click-to-call phone buttons, social links, and `InteractiveMap` (Yandex / Google map iframe).

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/components/contacts.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/service/ src/app/contacts/ src/components/contacts/ tests/components/contacts.test.ts
git commit -m "feat(pages): implement service warranty page and dynamic contacts page with interactive map"
```

---

### Task 10: Admin Authentication & Dashboard Shell

**Files:**
- Create: `src/app/admin/login/page.tsx`
- Create: `src/app/admin/layout.tsx`
- Create: `src/app/admin/page.tsx`
- Create: `src/middleware.ts`
- Create: `src/lib/auth.ts`
- Test: `tests/admin/auth.test.ts`

**Interfaces:**
- Consumes: `prisma.user`, `JWT_SECRET` environment variable.
- Produces: Protected admin session management, login form with password verification, Next.js route protection middleware, and dashboard summary metrics (total leads, new leads, cars in stock).

- [ ] **Step 1: Write test for password hashing and JWT token verification in `tests/admin/auth.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword, signToken, verifyToken } from '@/lib/auth';

describe('Admin Authentication Utilities', () => {
  it('should hash and verify passwords with bcrypt', async () => {
    const password = 'SuperSecretZeekrPassword2026';
    const hash = await hashPassword(password);
    expect(await verifyPassword(password, hash)).toBe(true);
    expect(await verifyPassword('WrongPassword', hash)).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/admin/auth.test.ts`  
Expected: FAIL (`hashPassword` not defined).

- [ ] **Step 3: Implement auth utilities, middleware, and admin layout**

- Implement `hashPassword`, `verifyPassword`, `signToken`, `verifyToken` in `src/lib/auth.ts`.
- `src/middleware.ts`: Intercepts `/admin/*` (except `/admin/login`); verifies session cookie; redirects unauthenticated visitors to `/admin/login`.
- `src/app/admin/layout.tsx`: High-density sidebar navigation (Arizalar / CRM, Modellar katalogi, Ombordagi mashinalar, Sozlamalar), admin profile dropdown, and logout action.
- `src/app/admin/page.tsx`: Quick statistics cards: Yangi arizalar soni, Jami test-drayvlar, Salondagi mashinalar soni, USD kursi.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/admin/auth.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/auth.ts src/middleware.ts src/app/admin/ tests/admin/auth.test.ts
git commit -m "feat(admin): implement admin authentication, JWT middleware protection and dashboard shell"
```

---

### Task 11: Admin Leads CRM Module

**Files:**
- Create: `src/app/admin/leads/page.tsx`
- Create: `src/components/admin/LeadTable.tsx`
- Create: `src/components/admin/LeadStatusBadge.tsx`
- Create: `src/app/actions/adminLeadActions.ts`
- Test: `tests/admin/leads.test.ts`

**Interfaces:**
- Consumes: `prisma.lead` (joined with `model` and `inventoryItem`).
- Produces: Data table of all customer leads, status filters (`NEW`, `CONTACTED`, `SCHEDULED`, `DEAL_WON`, `CANCELLED`), status transition actions, and manager notes editor.

- [ ] **Step 1: Write test for lead status transition validation in `tests/admin/leads.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { isValidStatusTransition } from '@/lib/lead-workflow';

describe('Lead Status Workflow', () => {
  it('should validate allowed status transitions', () => {
    expect(isValidStatusTransition('NEW', 'CONTACTED')).toBe(true);
    expect(isValidStatusTransition('CONTACTED', 'SCHEDULED')).toBe(true);
    expect(isValidStatusTransition('DEAL_WON', 'NEW')).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/admin/leads.test.ts`  
Expected: FAIL (`isValidStatusTransition` not defined).

- [ ] **Step 3: Implement Leads CRM table and server actions**

- `src/app/admin/leads/page.tsx`: Fetches leads ordered by `createdAt desc`.
- `LeadTable`: Displays client name, phone (with direct `tel:` link and Telegram button), lead type (Test-drayv / Bron / Maslahat), requested car, date, current status dropdown.
- `updateLeadStatusAction`: Updates status in DB, appends manager timestamped note, and revalidates page.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/admin/leads.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/leads/ src/components/admin/LeadTable.tsx src/components/admin/LeadStatusBadge.tsx src/app/actions/adminLeadActions.ts tests/admin/leads.test.ts
git commit -m "feat(admin): implement Leads CRM table with status pipeline and manager notes"
```

---

### Task 12: Admin Car Catalog & Inventory Management

**Files:**
- Create: `src/app/admin/cars/page.tsx`
- Create: `src/app/admin/cars/new/page.tsx`
- Create: `src/app/admin/inventory/page.tsx`
- Create: `src/app/admin/inventory/new/page.tsx`
- Create: `src/app/actions/adminCarActions.ts`
- Test: `tests/admin/cars.test.ts`

**Interfaces:**
- Consumes: `prisma.carModel`, `prisma.carTrim`, `prisma.inventoryItem`.
- Produces: CRUD interfaces to manage Zeekr models, trims, exterior/interior colors, and in-stock inventory items (VIN, color, year, price, status).

- [ ] **Step 1: Write test for car model data validation in `tests/admin/cars.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { carModelFormSchema } from '@/lib/validations/car';

describe('Car Model Admin Validation', () => {
  it('should validate car model specifications', () => {
    const result = carModelFormSchema.safeParse({
      name: 'Zeekr 001',
      slug: 'zeekr-001',
      tagline: 'Shooting brake',
      basePriceUSD: 45000,
      rangeKm: 741,
      acceleration0100: 3.8,
      batteryKwh: 100,
      powerHp: 544,
      topSpeedKmH: 200,
      chargingTimeMin: 15,
      mainImage: '/images/cars/001-main.jpg',
      description: 'Elektr flagman',
    });
    expect(result.success).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/admin/cars.test.ts`  
Expected: FAIL (`carModelFormSchema` not defined).

- [ ] **Step 3: Implement Car Catalog and Inventory Admin interfaces**

- `src/app/admin/cars/page.tsx`: List of models with toggle active/inactive and edit button.
- `src/app/admin/cars/new/page.tsx`: Model editor with technical specs, image URL inputs, and trims configuration.
- `src/app/admin/inventory/page.tsx`: Inventory table with VIN/Stock code, trim name, colors, stock status (`IN_STOCK`, `IN_TRANSIT`, `RESERVED`, `SOLD`), and price.
- `src/app/actions/adminCarActions.ts`: Server actions for create/update/delete operations.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/admin/cars.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/cars/ src/app/admin/inventory/ src/app/actions/adminCarActions.ts tests/admin/cars.test.ts
git commit -m "feat(admin): implement car catalog and stock inventory management CRUD modules"
```

---

### Task 13: Admin Site Settings Management (Zero Hardcoded Data)

**Files:**
- Create: `src/app/admin/settings/page.tsx`
- Create: `src/components/admin/SettingsForm.tsx`
- Create: `src/app/actions/adminSettingsActions.ts`
- Test: `tests/admin/settings.test.ts`

**Interfaces:**
- Consumes: `prisma.setting`, `getSiteSettings()`.
- Produces: Web interface to update showroom address, primary/secondary phones, email, working hours, map URL, social links, exchange rate (USD to UZS), auto loan APR, and Telegram Bot token/chat ID.

- [ ] **Step 1: Write test for settings update validation in `tests/admin/settings.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { settingsFormSchema } from '@/lib/validations/settings';

describe('Admin Settings Form Validation', () => {
  it('should validate exchange rate and loan interest rate ranges', () => {
    const valid = settingsFormSchema.safeParse({
      showroom_address: 'Toshkent sh.',
      primary_phone: '+998712000000',
      usd_to_uzs_rate: 12850,
      default_loan_apr: 22,
    });
    expect(valid.success).toBe(true);

    const invalid = settingsFormSchema.safeParse({
      usd_to_uzs_rate: -5,
      default_loan_apr: 150,
    });
    expect(invalid.success).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/admin/settings.test.ts`  
Expected: FAIL (`settingsFormSchema` not defined).

- [ ] **Step 3: Implement Settings Form and Server Action**

- `src/app/admin/settings/page.tsx`: Organized tabbed or grouped settings form:
  1. **Showroom & Kontaktlar:** Manzil, asosiy telefon, qo'shimcha telefon, email, ish vaqti, xarita ssilkasi/kodi.
  2. **Ijtimoiy Tarmoqlar:** Telegram kanal, Instagram, YouTube havolalari.
  3. **Moliya & Narxlar:** USD kursi (UZS bo'yicha), Yillik kredit stavkasi (%).
  4. **Telegram Xabarnomalar:** Bot Token va Menejerlar Guruhi Chat ID'si.
- `updateSettingsAction`: Upserts settings in `Setting` table, calls `revalidatePath('/', 'layout')` so the public site reflects changed address/phones instantly without redeploying.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/admin/settings.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/settings/ src/components/admin/SettingsForm.tsx src/app/actions/adminSettingsActions.ts tests/admin/settings.test.ts
git commit -m "feat(admin): implement dynamic site settings management module for contacts, financial and bot settings"
```

---

### Task 14: Vercel Production Build, Verification & Deploy Preparation

**Files:**
- Create: `vercel.json`
- Modify: `package.json` (build script: `prisma generate && next build`)
- Modify: `README.md` (environment variables guide, seed guide, deploy checklist)
- Test: `tests/build/production.test.ts`

**Interfaces:**
- Consumes: All project files, `deploy-to-vercel` skill requirements.
- Produces: Production-ready Next.js build bundle, validated environment variable checklist, zero lint/type errors, verified Vercel configuration.

- [ ] **Step 1: Write production bundle verification test in `tests/build/production.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Production Readiness & Vercel Configuration', () => {
  it('should have vercel.json or valid package.json scripts with prisma generate', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8'));
    expect(pkg.scripts.build).toContain('prisma generate');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/build/production.test.ts`  
Expected: FAIL (`pkg.scripts.build` does not contain `prisma generate`).

- [ ] **Step 3: Configure build scripts, `vercel.json`, and deployment documentation**

- Update `package.json`: `"build": "prisma generate && next build"`.
- Configure `vercel.json` if custom headers or region preferences (e.g. `fra1` or `sin1` for optimal Central Asia routing) are desired.
- Provide `.env.example` with exact variable documentation (`DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`).
- Run full typecheck and build command: `npx tsc --noEmit && npm run build`.

- [ ] **Step 4: Run all test suites across the project**

Run: `npx vitest run`  
Expected: ALL PASS.

- [ ] **Step 5: Commit**

```bash
git add vercel.json package.json README.md .env.example tests/build/
git commit -m "chore(deploy): prepare production build configuration and environment variables for Vercel deployment"
```

---
*(Implementation Plan End)*

