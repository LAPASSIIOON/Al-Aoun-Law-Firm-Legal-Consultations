import { defineRouting } from 'next-intl/routing';

/**
 * تعريف اللغات المدعومة ومسار الدخول الافتراضي.
 * العربية هي اللغة الأساسية للمكتب (السوق الكويتي)، الإنجليزية لغة ثانوية.
 */
export const routing = defineRouting({
  locales: ['ar', 'en'],
  defaultLocale: 'ar',
  localePrefix: 'always',
});
