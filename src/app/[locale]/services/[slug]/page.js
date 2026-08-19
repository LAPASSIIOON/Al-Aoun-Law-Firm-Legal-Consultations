import { notFound } from 'next/navigation';
import { altLangs } from '@/lib/i18n-meta.js';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { createAnonClient } from '@/lib/supabase-server.js';
import { Link } from '@/i18n/navigation.js';
import Breadcrumbs from '@/components/Breadcrumbs.js';
import s from '../../shared.module.css';
import fs from 'node:fs';
import path from 'node:path';

const IMG_DIR = path.join(process.cwd(), 'public', 'practice-areas');
function hasImage(slug) {
  try { return fs.existsSync(path.join(IMG_DIR, `${slug}.webp`)); } catch { return false; }
}

async function getArea(slug, locale) {
  try {
    const supabase = createAnonClient();
    const { data } = await supabase.from('practice_area_translations')
      .select('title, summary, body').eq('slug', slug).eq('locale', locale)
      .eq('status', 'published').eq('legal_approved', true).maybeSingle();
    return data;
  } catch (e) { return null; }
}

async function getOthers(slug, locale) {
  try {
    const supabase = createAnonClient();
    const { data } = await supabase.from('practice_area_translations')
      .select('slug, title, practice_areas(sort_order)')
      .eq('locale', locale).eq('status', 'published').eq('legal_approved', true).neq('slug', slug);
    return (data || []).sort((a, b) => (a.practice_areas?.sort_order || 0) - (b.practice_areas?.sort_order || 0)).slice(0, 4);
  } catch (e) { return []; }
}

export async function generateMetadata({ params }) {
  const { slug, locale } = await params; const a = await getArea(slug, locale);
  return a ? { title: a.title, description: a.summary, alternates: altLangs(locale, `/services/${slug}`) } : {};
}

/** @param {{ params: Promise<{ slug: string, locale: string }> }} props */
export default async function ServiceDetail({ params }) {
  const { slug, locale } = await params; setRequestLocale(locale);
  const [a, others, tPA, tSP, n] = await Promise.all([
    getArea(slug, locale),
    getOthers(slug, locale),
    getTranslations({ locale, namespace: 'practiceAreas' }),
    getTranslations({ locale, namespace: 'servicesPage' }),
    getTranslations({ locale, namespace: 'nav' }),
  ]);
  if (!a) notFound();

  return (
    <>
      <section className={`on-navy ${s.pageHead} section-tight`}>
        <div className="wrap">
          <Breadcrumbs items={[
            { label: locale === 'ar' ? 'الرئيسية' : 'Home', href: '/' },
            { label: tPA('eyebrow'), href: '/services' },
            { label: a.title },
          ]} />
          <span className="eyebrow" data-reveal>{tPA('eyebrow')}</span>
          <h1 className="display d-1" data-reveal style={{ marginBlock: '1.2rem 1.2rem' }}>{a.title}</h1>
          {a.summary && <p className="lead" data-reveal style={{ maxWidth: '52ch' }}>{a.summary}</p>}
        </div>
      </section>

      {hasImage(slug) && (
        <section className="on-white" style={{ paddingBlock: '2.5rem 0' }}>
          <div className="wrap">
            <div className="img-zoom-frame" data-reveal style={{ borderRadius: 'var(--r-lg)' }}>
              <img src={`/practice-areas/${slug}.webp`} alt=""
                style={{ width: '100%', height: 'clamp(200px,32vw,380px)', objectFit: 'cover', display: 'block' }} />
            </div>
          </div>
        </section>
      )}

      <section className="on-white section">
        <div className="wrap-narrow wrap">
          {a.body ? (
            <div className="body" data-reveal style={{ whiteSpace: 'pre-wrap', fontSize: '1.05rem', lineHeight: 1.9, maxWidth: '68ch' }}>{a.body}</div>
          ) : (
            <p className="lead" data-reveal style={{ maxWidth: '52ch' }}>{tSP('detailForthcoming')}</p>
          )}
          <div data-reveal style={{ marginBlockStart: '2.5rem', padding: 'clamp(1.5rem,3vw,2.25rem)', borderRadius: 'var(--r-lg)', background: 'var(--surface-2)', boxShadow: 'inset 0 0 0 1px var(--hair-light)' }}>
            <p className="body" style={{ marginBlockEnd: '1.1rem', fontSize: '1rem' }}>
              {locale === 'ar' ? 'لمناقشة مسألتك ضمن هذا المجال، يمكنك طلب استشارة مباشرة.' : 'To discuss your matter in this area, you can request a consultation directly.'}
            </p>
            <Link href="/contact" className="btn btn-solid">{n('consult')} <span className="arrow">→</span></Link>
          </div>
        </div>
      </section>

      {others.length > 0 && (
        <section className="on-navy section-tight">
          <div className="wrap">
            <span className="eyebrow" data-reveal>{locale === 'ar' ? 'مجالات أخرى' : 'Other practice areas'}</span>
            <div className="grid cols-2" style={{ marginBlockStart: '1.5rem' }}>
              {others.map((o) => (
                <Link key={o.slug} href={`/services/${o.slug}`} className="btn-line" data-reveal style={{ fontSize: '1.05rem' }}>
                  {o.title} <span className="arrow">→</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
