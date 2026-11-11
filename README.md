# ⚡ Zeekr Uzbekistan — Rasmiy Dilerlik Veb-sayti va Boshqaruv CRM Paneli

O'zbekistondagi Zeekr premium elektromobillari dilerlik markazi uchun yaratilgan rasmiy veb-sayt, interaktiv modellar konfiguratori, kredit/lizing kalkulyatori, salondagi mavjud mashinalar vitrinasi hamda dinamik ma'lumotlarni boshqaruvchi to'liq Admin CRM paneli.

---

## 💎 Dizayn Falsafasi

- **Uslub:** **Nordic Architectural (Clean Light Minimal)** — toza oq (`#FFFFFF`) va arxitekturaviy kulrang (`#F8FAFC`) fonlar, chuqur qora tipografika (`#0F172A`), nozik havoiy chiziqlar va katta formatdagi avtomobil suratlari.
- **Asosiy Qoida:** **Kodda ma'lumotlar hardcode qilinmaydi.** Dilerlik manzili, telefonlar, email, ish vaqti, xarita kodi, ijtimoiy tarmoqlar, USD kursi va kredit foiz stavkasi ma'lumotlar bazasida (`Setting` jadvali) saqlanadi va Admin Panel orqali dinamik tahrirlanadi.
- **Xabarnomalar:** Saytdan yangi test-drayv yoki avtomobil bron arizasi tushganda Telegram Bot API orqali sotuv menejerlari guruhiga bir zumda bildirishnoma boradi.

---

## 🛠 Texnologik Stack

- **Framework:** Next.js 15 (App Router, Server Actions, Route Handlers)
- **Til:** TypeScript (qat'iy tiplash)
- **Styling:** Tailwind CSS, Radix UI / Shadcn Primitives, Lucide Icons
- **Ma'lumotlar bazasi & ORM:** PostgreSQL, Prisma ORM
- **Validatsiya:** Zod
- **Xavfsizlik:** bcryptjs (parollarni xeshlash), jsonwebtoken (JWT sessiya), Next.js Middleware
- **Test:** Vitest (TDD tamoyili, 15 ta test to'plami, 29+ unit/integratsiya testlari)
- **Deploy:** Vercel

---

## 🚀 Ishga Tushirish (Local Setup)

### 1. Bog'liqliklarni o'rnatish

```bash
npm install
```

### 2. Muhit o'zgaruvchilari (`.env`)

`.env.example` faylidan nusxa olib `.env` yarating:

```env
DATABASE_URL="postgresql://user:password@host:5432/zeekr_db?pgbouncer=true"
DIRECT_URL="postgresql://user:password@host:5432/zeekr_db"
JWT_SECRET="zeekr-super-secret-admin-key-2026"
TELEGRAM_BOT_TOKEN="your-telegram-bot-token"
TELEGRAM_CHAT_ID="-1001234567890"
```

### 3. Ma'lumotlar bazasi va Seeder

```bash
# Prisma klientini generatsiya qilish
npm run prisma:generate

# Migratsiyalarni qo'llash
npx prisma db push

# Boshlang'ich modellar, admin foydalanuvchi va sozlamalarni kiritish
npx prisma db seed
```

### 4. Dasturni ishga tushirish

```bash
npm run dev
```

Sayt `http://localhost:3000` manzilida ochiladi.

---

## 🔐 Admin Panel Kirish Ma'lumotlari

- **URL:** `http://localhost:3000/admin`
- **Birlamchi Login:** `admin@zeekr-auto.uz`
- **Birlamchi Parol:** `ZeekrAdmin2026!`

Admin panel orqali quyidagilar boshqariladi:

1. **Arizalar & Leads CRM (`/admin/leads`):** Test-drayv va bron qilish arizalari, statuslar voronkasi (`Yangi` ➔ `Bog'lanildi` ➔ `Belgilandi` ➔ `Shartnoma qilindi` ➔ `Bekor qilindi`), menejer izohlari.
2. **Modellar Katalogi (`/admin/cars`):** Zeekr 001, 007, 009, X modellarini faollashtirish, yashirish yoki yangi model qo'shish.
3. **Ombordagi Mashinalar (`/admin/inventory`):** Salonda bor yoki yo'ldagi avtomobillarni VIN kodi, rangi, yili va narxi bilan kiritish.
4. **Sayt Sozlamalari (`/admin/settings`):** Dilerlik manzili, telefonlar, Yandex xarita, USD kursi va kredit foiz stavkasi.

---

## 🧪 Testlarni Ishga Tushirish

Loyihadagi barcha testlar Vitest yordamida avtomatlashtirilgan:

```bash
# Barcha testlarni bir martalik tekshiruvdan o'tkazish
npm test

# Testlarni kuzatuv (watch) rejimida yurgizish
npm run test:watch
```

---

## 🚢 Vercel Platformasiga Deploy Qilish

1. Repozitoriyni GitHub hisobingizga ulang.
2. Vercel boshqaruv panelida yangi loyiha import qiling.
3. Vercel Environment Variables bo'limida quyidagilarni kiriting:
   - `DATABASE_URL` (Supabase yoki Neon PostgreSQL)
   - `DIRECT_URL`
   - `JWT_SECRET`
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID`
4. Deploy tugmasini bosing. Build komandasi avtomatik `prisma generate && next build` ni bajaradi.
