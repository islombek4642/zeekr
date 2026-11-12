# 🤖 Zeekr Uzbekistan — Agent Handoff & Tizim Hujjati

> **Ushbu hujjat loyiha arxitekturasi, ma'lumotlar bazasi, Vercel Prisma Postgres integratsiyasi va barcha o'zgarishlarni to'liq qamrab oladi.**

---

## 📌 1. Loyihaning Joriy Holati

- **Repo URL:** `https://github.com/islombek4642/zeekr.git` (branch: `main`)
- **Dizayn uslubi:** **Nordic Architectural (Oq va Elegant / Clean Light Minimal)** — toza oq va tosh-kulrang fonlar, chuqur qora tipografika, nozik chiziqlar, keng bo'shliqlar va avtomobillarning yuqori sifatli fotosuratlari.
- **Sinovlar:** **20 ta test fayl, 50 ta test 100% yashil (`PASS`)** (`npx vitest run`).
- **TypeScript:** 0 ta xatolik (`npx tsc --noEmit`).
- **Platforma:** Next.js 15 App Router, React 19, Tailwind CSS v4, Prisma 6, PostgreSQL (Vercel Prisma Postgres / Neon).

---

## 📂 2. Kategoriyalangan JSON Baza Tuzilmasi (`data/`)

Loyiha kodida hech qanday avtomobil, komplektatsiya yoki parametrlar hardcode qilinmagan. Barcha boshlang'ich va namunaviy ma'lumotlar loyiha ildizidagi `data/` papkasida 6 ta kategoriyaga ajratilgan:

1. **`data/models.json`**: Zeekr 001, 007, 009, X modellarining barcha texnik ko'rsatkichlari (0-100 km/s, quvvat, masofa, batareya, tezlik, zaryadlash vaqti, rasmlar).
2. **`data/trims.json`**: Har bir modelning WE, ME, YOU komplektatsiyalari, privod turi (RWD, AWD), narxlari va opsiyalar ro'yxati.
3. **`data/colors.json`**: Eksteryer va interyer ranglari, hex kodlari va mos rasmlar.
4. **`data/inventory.json`**: Toshkent salonida tayyor turgan avtomobillar (VIN raqami, ranglari, yili, narxi, statusi).
5. **`data/settings.json`**: Showroom manzili, telefonlar, ish vaqti, Yandex xarita ssilkasi, ijtimoiy tarmoqlar, USD kursi va kredit stavkasi.
6. **`data/technologies.json`**: 800V arxitektura, SEA platforma, Euro NCAP xavfsizlik va termal boshqaruv kartalari.

---

## 🔌 3. Vercel Prisma Postgres Ulanishi va Sinxronizatsiyasi

### Nega Prisma Postgres'da ma'lumotlar ko'rinmayotgan edi?
`prisma/schema.prisma` da `directUrl = env("DIRECT_URL")` majburiy qilib belgilangan edi. Vercel Prisma Postgres yoki Neon ulanganda Vercel avtomatik ravishda `DATABASE_URL` (yoki `POSTGRES_PRISMA_URL`) ni taqdim etadi, biroq `DIRECT_URL` env o'zgaruvchisi kiritilmagan bo'ladi. Natijada `npx prisma db push` va `seed` bosqichi `P1012: Environment variable not found: DIRECT_URL` xatosi bilan to'xtab qolgan.

### Qanday tuzatildi?
1. **`prisma/schema.prisma`**: Majburiy `directUrl` parametri olib tashlandi.
2. **`scripts/db-deploy.js`**: `DATABASE_URL`, `POSTGRES_PRISMA_URL`, `POSTGRES_URL` o'zgaruvchilarini avtomatik taniydi va `DIRECT_URL` bo'lmasa unga fallback ulaydi.
3. **`src/lib/data-provider.ts`**: Baza bilan ishlashda chidamli (resilient) qatlam yaratildi — agar baza yangi yoki serverless so'rovlarida bo'sh bo'lsa, tizim darhol `data/*.json` fayllaridan ma'lumotlarni o'qiydi.
4. **`prisma/seed.ts`**: Kod ichidagi hardcoded obyektlar butunlay olib tashlandi, endi u to'liq `data/*.json` fayllaridan o'qib bazani to'ldiradi.
5. **Admin 1-klikli Seed**: `/api/admin/seed` endpointi va `/admin/settings` sahifasida **"Bazani to'ldirish (Prisma Seed)"** tugmasi yaratildi. Admin istalgan paytda Vercel bazasini birgina tugma bilan to'ldirishi yoki yangilashi mumkin.

---

## 🛠 4. Foydali Buyruqlar

```bash
# Barcha testlarni ishga tushirish (50 ta test):
npx vitest run

# TypeScript tekshiruvi:
npx tsc --noEmit

# Prisma mijozini yangilash:
npx prisma generate

# JSON fayllar asosida bazani to'ldirish:
npm run prisma:seed

# Ishlab chiqarish buildini tekshirish:
npm run build
```
