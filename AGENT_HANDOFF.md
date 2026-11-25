# 🤖 Zeekr Uzbekistan — AI Agent Handoff & Keyingi Bosqich Yo'riqnomasi

> **Diqqat keyingi AI Agent yoki dasturchiga:** Ushbu hujjat loyihaning to'xtagan joyidan bir qadam ham adashmasdan, aynan qayerdan va qanday davom ettirish kerakligini to'liq ko'rsatadi.

---

## 📌 1. Repozitoriy va Mualliflik Standartlari

- **GitHub Repozitoriy:** [https://github.com/islombek4642/zeekr.git](https://github.com/islombek4642/zeekr.git) (`main` branch).
- **Vercel Jonli Sayt:** [https://zeekr-xi.vercel.app/](https://zeekr-xi.vercel.app/)
- **Git Commit Muallifi:** Har doim quyidagi muallif bilan commit qilinishi shart (hech qachon `ganiyevahadjon` ishlatilmasin):
  ```bash
  git commit --author="islombek4642 <islombek4642@users.noreply.github.com>" -m "..."
  ```
- **Hozirgi holat:** Barcha commitlar GitHub `origin/main` ga to'liq `push` qilingan, ishchi daraxt toza (`working tree clean`).

---

## 🚀 2. Loyiha Sog'lig'i va Test Natijalari (100% Yashil)

1. **Unit & Komponent Testlar:** **27 ta test fayl, 88 ta test yashil (`PASS`)**
   ```bash
   npm test
   ```
2. **End-to-End (E2E) Testlar:** **8 ta test fayl, 208 ta test yashil (`PASS`)**
   ```bash
   npx vitest run tests/e2e/ --config tests/e2e/vitest.e2e.config.ts
   ```
3. **TypeScript Type Check:** **0 ta xatolik (`exit code 0`)**
   ```bash
   npx tsc --noEmit
   ```
4. **Next.js Production Build:** **Muvaffaqiyatli yakunlanadi (`exit code 0`)**
   ```bash
   npm run build
   ```

---

## 💎 3. Ushbu Sessiyada Bajarilgan Katta Ishlar

Foydalanuvchi `https://www.zeekr-city.uz/` rasmiy diler saytidagi barcha avtomobillarni, ularning yangilangan rasmlari, ranglari va video lavhalarini xavfsiz tartibda loyihaga o'tkazishni va grafikasi buzilmasdan saytga joylashni so'radi.

Quyidagi ishlar to'liq bajarildi va gitga kiritildi:

### 1. Rasmiy Media Aktivlari Yuklandi (Zero Remote CDN / Local Assets)
- `scripts/download-zeekr-assets.js` orqali `zeekr-city.uz` va `zeekrlife-oss.zeekrlife.com` dan 45 dan ortiq original media fayllar yuklandi:
  - **4 ta HD kinematik video loop:** `public/videos/cars/zeekr-001-hero.mp4`, `zeekr-007-hero.mp4`, `zeekr-7x-hero.mp4`, `zeekr-9x-hero.mp4`.
  - **Shaffof studio cutouts (eksteryer):** `public/images/cars/<slug>/main.webp` va orqaga moslik uchun `main.jpg`.
  - **Haqiqiy kuzov bo'yoq ranglari:** `public/images/cars/<slug>/colors/*.jpg|webp`.
  - **Salon va interyer fotosuratlari:** `public/images/cars/<slug>/interior.webp` va `int-*.webp`.
  - Barcha rasmlar 500 KB dan past o'lchamda veb-optimizatsiya qilindi (grafika tiniqligi saqlangan holda).

### 2. Modellar Katalogi 6 taga Kengaytirildi
- `data/models.json`, `data/trims.json`, `data/inventory.json` fayllari yangilandi:
  1. **Zeekr 001** (Shooting Brake, 750 km CLTC, 544 hp, 3.8s)
  2. **Zeekr 007** (Luxury Sport Sedan, 870 km CLTC, 646 hp, 2.84s)
  3. **Zeekr 7X** (Family Luxury SUV, 780 km CLTC, 646 hp, 3.8s)
  4. **Zeekr X** (Urban Premium Crossover, 560 km CLTC, 428 hp, 3.7s)
  5. **Zeekr 009** (First-Class Luxury MPV, 822 km CLTC, 544 hp, 4.5s)
  6. **Zeekr 9X** (Global Ultra-Luxury Flagship SUV, 800 km CLTC, 780 hp, 3.1s)
- Har bir model uchun rasmiy diler narxlari, komplektatsiyalari (trims) va salonda mavjud (in-stock) VIN kodli avtomobillar kiritildi.

### 3. Dual Rang Visualizatori (Eksteryer + Interyer)
- `src/components/models/ColorVisualizer.tsx` va `data/colors.json`:
  - **Eksteryer** tabida haqiqiy kuzov bo'yoq ranglari (Polar White, Phantom Black, Forest Green, River Blue, Dawn Silver, Berlin Gray va boshqalar) va ranglar swatchesi.
  - **Interyer** tabida hashamatli salon mebellari (Nappa teri, Sofaro, Alcantara, Cognac leather).
  - Grafika buzilmasligi uchun eksteryerda `object-contain p-4`, interyerda `object-cover` ishlatildi (`aspect-[16/9]` nisbati buzilmaydi).

### 4. Bosh Sahifa va Model Tafsilotlarida Kinematik Video Hero
- `src/components/home/HeroSection.tsx`: Fon qismida ovozsiz, avtomatik aylanuvchi (`autoPlay muted loop playsInline preload="metadata"`) ambient video loop va sifatli poster fallback qo'shildi.
- `src/app/(public)/models/[slug]/page.tsx`: 001, 007, 7X, 9X modellari uchun yuqori sifatli video taqdimot joylashtirildi.

---

## 🎯 4. Keyingi AI Agent Uchun Topshiriqlar va Tavsiyalar

Agar foydalanuvchi uyga borib ishni davom ettirsa, quyidagi vazifalarni amalga oshirish mumkin:

### 1-vazifa: Qolgan 4 ta Modelni Qo'shish (Agar foydalanuvchi 10 ta modelni to'liq xohlasa)
Foydalanuvchi yuborgan ikkinchi skrinshotda `zeekr-city.uz` da 10 ta modellar qatori ko'rsatilgan:
- `9X`, `8X`, `8X Yaoying`, `7X`, `X`, `001 2025`, `001 All New 2026`, `007`, `007 GT`, `009`.
Hozir saytda asosiy 6 ta avtomobil to'liq ishlayapti (`001`, `007`, `009`, `X`, `7X`, `9X`).
Agar foydalanuvchi `8X`, `8X Yaoying`, `007 GT` larni ham alohida model sifatida qo'shishni so'rasa:
1. `scripts/download-zeekr-assets.js` ga ularning rasmlari havolasini qo'shib yuklab olish.
2. `data/models.json` va `data/trims.json` ga kiritish.

### 2-vazifa: Cloud Database yoki Telegram Integratsiyasi (Ixtiyoriy)
- Hozirda loyiha PostgreSQL o'chirilgan bo'lsa ham mukammal ishlaydigan `JSON Fallback Database Architecture` bilan ta'minlangan (Vercel'da DBsiz ham 100% ishlaydi).
- Agar foydalanuvchi Supabase yoki Neon orqali real PostgreSQL ulamoqchi bo'lsa:
  1. `.env.local` da `DATABASE_URL` va `DIRECT_URL` ni kiritish.
  2. `npx prisma db push` va `npx tsx prisma/seed.ts` buyrug'ini bajarish.
- Telegram xabarnomasi uchun `.env.local` ga `TELEGRAM_BOT_TOKEN` va `TELEGRAM_CHAT_ID` kiritish.

---

## 🛠 5. Ishga Tushirish va Tekshirish Buyruqlari

```bash
# 1. Loyihani mahalliy serverda ishga tushirish (Local Dev)
npm run dev

# 2. Barcha unit testlarni yurgizish (88 ta test)
npm test

# 3. Barcha 208 ta E2E testlarni yurgizish
npx vitest run tests/e2e/ --config tests/e2e/vitest.e2e.config.ts

# 4. TypeScript xatoliklarini tekshirish
npx tsc --noEmit

# 5. Production build tayyorlash
npm run build

# 6. O'zgarishlarni GitHub ga yuborish
git add .
git commit --author="islombek4642 <islombek4642@users.noreply.github.com>" -m "feat: ..."
git push origin main
```

Ushbu yo'riqnoma bilan keyingi AI agent darhol kontekstga kirib, hech qanday to'siqsiz ishlarni davom ettira oladi.
