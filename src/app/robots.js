const BASE_URL = 'https://al-aoun-law-firm-legal-consultation.vercel.app';

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/actions/'],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
