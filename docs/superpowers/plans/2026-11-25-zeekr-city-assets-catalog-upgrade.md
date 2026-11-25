# Zeekr-City Authentic Media, Official Colors & Full Lineup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade Zeekr Uzbekistan with authentic assets from `https://www.zeekr-city.uz/` by adding the full 6-model lineup (including Zeekr 7X and 9X), dual exterior/interior color visualizer palettes, transparent studio renders, and cinematic video loops.

**Architecture:** A standalone scraper script downloads and organizes official dealer assets locally into `public/images/cars/<slug>/` and `public/videos/cars/`. Static datasets (`data/*.json`) are synchronized with official specs, trims, and colors. Next.js server components and client visualizers (`HeroSection`, `ColorVisualizer`, `ModelDetailPage`) render the enhanced media with strict aspect ratios and non-distorting containers.

**Tech Stack:** Next.js 15, React 19, TypeScript 5, Tailwind CSS, Vitest 3.

**Spec:** [docs/superpowers/specs/2026-11-25-zeekr-city-assets-catalog-upgrade-design.md](file:///c:/zeekr/docs/superpowers/specs/2026-11-25-zeekr-city-assets-catalog-upgrade-design.md)

## Global Constraints
- Rule F2: Every image and video path must resolve to a valid local file in `public/` (zero remote CDN hotlinking).
- Rule F3: Catalog and inventory vehicle cards must strictly adhere to `aspect-[16/10]`.
- Legacy Compatibility: `main.jpg` and `interior.jpg` must remain present in each model's directory with valid JPEG headers to keep legacy test suites passing.
- Video Optimization: All background video tags must include `autoPlay muted loop playsInline preload="metadata"` and provide a static poster image.

## Review Focus
1. Slow/Mobile Network Video Blocking: Browser autoplay restrictions or slow networks must gracefully show poster image without layout shifts.
2. In-Memory Mock Model Count: Adding 7X and 9X changes `models.length` from 4 to 6, requiring deliberate updates in test assertions.
3. Transparent Studio Render Backgrounds: PNG/WebP cutout renders must use `object-contain` with clean padding so dark/light themes render crisp without pixelation.
4. Color Visualizer Active State: Switching between "Tashqi rang" (Exterior) and "Salon" (Interior) must accurately bind the active photo and hex badge without state conflicts.
5. Zero Missing Asset 404s: Every entry in `data/models.json` and `data/colors.json` must map to an existing local file on disk.

---

### Task 1: Safe Asset Acquisition Script & Local Directory Scaffolding

**Files:**
- Create: `scripts/download-zeekr-assets.js`
- Create: `public/videos/cars/`
- Create: `public/images/cars/zeekr-7x/`
- Create: `public/images/cars/zeekr-9x/`
- Test: `tests/assets/zeekr-city-assets.test.ts`

**Interfaces:**
- Consumes: Verified URLs from `https://www.zeekr-city.uz/` and `zeekrlife-oss.zeekrlife.com`.
- Produces: Local media files in `public/images/cars/<slug>/` and `public/videos/cars/`.

- [ ] **Step 1: Write test asserting asset existence and format**

Create `tests/assets/zeekr-city-assets.test.ts`:
```ts
import fs from 'fs';
import path from 'path';
import { describe, it, expect } from 'vitest';

describe('Zeekr City Authentic Assets', () => {
  const models = ['zeekr-001', 'zeekr-007', 'zeekr-009', 'zeekr-x', 'zeekr-7x', 'zeekr-9x'];

  it('contains main studio cutout and interior photos for all 6 models', () => {
    for (const m of models) {
      const dir = path.join(process.cwd(), 'public/images/cars', m);
      expect(fs.existsSync(dir), `Missing dir for ${m}`).toBe(true);
      expect(fs.existsSync(path.join(dir, 'main.jpg')) || fs.existsSync(path.join(dir, 'main.webp'))).toBe(true);
      expect(fs.existsSync(path.join(dir, 'interior.jpg')) || fs.existsSync(path.join(dir, 'interior.webp'))).toBe(true);
    }
  });

  it('contains web-optimized mp4 video loops for hero and model pages', () => {
    const videoDir = path.join(process.cwd(), 'public/videos/cars');
    expect(fs.existsSync(videoDir)).toBe(true);
    const videos = fs.readdirSync(videoDir).filter(f => f.endsWith('.mp4'));
    expect(videos.length).toBeGreaterThanOrEqual(4);
  });
});
```

- [ ] **Step 2: Run test to verify it fails initially**

Run: `npx vitest run tests/assets/zeekr-city-assets.test.ts`  
Expected: FAIL (missing `zeekr-7x`, `zeekr-9x`, and `public/videos/cars`).

- [ ] **Step 3: Implement downloader script and fetch assets**

Create `scripts/download-zeekr-assets.js`:
- Fetch and save transparent studio renders for Zeekr 001, 007, 009, X, 7X, 9X.
- Fetch exterior color swatches (`001-new-colors/`, `007-colors/`, `7x/`, `9x/`).
- Fetch interior color swatches (`009_int_6_*.webp`, `7x/i-*.webp`, `9x-int-*.webp`, `interior-theme-x-*.jpg`).
- Fetch video loops (`video/001_new_d.mp4`, `video/007GT_d.mp4`, `video/7x_d.mp4`, `https://zeekr-cars.uz/video/9X_hero.mp4`).
- Ensure `main.jpg` and `interior.jpg` exist in each directory for backward compatibility.
Run: `node scripts/download-zeekr-assets.js`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/assets/zeekr-city-assets.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/download-zeekr-assets.js tests/assets/zeekr-city-assets.test.ts public/images/cars public/videos/cars
git commit -m "feat(assets): download and scaffold authentic zeekr-city images, colors and videos"
```

---

### Task 2: Data Expansion for Full 6-Model Range (`models.json`, `trims.json`, `inventory.json`)

**Files:**
- Modify: `data/models.json`
- Modify: `data/trims.json`
- Modify: `data/inventory.json`
- Modify: `tests/data/json-db.test.ts`
- Modify: `tests/data-provider.test.ts`

**Interfaces:**
- Consumes: Downloaded asset paths and specs from `zeekr-city.uz`.
- Produces: 6 active models with associated trims and in-stock units.

- [ ] **Step 1: Write test updates for 6 models**

Update `tests/data/json-db.test.ts`:
Change `expect(models.length).toBe(4)` to `expect(models.length).toBe(6)`.
Update `tests/data-provider.test.ts`:
Change `expect(models.length).toBe(4)` to `expect(models.length).toBe(6)`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/data/json-db.test.ts tests/data-provider.test.ts`  
Expected: FAIL (`expected 4 to be 6`).

- [ ] **Step 3: Update `data/models.json`, `data/trims.json`, and `data/inventory.json`**

1. In `data/models.json`:
   - Add `zeekr-7x` (slug: `zeekr-7x`, name: `Zeekr 7X`, orderIndex: 3, basePriceUSD: 39500, rangeKm: 780, acceleration0100: 3.8, powerHp: 646).
   - Add `zeekr-9x` (slug: `zeekr-9x`, name: `Zeekr 9X`, orderIndex: 6, basePriceUSD: 89000, rangeKm: 800, acceleration0100: 3.1, powerHp: 780).
2. In `data/trims.json`:
   - Add trims for `zeekr-7x` (Smart RWD, Performance AWD).
   - Add trims for `zeekr-9x` (Ultra Flagship AWD).
3. In `data/inventory.json`:
   - Add in-stock ready units for `zeekr-7x` (VIN: `ZEEKR7X-UZ-2026-005`) and `zeekr-9x` (VIN: `ZEEKR9X-UZ-2026-006`).

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/data/json-db.test.ts tests/data-provider.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add data/models.json data/trims.json data/inventory.json tests/data/json-db.test.ts tests/data-provider.test.ts
git commit -m "feat(data): expand catalog to 6 authentic models including Zeekr 7X and 9X"
```

---

### Task 3: Dual Color Palettes & Visualizer Expansion (`data/colors.json`, `ColorVisualizer.tsx`)

**Files:**
- Modify: `data/colors.json`
- Modify: `src/components/models/ColorVisualizer.tsx`
- Test: `tests/components/color-visualizer.test.ts`

**Interfaces:**
- Consumes: Exterior and interior color entries (`type: 'EXTERIOR' | 'INTERIOR'`).
- Produces: Dual-tab color visualizer component.

- [ ] **Step 1: Write test for dual exterior and interior color visualizer**

Create `tests/components/color-visualizer.test.ts`:
```tsx
import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderComponentHtml } from '../e2e/helpers/http-client';
import { ColorVisualizer } from '@/components/models/ColorVisualizer';

describe('ColorVisualizer Dual Mode', () => {
  const sampleColors = [
    { id: 'c1', modelSlug: 'zeekr-001', name: 'Polar White', hex: '#FFFFFF', imageUrl: '/images/cars/zeekr-001/colors/white.webp', type: 'EXTERIOR' },
    { id: 'c2', modelSlug: 'zeekr-001', name: 'Dark & Green', hex: '#24292B', imageUrl: '/images/cars/zeekr-001/interior.webp', type: 'INTERIOR' },
  ];

  it('renders both exterior and interior tabs and color swatches', () => {
    const html = renderComponentHtml(
      React.createElement(ColorVisualizer, {
        colors: sampleColors as any,
        modelName: 'Zeekr 001',
      })
    );
    expect(html).toContain('Tashqi');
    expect(html).toContain('Interyer');
    expect(html).toContain('Polar White');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/color-visualizer.test.ts`  
Expected: FAIL (missing tabs or type differentiation).

- [ ] **Step 3: Implement dual exterior/interior switching in `ColorVisualizer.tsx` and populate `data/colors.json`**

1. Update `data/colors.json` with authentic exterior paint colors (hex + path) and interior themes (hex + path) for all 6 models.
2. In `ColorVisualizer.tsx`:
   - Add tab selector: "Kuzov rangi" (Exterior) vs "Salon / Interyer" (Interior).
   - Display active color name, hex swatch button, and smooth fade preview image.
   - Retain `object-contain` and standard aspect ratio to prevent image distortion.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/components/color-visualizer.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add data/colors.json src/components/models/ColorVisualizer.tsx tests/components/color-visualizer.test.ts
git commit -m "feat(ui): implement dual exterior and interior color visualizer with authentic colors"
```

---

### Task 4: Cinematic Video Hero on Homepage & Model Detail Pages

**Files:**
- Modify: `src/components/home/HeroSection.tsx`
- Modify: `src/app/(public)/models/[slug]/page.tsx`
- Test: `tests/components/hero-video.test.ts`

**Interfaces:**
- Consumes: Local MP4 video assets in `public/videos/cars/`.
- Produces: Smooth background video player on `/` and `/models/[slug]`.

- [ ] **Step 1: Write test for video background rendering**

Create `tests/components/hero-video.test.ts`:
```tsx
import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderComponentHtml } from '../e2e/helpers/http-client';
import { HeroSection } from '@/components/home/HeroSection';

describe('HeroSection Video Loop', () => {
  it('renders a background video tag with autoplay, muted, loop and poster fallback', () => {
    const html = renderComponentHtml(React.createElement(HeroSection));
    expect(html).toContain('<video');
    expect(html).toContain('autoplay');
    expect(html).toContain('muted');
    expect(html).toContain('loop');
    expect(html).toContain('.mp4');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/hero-video.test.ts`  
Expected: FAIL (no `<video>` tag currently in `HeroSection`).

- [ ] **Step 3: Implement video player in `HeroSection.tsx` and `models/[slug]/page.tsx`**

1. In `src/components/home/HeroSection.tsx`:
   - Embed background `<video autoPlay muted loop playsInline preload="metadata" poster="/images/cars/zeekr-001/main.webp">`.
   - Add gradient overlay for text readability and high contrast.
2. In `src/app/(public)/models/[slug]/page.tsx`:
   - If model has a matching video in `public/videos/cars/`, display video hero showcase section with play/pause or muted loop.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/components/hero-video.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/home/HeroSection.tsx src/app/\(public\)/models/\[slug\]/page.tsx tests/components/hero-video.test.ts
git commit -m "feat(ui): add cinematic video background to homepage and model detail pages"
```

---

### Task 5: Full Verification & Production Build Validation

**Files:**
- Tests: All test files (`tests/**/*.test.ts`, `tests/e2e/**/*.e2e.ts`)

- [ ] **Step 1: Run complete test suite**

Run: `npm test`  
Expected: 83+ passing unit tests.

Run: `npx vitest run tests/e2e/ --config tests/e2e/vitest.e2e.config.ts`  
Expected: All 208 E2E tests passing.

- [ ] **Step 2: Run TypeScript and ESLint checks**

Run: `npx tsc --noEmit`  
Expected: 0 errors.

Run: `node node_modules/eslint/bin/eslint.js src/`  
Expected: 0 errors.

- [ ] **Step 3: Run production build**

Run: `npm run build`  
Expected: Exit code 0, all static and dynamic pages generated.

- [ ] **Step 4: Commit and push to main**

```bash
git add -A
git commit -m "chore: complete authentic zeekr-city asset upgrade and verify production build" --author="islombek4642 <islombek4642@users.noreply.github.com>"
git push origin main
```
