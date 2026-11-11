# 🤖 Zeekr Uzbekistan — Agent Handoff & Davom Ettirish Yo'riqnomasi

> **Ushbu fayl keyingi AI agent yoki dasturchi loyihani to'xtagan joyidan bir zumda, xatosiz davom ettirishi uchun mo'ljallangan.**

---

## 📌 1. Loyihaning Joriy Holati

- **Repo URL:** `https://github.com/islombek4642/zeekr.git` (branch: `main`)
- **Dizayn uslubi:** **Nordic Architectural (Oq va Elegant / Clean Light Minimal)** — toza oq va tosh-kulrang fonlar, chuqur qora tipografika, nozik chiziqlar, keng bo'shliqlar va avtomobillarning yuqori sifatli fotosuratlari.
- **Asosiy qoida:** **Kodda hech narsa hardcode qilinmaydi.** Dilerlik manzili, telefonlar, email, ish vaqti, xarita ssilkasi, ijtimoiy tarmoqlar, USD kursi va kredit foizi ma'lumotlar bazasida (`Setting` jadvali) saqlanadi va Admin Panel orqali dinamik boshqariladi.
- **Spetsifikatsiya va Reja:**
  - Hujjat (Design Doc): `docs/superpowers/specs/2026-11-11-zeekr-website-design.md`
  - Reja (Implementation Plan): `docs/superpowers/plans/2026-11-11-zeekr-website.md`
  - SDD Ledger (Bajarilgan ishlar jurnali): `.superpowers/sdd/2026-11-11-zeekr-website/progress.md`

---

## ✅ 2. Bajarilgan Vazifalar (Tasks 1–6 — BARCHASI TESTLARDAN O'TGAN)

Barcha yozilgan **12 ta unit va integratsiya testlari** muvaffaqiyatli ishlamoqda (`npx vitest run` -> 7/7 test files passed, 12/12 tests passed).

1. **Task 1 (Scaffolding):** Next.js 15 App Router, TypeScript, Tailwind CSS, Lucide React, Vitest to'liq sozlandi.
2. **Task 2 (Database Layer):** Prisma ORM schema yaratildi (`CarModel`, `CarTrim`, `CarColor`, `InventoryItem`, `Lead`, `Setting`, `User`) va `prisma/seed.ts` (Zeekr 001, 007, 009, X, birlamchi sozlamalar, admin) tayyorlandi.
3. **Task 3 (Services):** Dinamik Sozlamalar provayderi (`src/lib/settings.ts`) va Telegram Bot orqali yangi arizalarni sotuvchilar guruhiga HTML formatda jo'natuvchi xizmat (`src/lib/telegram.ts`) yozildi.
4. **Task 4 (Public Layout):** Nordic Minimal Header, Dinamik Footer (bazadagi manzil, telefon va tarmoqlarni o'qiydi), MobileMenu va `src/lib/utils.ts` (telefon va narx formatlagichlari).
5. **Task 5 (Bosh sahifa / Showroom):**
   - `HeroSection.tsx`: Flagman Zeekr taqdimoti va tezkor metrikalar (0-100 km/s, masofa, kafolat).
   - `ModelShowcase.tsx`: Zeekr 001, 007, 009, X modellar kartalari, xarakteristikalari, so'm/dollar narxlari.
   - `InStockCarousel.tsx`: Toshkent showroomida tayyor turgan mashinalar bloki.
   - `TechnologySection.tsx`: 800V platforma, SEA arxitektura, xavfsizlik va termal boshqaruv.
   - `QuickBookingSection.tsx`: Bosh sahifaning o'zidan 1 bosqichda test-drayvga yozilish formasi.
   - `/api/leads`: Arizalarni qabul qiluvchi, bazaga saqlovchi va Telegram botga uzatuvchi API endpoint.
6. **Task 6 (Model Sahifasi & Konfigurator):**
   - `src/app/(public)/models/[slug]/page.tsx`: Dinamik model sahifasi.
   - `ColorVisualizer.tsx`: Eksteryer va interyer ranglarini almashtirish imkoniyati.
   - `SpecsComparison.tsx`: 0-100 km/s, masofa, batareya va quvvat taqqoslovi.
   - `TrimSelector.tsx`: WE, ME, YOU komplektatsiyalari jadvali.
   - `LoanCalculator.tsx`: Boshlang'ich to'lov va kredit muddati slayderlari, so'm va dollarda oylik to'lovni avtomatik hisoblovchi annuitet kalkulyatori.
   - `src/lib/calculator.ts`: Annuitet formulasi kalkulyatori.

---

## 🚀 3. Qayerdan Davom Etish Kerak (Tasks 7–14)

Reja bo'yicha keyingi qadam — **Task 7** dan boshlash:

### 👉 TASK 7: Ombordagi Mavjud Mashinalar Katalogi (`/inventory`)
- `src/app/(public)/inventory/page.tsx`, `InventoryFilter.tsx`, `VehicleCard.tsx`, `ReserveModal.tsx`
- Mashinani tanlab, "Bron qilish" modal oynasi orqali ariza qoldirish.

### 👉 TASK 8: Alohida Test-Drayv Bron Qilish Sahifasi (`/test-drive`)
- `src/app/(public)/test-drive/page.tsx`, `TestDriveWizard.tsx`, `src/app/actions/leadActions.ts`, `src/lib/validations/lead.ts`.
- 3 bosqichli qulay bron: Model tanlash -> Sana va vaqt slotlari -> Mijoz ma'lumotlari.

### 👉 TASK 9: Servis, Kafolat va Dinamik Kontaktlar
- `src/app/(public)/service/page.tsx` (8 yil batareya kafolati, zaryadlash stansiyalari turlari, servis arizasi).
- `src/app/(public)/contacts/page.tsx` va `InteractiveMap.tsx` (bazadagi dinamik manzil, telefonlar va xarita).

### 👉 TASK 10: Admin Autentifikatsiya va Dashboard Shell
- `src/app/admin/login/page.tsx`, `src/app/admin/layout.tsx`, `src/app/admin/page.tsx`, `src/middleware.ts` (himoyalangan sessiya), `src/lib/auth.ts` (bcrypt + JWT).

### 👉 TASK 11: Admin Leads CRM Moduli (`/admin/leads`)
- Barcha tushgan arizalar jadvali, status voronkasi (`Yangi` -> `Bog'lanildi` -> `Test-drayv belgilandi` -> `Shartnoma qilindi` -> `Bekor qilindi`), menejer izohlari.

### 👉 TASK 12: Admin Avtomobillar va Ombor Boshqaruvi
- `src/app/admin/cars/` va `src/app/admin/inventory/` (CRUD: modellar, komplektatsiyalar, ranglar va salondagi mashinalarni kiritish).

### 👉 TASK 13: Admin Dinamik Sozlamalar Moduli (`/admin/settings`)
- Showroom manzili, telefonlar, ish vaqti, Yandex xarita ssilkasi, ijtimoiy tarmoqlar, USD kursi va kredit foiz stavkasini boshqarish formasi.

### 👉 TASK 14: Vercel Production Build & Deploy
- `vercel.json`, `npm run build` tekshiruvi va Vercel platformasiga joylash (`deploy-to-vercel` skilli yordamida).

---

## 🛠 4. Foydali Buyruqlar

```bash
# Barcha testlarni ishga tushirish:
npx vitest run

# Testlarni kuzatish rejimida ishga tushirish:
npx vitest

# Prisma mijozini yangilash:
npx prisma generate

# Loyihani build qilish (ishlab chiqarishga tayyorligini tekshirish):
npm run build
```
