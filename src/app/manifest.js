/**
 * بيان تطبيق الويب — يفعّل "إضافة إلى الشاشة الرئيسية" بأيقونة عالية الجودة (بدل لقطة شاشة عامة).
 * لا نُصدِر ملفًا واحدًا لكل لغة (البيان عادةً واحد لكل نطاق) — نستخدم الاسم العربي (اللغة الافتراضية للمكتب).
 */
export default function manifest() {
  return {
    name: 'مجموعة العون — محامون ومستشارون قانونيون',
    short_name: 'مجموعة العون',
    description: 'مكتب محاماة واستشارات قانونية كويتي، تأسّس عام ٢٠٠٠.',
    start_url: '/ar',
    display: 'standalone',
    background_color: '#0E1826',
    theme_color: '#141E36',
    lang: 'ar',
    dir: 'rtl',
    icons: [
      { src: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { src: '/icons/favicon-48.png', sizes: '48x48', type: 'image/png' },
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    ],
  };
}
