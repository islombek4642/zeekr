# 🤖 Zeekr Uzbekistan — Agent Handoff & Keyingi Bosqich Yo'riqnomasi

> **Diqqat keyingi AI Agent yoki dasturchiga:** Ushbu hujjat loyihaning to'xtagan joyidan bir qadam ham adashmasdan, aynan qayerdan davom ettirish kerakligini to'liq ko'rsatadi.

---

## 📌 1. Joriy Holat Qisqacha Xulosasi

- **Repozitoriy:** `https://github.com/islombek4642/zeekr.git` (`main` branch)
- **Framework & Stack:** Next.js 15, React 19, Tailwind CSS v4, Prisma 6, PostgreSQL, Vitest.
- **Sinovlar:** **21 ta test fayl, 51 ta test yashil (`PASS`)** (`npx vitest run`).
- **TypeScript:** 0 ta xatolik (`npx tsc --noEmit`).

---

## 🔍 2. Foydalanuvchi Qo'ygan So'nggi Topshiriq va Aniqlangan Muammolar

### Muammo 1: Kartochkalar o'lchami buzilishi (Vertical Stretching)
- Vercel'dagi jonli saytda (`InStockCarousel` va `VehicleCard`) 3-kartochka (Zeekr 009) rasmi vertikal (portrait) bo'lgani sababli kartochka balandligi ikki barobar oshib, narx va "Bron qilish" tugmasi pastga tushib ketgan.
- **Sababi:** Rasm konteynerida `relative aspect-[16/10]` bo'lgani bilan, ichidagi `<img>` tegi `absolute inset-0` bilan o'ralmagan va `shrink-0` bo'lmagani sababli rasm o'zining tabiiy vertikal piksellari bo'yicha flex qutisini cho'zib yuborgan.
- **Yechim arxitekturasi:** Barcha kartochkalarga quyidagi qat'iy CSS kodi qo'yiladi:
  ```tsx
  {/* Rigid Image Container */}
  <div className="relative w-full aspect-[16/10] overflow-hidden bg-slate-100 shrink-0">
    <img
      src={displayImage}
      alt={altText}
      className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
      loading="lazy"
    />
  </div>
  ```
  Kartochkaning o'zi: `flex flex-col h-full justify-between`.
  Pastki narx va tugma bloki: `mt-auto`.

### Muammo 2: Saytda Begona Avtomobillar Rasmlari Turgani
- Unsplash'dan tasodifiy Chevrolet Camaro, Porsche Panamera va BMW rasmlari qo'yilgan edi.
- Barcha rasmlar mahalliy papkaga (`public/images/cars/...`) rasmiy Zeekr fotosuratlari sifatida yuklanishi belgilandi.

### Muammo 3: Texnik Xarakteristikalarni Rasmiy Manbalar Asosida Yangilash
- Zeekr modellarining batareya quvvati, 0-100 km/s tezlanishi va masofasi rasmiy manbalar (`zeekrlife.com`, `zeekr.eu`) asosida tasdiqlandi:
  - **Zeekr 001:** Shooting Brake, 100 kVt/s batareya, 544 ot kuchi (AWD), 0-100 km/s: 3.8s, masofa: 750 km (CLTC), Maksimal tezlik: 200 km/soat.
  - **Zeekr 007:** Sedan, 100 kVt/s batareya, 646 ot kuchi (AWD Performance), 0-100 km/s: 2.84s, masofa: 870 km (CLTC), Maksimal tezlik: 210 km/soat.
  - **Zeekr 009:** MPV, 140 kVt/s CATL Qilin batareya, 544 ot kuchi, 0-100 km/s: 4.5s, masofa: 822 km (CLTC), Maksimal tezlik: 190 km/soat.
  - **Zeekr X:** Krossover, 66 kVt/s batareya, 428 ot kuchi (AWD), 0-100 km/s: 3.7s, masofa: 560 km (CLTC), Maksimal tezlik: 185 km/soat.

---

## 📁 3. Yuklangan Haqiqiy Zeekr Rasmlari (Bajarildi)

Loyiha papkasida `public/images/cars/` katalogi yaratildi va haqiqiy rasmiy fotosuratlar yuklandi:
1. `public/images/cars/zeekr-001/main.jpg` (4.8 MB rasmiy Zeekr 001 master fotosurati — Zeekr DatoCMS)
2. `public/images/cars/zeekr-001/interior.jpg` (292 KB Nappa salon fotosurati)
3. `public/images/cars/zeekr-007/main.jpg` (273 KB Zeekr 007 eksteryer fotosurati)
4. `public/images/cars/zeekr-009/main.jpg` (715 KB Zeekr 009 master fotosurati 3024x1890)
5. `public/images/cars/zeekr-x/main.jpg` (475 KB Zeekr X fotosurati)

Test yaratildi va muvaffaqiyatli o'tdi:
- `tests/assets/car-images.test.ts` (4 ta model rasmlari mavjudligi va hajmi tekshirildi).

---

## 🎯 4. Keyingi Agent Qilishi Kerak Bo'lgan Ishlar (QADAMMA-QADAM)

Keyingi agent quyidagi 3 ta qadamni bajarishi shart:

### 1-qadam: `data/*.json` fayllarini yangilash
- `data/models.json`: Rasmlar yo'lini `/images/cars/zeekr-001/main.jpg`, `/images/cars/zeekr-007/main.jpg`, `/images/cars/zeekr-009/main.jpg`, `/images/cars/zeekr-x/main.jpg` ga o'tkazish va yuqoridagi rasmiy parametrlarni kiritish.
- `data/colors.json`: Tashqi va ichki ranglar rasmlari havolalarini yangilash.
- `data/inventory.json`: Ombordagi 4 ta mashinaning rasmlarini mos ravishda `/images/cars/...` ga yo'naltirish.
- `data/trims.json`: WE, ME, YOU komplektatsiyalari ko'rsatkichlarini rasmiy xarakteristikalarga moslash.

### 2-qadam: Kartochkalar CSS arxitekturasini qat'iylashtirish
Quyidagi 3 ta komponent faylini ochib, rasm va quti balandligini toshday mustahkam qilish:
1. `src/components/home/InStockCarousel.tsx` (58-64 qatorlar atrofida)
2. `src/components/home/ModelShowcase.tsx` (46-52 qatorlar atrofida)
3. `src/components/inventory/VehicleCard.tsx` (30-36 qatorlar atrofida)

Struktura:
```tsx
<div className="relative w-full aspect-[16/10] overflow-hidden bg-slate-100 shrink-0">
  <img
    src={displayImage}
    alt={altText}
    className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
    loading="lazy"
  />
</div>
```
Va pastki narx/tugma qatoriga `mt-auto` berish, shunda hamma kartochkalarda narx va "Bron qilish" tugmasi bir tekis gorizontal chiziqda turadi.

### 3-qadam: Ma'lumotlar bazasini qayta to'ldirish (Seed) va Sinov
- `npm run prisma:seed` buyrug'i orqali yangilangan JSON ma'lumotlarni bazaga yuklash.
- `npx vitest run` buyrug'ini ishga tushirish (barcha testlar yashil ekanligiga ishonch hosil qilish).
- `npx tsc --noEmit` bilan TypeScript xatoliklari 0 ekanligini tekshirish.
- `git add -A; git commit -m "feat(ui): enforce rigid card aspect ratio and bind authentic local zeekr assets"`
- `git push origin main`

---

## 🛠 5. Asosiy Hujjatlar Havolasi

- **Design Spec:** [docs/superpowers/specs/2026-11-12-zeekr-authentic-data-and-card-layout-design.md](file:///c:/ZEEKR/docs/superpowers/specs/2026-11-12-zeekr-authentic-data-and-card-layout-design.md)
- **Implementation Plan:** [docs/superpowers/plans/2026-11-12-zeekr-authentic-data-and-card-layout.md](file:///c:/ZEEKR/docs/superpowers/plans/2026-11-12-zeekr-authentic-data-and-card-layout.md)
