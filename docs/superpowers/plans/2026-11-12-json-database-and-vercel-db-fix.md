# JSON Database & Vercel Prisma Postgres Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prisma Postgres'dagi ma'lumotlar ko'rinmaslik sababini (`DIRECT_URL` xatoligi va Vercel env mapping) to'liq tuzatish, loyiha ildizida `data/` papkasida 6 ta kategoriyalangan JSON baza faylini yaratish, `prisma/seed.ts` ni JSON'dan o'qiydigan qilish, kod ichidagi barcha hardcoded massivlarni tozalash hamda Admin panelga 1-klikli bazani sinxronlash/seed qilish imkoniyatini qo'shish.

**Architecture:** 
1. `prisma/schema.prisma` dan majburiy `directUrl` talabi olib tashlanadi va `scripts/db-deploy.js` da `POSTGRES_PRISMA_URL`, `POSTGRES_URL`, `DATABASE_URL` avtomatik xaritaga solinadi.
2. `data/` papkasida toza JSON baza: `models.json`, `trims.json`, `colors.json`, `inventory.json`, `settings.json`, `technologies.json`.
3. `prisma/seed.ts` to'liq ushbu JSON fayllardan o'qiydi (kodda 0 ta hardcode obyekt).
4. `src/lib/data-provider.ts` orqali yagona o'qish qatlami: Prisma Postgres'dan ma'lumotlarni oladi, agar baza bo'sh bo'lsa JSON fayllardan foydalanadi (`FALLBACK_MODELS` o'chiriladi).
5. `/api/admin/seed` endpointi va `/admin/settings` sahifasida "Bazani to'ldirish (Seed DB)" tugmasi yaratiladi.

**Tech Stack:** Next.js 15, Prisma 6, PostgreSQL, TypeScript, Vitest, Vercel.

**Spec:** [docs/superpowers/specs/2026-11-12-json-database-refactor-design.md](file:///c:/ZEEKR/docs/superpowers/specs/2026-11-12-json-database-refactor-design.md)

## Global Constraints

- **Zero Hardcoded Data:** Hech qanday mashina parametrlari, komplektatsiyalari, ranglari, texnologiya kartalari yoki kontaktlar kod ichida statik massiv sifatida yozilmaydi.
- **Vercel DB Reliability:** `scripts/db-deploy.js` va Prisma ulanishi Vercel'da mavjud bo'lgan har qanday PostgreSQL o'zgaruvchisida (`DATABASE_URL`, `POSTGRES_PRISMA_URL`, `POSTGRES_URL`) xatosiz ishlashi shart.
- **Backwards Compatibility:** Mavjud 40 ta testning barchasi yashil (`PASS`) holatda qolishi kerak.

---

### Task 1: Fix Prisma Schema & Vercel DB Deploy Script

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `scripts/db-deploy.js`
- Test: `tests/db/schema.test.ts`

- [ ] **Step 1: Write test verifying schema compiles without DIRECT_URL**
- [ ] **Step 2: Modify `prisma/schema.prisma` to remove mandatory directUrl and update `scripts/db-deploy.js` with auto-fallback**
- [ ] **Step 3: Run prisma generate and verify tests pass**
- [ ] **Step 4: Commit**

---

### Task 2: Create Categorized JSON Database (`data/` Directory)

**Files:**
- Create: `data/models.json`
- Create: `data/trims.json`
- Create: `data/colors.json`
- Create: `data/inventory.json`
- Create: `data/settings.json`
- Create: `data/technologies.json`
- Test: `tests/data/json-db.test.ts`

- [ ] **Step 1: Write test validating all 6 JSON database files structure and completeness**
- [ ] **Step 2: Create all 6 categorized JSON files with full Zeekr dataset**
- [ ] **Step 3: Run test to verify it passes**
- [ ] **Step 4: Commit**

---

### Task 3: Refactor `prisma/seed.ts` to Consume JSON Database

**Files:**
- Modify: `prisma/seed.ts`
- Test: `tests/db/seed.test.ts`

- [ ] **Step 1: Write test verifying seed function imports and parses JSON data correctly**
- [ ] **Step 2: Refactor `prisma/seed.ts` to read directly from `data/*.json`**
- [ ] **Step 3: Run test and verify it passes**
- [ ] **Step 4: Commit**

---

### Task 4: Create Centralized Data Provider & Remove Code Hardcodes

**Files:**
- Create: `src/lib/data-provider.ts`
- Modify: `src/app/(public)/page.tsx`
- Modify: `src/lib/settings.ts`
- Modify: `src/components/home/TechnologySection.tsx`
- Test: `tests/data-provider.test.ts`

- [ ] **Step 1: Write test for data-provider loading models, settings and technologies from DB or JSON**
- [ ] **Step 2: Implement `src/lib/data-provider.ts`**
- [ ] **Step 3: Remove `FALLBACK_MODELS` from `src/app/(public)/page.tsx` and use `data-provider`**
- [ ] **Step 4: Update `TechnologySection.tsx` and `settings.ts` to read from JSON**
- [ ] **Step 5: Run tests to verify they pass**
- [ ] **Step 6: Commit**

---

### Task 5: One-Click Admin Database Seed Endpoint & UI Button

**Files:**
- Create: `src/app/api/admin/seed/route.ts`
- Modify: `src/components/admin/SettingsForm.tsx`
- Test: `tests/admin/seed-api.test.ts`

- [ ] **Step 1: Write test for seed API endpoint authentication and response**
- [ ] **Step 2: Implement `/api/admin/seed` route that runs seed from JSON data**
- [ ] **Step 3: Add "Bazani to'ldirish (Prisma Seed)" button to `/admin/settings`**
- [ ] **Step 4: Run tests to verify they pass**
- [ ] **Step 5: Commit**

---

### Task 6: Full Verification, Typecheck, and Push to GitHub

**Files:**
- All project files
- Modify: `README.md`
- Modify: `AGENT_HANDOFF.md`

- [ ] **Step 1: Run full test suite (`npx vitest run`) and TypeScript check (`npx tsc --noEmit`)**
- [ ] **Step 2: Update documentation**
- [ ] **Step 3: Push changes to GitHub `main` branch**

