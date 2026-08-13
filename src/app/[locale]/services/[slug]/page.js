import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { createAnonClient } from '@/lib/supabase-server.js';
import { Link } from '@/i18n/navigation.js';
import s from '../../shared.module.css';

async function getArea(slug, locale) {
  try {
    const supabase = createAnonClient();
    const { data } = await supabase.from('practice_area_translations')
      .select('title, summary, body').eq('slug', slug).eq('locale', locale)
      .eq('status', 'published').eq('legal_approved', true).maybeSingle();
    return data;
  } catch (e) { return null; }
}
export async function generateMetadata({ params }) {
  const { slug, locale } = await params; const a = await getArea(slug, locale);
  return a ? { title: a.title, description: a.summary } : {};
}
export default async function ServiceDetail({ params }) {
  const { slug, locale } = await params; setRequestLocale(locale);
  const a = await getArea(slug, locale);
  if (!a) notFound();
  return (
    <section className={`on-ivory ${s.pageHead} section`}>
      <div className="wrap-narrow wrap">
        <Link href="/services" className="btn-line" style={{ marginBlockEnd: '2rem' }}>{(await getTranslations('practiceAreas'))('eyebrow')}</Link>
        <h1 className="display d-1" data-reveal style={{ marginBlock: '1rem 1.2rem' }}>{a.title}</h1>
        {a.summary && <p className="lead" data-reveal style={{ marginBlockEnd: '2rem' }}>{a.summary}</p>}
        {a.body && <div className="prose body" data-reveal style={{ color: 'var(--muted)', whiteSpace: 'pre-wrap' }}>{a.body}</div>}
      </div>
    </section>
  );
}
