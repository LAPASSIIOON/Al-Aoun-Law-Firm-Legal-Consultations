import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.js');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // إعادة توجيه الجذر للغة الافتراضية على مستوى Vercel edge —
  // ضمان قاطع ألا يعطي '/' الرمز 404 حتى لو تأخّر الـmiddleware.
  async redirects() {
    return [
      {
        source: '/',
        destination: '/ar',
        permanent: false,
      },
    ];
  },
  // ترويسات أمان أساسية على كل الاستجابات — راجع §مراجعة أمنية.
  // ملاحظة: Content-Security-Policy مقصود استبعادها هنا — تحتاج اختبارًا دقيقًا منفصلًا
  // (Turnstile + خرائط جوجل + سكربتات Next.js الداخلية) قبل التفعيل لتفادي كسر الموقع.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          // مرحلة رصد فقط — Report-Only لا يفرض السياسة ولا يوفّر حماية بعد.
          {
            key: 'Content-Security-Policy-Report-Only',
            value: [
              "default-src 'self'",
              "base-uri 'self'",
              "object-src 'none'",
              "frame-ancestors 'none'",
              "form-action 'self'",
              "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self'",
              "font-src 'self'",
              "connect-src 'self' https://ngyhplcnmedafjzotgho.supabase.co",
              "frame-src https://challenges.cloudflare.com https://www.google.com",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
