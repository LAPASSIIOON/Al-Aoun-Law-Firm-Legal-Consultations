import { notFound } from 'next/navigation';
import { cache } from 'react';
import { altLangs } from '@/lib/i18n-meta.js';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { createAnonClient } from '@/lib/supabase-server.js';
import { Link } from '@/i18n/navigation.js';
import Breadcrumbs from '@/components/Breadcrumbs.js';
import PageUtilityIcons from '@/components/PageUtilityIcons.js';
import { whatsappHref } from '@/lib/whatsapp.js';
import { TEAM } from '@/lib/team-data.js';
import s from '../../shared.module.css';
import styles from './service-detail.module.css';
import { GROUPS, SLUG_TO_GROUP } from '@/lib/practice-area-groups.js';
import fs from 'node:fs';
import path from 'node:path';

/* ═══ قالب صفحة مجال الممارسة (معتمد من المالك، ١٥ أكتوبر ٢٠٢٦) ═══
 * يُبنى كله من بيانات حقيقية: عنوان المجال وملخّصه ونصّه المعتمد من قاعدة البيانات، وخطوات البدء
 * وأسئلة الاستشارة من نصوص الموقع المعتمدة نفسها (intake / faq / consultCta)، وبطاقتا المحاميَين من
 * team-data بوزن متساوٍ. لا محتوى مخصّص لكل مجال يُخترع هنا: أي قسم بلا بيانات لا يُعرض. */

const IMG_DIR = path.join(process.cwd(), 'public', 'practice-areas');
const AREA_RETRY_DELAYS_MS = [0, 150, 500];
function hasImage(slug) {
  try { return fs.existsSync(path.join(IMG_DIR, `${slug}.webp`)); } catch { return false; }
}

/* أسئلة الاستشارة العامة من صفحة الأسئلة الشائعة (faq.items): كيف أطلب، هل هي مجانية، فحص التعارض */
const CONSULT_FAQ = [2, 3, 4];

const T = {
  ar: {
    consultInArea: 'اطلب استشارة في هذا المجال',
    whatsapp: 'تواصل عبر واتساب',
    overviewEye: 'نظرة على المجال',
    overviewHead: 'ما يشمله هذا المجال',
    processEye: 'خطوات البدء',
    processHead: 'كيف نعمل معك',
    teamEye: 'الفريق',
    teamHead: 'محامو المجموعة',
    profile: 'الملف الكامل',
    faqEye: 'أسئلة شائعة',
    faqHead: 'قبل أن تبدأ',
    allFaq: 'كل الأسئلة',
    consultEye: 'استشارة بسرّية تامة',
    consultHead: 'ناقش مسألتك مع المكتب',
    consultPoints: [
      'الخطوة الأولى: اسمك ووسيلة التواصل فقط',
      'لا تفاصيل عن وقائع القضية قبل فحص تعارض المصالح',
      'قناة تواصل مؤمَّنة بعد اجتياز الفحص',
    ],
    inPage: 'في هذه الصفحة',
    consultNav: 'طلب استشارة',
    exploreEye: 'استكشف أيضًا',
    relatedHead: 'مجالات متصلة',
    view: 'استعراض',
  },
  en: {
    consultInArea: 'Request a consultation in this area',
    whatsapp: 'Chat on WhatsApp',
    overviewEye: 'Overview',
    overviewHead: 'What this practice covers',
    processEye: 'Getting started',
    processHead: 'How we work with you',
    teamEye: 'The team',
    teamHead: 'Our lawyers',
    profile: 'Full profile',
    faqEye: 'FAQ',
    faqHead: 'Before you begin',
    allFaq: 'All questions',
    consultEye: 'Strictly confidential',
    consultHead: 'Discuss your matter with the firm',
    consultPoints: [
      'First step: your name and preferred contact only',
      'No case facts before the conflict-of-interest check',
      'A secure channel once the check is cleared',
    ],
    inPage: 'On this page',
    consultNav: 'Request a consultation',
    exploreEye: 'Explore also',
    relatedHead: 'Related practice areas',
    view: 'View',
  },
};

const WaIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 12a8.5 8.5 0 0 1-12.4 7.6L3.5 21l1.4-4.9A8.5 8.5 0 1 1 21 12z" />
  </svg>
);
const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);
const ShieldIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3z" />
  </svg>
);
const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const getArea = cache(async function getArea(slug, locale) {
  let lastError = null;
  for (const delayMs of AREA_RETRY_DELAYS_MS) {
    if (delayMs) await new Promise((resolve) => setTimeout(resolve, delayMs));
    const supabase = createAnonClient();
    const { data, error } = await supabase.from('practice_area_translations')
      .select('title, summary, body').eq('slug', slug).eq('locale', locale)
      .eq('status', 'published').eq('legal_approved', true).maybeSingle();
    if (!error) return data;
    lastError = error;
  }
  throw new Error('Unable to load the requested practice area.', { cause: lastError });
});

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

/* النص المعتمد فقرة واحدة غالبًا؛ إن كان فيه أسطر فارغة نحترمها فقرات */
function paragraphs(body) {
  return String(body || '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
}

export async function generateMetadata({ params }) {
  const { slug, locale } = await params; const a = await getArea(slug, locale);
  return a ? { title: a.title, description: a.summary, alternates: altLangs(locale, `/services/${slug}`) } : {};
}

/** @param {{ params: Promise<{ slug: string, locale: string }> }} props */
export default async function ServiceDetail({ params }) {
  const { slug, locale } = await params; setRequestLocale(locale);
  const [a, others, tPA, tSP, n, tIn, tFaq, tCta] = await Promise.all([
    getArea(slug, locale),
    getOthers(slug, locale),
    getTranslations({ locale, namespace: 'practiceAreas' }),
    getTranslations({ locale, namespace: 'servicesPage' }),
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'intake' }),
    getTranslations({ locale, namespace: 'faq' }),
    getTranslations({ locale, namespace: 'consultCta' }),
  ]);
  if (!a) notFound();
  const L = T[locale] || T.ar;
  const category = getCategory(slug, locale);
  const sameCategory = others.filter((item) => SLUG_TO_GROUP[item.slug] === SLUG_TO_GROUP[slug]);
  const related = (sameCategory.length ? sameCategory : others).slice(0, 4);
  const imageAvailable = hasImage(slug);
  const consultHref = `/contact?intent=legalConsultation&from=/${locale}/services/${slug}`;
  const wa = whatsappHref(locale);
  const bodyParas = paragraphs(a.body);

  const steps = [1, 2, 3].map((i) => ({ title: tIn(`step${i}Title`), body: tIn(`step${i}Body`) }));
  const faqAll = tFaq.raw('items') || [];
  const faq = CONSULT_FAQ.map((i) => faqAll[i]).filter((item) => item && item.q && item.a);
  const team = TEAM.map((m) => ({ slug: m.slug, photo: m.photoThumb, ...(m[locale] || m.ar) })).filter((m) => m.name);

  const sections = [
    { id: 'overview', label: L.overviewEye },
    { id: 'process', label: L.processHead },
    team.length ? { id: 'team', label: L.teamHead } : null,
    faq.length ? { id: 'faq', label: L.faqHead } : null,
  ].filter(Boolean);

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
          <div className={styles.heroActions} data-reveal>
            <Link href={consultHref} className="btn btn-solid">{L.consultInArea} <span className="arrow">→</span></Link>
            <a href={wa} target="_blank" rel="noopener noreferrer" className={`btn btn-ghost ${styles.waBtn}`}><WaIcon />{L.whatsapp}</a>
          </div>
          <PageUtilityIcons title={a.title} locale={locale} />
        </div>
      </section>

      <div className={styles.contentWrap}>
      {/* الهاتف: فهرس أفقي ثابت أعلى المحتوى (على الشاشات الواسعة يسكن في العمود الجانبي) */}
      <nav className={`no-print ${styles.pageNavBar}`} aria-label={L.inPage}>
        <div className={styles.pageNavBarInner}>
          {sections.map((sec) => <a key={sec.id} href={`#${sec.id}`} className={styles.pageNavChip}>{sec.label}</a>)}
          <a href="#consult" className={styles.pageNavChip}>{L.consultNav}</a>
        </div>
      </nav>

      <section className={`on-white ${styles.content}`}>
        <div className={`wrap ${styles.layout}`}>
          <div className={styles.main}>
            <section id="overview" className={styles.block} aria-labelledby="h-overview">
              <span className={styles.blockEye}>{L.overviewEye}</span>
              <h2 id="h-overview" className={styles.blockHead}>{L.overviewHead}</h2>
              {bodyParas.length ? (
                <div className={styles.body} data-reveal>{bodyParas.map((p, i) => <p key={i}>{p}</p>)}</div>
              ) : (
                <p className={styles.summaryOnly} data-reveal>{a.summary || tSP('detailForthcoming')}</p>
              )}
            </section>

            <section id="process" className={styles.block} aria-labelledby="h-process">
              <span className={styles.blockEye}>{L.processEye}</span>
              <h2 id="h-process" className={styles.blockHead}>{L.processHead}</h2>
              <ol className={styles.steps}>
                {steps.map((st, i) => (
                  <li key={st.title} className={styles.step} data-reveal>
                    <span className={`${styles.stepNum} ${i === 0 ? styles.stepNumOn : ''}`} aria-hidden="true">{locale === 'ar' ? ['١', '٢', '٣'][i] : i + 1}</span>
                    <h3 className={styles.stepTitle}>{st.title}</h3>
                    <p className={styles.stepBody}>{st.body}</p>
                  </li>
                ))}
              </ol>
            </section>

            {team.length > 0 && (
              <section id="team" className={styles.block} aria-labelledby="h-team">
                <span className={styles.blockEye}>{L.teamEye}</span>
                <h2 id="h-team" className={styles.blockHead}>{L.teamHead}</h2>
                <div className={styles.team}>
                  {team.map((m) => (
                    <article key={m.slug} className={styles.person} data-reveal>
                      {m.photo && <img src={m.photo} alt={m.name} className={styles.personPhoto} loading="lazy" decoding="async" width="112" height="128" />}
                      <div className={styles.personBody}>
                        <h3 className={styles.personName}>{m.name}</h3>
                        {m.role && <p className={styles.personRole}>{m.role}</p>}
                        {m.title && <p className={styles.personTitle}>{m.title}</p>}
                        <Link href={`/team/${m.slug}`} className={styles.personLink}>{L.profile} <span className="arrow" aria-hidden="true">→</span></Link>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {faq.length > 0 && (
              <section id="faq" className={styles.block} aria-labelledby="h-faq">
                <div className={styles.blockTop}>
                  <div>
                    <span className={styles.blockEye}>{L.faqEye}</span>
                    <h2 id="h-faq" className={styles.blockHead}>{L.faqHead}</h2>
                  </div>
                  <Link href="/faq" className={styles.moreLink}>{L.allFaq} <span className="arrow" aria-hidden="true">→</span></Link>
                </div>
                <div className={styles.faq}>
                  {faq.map((item, i) => (
                    <details key={item.q} className={styles.faqItem} open={i === 0}>
                      <summary className={styles.faqQ}><span>{item.q}</span><span className={styles.faqPlus}><PlusIcon /></span></summary>
                      <p className={styles.faqA}>{item.a}</p>
                    </details>
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className={styles.aside} aria-label={L.consultHead}>
            <div id="consult" className={`on-navy ${styles.consult}`}>
              <span className={styles.consultEye}><ShieldIcon />{L.consultEye}</span>
              <h2 className={styles.consultHead}>{L.consultHead}</h2>
              <ul className={styles.consultPoints}>
                {L.consultPoints.map((p) => <li key={p}><CheckIcon />{p}</li>)}
              </ul>
              <Link href={consultHref} className={`btn btn-solid ${styles.consultBtn}`}>{n('consult')}</Link>
              <a href={wa} target="_blank" rel="noopener noreferrer" className={`btn btn-ghost ${styles.consultBtn} ${styles.waBtn}`}><WaIcon />{L.whatsapp}</a>
              <p className={styles.consultNote}>{tCta('disclaimer')}</p>
            </div>
            <nav className={`no-print ${styles.pageNav}`} aria-label={L.inPage}>
              <span className={styles.pageNavLabel}>{L.inPage}</span>
              <ul>
                {sections.map((sec) => <li key={sec.id}><a href={`#${sec.id}`}>{sec.label}</a></li>)}
              </ul>
            </nav>
          </aside>
        </div>
      </section>
      </div>

      {related.length > 0 && (
        <section className={`on-navy-raised ${styles.related}`}>
          <div className="wrap">
            <div className={styles.relatedHead}>
              <div>
                <span className="eyebrow" data-reveal>{L.exploreEye}</span>
                <h2 className={styles.relatedTitle} data-reveal>{L.relatedHead}</h2>
              </div>
              <Link href="/services" className="btn-line" data-reveal>{tPA('heading')} <span className="arrow">→</span></Link>
            </div>
            <div className={styles.relatedList}>
              {related.map((o) => (
                <Link key={o.slug} href={`/services/${o.slug}`} className={styles.relatedItem} data-reveal="file">
                  <span className={styles.relatedItemTitle}>{o.title}</span>
                  <span className={styles.relatedItemMore}>{L.view} <span className="arrow" aria-hidden="true">→</span></span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className={`on-navy ${styles.closing}`} aria-labelledby="h-closing">
        <div className={`wrap ${styles.closingInner}`}>
          <div>
            <h2 id="h-closing" className={styles.closingHead}>{tCta('heading')}</h2>
            <p className={styles.closingBody}>{tCta('body')}</p>
          </div>
          <div className={styles.closingActions}>
            <Link href={consultHref} className="btn btn-solid">{tCta('cta')} <span className="arrow">→</span></Link>
            <a href={wa} target="_blank" rel="noopener noreferrer" className={`btn btn-ghost ${styles.waBtn}`}><WaIcon />{L.whatsapp}</a>
          </div>
        </div>
      </section>
    </>
  );
}
