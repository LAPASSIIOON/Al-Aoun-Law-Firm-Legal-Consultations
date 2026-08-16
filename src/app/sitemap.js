import { createAnonClient } from '@/lib/supabase-server.js';

const BASE_URL = 'https://al-aoun-law-firm-legal-consultation.vercel.app';
const LOCALES = ['ar', 'en'];

const STATIC_PATHS = [
  { path: '', priority: 1.0, freq: 'weekly' },
  { path: '/international', priority: 0.9, freq: 'monthly' },
  { path: '/international/for-law-firms', priority: 0.85, freq: 'monthly' },
  { path: '/international/refer-a-matter', priority: 0.7, freq: 'monthly' },
  { path: '/international/partner-with-us', priority: 0.7, freq: 'monthly' },
  { path: '/about', priority: 0.8, freq: 'monthly' },
  { path: '/services', priority: 0.9, freq: 'weekly' },
  { path: '/team', priority: 0.7, freq: 'monthly' },
  { path: '/team/haitham-al-aoun', priority: 0.7, freq: 'monthly' },
  { path: '/insights', priority: 0.7, freq: 'weekly' },
  { path: '/contact', priority: 0.8, freq: 'yearly' },
  { path: '/careers', priority: 0.5, freq: 'monthly' },
  { path: '/privacy', priority: 0.3, freq: 'yearly' },
  { path: '/terms', priority: 0.3, freq: 'yearly' },
];

async function fetchServiceSlugs() {
  try {
    const supabase = createAnonClient();
    const { data } = await supabase
      .from('practice_area_translations')
      .select('slug, locale')
      .eq('status', 'published')
      .eq('legal_approved', true);
    return data || [];
  } catch (e) { return []; }
}

async function fetchArticleSlugs() {
  try {
    const supabase = createAnonClient();
    const { data } = await supabase
      .from('article_translations')
      .select('slug, locale, created_at')
      .eq('status', 'published')
      .eq('legal_approved', true);
    return data || [];
  } catch (e) { return []; }
}

export default async function sitemap() {
  const now = new Date();
  const entries = [];

  for (const locale of LOCALES) {
    for (const { path, priority, freq } of STATIC_PATHS) {
      entries.push({
        url: `${BASE_URL}/${locale}${path}`,
        lastModified: now,
        changeFrequency: freq,
        priority,
      });
    }
  }

  const [services, articles] = await Promise.all([fetchServiceSlugs(), fetchArticleSlugs()]);

  for (const s of services) {
    entries.push({
      url: `${BASE_URL}/${s.locale}/services/${s.slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.75,
    });
  }

  for (const a of articles) {
    entries.push({
      url: `${BASE_URL}/${a.locale}/insights/${a.slug}`,
      lastModified: a.created_at ? new Date(a.created_at) : now,
      changeFrequency: 'monthly',
      priority: 0.6,
    });
  }

  return entries;
}
