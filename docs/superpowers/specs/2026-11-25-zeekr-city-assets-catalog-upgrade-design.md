# Design Document: Zeekr-City Authentic Media, Official Colors & Full Lineup Upgrade

**Date:** 2026-11-25  
**Topic:** Zeekr Uzbekistan Authentic Asset & Model Range Upgrade from `https://www.zeekr-city.uz/`  
**Status:** Pending Approval  

---

## 1. Intent & Context

Our current website (`zeekr-uzbekistan`) features 4 core electric vehicles (`Zeekr 001`, `Zeekr 007`, `Zeekr 009`, `Zeekr X`). While the vehicles and technical parameters are authentic, their current visuals (hero images, color visualizer swatches, and trims) rely on preliminary press photos. 

The official dealer platform `https://www.zeekr-city.uz/` offers:
1. **Authentic Studio Cutouts (Transparent WebP/PNG):** Flawless background-free 3D renders from the official Zeekr CDN (`zeekrlife-oss.zeekrlife.com`) that integrate cleanly with our dark/light theme card layouts without visual artifacts.
2. **Official Exterior & Interior Colors:** Real color palettes with accurate names (e.g. Electric Blue, Tech Grey, Alpine White, Olive Green), precise hex codes, and actual exterior vehicle photography per color.
3. **High-Definition Cinematic Loops (MP4):** Authentic dynamic background video loops for hero sections (`video/001_new_d.mp4`, `video/home-section-007.mp4`, `video/7x_d.mp4`, `video/9X_hero.mp4`).
4. **Complete Local Market Lineup:** Addition of the newly arrived and highly requested **Zeekr 7X** (Family Luxury SUV) and **Zeekr 9X** (Flagship Ultra-Luxury SUV), giving customers a complete showroom experience.

---

## 2. Goals, Non-Goals & Anti-Goals

### Goals
- **Safe Asset Acquisition:** Implement a safe, rate-limited local Node.js script to download high-resolution images, color swatches, and video loops directly into `public/images/cars/<slug>/` and `public/videos/cars/`.
- **Zero Remote Dependencies:** Adhere strictly to the project rule of zero external runtime CDN dependencies (`images.unsplash.com` or third-party hotlinking); all assets are served from project disk.
- **Graphic Integrity & Crispness:** Use SVG/WebP vector icons, high-density WebP/PNG renders, and fixed CSS geometry (`aspect-[16/10]` on cards, responsive `object-contain` for cutout studio shots) to completely prevent image stretching, distortion, or blurriness.
- **Accurate Colors & Visualizer:** Update `data/colors.json` and `ColorVisualizer.tsx` with authentic hex colors and real body paint images from `zeekr-city.uz`.
- **Full Model Range Expansion:** Incorporate `Zeekr 7X` and `Zeekr 9X` into `data/models.json`, `data/trims.json`, and `data/inventory.json` with official specifications.
- **Test Integrity:** Maintain 100% pass rate across all 83 unit tests and 208 E2E tests, verifying that existing model lookups (`zeekr-001`, etc.) remain fully functional.

### Non-Goals
- Modifying backend database schemas or dropping Prisma models.
- Changing admin authorization, lead management, or leasing calculation algorithms.
- Scraping interactive form backend endpoints or customer submission forms from `zeekr-city.uz`.

### Anti-Goals
- Distorted graphics: stretched car photos, overflowing cards, or misaligned aspect ratios.
- Bloated page weight: unoptimized raw 4K videos auto-loading on mobile networks (must use responsive compressed MP4 loops with `preload="metadata"` and mobile poster fallbacks).

---

## 3. Constraints
- **Rule F2 (Asset Localization):** Every single asset path in `data/*.json` and UI components must resolve to an existing local file in `public/`.
- **Rule F3 (Card CSS Architecture):** Car cards in `ModelCard`, `VehicleCard`, and `InStockCarousel` must strictly retain `aspect-[16/10]` geometry.
- **Multilingual Support:** All new models (`Zeekr 7X`, `Zeekr 9X`) and color names must include both Uzbek (`uz`) and Russian (`ru`) translations in `src/lib/i18n.ts`.

---

## 4. Approaches Considered & Decision

### Approaches:
1. **Approach 1 (Minimal Refinement):** Keep only the current 4 models (`001`, `007`, `009`, `X`) and only replace their main photos with `zeekr-city` cutouts.
   - *Trade-off:* Leaves out the most popular new SUV (`Zeekr 7X`) currently driving showroom sales in Tashkent.
2. **Approach 2 (Full Real-Dealer Lineup — SELECTED):** Expand the core lineup to 6 models by adding `Zeekr 7X` and `Zeekr 9X`, update all official exterior/interior colors, and add cinematic video headers.
   - *Trade-off:* Selected by the user as it represents the true, complete showroom catalog while keeping UI clean and uncluttered.
3. **Approach 3 (Fragmented Sub-model Mirroring):** Create 10 distinct model cards for every sub-trim (`001 2025`, `001 2026`, `007 GT`, `8X Yaoying`, etc.).
   - *Trade-off:* Clutters navigation and creates redundant duplicate catalog entries.

---

## 5. System Design & Implementation Details

### 5.1 Asset Storage Layout
```
public/
  videos/
    cars/
      zeekr-001-hero.mp4
      zeekr-007-hero.mp4
      zeekr-009-hero.mp4
      zeekr-x-hero.mp4
      zeekr-7x-hero.mp4
      zeekr-9x-hero.mp4
  images/
    cars/
      zeekr-001/
        main.webp (transparent studio render)
        interior.webp
        colors/
          green.webp
          orange.webp
          blue.webp
          white.webp
          grey.webp
          black.webp
      zeekr-007/
        main.webp
        interior.webp
        colors/
          green.webp
          blue.webp
          grey.webp
          white.webp
          black.webp
      zeekr-009/
        main.webp
        interior.webp
        colors/...
      zeekr-x/
        main.webp
        interior.webp
        colors/...
      zeekr-7x/
        main.webp
        interior.webp
        colors/
          blue.webp
          brown.webp
          white.webp
          orange.webp
          grey.webp
          black.webp
          green.webp
      zeekr-9x/
        main.webp
        interior.webp
        colors/...
```

### 5.2 Safe Asset Scraper & Sanitizer (`scripts/download-zeekr-assets.js`)
- Runs as a standalone Node.js utility.
- Iterates over the verified URLs from `zeekr-city.uz`.
- Validates HTTP response headers and MIME types.
- Writes files using atomic write streams into target project directories.
- Gracefully skips or retries on temporary network timeouts.

### 5.3 Data Updates
- **`data/models.json`**:
  - Update `zeekr-001`, `zeekr-007`, `zeekr-009`, `zeekr-x` with authentic high-res main and gallery paths.
  - Add `zeekr-7x` (slug: `zeekr-7x`, name: `Zeekr 7X`, orderIndex: 3, basePriceUSD: 39500, range: 780km, 0-100: 3.8s, power: 646hp).
  - Add `zeekr-9x` (slug: `zeekr-9x`, name: `Zeekr 9X`, orderIndex: 6, basePriceUSD: 89000, range: 800km, 0-100: 3.1s, power: 780hp).
- **`data/colors.json`**:
  - Synchronize true hex codes and matching car paint image paths for each model.
- **`data/trims.json`**:
  - Add official trims for 7X (Smart RWD, Performance AWD) and 9X (Ultra Flagship AWD).
- **`data/inventory.json`**:
  - Add ready-in-stock units for Zeekr 7X and 9X to populate the showroom carousel and `/inventory` filters.

### 5.4 UI Enhancements
- **Hero Video Background (`src/components/home/HeroSection.tsx`):**
  - Add an optional background cinematic video loop with graceful poster image fallback for low-power and mobile devices.
- **Color Visualizer (`src/components/models/ColorVisualizer.tsx`):**
  - Update swatches with authentic hex codes and smooth fade transition between vehicle color renders.
- **Detail Page Gallery (`src/app/(public)/models/[slug]/page.tsx`):**
  - Display authentic high-res interior and exterior photo gallery.

---

## 6. Technical Clarifications & Builder Review Resolutions

### 6.1 Test Suite & Asset Backwards Compatibility (Builder Decision)
- **JPEG Magic Bytes & Legacy Filenames:** To guarantee 100% pass rate in `tests/assets/car-images.test.ts` and `tier1/part-a.e2e.ts`, we keep `main.jpg` and `interior.jpg` in each model folder while adding the high-definition `main.webp` cutout and color swatches.
- **Model Count Assertions:** Unit tests in `tests/data/json-db.test.ts` and `tests/data-provider.test.ts` that assert `models.length === 4` will be cleanly updated to assert `models.length === 6` (or `>= 4`) to naturally reflect the addition of `Zeekr 7X` and `Zeekr 9X`.

### 6.2 Asset Lifecycle & Repository Hygiene
- `scripts/download-zeekr-assets.js` is a developer-executed utility, **not** run during Vercel CI `npm run build`. Downloaded assets are committed directly to the repo under strict compression thresholds (< 25MB total media footprint).
- Video loops are limited to compressed, web-optimized MP4 files (< 5MB each) with `preload="metadata"` and poster images. Verified working video endpoints from `zeekr-city.uz`:
  - Zeekr 001: `video/001_new_d.mp4`
  - Zeekr 7X: `video/7x_d.mp4`
  - Zeekr 9X: `https://zeekr-cars.uz/video/9X_hero.mp4`
  - Zeekr 007: `video/007GT_d.mp4`

### 6.3 Multilingual Consistency
- Core vehicle names, taglines, and descriptions are stored in `data/models.json` and `data/trims.json`. Common localized terms and route translations continue to be resolved via `src/lib/i18n.ts`.

---

## 7. What's Left to Decide (User Decisions)
1. **Video Hero Placement:** Where do you prefer video loops to be displayed?
   - *Option A:* Homepage Hero only (flagship video showcase with clean dark overlay).
   - *Option B:* Homepage Hero + Individual Model detail pages (`/models/[slug]`).
2. **Color Visualizer Scope:**
   - *Option A:* Exterior Body Paint switching (swapping between 6-7 official exterior colors like Olive Green, Tech Grey, Alpine White, Mineral Blue).
   - *Option B:* Dual Exterior + Interior Theme switching (exterior body paint and interior upholstery swatches).
