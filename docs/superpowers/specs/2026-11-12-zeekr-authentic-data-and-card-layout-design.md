# Zeekr Authentic Data, Local Image Assets & Uniform Card Layout Design

**Date:** 2026-11-12  
**Status:** Approved by User (Approach B)

---

## 1. Context & Motivation

In the live Vercel deployment of Zeekr Uzbekistan, several UI and data issues were identified:
1. **Broken Card Grid / Vertical Stretching:** When an image with a vertical (portrait) aspect ratio was rendered in `InStockCarousel` or `VehicleCard`, the image container expanded downward without constraint, making the third card twice as tall as adjacent cards, pushing prices and CTA buttons down and introducing large vertical whitespace.
2. **Incorrect Vehicle Photos:** Unsplash placeholders displaying Chevrolet Camaro, Porsche Panamera, and BMW were shown instead of real Zeekr vehicles.
3. **Specification Verification:** Vehicle technical specifications in `data/*.json` required synchronization with official Zeekr specifications (0-100 km/h, range CLTC/WLTP, battery kWh, power kW/hp).

---

## 2. Goals & Anti-Goals

### Goals
- **Uniform Card Geometry (Zero Layout Shift):** All car cards (`InStockCarousel`, `ModelShowcase`, `VehicleCard`) must maintain an identical, rigid height and aspect ratio (`16/10`) regardless of the source image aspect ratio or resolution.
- **Local Orderly Image Storage:** Store genuine, high-resolution Zeekr photos directly in the project under `public/images/cars/[model-slug]/` (e.g., `main.webp` or `main.jpg`, `gallery-1`, `interior`).
- **100% Authentic Zeekr Data:** Populate `data/models.json`, `data/trims.json`, `data/colors.json`, and `data/inventory.json` with verified specifications from official Zeekr sources.
- **Resilient Fallback & Image Error Handling:** If any image fails to load, gracefully display a clean SVG placeholder without breaking layout.
- **Preserve 100% Test Pass Rate:** Keep all 50 existing tests passing, plus add tests for image existence, spec validity, and component card structure.

### Anti-Goals
- No reliance on external third-party image hosting (e.g. random Unsplash IDs) that can change or display non-Zeekr vehicles.
- No dynamic JavaScript height calculations where CSS flexbox / aspect-ratio solves the issue natively.

---

## 3. Approaches Considered

- **Approach A (CSS only):** Fix `aspect-ratio` in CSS while leaving external Unsplash links intact.  
  *Rejected:* Leaves fake non-Zeekr cars on the website, violating the core requirement.
- **Approach B (Selected): Complete Local Assets + Rock-Solid Card Architecture + Official Zeekr Data.**
  Download official Zeekr images into `public/images/cars/`, enforce `aspect-[16/10] overflow-hidden relative shrink-0` with `absolute inset-0 w-full h-full object-cover` on all car cards, and update all JSON datasets with official specifications.

---

## 4. Technical Architecture

### 4.1 Card CSS Pattern
Every card component (`InStockCarousel.tsx`, `ModelShowcase.tsx`, `VehicleCard.tsx`) will strictly implement:

```tsx
<div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
  {/* Rigid Image Container */}
  <div className="relative w-full aspect-[16/10] overflow-hidden bg-slate-100 shrink-0">
    <img
      src={displayImage}
      alt={altText}
      className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
      loading="lazy"
    />
    {/* Floating badges (status, year, etc.) positioned absolutely */}
  </div>

  {/* Card Content with mt-auto or justify-between */}
  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
    <div>...title, trims, colors, specs...</div>
    <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
      ...price and CTA button...
    </div>
  </div>
</div>
```

### 4.2 Asset Directory Structure
```
public/
  images/
    cars/
      zeekr-001/
        main.jpg
        interior.jpg
      zeekr-007/
        main.jpg
        interior.jpg
      zeekr-009/
        main.jpg
        interior.jpg
      zeekr-x/
        main.jpg
        interior.jpg
```

### 4.3 Verified Zeekr Specifications
- **Zeekr 001:** Shooting Brake, 100 kWh CATL Qilin battery, 544 hp (AWD), 0-100 km/h: 3.8s, CLTC range: 750 km, Top Speed: 200 km/h.
- **Zeekr 007:** Luxury Sedan, 100 kWh battery, 646 hp (AWD Performance), 0-100 km/h: 2.84s, CLTC range: 870 km, Top Speed: 210 km/h.
- **Zeekr 009:** Luxury MPV, 140 kWh CATL Qilin battery, 544 hp, 0-100 km/h: 4.5s, CLTC range: 822 km, Top Speed: 190 km/h.
- **Zeekr X:** Urban Luxury SUV, 66 kWh battery, 428 hp (AWD), 0-100 km/h: 3.7s, CLTC range: 560 km, Top Speed: 185 km/h.
