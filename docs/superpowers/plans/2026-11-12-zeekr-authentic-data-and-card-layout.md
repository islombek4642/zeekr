# Zeekr Authentic Data, Local Image Assets & Uniform Card Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Begona avtomobil rasmlarini haqiqiy Zeekr rasmlariga almashtirib `public/images/cars/` ga saqlash, kartochkalar o'lchami har qanday rasm o'lchamida buzilmasligi uchun qat'iy CSS aspect-ratio va flex arxitekturasini joriy etish, hamda `data/*.json` fayllarini rasmiy Zeekr xarakteristikalari bilan to'liq yangilash.

**Spec:** [docs/superpowers/specs/2026-11-12-zeekr-authentic-data-and-card-layout-design.md](file:///c:/ZEEKR/docs/superpowers/specs/2026-11-12-zeekr-authentic-data-and-card-layout-design.md)

---

### Task 1: Download and Organize Real Zeekr Images in `public/images/cars/`

**Files:**
- Create: `public/images/cars/zeekr-001/main.jpg`, `interior.jpg`
- Create: `public/images/cars/zeekr-007/main.jpg`, `interior.jpg`
- Create: `public/images/cars/zeekr-009/main.jpg`, `interior.jpg`
- Create: `public/images/cars/zeekr-x/main.jpg`, `interior.jpg`
- Test: `tests/assets/car-images.test.ts`

- [ ] **Step 1: Write test verifying local car image assets exist and are valid non-empty files**
- [ ] **Step 2: Download verified Zeekr images into the respective model directories**
- [ ] **Step 3: Run test to confirm all images exist**
- [ ] **Step 4: Commit**

---

### Task 2: Update JSON Database with Authentic Zeekr Specs & Local Paths

**Files:**
- Modify: `data/models.json`
- Modify: `data/trims.json`
- Modify: `data/colors.json`
- Modify: `data/inventory.json`
- Test: `tests/data/json-db.test.ts`

- [ ] **Step 1: Update `data/models.json` with verified specs and `/images/cars/...` local image paths**
- [ ] **Step 2: Update `data/trims.json` and `data/colors.json` with authentic configurations**
- [ ] **Step 3: Update `data/inventory.json` with local image paths and realistic showroom data**
- [ ] **Step 4: Run test `npx vitest run tests/data/json-db.test.ts` to verify data consistency**
- [ ] **Step 5: Commit**

---

### Task 3: Enforce Uniform Card Geometry Across All Vehicle Card Components

**Files:**
- Modify: `src/components/home/InStockCarousel.tsx`
- Modify: `src/components/home/ModelShowcase.tsx`
- Modify: `src/components/inventory/VehicleCard.tsx`
- Test: `tests/components/card-layout.test.ts`

- [ ] **Step 1: Write test verifying card container structure (aspect-ratio, absolute inset-0, shrink-0)**
- [ ] **Step 2: Refactor `InStockCarousel.tsx` with rigid `aspect-[16/10] overflow-hidden` and `absolute inset-0 object-cover`**
- [ ] **Step 3: Refactor `ModelShowcase.tsx` and `VehicleCard.tsx` with the same uniform pattern**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

---

### Task 4: Full Verification, Re-seed & TypeScript Typecheck

**Files:**
- Run: `npm run prisma:seed`
- Test: All tests (`npx vitest run`)
- Check: `npx tsc --noEmit`

- [ ] **Step 1: Run full test suite and TypeScript check**
- [ ] **Step 2: Run seed script to update database from JSON**
- [ ] **Step 3: Final commit**
