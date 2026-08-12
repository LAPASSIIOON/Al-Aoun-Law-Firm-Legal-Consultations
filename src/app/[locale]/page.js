import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation.js';
import { AlAounMark } from '@/components/AlAounMark.js';
import { ArchLines } from '@/components/ArchLines.js';
import styles from './page.module.css';

const AR_NUM = ['٠١', '٠٢', '٠٣', '٠٤', '٠٥', '٠٦'];
const EN_NUM = ['01', '02', '03', '04', '05', '06'];

export default async function HomePage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const N = locale === 'ar' ? AR_NUM : EN_NUM;
  const tHero = await getTranslations('hero');
  const tTrust = await getTranslations('trust');
  const tDiff = await getTranslations('differentiators');
  const tPractice = await getTranslations('practiceAreas');
  const tInsights = await getTranslations('insights');
  const tConsult = await getTranslations('consultCta');

  const values = tHero.raw('valuesStrip');
  const diffItems = tDiff.raw('items');
  const practiceRows = [0, 1, 2, 3, 4, 5];

  return (
    <>
      {/* ═══ مشهد ١ — البيان الافتتاحي ═══ */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroGrid}`}>
          <div className={styles.heroMain}>
            <span className={`label ${styles.heroLabel}`} data-reveal>{tHero('eyebrow')}</span>
            <div className={styles.heroTitleWrap} data-line-reveal>
              <h1 className={styles.heroTitle}>{tHero('headline')}</h1>
            </div>
            <p className={styles.heroLead} data-reveal style={{ '--reveal-delay': '160ms' }}>
              {tHero('subhead')}
            </p>
            <div className={styles.heroActions} data-reveal style={{ '--reveal-delay': '260ms' }}>
              <Link href="/#consult" className={styles.btnPrimary}>{tHero('ctaPrimary')}</Link>
              <Link href="/#about" className={styles.btnQuiet}>
                {tHero('ctaSecondary')}
                <span className={styles.arrow} aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          <aside className={styles.heroAside} aria-hidden="true">
            <ArchLines className={styles.heroMotif} />
            <ul className={styles.heroValues}>
              {values.map((v, i) => (
                <li key={v} className={styles.heroValue} data-reveal style={{ '--reveal-delay': `${320 + i * 70}ms` }}>
                  <span className={`index-num ${styles.heroValueNum}`}>{N[i]}</span>
                  <span>{v}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      {/* ═══ مشهد ٢ — السلطة / عن المكتب ═══ */}
      <section id="about" className={styles.about}>
        <div className={`container ${styles.aboutGrid}`}>
          <div className={styles.sectionMeta} data-reveal>
            <span className={`index-num ${styles.sectionNum}`}>{N[0]}</span>
            <span className="label">{tTrust('eyebrow')}</span>
          </div>
          <div className={styles.aboutBody}>
            <h2 className={styles.aboutHeading} data-reveal>{tTrust('heading')}</h2>
            <p className={styles.aboutText} data-reveal style={{ '--reveal-delay': '120ms' }}>{tTrust('body')}</p>
            <p className={styles.note} data-reveal style={{ '--reveal-delay': '200ms' }}>{tTrust('note')}</p>
          </div>
          <div className={styles.aboutYear} aria-hidden="true"><span className="index-num">2000</span></div>
        </div>
      </section>

      {/* ═══ مشهد ٣ — فهرس مجالات الممارسة ═══ */}
      <section id="practice" className={styles.practice}>
        <div className="container">
          <div className={styles.sectionHead}>
            <div className={styles.sectionMeta} data-reveal>
              <span className={`index-num ${styles.sectionNum}`}>{N[1]}</span>
              <span className="label">{tPractice('eyebrow')}</span>
            </div>
            <h2 className={styles.practiceHeading} data-reveal>{tPractice('heading')}</h2>
            <p className={styles.flag} data-reveal>{tPractice('flag')}</p>
          </div>

          <ul className={styles.index}>
            {practiceRows.map((i) => (
              <li key={i} className={styles.indexRow} data-reveal style={{ '--reveal-delay': `${i * 60}ms` }}>
                <Link href="/practice-areas/placeholder" className={styles.indexLink}>
                  <span className={`index-num ${styles.indexNum}`}>{N[i]}</span>
                  <span className={styles.indexName}>{tPractice('placeholderTitle')}</span>
                  <span className={styles.indexDesc}>{tPractice('placeholderBody')}</span>
                  <span className={styles.indexArrow} aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ═══ مشهد ٤ — المبادئ (لحظة داكنة سينمائية) ═══ */}
      <section className={styles.principles}>
        <ArchLines className={styles.principlesMotif} />
        <div className="container">
          <div className={styles.sectionMeta} data-reveal>
            <span className={`index-num ${styles.sectionNumDark}`}>{N[2]}</span>
            <span className={`label ${styles.labelDark}`}>{tDiff('eyebrow')}</span>
          </div>
          <h2 className={styles.principlesHeading} data-reveal>{tDiff('heading')}</h2>
          <ul className={styles.manifesto}>
            {diffItems.map((it, i) => (
              <li key={it.title} className={styles.principle} data-reveal style={{ '--reveal-delay': `${i * 90}ms` }}>
                <span className={`index-num ${styles.principleNum}`}>{N[i]}</span>
                <h3 className={styles.principleTitle}>{it.title}</h3>
                <p className={styles.principleBody}>{it.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ═══ مشهد ٥ — رؤى قانونية (تحرير كمجلة) ═══ */}
      <section id="insights" className={styles.insights}>
        <div className="container">
          <div className={styles.sectionHead}>
            <div className={styles.sectionMeta} data-reveal>
              <span className={`index-num ${styles.sectionNum}`}>{N[3]}</span>
              <span className="label">{tInsights('eyebrow')}</span>
            </div>
            <h2 className={styles.insightsHeading} data-reveal>{tInsights('heading')}</h2>
            <p className={styles.flag} data-reveal>{tInsights('flag')}</p>
          </div>

          <div className={styles.journal}>
            <article className={styles.featured} data-reveal>
              <div className={styles.featuredMeta}>
                <span className="label">{tInsights('eyebrow')}</span>
                <span className={styles.dot}>·</span>
                <span className={styles.metaDim}>—</span>
              </div>
              <p className={styles.featuredEmpty}>{tInsights('empty')}</p>
            </article>
            <ul className={styles.journalList}>
              {[0, 1, 2].map((i) => (
                <li key={i} className={styles.journalRow} data-reveal style={{ '--reveal-delay': `${i * 70}ms` }}>
                  <span className={`index-num ${styles.journalNum}`}>{N[i]}</span>
                  <span className={styles.journalDim}>{tInsights('empty')}</span>
                  <span className={styles.journalMeta}>—</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ═══ مشهد ٦ — الاستشارة (الخاتمة) ═══ */}
      <section id="consult" className={styles.consult}>
        <div className={`container ${styles.consultInner}`}>
          <AlAounMark size={44} variant="navy" title="" className={styles.consultMark} />
          <h2 className={styles.consultHeading} data-reveal>{tConsult('heading')}</h2>
          <p className={styles.consultBody} data-reveal style={{ '--reveal-delay': '120ms' }}>{tConsult('body')}</p>
          <Link href="/#contact" className={styles.consultBtn} data-reveal style={{ '--reveal-delay': '200ms' }}>
            {tConsult('cta')}
          </Link>
          <p className={styles.consultNote} data-reveal style={{ '--reveal-delay': '280ms' }}>{tConsult('disclaimer')}</p>
        </div>
      </section>
    </>
  );
}
