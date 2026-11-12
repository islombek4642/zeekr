# Design Document: JSON Ma'lumotlar Bazasi va Kodni Hardcodedan Tozalash

**Hujjat sanasi:** 2026-11-12  
**Holati:** Tasdiqlangan (Approved)  
**Hajmi:** Kichik o'zgarish / Refaktoring (Small Change)  

---

## 1. Maqsad va Vazifa (Intent)
Loyihadagi barcha namuna ma'lumotlarni (`FALLBACK_MODELS`, `techCards`, `seed` obyektlari) kod ichidan to'liq chiqarib tashlash. Loyiha ildizida `data/` papkasida kategoriyalangan, tartibli va toza JSON fayllar to'plamini shakllantirish hamda Vercel Prisma Postgres bazasi bilan ushbu JSON fayllarni yagona manba sifatida integratsiya qilish.

---

## 2. Maqsadlar (Goals) va Cheklovlar
- **Yagona Manba (Single Source of Truth):**
  - `data/models.json` — 4 ta Zeekr modeli (001, 007, 009, X) xarakteristikalari bilan.
  - `data/trims.json` — WE, ME, YOU komplektatsiyalari va narxlari.
  - `data/colors.json` — Eksteryer va interyer ranglari, hex kodlari va fotosuratlari.
  - `data/inventory.json` — Salondagi va yo'ldagi aniq avtomobillar.
  - `data/settings.json` — Showroom manzili, telefonlar, ish vaqti, USD kursi, kredit stavkasi, xarita.
  - `data/technologies.json` — 800V, SEA platformasi, xavfsizlik va termal boshqaruv bloklari.
- **Prisma Seed Yangilanishi:**
  - `prisma/seed.ts` ichidagi barcha hardcoded JavaScript massivlari o'chirilib, to'g'ridan-to'g'ri `data/*.json` fayllarini o'qib Postgres bazasiga yozadigan qilinadi.
- **Kodni Tozalash:**
  - `src/app/(public)/page.tsx` dagi `FALLBACK_MODELS` o'chirib tashlanadi.
  - `src/components/home/TechnologySection.tsx` dagi statik massiv o'rniga `data/technologies.json` dan dinamik o'qiladi.
  - `src/lib/settings.ts` dagi fallback qiymatlari `data/settings.json` dan olinadi.
- **Markazlashgan Data Provider (`src/lib/data-provider.ts`):**
  - Prisma Postgres'dan ma'lumotlarni oladi, agar baza bo'sh bo'lsa yoki so'rovda xatolik bo'lsa, `data/*.json` fayllaridan o'qiydi (kod ichida hech qanday obyekt takrorlanmaydi).

---

## 3. Fayllar Rejasi
1. `data/models.json` (Yangi)
2. `data/trims.json` (Yangi)
3. `data/colors.json` (Yangi)
4. `data/inventory.json` (Yangi)
5. `data/settings.json` (Yangi)
6. `data/technologies.json` (Yangi)
7. `src/lib/data-provider.ts` (Yangi)
8. `prisma/seed.ts` (O'zgartirish)
9. `src/app/(public)/page.tsx` (O'zgartirish: hardcode o'chiriladi)
10. `src/components/home/TechnologySection.tsx` (O'zgartirish: hardcode o'chiriladi)
11. `src/lib/settings.ts` (O'zgartirish: hardcode o'chiriladi)
12. `tests/data-provider.test.ts` (Yangi test)

