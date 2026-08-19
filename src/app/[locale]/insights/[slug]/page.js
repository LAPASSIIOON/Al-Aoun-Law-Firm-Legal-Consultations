import { notFound } from 'next/navigation';
import { altLangs } from '@/lib/i18n-meta.js';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { createAnonClient } from '@/lib/supabase-server.js';
import { Link } from '@/i18n/navigation.js';
import s from '../../shared.module.css';

async function getArticle(slug, locale) {
  try {
    const supabase = createAnonClient();
    const { data } = await supabase.from('article_translations')
      .select('title, excerpt, body, meta_title, meta_description').eq('slug', slug).eq('locale', locale)
      .eq('status', 'published').eq('legal_approved', true).maybeSingle();
    return data;
  } catch (e) { return null; }
}
export async function generateMetadata({ params }) {
  const { slug, locale } = await params; const a = await getArticle(slug, locale);
  return a ? { title: a.meta_title || a.title, description: a.meta_description || a.excerpt, alternates: altLangs(locale, `/insights/${slug}`) } : {};
}
export default async function Article({ params }) {
  const { slug, locale } = await params; setRequestLocale(locale);
  const a = await getArticle(slug, locale);
  if (!a) notFound();
  const t = await getTranslations('insights');
  return (
    <article className={`on-ivory ${s.pageHead} section`}>
      <div className="wrap-narrow wrap">
        <Link href="/insights" className="btn-line" style={{ marginBlockEnd: '2rem' }}>{t('heading')}</Link>
        <h1 className="display d-1" data-reveal style={{ marginBlock: '1rem 1.2rem' }}>{a.title}</h1>
        {a.excerpt && <p className="lead" data-reveal style={{ marginBlockEnd: '2rem' }}>{a.excerpt}</p>}
        {a.body && <div className="prose body" data-reveal style={{ color: 'var(--muted)', whiteSpace: 'pre-wrap' }}>{a.body}</div>}
      </div>
    </article>
  );
}
