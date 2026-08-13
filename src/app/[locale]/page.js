import { getTranslations, getLocale, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation.js';
import styles from './home.module.css';

const FOUNDER = {
  ar: { name: 'الدكتور هيثم أحمد العون', role: 'المؤسِّس ورئيس مجلس الإدارة', title: 'محامٍ بالتمييز والدستورية',
    bio: 'حاصل على دكتوراه القانون الدستوري من جامعة القاهرة بتقدير امتياز، ومقيّد للمرافعة أمام محكمتَي التمييز والدستورية. أسّس مجموعة العون، ويرأس المجلس العلمي الاستشاري بجمعية المحامين الكويتية.' },
  en: { name: 'Dr. Haitham Ahmed Al Oun', role: 'Founder & Chairman', title: 'Cassation & Constitutional Lawyer',
    bio: 'Holds a PhD in Constitutional Law from Cairo University (Excellent), admitted before the Cassation and Constitutional courts. Founder of Al Oun, and Chair of the Scientific Advisory Council at the Kuwait Lawyers Association.' },
};

export function generateStaticParams() { return [{ locale: 'ar' }, { locale: 'en' }]; }

export default async function Home({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('hero');
  const tt = await getTranslations('trust');
  const tp = await getTranslations('practiceAreas');
  const td = await getTranslations('differentiators');
  const tph = await getTranslations('philosophy');
  const th = await getTranslations('history');
  const ti = await getTranslations('insights');
  const tc = await getTranslations('consultCta');
  const tpe = await getTranslations('people');
  const f = FOUNDER[locale] || FOUNDER.ar;
  const items = td.raw('items');
  const values = tph.raw('items');

  return (
    <>
      {/* Hero — تايبوغرافي + خامة، إسبريسو */}
      <section className={`on-espresso ${styles.hero}`}>
        <div className={`wrap ${styles.heroInner}`}>
          <span className="eyebrow" data-reveal>{t('eyebrow')}</span>
          <h1 className={`display d-hero ${styles.heroTitle}`} data-reveal>{t('headline')}</h1>
          <p className={`lead ${styles.heroLead}`} data-reveal>{t('subhead')}</p>
          <div className={styles.heroCta} data-reveal>
            <Link href="/contact" className="btn btn-solid">{t('ctaPrimary')}<span className="arrow">→</span></Link>
            <Link href="/about" className="btn btn-ghost">{t('ctaSecondary')}</Link>
          </div>
        </div>
        <div className={`wrap ${styles.heroFoot}`}>
          <span className="idx">EST. 2000 · KUWAIT</span>
          <span className={styles.heroRule} aria-hidden="true" />
          <span className="idx">مجموعة العون · OUN GROUP</span>
        </div>
      </section>

      {/* التموضع — عاجي */}
      <section className="on-ivory section">
        <div className="wrap-narrow wrap">
          <span className="eyebrow" data-reveal>{tt('eyebrow')}</span>
          <h2 className="display d-1" data-reveal style={{ marginBlock: '1.2rem 1.5rem' }}>{tt('heading')}</h2>
          <p className="body" data-reveal style={{ fontSize: '1.15rem', maxWidth: '68ch' }}>{tt('body')}</p>
        </div>
      </section>

      {/* مجالات الممارسة — فهرس تحريري، جرافيت */}
      <section className="on-graphite section">
        <div className="wrap">
          <div className={styles.head} data-reveal>
            <div>
              <span className="eyebrow">{tp('eyebrow')}</span>
              <h2 className="display d-1" style={{ marginBlockStart: '1.1rem' }}>{tp('heading')}</h2>
            </div>
            <Link href="/services" className="btn-line">{tp('indexLabel')}<span className="arrow">→</span></Link>
          </div>
          <p className="body" data-reveal style={{ marginBlockEnd: '2.5rem' }}>{tp('subhead')}</p>
          <ul className={styles.areaList}>
            {[0,1,2,3].map((i) => (
              <li key={i} className={styles.areaRow} data-reveal>
                <span className="idx">{String(i+1).padStart(2,'0')}</span>
                <span className={styles.areaName}>{tp('placeholderTitle')}</span>
                <span className="tag">{tp('forthcoming')}</span>
              </li>
            ))}
          </ul>
          <p className="muted" data-reveal style={{ marginBlockStart: '1.75rem', fontSize: '0.9rem' }}>{tp('flag')}</p>
        </div>
      </section>

      {/* لماذا العون — قيم، إسبريسو */}
      <section className="on-espresso section">
        <div className="wrap">
          <span className="eyebrow" data-reveal>{td('eyebrow')}</span>
          <h2 className="display d-1" data-reveal style={{ marginBlock: '1.1rem 3rem' }}>{td('heading')}</h2>
          <div className="grid cols-2">
            {items.map((it, i) => (
              <div key={i} className={styles.valueBlock} data-reveal>
                <span className="idx">{String(i+1).padStart(2,'0')}</span>
                <h3 className="d-3 display">{it.title}</h3>
                <p className="body">{it.body}</p>
              </div>
            ))}
          </div>
          <div className={styles.valueStrip} data-reveal>
            {values.map((v, i) => (<span key={i} className={styles.chip}>{v}</span>))}
          </div>
        </div>
      </section>

      {/* الإرث منذ 2000 — جرافيت */}
      <section className="on-graphite section">
        <div className={`wrap ${styles.legacy}`}>
          <div className={styles.legacyYear} aria-hidden="true">2000</div>
          <div data-reveal>
            <span className="eyebrow">{th('eyebrow')}</span>
            <h2 className="display d-2" style={{ marginBlock: '1rem 1.4rem' }}>{th('heading')}</h2>
            <p className="body" style={{ maxWidth: '54ch' }}>{th('body')}</p>
          </div>
        </div>
      </section>

      {/* القيادة — د. هيثم، عاجي */}
      <section className="on-ivory section">
        <div className="wrap">
          <span className="eyebrow" data-reveal>{tpe('eyebrow')}</span>
          <div className={styles.founder} data-reveal>
            <div className={styles.founderPhoto}>
              <img src="/media/founder-haitham.jpg" alt={f.name} />
            </div>
            <div className={styles.founderBody}>
              <h2 className="display d-2">{f.name}</h2>
              <p className={styles.founderRole}>{f.role} · {f.title}</p>
              <p className="body" style={{ marginBlockStart: '1.25rem' }}>{f.bio}</p>
              <Link href="/team" className="btn-line" style={{ marginBlockStart: '1.75rem' }}>{tpe('heading')}<span className="arrow">→</span></Link>
            </div>
          </div>
        </div>
      </section>

      {/* رؤى — إسبريسو */}
      <section className="on-espresso section">
        <div className="wrap">
          <div className={styles.head} data-reveal>
            <div>
              <span className="eyebrow">{ti('eyebrow')}</span>
              <h2 className="display d-1" style={{ marginBlockStart: '1.1rem' }}>{ti('heading')}</h2>
            </div>
            <Link href="/insights" className="btn-line">{ti('heading')}<span className="arrow">→</span></Link>
          </div>
          <p className="body" data-reveal style={{ marginBlockEnd: '2rem' }}>{ti('subhead')}</p>
          <div className={styles.insightsEmpty} data-reveal>
            <span className="tag">{ti('forthcoming')}</span>
            <p className="muted">{ti('flag')}</p>
          </div>
        </div>
      </section>

      {/* تواصل — جرافيت */}
      <section className="on-graphite section">
        <div className={`wrap-narrow wrap ${styles.ctaBlock}`}>
          <span className="eyebrow" data-reveal>{tc('eyebrow')}</span>
          <h2 className="display d-hero" data-reveal style={{ marginBlock: '1.2rem 1.5rem' }}>{tc('heading')}</h2>
          <p className="lead" data-reveal style={{ marginBlockEnd: '2.25rem' }}>{tc('body')}</p>
          <Link href="/contact" className="btn btn-solid" data-reveal>{tc('cta')}<span className="arrow">→</span></Link>
          <p className="muted" data-reveal style={{ marginBlockStart: '2rem', fontSize: '0.85rem', maxWidth: '52ch' }}>{tc('disclaimer')}</p>
        </div>
      </section>
    </>
  );
}
