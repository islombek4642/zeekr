import { cookies, headers } from 'next/headers';
import uzTranslations from '@/locales/uz.json';
import ruTranslations from '@/locales/ru.json';

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
  uz: uzTranslations,
  ru: ruTranslations,
};

export function getTranslations(locale: Locale) {
  return translations[locale] || translations.uz;
}
