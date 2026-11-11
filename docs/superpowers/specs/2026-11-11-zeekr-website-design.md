# Design Document: Zeekr O'zbekiston Rasmiy Dilerlik Veb-sayti va Admin Panel

**Hujjat sanasi:** 2026-11-11  
**Holati:** Qabul uchun tayyorlangan (Review Complete & Finalized)  
**Loyiha hajmi:** To'liq loyiha (Project)  
**Arxitektura:** Next.js Full-Stack (Next.js 15 App Router + TypeScript + Tailwind CSS + PostgreSQL + Prisma)  
**Hosting va Deploy:** Vercel (Serverless / Edge) + Supabase/Neon PostgreSQL + Vercel Blob / Cloudinary Media  

---

## 1. Maqsad va "Why" (Intent & Problem Statement)

### 1.1. Asosiy maqsad
O'zbekistondagi Zeekr premium elektromobillari dilerlik markazi/avtosaloni uchun yuqori sifatli, estetik jihatdan mukammal rasmiy veb-sayt va sotuv jarayonlarini boshqaruvchi yengil admin CRM panelini yaratish.

### 1.2. Biznes vazifalari
1. **Premium brend taassuroti:** Zeekr'ning Skandinaviya minimalizmi va ilg'or elektr texnologiyalarini (SEA platformasi, 800V arxitektura) O'zbekiston auditoriyasiga nufuzli tarzda taqdim etish.
2. **Yuqori konversiyali Lead Generation:** Test-drayvga yozilish, professional konsultatsiya olish va salonda tayyor turgan mashinani band (bron) qilish jarayonini maksimal darajada sodda va qulay qilish.
3. **Menejerlar uchun tezkor nazorat:** Barcha tushgan arizalarni admin panelda kuzatish va Telegram guruhiga darhol avtomatik bildirishnoma yuborish.

---

## 2. Maqsadlar, No-Go va Cheklovlar (Goals, Non-Goals, Anti-Goals)

### 2.1. Goals (Talab qilinadigan maqsadlar)
- **Mijozlar vitrinasi (Showroom):** Zeekr 001, Zeekr 007, Zeekr 009, Zeekr X modellarining interaktiv ko'rgazmasi.
- **Model sahifasi va konfigurator:** Ranglar (eksteryer/interyer) almashtirish, komplektatsiyalarni taqqoslash (WE/ME/YOU), xarakteristikalar (0-100 km/s tezlanish, zaxira masofasi, quvvati) va kredit/lizing kalkulyatori.
- **Salonda mavjud mashinalar (In Stock):** Toshkentdagi dilerlik markazida hozir bor yoki yo'lda kelayotgan real avtomobillar vitrinasi.
- **Admin Panel (`/admin`):** Xavfsiz avtorizatsiya, arizalar ro'yxati va statuslari (Lead CRM), avtomobillar katalogi va ombor boshqaruvi, USD/UZS valyuta kursi sozlamasi.
- **Telegram Bot bildirishnomalari:** Har bir yangi mijoz arizasi tushganda menejerlarga xabar borishi.
- **SEO va ishlash tezligi:** Server-Side Rendering (SSR) va static generation orqali Google'da yuqori o'rinlar, mobil internetda bir zumda ochilish.
- **Vercel Deploy:** Loyihani to'liq Vercel muhitiga moslashtirish (Serverless API, Edge Caching, Environment Variables).

### 2.2. Non-Goals (1-bosqich doirasiga kirmaydigan narsalar)
- Sayt orqali to'g'ridan-to'g'ri bank kartasi orqali to'liq avtomobil sotib olish (e-commerce checkout) — avtomobillar dilerlik shartnomasi orqali sotiladi.
- Avtomatik avtomobilni onlayn bloklab qo'yish (concurrency locking) — zaxiralash arizasi tushganda sotuv menejeri mijoz bilan bog'lanib, holatni tasdiqlaydi.
- Trade-in tizimi (foydalanuvchi hozircha talab qilmadi).
- O'zbekiston bo'yicha mustaqil zaryadlash stansiyalari real-time monitoringi (faqat xarita va tavsiyalar beriladi).

### 2.3. Anti-Goals (Nimalardan qat'iy qochiladi — Anti-Slop)
- Shablon "AI slop" dizayn: to'yingan binafsha gradientlar, noaniq suzib yuruvchi pufaklar, ma'nosiz dekorativ kartalar.
- Brauzerni qotiradigan, yuklanishi 10 soniya vaqt oladigan og'ir 3D WebGL elementlar. Uning o'rniga yuqori aniqlikdagi optimallashtirilgan fotosuratlar, silliq animatsiyalar va interaktiv rang almashtirgich ishlatiladi.
- Murakkab, 5 bosqichli va foydalanuvchini charchatadigan anketalar (test-drayv uchun faqat ism, telefon, model va qulay vaqt so'raladi).

---

## 3. Dizayn Uslubi va Estetika (UI Taste & Visual Direction)

Foydalanuvchi tomonidan tasdiqlangan yo'nalish: **Nordic Architectural (Oq va Elegant / Clean Light Minimal)**.

- **Palitra:**
  - Asosiy fon: Muzdek toza oq (`#FFFFFF`) va arxitekturaviy och kulrang (`#F8FAFC`, `#F1F5F9`).
  - Matnlar: Chuqur qora (`#0F172A`) va grafit kulrang (`#334155`).
  - Aksentlar: Zeekr'ning zamonaviy brend tuslari — nozik neon-cyan / elektr havorang (`#0284C7` / `#38BDF8`) yoki diskret premium to'q sariq (`#EA580C`).
- **Tipografika:** Geometrik, keng, zamonaviy sans-serif shriftlar (Inter / Syne / Space Grotesk uslubida).
- **Tuzilma va Proporsiyalar:** Katta formatdagi avtomobil suratlari, toza 1px havoiy chiziqlar (borders), keng bo'shliqlar (whitespace) va tartibli grid.
- **Admin Panel:** Yuqori axborot zichligiga ega (High-density), qulay jadvallar, qidiruv va filtrlarga ega toza boshqaruv interfeysi.

---

## 4. Texnologik Arxitektura, Infratuzilma va Vercel Deploy

### 4.1. Arxitektura: Next.js 15 Full-Stack
- **Frontend & Backend:** Next.js 15 (App Router, Server Actions, Route Handlers).
- **Styling & Components:** Tailwind CSS, Shadcn UI / Radix primitives, Lucide Icons, Framer Motion.
- **Database:** PostgreSQL (Cloud/Serverless Postgres: Supabase yoki Neon).
- **ORM:** Prisma Client (Connection Pooling bilan, Vercel Serverless Function limiti uchun optimallashgan).
- **Deploy Muhiti:** **Vercel** (`deploy-to-vercel` integratsiyasi orqali).
- **Media va Rasm Fayllari:** Vercel serverless fayl tizimi vaqtinchalik bo'lgani sababli, avtomobillarning asosiy sifatli rasmlari optimallashtirilgan holda `/public/images/cars/...` da statik saqlanadi, dinamik yuklashlar uchun esa Vercel Blob / Cloudinary yoki Supabase Storage ishlatiladi.
- **Til (i18n):** Hozirgi bosqichda asosiy til — O'zbek tili. Arxitektura va lug'at tizimi esa **i18n-ready** (modulli) tuziladi, keyinchalik Rus yoki Ingliz tilini yo'llar va bazani buzmasdan qo'shish kafolatlanadi.

---

## 5. Sahifalar va Funksional Modullar (Functional Scope)

### 5.1. Ommaviy Veb-sayt Sahifalari
1. **Bosh Sahifa (`/`):**
   - **Hero Section:** Zeekr flagman modeli (masalan 001 yoki 007) kinematik video/foto taqdimoti, shior, "Test-drayvga yozilish" va "Modellar katalogi" tugmalari.
   - **Modellar Vitrinasi:** Zeekr 001, 007, 009, X kartochkalari — har birining 0-100 km/s tezlanishi, yurish masofasi (CLTC/WLTP), narxi (boshlanishi) va "Tafsilotlar" tugmasi.
   - **Salonda Mavjud (In Stock Carousels):** Toshkent saloni ko'rgazmasidagi aniq mashinalar fotosuratlari bilan.
   - **Texnologiya & Xavfsizlik:** 800V arxitektura, SEA platformasi, xavfsizlik testlari natijalari.
   - **Tezkor ariza bloki:** Qisqa forma (Ism, Telefon, Model tanlash).
   - **Dilerlik markazi:** Showroom fotosurati, manzili, ish vaqti, lokatsiya xaritasi.

2. **Model Sahifasi (`/models/[slug]`):**
   - **Interaktiv Ko'rinish:** Eksteryer ranglari (masalan: Polar White, Phantom Black, Electric Orange) va interyer ranglari tanlanganda mos avtomobil fotosuratlari almashishi.
   - **Texnik Xarakteristikalar:** Dvigatel quvvati, akkumulyator sig'imi (kVt/soat), zaryadlash tezligi, o'lchamlari.
   - **Komplektatsiyalar jadvali:** WE / ME / YOU versiyalari narxi va farqlari taqqoslanishi.
   - **Kredit va Lizing Kalkulyatori:** Boshlang'ich to'lov (masalan 20% - 50%), muddat (12 - 48 oy), oylik to'lovni avtomatik hisoblash. Admin paneldan stavkani boshqarish imkoni.
   - **Test-drayvga yozilish:** Aynan shu model uchun to'g'ridan-to'g'ri ariza.

3. **Salonda Mavjud Mashinalar (`/inventory`):**
   - Hozir salonda bor yoki 10-15 kunda keladigan real mashinalar katalogi.
   - Filtrlash: Model bo'yicha, Rangi bo'yicha, Holati bo'yicha (*Salonda mavjud* / *Yo'lda*).
   - Mashina kartasi: Real fotosuratlar, aniq komplektatsiyasi, narxi (UZS va USD), "Bron qilish" tugmasi.

4. **Test-drayv Sahifasi (`/test-drive`):**
   - Bosqichli qulay bron qilish: Model tanlash -> Sana va vaqt tanlash -> Aloqa ma'lumotlari.
   - Muvaffaqiyatli yuborilganda chiroyli tasdiq ekrani va Telegram bot orqali menejerga zudlik bilan bildirishnoma.

5. **Servis, Kafolat & Zaryadlash (`/service`):**
   - Rasmiy dilerlik kafolati: batareyaga 8 yil / 160 000 km, avtomobilga 5 yil / 100 000 km.
   - Original ehtiyot qismlar va servisga yozilish formasi.
   - O'zbekiston bo'yicha zaryadlash stansiyalari turlari (GB/T, CCS2 adapterlari) haqida ma'lumot.

6. **Dilerlik va Kontaktlar (`/contacts`):**
   - Toshkent showroom manzili, telefon raqamlari, ish tartibi, Yandex / Google interaktiv xaritasi.

### 5.2. Admin Panel (`/admin`)
1. **Autentifikatsiya (`/admin/login`):** Himoyalangan kirish (Login, parol, sessiya nazorati).
2. **Arizalar boshqaruvi (Leads CRM - `/admin/leads`):**
   - Test-drayv, maslahat va mashina bron qilish arizalari ro'yxati.
   - Filtrlar va qidiruv (Ism, telefon, model, sana).
   - Ariza holati (Status pipeline): `Yangi` -> `Bog'lanildi` -> `Test-drayv belgilandi` -> `Shartnoma qilindi` -> `Bekor qilindi`.
   - Menejer izohi (Notes) qo'shish imkoniyati.
3. **Avtomobillar Katalogi (`/admin/cars`):**
   - Modellarni qo'shish va tahrirlash (nomi, tavsifi, xarakteristikalari, asosiy rasmlari).
   - Komplektatsiyalar va ranglar qo'shish/o'chirish.
4. **Ombor boshqaruvi (In-Stock Vehicles - `/admin/inventory`):**
   - Salonda mavjud yoki yo'ldagi aniq avtomobillarni kiritish (VIN raqami, rang, komplektatsiya, narx, holat).
5. **Dinamik Sozlamalar & Kontaktlar (`/admin/settings`):**
   - **Hech qanday ma'lumot kodda hardcode qilinmaydi!**
   - **Showroom ma'lumotlari:** Dilerlik manzili, asosiy va qo'shimcha telefon raqamlari, email, ish vaqtlari.
   - **Xarita va lokatsiya:** Yandex / Google Maps xaritasi havolasi yoki koordinatalari.
   - **Ijtimoiy tarmoqlar:** Telegram kanal, Instagram, YouTube havolalari.
   - **Moliya & Kalkulyator:** USD / UZS valyuta kursi, yillik kredit/lizing stavkasi (%).
   - **Bildirishnomalar:** Telegram Bot token va arizalar tushadigan guruh Chat ID'si.

---

## 6. Ma'lumotlar Bazasi Sxemasi (Database Schema / Prisma)

```prisma
enum LeadType {
  TEST_DRIVE
  CONSULTATION
  CAR_RESERVE
  SERVICE
}

enum LeadStatus {
  NEW
  CONTACTED
  SCHEDULED
  DEAL_WON
  CANCELLED
}

enum VehicleStatus {
  IN_STOCK
  IN_TRANSIT
  RESERVED
  SOLD
}

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  name         String
  role         String   @default("ADMIN") // ADMIN, MANAGER
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model CarModel {
  id                  String         @id @default(cuid())
  slug                String         @unique // masalan: "zeekr-001", "zeekr-007"
  name                String         // "Zeekr 001"
  tagline             String         // "Shooting Brake Elektr Flagmani"
  basePriceUSD        Float          // 45000
  acceleration0100    Float          // 3.8
  rangeKm             Int            // 741
  batteryKwh          Float          // 100
  powerHp             Int            // 544
  topSpeedKmH         Int            // 200
  chargingTimeMin     Int            // 15
  mainImage           String
  galleryImages       String[]
  description         String
  isActive            Boolean        @default(true)
  orderIndex          Int            @default(0)
  trims               CarTrim[]
  colors              CarColor[]
  leads               Lead[]
  createdAt           DateTime       @default(now())
  updatedAt           DateTime       @updatedAt
}

model CarTrim {
  id              String      @id @default(cuid())
  modelId         String
  model           CarModel    @relation(fields: [modelId], references: [id], onDelete: Cascade)
  name            String      // "WE Version 100kWh", "YOU 4WD"
  priceUSD        Float
  driveType       String      // "RWD" yoki "AWD"
  rangeKm         Int
  acceleration    Float
  features        String[]
  inventoryItems  InventoryItem[]
}

model CarColor {
  id              String      @id @default(cuid())
  modelId         String
  model           CarModel    @relation(fields: [modelId], references: [id], onDelete: Cascade)
  name            String      // "Polar White", "Phantom Black"
  hexCode         String      // "#FFFFFF"
  imageUrl        String      // shu rangdagi mashina surati
  isInterior      Boolean     @default(false)
}

model InventoryItem {
  id              String        @id @default(cuid())
  trimId          String
  trim            CarTrim       @relation(fields: [trimId], references: [id])
  vinOrCode       String?       @unique
  exteriorColor   String
  interiorColor   String
  year            Int           @default(2025)
  status          VehicleStatus @default(IN_STOCK)
  priceUSD        Float
  priceUZS        Float?
  images          String[]
  notes           String?
  leads           Lead[]
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
}

model Lead {
  id              String         @id @default(cuid())
  type            LeadType       @default(TEST_DRIVE)
  fullName        String
  phone           String
  modelId         String?
  model           CarModel?      @relation(fields: [modelId], references: [id])
  inventoryItemId String?
  inventoryItem   InventoryItem? @relation(fields: [inventoryItemId], references: [id])
  preferredDate   DateTime?
  preferredTime   String?        // "14:00 - 16:00"
  status          LeadStatus     @default(NEW)
  managerNotes    String?
  source          String?        // "website_header", "model_page", "inventory"
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
}

model Setting {
  key             String      @id
  value           String
  updatedAt       DateTime    @updatedAt
}
```

---

## 7. Hal qilingan Texnik Qarorlar (Settled Builder Calls)

1. **Til (i18n):** Hozirgi bosqichda to'liq O'zbek tili. Biroq matnlar va lokalizatsiya i18n-ready tarzda tuzilgani sababli, kelgusida Rus tilini qo'shish strukturani buzmaydi.
2. **Dinamik Kontaktlar va Ma'lumotlar:** Manzil, telefonlar, ish vaqti, ijtimoiy tarmoqlar va xarita ma'lumotlari kodda mutlaqo hardcode qilinmaydi — barchasi ma'lumotlar bazasida (`Setting` jadvali) saqlanadi va Admin Panel orqali dinamik boshqariladi.
3. **Hosting:** Vercel platformasi. Ma'lumotlar bazasi Vercel Postgres / Supabase / Neon serverless bilan ishlaydi.
4. **Mashina bron qilish:** Bu operativ inquiry lead hisoblanadi. Mijoz arizani to'ldirganda Telegram orqali menejerga xabar boradi. Salondagi statusni menejer admin CRM orqali `RESERVED` ga o'tkazadi (spam va avtomatlashtirilgan blokirovkadan himoya).
5. **Kalkulyator:** Admin panelda yillik foiz stavkasi sozlanadi. Standart annuitet formulasi asosida mijozga taqribiy hisob-kitob ko'rsatiladi.

---

## 8. Xavfsizlik va Muhandislik Standartlari (AGENTS.md bo'yicha)

- **Maxfiy ma'lumotlar:** Hech qanday ma'lumotlar bazasi parollari, JWT sirlari yoki Telegram Bot tokenlari kodda ochiq yozilmaydi; barchasi `.env.local` orqali boshqariladi.
- **Validatsiya:** Mijozdan va admindan keladigan barcha shakllar `zod` kutubxonasi orqali server darajasida tekshiriladi (telefon raqam formati, matn uzunligi, SQL/Script inyeksiyadan himoya).
- **Admin himoyasi:** Parollar zamonaviy `bcrypt` orqali xeshlanadi, `/admin/*` yo'llari Next.js Middleware orqali avtorizatsiya sessiyasi mavjudligiga tekshiriladi.
- **Ruxsatlar va Idempotentlik:** Test-drayv arizalarini ketma-ket bir necha marta tasodifiy jo'natib yuborishning oldini oluvchi debouncing/rate-limiting qo'shiladi.

---

## 9. Ishlab chiquvchiga (Builder) qoldirilgan jihatlar

- UI komponentlarining animatsiya tezliklari (Framer Motion orqali silliq o'tishlar).
- Mock/Seeder ma'lumotlari: Zeekr 001, 007, 009 va X modellarining boshlang'ich rasmlari va texnik ko'rsatkichlari bilan bazani to'ldirish.
- Toast xabarnomalar va interfeys yuklanish holatlari (Skeleton loaderlar).

---
*(Hujjat yakuni)*
