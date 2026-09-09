import { notFound } from 'next/navigation';
import { altLangs } from '@/lib/i18n-meta.js';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { createAnonClient } from '@/lib/supabase-server.js';
import { Link } from '@/i18n/navigation.js';
import Breadcrumbs from '@/components/Breadcrumbs.js';
import PageUtilityIcons from '@/components/PageUtilityIcons.js';
import s from '../../shared.module.css';
import styles from './service-detail.module.css';
import { GROUPS, SLUG_TO_GROUP } from '@/lib/practice-area-groups.js';
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
    return (data || []).sort((a, b) => (a.practice_areas?.sort_order || 0) - (b.practice_areas?.sort_order || 0));
  } catch (e) { return []; }
}

function getCategory(slug, locale) {
  const group = GROUPS.find((item) => item.key === SLUG_TO_GROUP[slug]);
  return group ? group[locale] : (locale === 'ar' ? 'مجالات الممارسة' : 'Practice Areas');
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
  const category = getCategory(slug, locale);
  const sameCategory = others.filter((item) => SLUG_TO_GROUP[item.slug] === SLUG_TO_GROUP[slug]);
  const related = (sameCategory.length ? sameCategory : others).slice(0, 4);
  const imageAvailable = hasImage(slug);

  return (
    <>
      <section className={`on-navy ${s.pageHead} section-tight ${styles.hero}`}>
        {imageAvailable && <div className={styles.heroArt} aria-hidden="true" style={{ backgroundImage: `url('/practice-areas/${slug}.webp')` }} />}
        <div className={`wrap ${styles.heroInner}`}>
          <Breadcrumbs locale={locale} items={[
            { label: locale === 'ar' ? 'الرئيسية' : 'Home', href: '/' },
            { label: tPA('eyebrow'), href: '/services' },
            { label: a.title },
          ]} />
          <span className={styles.category} data-reveal>{category}</span>
          <h1 className="display d-1" data-reveal style={{ marginBlock: '1.2rem 1.2rem' }}>{a.title}</h1>
          {a.summary && <p className={`lead ${styles.heroSummary}`} data-reveal>{a.summary}</p>}
          <PageUtilityIcons title={a.title} locale={locale} />
          <div className={styles.heroFoot} aria-hidden="true">AL OUN</div>
        </div>
      </section>

      <section className={`on-white ${styles.content}`}>
        <div className={`wrap ${styles.layout}`}>
          <aside className={styles.rail} aria-label={locale === 'ar' ? 'تصنيف المجال' : 'Practice classification'}>
            <span className={styles.railLabel}>{tPA('eyebrow')}</span>
            <span className={styles.railValue}>{category}</span>
            <span className={styles.railLine} aria-hidden="true" />
          </aside>
          <article className={styles.prose}>
            <h2 className={styles.proseHead}>{locale === 'ar' ? 'نظرة على المجال' : 'An overview of this practice'}</h2>
          {a.body ? (
            <div className={styles.body} data-reveal>{a.body}</div>
          ) : (
            <p className={styles.summaryOnly} data-reveal>{a.summary || tSP('detailForthcoming')}</p>
          )}
            <div className={styles.inquiry} data-reveal>
              <span className={styles.inquiryEyebrow}>{locale === 'ar' ? 'خطوة عملية' : 'A practical next step'}</span>
              <p className={styles.inquiryText}>
                {locale === 'ar' ? 'لمناقشة مسألتك ضمن هذا المجال، يمكنك طلب استشارة مباشرة.' : 'To discuss your matter in this area, you can request a consultation directly.'}
            </p>
              <Link href={`/contact?intent=legalConsultation&from=/${locale}/services/${slug}`} className="btn btn-solid">{n('consult')} <span className="arrow">→</span></Link>
            </div>
          </article>
        </div>
      </section>

      {related.length > 0 && (
        <section className={`on-navy ${styles.related}`}>
          <div className="wrap">
            <div className={styles.relatedHead}>
              <div>
                <span className="eyebrow" data-reveal>{locale === 'ar' ? 'استكشف أيضًا' : 'Explore also'}</span>
                <h2 className={styles.relatedTitle} data-reveal>{locale === 'ar' ? 'مجالات متصلة' : 'Related practice areas'}</h2>
              </div>
              <Link href="/services" className="btn-line" data-reveal>{tPA('heading')} <span className="arrow">→</span></Link>
            </div>
            <div className={styles.relatedList}>
              {related.map((o) => (
                <Link key={o.slug} href={`/services/${o.slug}`} className={styles.relatedItem} data-reveal="file">
                  <span className={styles.relatedItemTitle}>{o.title}</span><span className="arrow" aria-hidden="true">→</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
