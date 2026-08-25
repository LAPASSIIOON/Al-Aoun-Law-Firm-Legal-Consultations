import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation.js';
import { createAnonClient } from '@/lib/supabase-server.js';
import HeroImageBackground from '@/components/HeroImageBackground.js';
import HeroMarkWatermark from '@/components/HeroMarkWatermark.js';
import HeroSearch from '@/components/HeroSearch.js';
import SignatureUnderline from '@/components/SignatureUnderline.js';
import CounterStat from '@/components/CounterStat.js';
import ReferenceRow from '@/components/ReferenceRow.js';
import styles from './home.module.css';

export const revalidate = 60;
export function generateStaticParams() { return [{ locale: 'ar' }, { locale: 'en' }]; }

const T = {
  ar: {
    eyebrow: 'ظ…ظƒطھط¨ ظ…ط­ط§ظ…ط§ط© ظƒظˆظٹطھظٹ آ· ظ…ظ†ط° ظ¢ظ ظ ظ ',
    head: 'ظ‚ظˆظ‘ط©ظŒ ظ‚ط§ظ†ظˆظ†ظٹط© ظƒظˆظٹطھظٹط©طŒ\nط¨ظ…ط¹ط§ظٹظٹط± ط¹ط§ظ„ظ…ظٹط©.',
    sub: 'ظ†ط±ط§ظپظ‚ ط§ظ„ط£ظپط±ط§ط¯ ظˆط§ظ„ط´ط±ظƒط§طھ ظˆط§ظ„ظ…ط³طھط«ظ…ط±ظٹظ† ظپظٹ ط§ظ„ظƒظˆظٹطھ ظˆط®ط§ط±ط¬ظ‡ط§ ط¨ظ…ط´ظˆط±ط© ط¯ظ‚ظٹظ‚ط© ظˆط³ط±ظ‘ظٹط© طھط§ظ…ط© â€” ظ…ظ† ط£ظˆظ„ ط³ط¤ط§ظ„ظچ ط¥ظ„ظ‰ ط§ظ„ظ‚ط±ط§ط±.',
    heroCta1: 'ط£ط­طھط§ط¬ ظ…ط³ط§ط¹ط¯ط© ظ‚ط§ظ†ظˆظ†ظٹط©', heroCta2: 'ط§ط¨ط­ط« ط¹ظ† ظ…ط¬ط§ظ„',
    counters: [
      { v: 2000, l: 'ط³ظ†ط© ط§ظ„طھط£ط³ظٹط³' }, { v: 25, s: '+', l: 'ط³ظ†ط© ط®ط¨ط±ط©' },
      { v: 12, l: 'ظ…ط¬ط§ظ„ ظ…ظ…ط§ط±ط³ط©' }, { v: 4, l: 'ظ…ط±ط§ظƒط² طھط­ظƒظٹظ… ظ…ط¹طھظ…ط¯ط©' },
    ],
    legacyEye: 'ط§ظ„ط¥ط±ط« ط§ظ„ظ…ط¤ط³ط³ظٹ', legacyHead: 'ط¹ظ…ظ‚ظŒ ظ…ط¤ط³ط³ظٹطŒ ط¨ظڈظ†ظٹ ط¹ظ„ظ‰ ط³ظ†ظˆط§طھ ظ…ظ† ط§ظ„ظ…ظ…ط§ط±ط³ط© ط§ظ„ط¯ظ‚ظٹظ‚ط©.',
    legacyItems: [
      { n: '01', t: 'ظ…ط­ط§ظ…ط§ط© ط¨ط§ظ„طھظ…ظٹظٹط² ظˆط§ظ„ط¯ط³طھظˆط±ظٹط©', d: 'ط®ط¨ط±ط©ظŒ ط£ظƒط§ط¯ظٹظ…ظٹط© ظˆط¹ظ…ظ„ظٹط© ظپظٹ ط§ظ„ظ‚ط§ظ†ظˆظ† ط§ظ„ط¯ط³طھظˆط±ظٹطŒ ط¨ظ‚ظٹط§ط¯ط© ط¯ظƒطھظˆط±ط§ظ‡ ظ…ظ† ط¬ط§ظ…ط¹ط© ط§ظ„ظ‚ط§ظ‡ط±ط© ط¨طھظ‚ط¯ظٹط± ط§ظ…طھظٹط§ط².' },
      { n: '02', t: 'ظ…ط­ظƒظ‘ظ… ظ…ط¹طھظ…ط¯ ظ„ط¯ظ‰ ظ¤ ظ…ط±ط§ظƒط²', d: 'طھط³ط¬ظٹظ„ظŒ ظ…ط¹طھظ…ظژط¯ ظ„ط¯ظ‰ ظ…ط±ط§ظƒط² ط§ظ„طھط­ظƒظٹظ… ط§ظ„ط±ط§ط¦ط¯ط© ظپظٹ ط§ظ„ظƒظˆظٹطھ ظˆط§ظ„ط®ظ„ظٹط¬.' },
      { n: '03', t: 'ط±ط¦ط§ط³ط© ط§ظ„ظ…ط¬ظ„ط³ ط§ظ„ط¹ظ„ظ…ظٹ ط¨ط¬ظ…ط¹ظٹط© ط§ظ„ظ…ط­ط§ظ…ظٹظ†', d: 'ظ‚ظٹط§ط¯ط© ط£ظƒط§ط¯ظٹظ…ظٹط© ط¯ط§ط®ظ„ ط§ظ„ظ‡ظٹط¦ط© ط§ظ„ظ…ظ‡ظ†ظٹط© ظ„ظ„ظ…ط­ط§ظ…ظٹظ† ظپظٹ ط§ظ„ظƒظˆظٹطھ.' },
      { n: '04', t: '+ظ¢ظ¥ ط¹ط§ظ…ظ‹ط§ ظ…ظ† ط§ظ„ظ…ظ…ط§ط±ط³ط©', d: 'ط®ط¨ط±ط©ظŒ طھظ…طھط¯ ظ„ط£ظƒط«ط± ظ…ظ† ط¹ظ‚ط¯ظٹظ† ظپظٹ ط§ظ„ظ‚ط¶ط§ظٹط§ ط§ظ„ط¯ط³طھظˆط±ظٹط© ظˆط§ظ„ط·ط¹ظˆظ† ط¨ط§ظ„طھظ…ظٹظٹط² ظˆط§ظ„طھط­ظƒظٹظ… ط§ظ„طھط¬ط§ط±ظٹ ط§ظ„ط¯ظˆظ„ظٹ.' },
    ],
    posEye: 'ظ„ظ…ط§ط°ط§ ظ…ط¬ظ…ظˆط¹ط© ط§ظ„ط¹ظˆظ†', posHead: 'ط®ط¨ط±ط©ظŒ ظ‚ط§ظ†ظˆظ†ظٹط© ط¹ظ…ظٹظ‚ط©طŒ ظپظٹ ط®ط¯ظ…ط© ظ‚ط±ط§ط±ظچ ظˆط§ط¶ط­.',
    posBody: 'ظ…ط¬ظ…ظˆط¹ط© ط§ظ„ط¹ظˆظ† ظ…ظƒطھط¨ ظ…ط­ط§ظ…ط§ط©ظچ ظˆط§ط³طھط´ط§ط±ط§طھظچ ظˆطھط­ظƒظٹظ…ظچ ظƒظˆظٹطھظٹ طھط£ط³ظ‘ط³ ط¹ط§ظ… ظ¢ظ ظ ظ طŒ ظٹظ‚ظˆط¯ظ‡ ط§ظ„ط¯ظƒطھظˆط± ظ‡ظٹط«ظ… ط§ظ„ط¹ظˆظ† ط¨ط®ظ„ظپظٹط©ظچ ط£ظƒط§ط¯ظٹظ…ظٹط© ظˆط¹ظ…ظ„ظٹط© ظپظٹ ط§ظ„ظ‚ط§ظ†ظˆظ† ط§ظ„ط¯ط³طھظˆط±ظٹ ظˆط§ظ„طھظ…ظٹظٹط² ظˆط§ظ„طھط­ظƒظٹظ… ط§ظ„طھط¬ط§ط±ظٹ ط§ظ„ط¯ظˆظ„ظٹ. ظ†ط¬ظ…ط¹ ط¨ظٹظ† ط§ظ„ط¹ظ…ظ‚ ط§ظ„ظ†ط¸ط±ظٹ ظˆط§ظ„ظ…ظ…ط§ط±ط³ط© ط§ظ„ط¯ظ‚ظٹظ‚ط© ظ„ظ†ظ‚ط¯ظ‘ظ… ظ…ط´ظˆط±ط©ظ‹ ظٹظڈط¹طھظ…ط¯ ط¹ظ„ظٹظ‡ط§.',
    posLink: 'ط§ظ„ظ…ط²ظٹط¯ ط¹ظ† ط§ظ„ظ…ظƒطھط¨',
    paEye: 'ظ…ط¬ط§ظ„ط§طھ ط§ظ„ظ…ظ…ط§ط±ط³ط©', paHead: 'ط®ط¨ط±ط©ظŒ طھظڈط؛ط·ظ‘ظٹ ظ…ط§ ظٹظ‡ظ…ظ‘ظƒ', paAll: 'ط§ط³طھط¹ط±ط§ط¶ ظƒظ„ ط§ظ„ظ…ط¬ط§ظ„ط§طھ', paMore: 'ط§ط³طھط¹ط±ط§ط¶',
    fEye: 'ط§ظ„ظ…ط¤ط³ظگظ‘ط³', fName: 'ط§ظ„ط¯ظƒطھظˆط± ظ‡ظٹط«ظ… ط£ط­ظ…ط¯ ط§ظ„ط¹ظˆظ†',
    fRole: 'ط§ظ„ظ…ط¤ط³ظگظ‘ط³ ظˆط±ط¦ظٹط³ ظ…ط¬ظ„ط³ ط§ظ„ط¥ط¯ط§ط±ط© آ· ظ…ط­ط§ظ…ظچ ط¨ط§ظ„طھظ…ظٹظٹط² ظˆط§ظ„ط¯ط³طھظˆط±ظٹط©',
    fBio: 'ط¯ظƒطھظˆط±ط§ظ‡ ظپظٹ ط§ظ„ظ‚ط§ظ†ظˆظ† ط§ظ„ط¯ط³طھظˆط±ظٹ ظ…ظ† ط¬ط§ظ…ط¹ط© ط§ظ„ظ‚ط§ظ‡ط±ط© ط¨طھظ‚ط¯ظٹط± ط§ظ…طھظٹط§ط²طŒ ظˆط±ط¦ظٹط³ ط§ظ„ظ…ط¬ظ„ط³ ط§ظ„ط¹ظ„ظ…ظٹ ط§ظ„ط§ط³طھط´ط§ط±ظٹ ط¨ط¬ظ…ط¹ظٹط© ط§ظ„ظ…ط­ط§ظ…ظٹظ† ط§ظ„ظƒظˆظٹطھظٹط©طŒ ظˆظ…ط­ظƒظ‘ظ… ظ…ط¹طھظ…ط¯ ظ„ط¯ظ‰ ط£ط¨ط±ط² ظ…ط±ط§ظƒط² ط§ظ„طھط­ظƒظٹظ… ظپظٹ ط§ظ„ظ…ظ†ط·ظ‚ط©. ط®ط¨ط±ط©ظŒ طھظ…طھط¯ ظ„ط£ظƒط«ط± ظ…ظ† ط¹ظ‚ط¯ظٹظ† ظپظٹ ط§ظ„ظ‚ط¶ط§ظٹط§ ط§ظ„ط¯ط³طھظˆط±ظٹط© ظˆط§ظ„ط·ط¹ظˆظ† ط¨ط§ظ„طھظ…ظٹظٹط² ظˆط§ظ„طھط­ظƒظٹظ… ط§ظ„طھط¬ط§ط±ظٹ ط§ظ„ط¯ظˆظ„ظٹ.',
    fLink: 'ط§ظ„ظ…ظ„ظپ ط§ظ„ظƒط§ظ…ظ„',
    inEye: 'ط±ط¤ظ‰ ظ‚ط§ظ†ظˆظ†ظٹط©', inHead: 'ط±ط¤ظ‰ ظˆظ…ظ‚ط§ظ„ط§طھ', inAll: 'ظƒظ„ ط§ظ„ط±ط¤ظ‰', inEmpty: 'ظ†ظڈط«ط±ظٹ ظ‡ط°ط§ ط§ظ„ظ‚ط³ظ… ط¨طھط­ظ„ظٹظ„ط§طھظچ ظ‚ط§ظ†ظˆظ†ظٹط© طھط¨ط§ط¹ظ‹ط§.',
    bandHead: 'ط¬ط§ظ‡ط²ظŒ ظ„ط®ط·ظˆط©ظچ ط£ظˆظ„ظ‰ ظˆط§ط¶ط­ط©طں', bandBody: 'ط§ط¨ط¯ط£ ط¨ط®ط·ظˆط©ظچ ط³ظ‡ظ„ط© â€” ط§ط³ظ…ظƒ ظˆط±ظ‚ظ…ظƒ ظپظ‚ط·طŒ ظˆط§ظ„ط¨ط§ظ‚ظٹ ظ†طھظˆظ„ظ‘ط§ظ‡ ط¨ط³ط±ظ‘ظٹط©ظچ طھط§ظ…ط©.', bandPhone: 'ط£ظˆ ط§طھطµظ„ ط¨ظ†ط§',
  },
  en: {
    eyebrow: 'Kuwaiti Law Firm آ· Since 2000',
    head: 'Kuwaiti legal strength,\nto a global standard.',
    sub: 'We stand with individuals, companies and investors in Kuwait and beyond â€” precise, fully confidential counsel from the first question to the decision.',
    heroCta1: 'I need legal help', heroCta2: 'Find a practice area',
    counters: [
      { v: 2000, l: 'Established' }, { v: 25, s: '+', l: 'Years of experience' },
      { v: 48, l: 'Practice areas' }, { v: 4, l: 'Arbitration centres' },
    ],
    legacyEye: 'Institutional Legacy', legacyHead: 'Institutional depth, built on years of precise practice.',
    legacyItems: [
      { n: '01', t: 'Cassation & constitutional advocacy', d: 'Academic and practical grounding in constitutional law, led by a PhD from Cairo University (Excellent).' },
      { n: '02', t: 'Registered arbitrator â€” 4 centres', d: 'Registered as arbitrator across four certified arbitration centres in Kuwait and the Gulf.' },
      { n: '03', t: 'Chair, Scientific Advisory Council', d: "Academic leadership within Kuwait's professional lawyers' association." },
      { n: '04', t: '25+ years in practice', d: 'Over two decades across constitutional matters, cassation appeals and international commercial arbitration.' },
    ],
    posEye: 'Why AL OUN', posHead: 'Deep legal expertise, in service of a clear decision.',
    posBody: 'Al Oun is a Kuwaiti law, consultancy and arbitration firm established in 2000, led by Dr. Haitham Al Oun with academic and practical grounding in constitutional law, cassation and international commercial arbitration. We pair theoretical depth with precise practice to deliver counsel you can rely on.',
    posLink: 'More about the firm',
    paEye: 'Practice Areas', paHead: 'Expertise across what matters to you', paAll: 'View all practice areas', paMore: 'Explore',
    fEye: 'The Founder', fName: 'Dr. Haitham Ahmed Al Oun',
    fRole: 'Founder & Chairman آ· Cassation & Constitutional Lawyer',
    fBio: 'PhD in constitutional law from Cairo University (Excellent), Chair of the Scientific Advisory Council at the Kuwait Lawyers Association, and a registered arbitrator at the regionâ€™s leading arbitration centres. Over two decades across constitutional matters, cassation appeals and international commercial arbitration.',
    fLink: 'Full profile',
    inEye: 'Insights', inHead: 'Insights & articles', inAll: 'All insights', inEmpty: 'Weâ€™re adding legal analysis to this section shortly.',
    bandHead: 'Ready for a clear first step?', bandBody: 'Start with one easy step â€” just your name and number. Weâ€™ll handle the rest, in full confidence.', bandPhone: 'Or call us',
  },
};

async function fetchData(locale) {
  let areas = [], articles = [];
  try {
    const supabase = createAnonClient();
    const { data: a } = await supabase.from('practice_area_translations')
      .select('slug, title, summary, practice_areas(sort_order)')
      .eq('locale', locale).eq('status', 'published').eq('legal_approved', true);
    areas = (a || []).sort((x, y) => (x.practice_areas?.sort_order || 0) - (y.practice_areas?.sort_order || 0));
    const { data: ar } = await supabase.from('article_translations')
      .select('slug, title, excerpt, created_at')
      .eq('locale', locale).eq('status', 'published').eq('legal_approved', true)
      .order('created_at', { ascending: false }).limit(3);
    articles = ar || [];
  } catch (e) { /* graceful */ }
  return { areas, articles };
}

/** @param {{ params: Promise<{ locale: string }> }} props */
export default async function Home({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const n = await getTranslations({ locale, namespace: 'nav' });
  const ti = await getTranslations({ locale, namespace: 'international' });
  const c = T[locale] || T.ar;
  const { areas, articles } = await fetchData(locale);
  const veilDir = locale === 'ar' ? 'to left' : 'to right';

  return (
    <>
      {/* HERO */}
      <section className={styles.hero} style={{ '--veilDir': veilDir }}>
        <HeroImageBackground />
        <svg className={styles.heroGrid} aria-hidden="true" viewBox="0 0 1200 800" preserveAspectRatio="none">
          <line x1="0" y1="120" x2="1200" y2="120" />
          <line x1="0" y1="680" x2="1200" y2="680" />
          <line x1="90" y1="0" x2="90" y2="800" />
          <line x1="1110" y1="0" x2="1110" y2="800" />
          <circle cx="90" cy="120" r="2.5" />
          <circle cx="1110" cy="120" r="2.5" />
          <circle cx="90" cy="680" r="2.5" />
          <circle cx="1110" cy="680" r="2.5" />
        </svg>
        <div className={styles.heroVeil} />
        <HeroMarkWatermark />
        <span className={styles.heroTag} aria-hidden="true">01</span>
        <div className={`wrap ${styles.heroInner}`}>
          <div className={styles.heroRule} aria-hidden="true" />
          <div className={styles.heroContent}>
            <span className="eyebrow">{c.eyebrow}</span>
            <h1 className={styles.heroHead}>{c.head.split('\n').map((l, i) => <span key={i} style={{ display: 'block' }}>{l}</span>)}</h1>
            <p className={styles.heroSub}>{c.sub}</p>
            <HeroSearch locale={locale} />
            <div className={styles.heroCtas}>
              <Link href="/contact?intent=legalConsultation" className="btn btn-solid">{c.heroCta1} <span className="arrow">â†’</span></Link>
              <Link href="/services" className="btn btn-ghost">{c.heroCta2}</Link>
            </div>
            <div className={styles.counters}>
              {c.counters.map((s, i) => (
                <CounterStat key={i} value={s.l.includes('ظ…ط¬ط§ظ„') || s.l.toLowerCase().includes('practice area') ? (areas.length || s.v) : s.v} suffix={s.s || ''} label={s.l} locale={locale} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* DUAL TRACK â€” ط¹ظ…ظٹظ„ / ظ…ظƒطھط¨ ط¯ظˆظ„ظٹطŒ ظ…ط¨ط§ط´ط±ط© ط¨ط¹ط¯ ط§ظ„ظ‡ظٹط±ظˆ */}
      <section className="on-white section-tight">
        <div className="wrap">
          <div className={styles.dualBar}>
            <Link href="/contact" className={styles.dualItem}>
              <span className={styles.dualEye}>{ti('forkClientEye')}</span>
              <span className={styles.dualT}>{ti('forkClientHead')}</span>
              <span className="arrow">â†’</span>
            </Link>
            <Link href="/international/for-law-firms" className={styles.dualItem}>
              <span className={styles.dualEye}>{ti('forkFirmEye')}</span>
              <span className={styles.dualT}>{ti('forkFirmHead')}</span>
              <span className="arrow">â†’</span>
            </Link>
          </div>
        </div>
      </section>

      {/* PRACTICE AREAS â€” moved to lead position (discovery-first, per approved restructuring) */}
      <section className="on-paper section">
        <div className="wrap">
          <div className={styles.headRow}>
            <div>
              <span className="eyebrow" data-reveal>{c.paEye}</span>
              <h2 className="display d-1" data-reveal style={{ marginBlockStart: '1rem' }}>{c.paHead}</h2>
            </div>
            <Link href="/services" className="btn-line" data-reveal>{c.paAll} <span className="arrow">â†’</span></Link>
          </div>
          <div className={styles.paList}>
            {(areas.length ? areas.slice(0, 8) : Array.from({ length: 6 })).map((a, i) => (
              <ReferenceRow key={a?.slug || i} index={i + 1}
                title={a ? a.title : (locale === 'ar' ? 'ظ…ط¬ط§ظ„ ظ…ظ…ط§ط±ط³ط©' : 'Practice area')}
                href={a ? `/services/${a.slug}` : '/services'}
                summary={a?.summary} />
            ))}
          </div>
        </div>
      </section>

      {/* WHY AL OUN â€” consolidated: intro (was "Positioning") + credentials (was "Legacy") + founder close,
          replacing three previously-separate, overlapping trust sections with one confident telling. */}
      <section className="on-white section">
        <div className="wrap">
          <div className={styles.head}>
            <span className="eyebrow" data-reveal>{c.posEye}</span>
            <div data-reveal>
              <h2 className="display d-1">{c.posHead}</h2>
              <SignatureUnderline width={96} />
            </div>
          </div>
          <p className="lead" data-reveal style={{ maxWidth: '52rem' }}>{c.posBody}</p>

          <div className={styles.legacyList} style={{ marginBlockStart: '2.5rem' }}>
            {c.legacyItems.map((it) => (
              <div key={it.n} className={styles.legacyRow} data-reveal="file">
                <span className={styles.legacyIdx}>{it.n}</span>
                <span className={styles.legacyBody}>
                  <span className={styles.legacyTitle}>{it.t}</span>
                  <span className={styles.legacyDesc}>{it.d}</span>
                </span>
              </div>
            ))}
          </div>

          <div className={styles.founder} style={{ marginBlockStart: 'clamp(2.5rem,5vh,4rem)' }}>
            <div className={`${styles.founderMedia} img-zoom-frame`} data-reveal="slow">
              <img src="/media/founder-haitham.jpg" alt={c.fName} />
            </div>
            <div data-reveal="slow">
              <span className="eyebrow">{c.fEye}</span>
              <h2 className={styles.founderName}>{c.fName}</h2>
              <p className={styles.founderRole}>{c.fRole}</p>
              <p className="body" style={{ fontSize: '1.08rem', maxWidth: '46rem' }}>{c.fBio}</p>
              <p style={{ marginBlockStart: '1.75rem' }}><Link href="/team" className="btn-line">{c.fLink} <span className="arrow">â†’</span></Link></p>
            </div>
          </div>
        </div>
      </section>

      {/* INSIGHTS â€” hidden entirely while zero approved articles exist (not a "coming soon" placeholder) */}
      {articles.length > 0 && (
        <section className="on-paper section">
          <div className="wrap">
            <div className={styles.headRow}>
              <div>
                <span className="eyebrow" data-reveal>{c.inEye}</span>
                <h2 className="display d-1" data-reveal style={{ marginBlockStart: '1rem' }}>{c.inHead}</h2>
              </div>
              <Link href="/insights" className="btn-line" data-reveal>{c.inAll} <span className="arrow">â†’</span></Link>
            </div>
            <div className="grid cols-3">
              {articles.map((a) => (
                <Link key={a.slug} href={`/insights/${a.slug}`} className="card" data-reveal>
                  <span className="tag">{c.inEye}</span>
                  <h3 className="card-title">{a.title}</h3>
                  {a.excerpt && <p className="body" style={{ fontSize: '0.98rem' }}>{a.excerpt}</p>}
                  <span className="btn-line">{locale === 'ar' ? 'ط§ظ‚ط±ط£' : 'Read'} <span className="arrow">â†’</span></span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA BAND */}
      <section className="on-navy section-tight">
        <div className="wrap">
          <div className={styles.band}>
            <div className={styles.bandText} data-reveal>
              <h2 className="display d-2" style={{ color: '#fff' }}>{c.bandHead}</h2>
              <p className="lead" style={{ marginBlockStart: '.75rem' }}>{c.bandBody}</p>
            </div>
            <div className={styles.bandActions} data-reveal>
              <Link href="/contact" className="btn btn-solid">{n('consult')} <span className="arrow">â†’</span></Link>
              <span className={styles.bandPhone}>{c.bandPhone} <a href="tel:+96599010470" dir="ltr">+965 99010470</a></span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

