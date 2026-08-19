/**
 * يبني alternates الصحيح (canonical + languages) لصفحة مُعيَّنة.
 * @param {'ar'|'en'} locale اللغة الحالية للصفحة نفسها — تحدّد الـcanonical.
 * @param {string} pathAfterLocale مسار الصفحة بعد رمز اللغة، بدون شرطة مائلة زائدة (مثال: '', '/about', '/services/slug')
 */
export function altLangs(locale, pathAfterLocale = '') {
  return {
    canonical: `/${locale}${pathAfterLocale}`,
    languages: { ar: `/ar${pathAfterLocale}`, en: `/en${pathAfterLocale}` },
  };
}
