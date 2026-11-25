import { cookies, headers } from 'next/headers';

export type Locale = 'uz' | 'ru';

export async function getCurrentLocale(): Promise<Locale> {
  try {
    const cookieStore = await cookies();
    const cookieLocale =
      cookieStore.get('locale')?.value ||
      cookieStore.get('NEXT_LOCALE')?.value ||
      cookieStore.get('zeekr_locale')?.value;

    if (cookieLocale === 'ru') return 'ru';
    if (cookieLocale === 'uz') return 'uz';

    const headerList = await headers();
    const acceptLang = headerList.get('accept-language') || '';
    if (acceptLang.toLowerCase().startsWith('ru') || acceptLang.toLowerCase().includes('ru-')) {
      return 'ru';
    }
  } catch {}
  return 'uz';
}

export const translations = {
  uz: {
    nav: {
      models: 'Modellar',
      inventory: 'Mavjud avtomobillar',
      testDrive: 'Test-drayv',
      service: 'Servis va Kafolat',
      contacts: 'Kontaktlar',
      callUs: 'Qo\'ng\'iroq qilish',
    },
    common: {
      testDrive: 'Test-drayv',
      details: 'Batafsil',
      reserve: 'Band qilish',
      inStock: 'Mavjud',
      inTransit: 'Yo\'lda',
      priceFrom: 'Boshlang\'ich narx',
      allRightsReserved: 'Barcha huquqlar himoyalangan',
      officialDealer: 'Rasmiy Dilerlik Markazi',
    },
    home: {
      showroomBadge: 'Rasmiy Dilerlik Markazi',
      showroomTitle: 'Zeekr Rasmiy Showroom va Servis Markazi',
      showroomSubtitle: 'Toshkent shahrida joylashgan premium dilerlik markazimizga tashrif buyuring va eksklyuziv elektromobillarni sinab ko\'ring.',
      addressLabel: 'Showroom manzili',
      hoursLabel: 'Ish vaqti',
      phoneLabel: 'Yagona aloqa markazi',
      emailLabel: 'Rasmiy elektron pochta',
      viewContacts: 'Showroom ma\'lumotlari',
      bookTestDrive: 'Test-drayvga yozilish',
    },
    models: {
      pageTitle: 'Zeekr Rasmiy Dilerlik Vitrinasi',
      backToModels: 'Barcha modellarga qaytish',
      galleryTitle: 'Fotogalereya',
      gallerySubtitle: 'Eksteryer va Interyer Tafsilotlari',
      configuratorTitle: 'Komplektatsiyani Tanlang:',
      calculatorTitle: 'Kredit & Lizing Kalkulyatori',
    },
    inventory: {
      badge: 'Ombordagi Avtomobillar',
      title: 'Mavjud Avtomobillar',
      subtitle: 'Toshkentdagi salonda mavjud yoki eng yaqin kunlarda yetkazib beriladigan elektromobillar ro\'yxati.',
      allModels: 'Barcha modellar',
      allStatuses: 'Barcha statuslar',
    },
    testDrive: {
      badge: 'Test-Drayv',
      title: 'Haqiqiy Elektr Quvvatini His Qiling',
      subtitle: 'O\'zingizga yoqqan Zeekr modelini tanlang va professional haydovchi hamrohligida sinovdan o\'tkazing.',
    },
    service: {
      badge: 'Rasmiy Servis Markazi',
      title: 'Kafolat va Premium Texnik Xizmat',
      subtitle: 'Zeekr avtomobillariga faqat ishlab chiqaruvchi tomonidan o\'qitilgan sertifikatlangan muhandislar xizmat ko\'rsatadi.',
      bookingTitle: 'Servis Xizmatiga Yozilish',
    },
    contacts: {
      badge: 'Aloqa',
      title: 'Biz Bilan Bog\'lanish',
      subtitle: 'Savollaringiz bormi? Mutaxassislarimiz sizga professional maslahat berishga tayyor.',
    },
    footer: {
      brandDesc: 'Zeekr elektromobillarining O\'zbekistondagi rasmiy dilerlik platformasi. Hashamat, xavfsizlik va yuqori elektr innovatsiyalari.',
      modelsTitle: 'Modellar',
      clientsTitle: 'Mijozlarga',
      contactsTitle: 'Kontaktlar',
      inStockCars: 'Salonda mavjud avtomobillar',
      bookDrive: 'Test-drayvga yozilish',
      serviceWarranty: 'Servis va kafolat',
    },
  },
  ru: {
    nav: {
      models: 'Модели',
      inventory: 'Автомобили в наличии',
      testDrive: 'Тест-драйв',
      service: 'Сервис и гарантия',
      contacts: 'Контакты',
      callUs: 'Позвонить',
    },
    common: {
      testDrive: 'Тест-драйв',
      details: 'Подробнее',
      reserve: 'Забронировать',
      inStock: 'В наличии',
      inTransit: 'В пути',
      priceFrom: 'Начальная цена',
      allRightsReserved: 'Все права защищены',
      officialDealer: 'Официальный дилерский центр',
    },
    home: {
      showroomBadge: 'Официальный дилерский центр',
      showroomTitle: 'Официальный шоурум и сервисный центр Zeekr',
      showroomSubtitle: 'Посетите наш премиальный дилерский центр в Ташкенте и пройдите тест-драйв эксклюзивных электромобилей.',
      addressLabel: 'Адрес шоурума',
      hoursLabel: 'Режим работы',
      phoneLabel: 'Единый контакт-центр',
      emailLabel: 'Электронная почта',
      viewContacts: 'Контакты шоурума',
      bookTestDrive: 'Записаться на тест-драйв',
    },
    models: {
      pageTitle: 'Официальная витрина дилера Zeekr',
      backToModels: 'Вернуться ко всем моделям',
      galleryTitle: 'Фотогалерея',
      gallerySubtitle: 'Детали экстерьера и интерьера',
      configuratorTitle: 'Выберите комплектацию:',
      calculatorTitle: 'Кредитный и лизинговый калькулятор',
    },
    inventory: {
      badge: 'Автомобили на складе',
      title: 'Электромобили Zeekr в наличии',
      subtitle: 'Список электромобилей в наличии в автосалоне Ташкента или с ближайшей поставкой.',
      allModels: 'Все модели',
      allStatuses: 'Все статусы',
    },
    testDrive: {
      badge: 'Тест-драйв',
      title: 'Почувствуйте истинную мощь электротяги',
      subtitle: 'Выберите понравившуюся модель Zeekr и испытайте её в сопровождении опытного инструктора.',
    },
    service: {
      badge: 'Официальный сервисный центр',
      title: 'Гарантия и премиальное техническое обслуживание',
      subtitle: 'Обслуживание автомобилей Zeekr сертифицированными специалистами с оригинальными запчастями.',
      bookingTitle: 'Запись на сервисное обслуживание',
    },
    contacts: {
      badge: 'Контакты',
      title: 'Свяжитесь с нами',
      subtitle: 'У вас есть вопросы? Наши консультанты готовы предоставить исчерпывающую информацию.',
    },
    footer: {
      brandDesc: 'Официальная дилерская платформа электромобилей Zeekr в Узбекистане. Роскошь, безопасность и инновации.',
      modelsTitle: 'Модели',
      clientsTitle: 'Клиентам',
      contactsTitle: 'Контакты',
      inStockCars: 'Автомобили в наличии в салоне',
      bookDrive: 'Записаться на тест-драйв',
      serviceWarranty: 'Сервис и гарантия',
    },
  },
};

export function getTranslations(locale: Locale) {
  return translations[locale] || translations.uz;
}
