/**
 * يبني alternates.languages الصحيح لصفحة مُعيَّنة — لا الرئيسية دائمًا.
 * @param {string} pathAfterLocale مسار الصفحة بعد رمز اللغة، بدون شرطة مائلة زائدة (مثال: '', '/about', '/services/slug')
 */
export function altLangs(pathAfterLocale = '') {
  return { languages: { ar: `/ar${pathAfterLocale}`, en: `/en${pathAfterLocale}` } };
}
