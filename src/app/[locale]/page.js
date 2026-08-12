import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation.js';
import { AlAounMark } from '@/components/AlAounMark.js';
import { Arc } from '@/components/Arc.js';
import { Construct } from '@/components/Construct.js';
import styles from './page.module.css';

const AR_NUM = ['٠١', '٠٢', '٠٣', '٠٤', '٠٥', '٠٦'];
const EN_NUM = ['01', '02', '03', '04', '05', '06'];

export default async function HomePage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const N = locale === 'ar' ? AR_NUM : EN_NUM;

  const tBrand = await getTranslations('brand');
  const tHero = await getTranslations('hero');
  const tTrust = await getTranslations('trust');
  const tDiff = await getTranslations('differentiators');
  const tPeople = await getTranslations('people');
  const tPractice = await getTranslations('practiceAreas');
  const tInsights = await getTranslations('insights');
  const tConsult = await getTranslations('consultCta');

  const values = tHero.raw('valuesStrip');
  const diffItems = tDiff.raw('items');
  const chev = locale === 'ar' ? '‹' : '›';

  return (
    <>
      {/* ═══ ١ · الافتتاح المعماري (كحلي) ═══ */}
      <section className={styles.hero}>
        <Construct lines={[0, 100]} dark ticks className={styles.heroConstruct} />
        <Arc className={styles.heroArc} />
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroTopline} data-reveal>
            <span className="reg" style={{ color: 'var(--on-navy-2)' }}>{tHero('eyebrow')}</span>
            <span className={`regnum ${styles.heroReg}`}>N{'\u00B0'} 2000</span>
          </div>

          <h1 className={styles.heroTitle} data-reveal style={{ '--reveal-delay': '80ms' }}>{tHero('headline')}</h1>

          <div className={styles.heroFoot}>
            <p className={styles.heroLead} data-reveal style={{ '--reveal-delay': '200ms' }}>{tHero('subhead')}</p>
            <div className={styles.heroActions} data-reveal style={{ '--reveal-delay': '320ms' }}>
              <Link href="/#consult" className={styles.btnSolid}>{tHero('ctaPrimary')}</Link>
              <Link href="/#about" className={styles.btnGhost}>
                <span>{tHero('ctaSecondary')}</span><span className={styles.chev} aria-hidden="true">{chev}</span>
              </Link>
            </div>
          </div>

          <ul className={styles.heroValues} data-reveal style={{ '--reveal-delay': '440ms' }}>
            {values.map((v, i) => (
              <li key={v} className={styles.heroValue}>
                <span className="regnum">{N[i]}</span><span>{v}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ═══ ٢ · السلطة / عن المكتب (فاتح) ═══ */}
      <section id="about" className={styles.about}>
        <Construct lines={[0, 100]} className={styles.sectionConstruct} />
        <div className={`container ${styles.aboutInner}`}>
          <div className={styles.head} data-reveal>
            <span className="regnum accent">{N[0]}</span>
            <span className="reg">{tTrust('eyebrow')}</span>
          </div>
          <div className={styles.aboutGrid}>
            <h2 className={styles.aboutTitle} data-reveal>{tTrust('heading')}</h2>
            <div className={styles.aboutBody}>
              <p className={styles.lead} data-reveal style={{ '--reveal-delay': '120ms' }}>{tTrust('body')}</p>
              <p className={styles.note} data-reveal style={{ '--reveal-delay': '200ms' }}>{tTrust('note')}</p>
            </div>
            <div className={styles.bigYear} aria-hidden="true"><span className="regnum">2000</span></div>
          </div>
        </div>
      </section>

      {/* ═══ ٣ · مجالات الممارسة (سجلّ مرقّم) ═══ */}
      <section id="practice" className={styles.practice}>
        <Construct lines={[0, 100]} className={styles.sectionConstruct} />
        <div className={`container ${styles.sectionInner}`}>
          <div className={styles.head} data-reveal>
            <span className="regnum accent">{N[1]}</span>
            <span className="reg">{tPractice('eyebrow')}</span>
          </div>
          <h2 className={styles.sectionTitle} data-reveal>{tPractice('heading')}</h2>
          <p className={styles.flag} data-reveal>{tPractice('flag')}</p>

          <ul className={styles.register}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <li key={i} className={styles.regRow} data-reveal style={{ '--reveal-delay': `${i * 55}ms` }}>
                <Link href="/practice-areas/placeholder" className={styles.regLink}>
                  <span className={`regnum ${styles.regRowNum}`}>{N[i]}</span>
                  <span className={styles.regName}>{tPractice('placeholderTitle')}</span>
                  <span className={styles.regDesc}>{tPractice('placeholderBody')}</span>
                  <span className={styles.regChev} aria-hidden="true">{chev}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ═══ ٤ · المبادئ (كحلي) ═══ */}
      <section className={styles.principles}>
        <Construct lines={[0, 100]} dark className={styles.sectionConstruct} />
        <Arc className={styles.principlesArc} draw={false} />
        <div className={`container ${styles.sectionInner}`}>
          <div className={styles.head} data-reveal>
            <span className="regnum" style={{ color: 'var(--azure-bright)' }}>{N[2]}</span>
            <span className="reg" style={{ color: 'var(--on-navy-2)' }}>{tDiff('eyebrow')}</span>
          </div>
          <h2 className={styles.principlesTitle} data-reveal>{tDiff('heading')}</h2>
          <ul className={styles.principleGrid}>
            {diffItems.map((it, i) => (
              <li key={it.title} className={styles.principle} data-reveal style={{ '--reveal-delay': `${i * 80}ms` }}>
                <span className={`regnum ${styles.principleNum}`}>{N[i]}</span>
                <h3 className={styles.principleTitle}>{it.title}</h3>
                <p className={styles.principleBody}>{it.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ═══ ٥ · الفريق (فاتح — بنية جاهزة مستقبليًا) ═══ */}
      <section id="people" className={styles.people}>
        <Construct lines={[0, 100]} className={styles.sectionConstruct} />
        <div className={`container ${styles.sectionInner}`}>
          <div className={styles.head} data-reveal>
            <span className="regnum accent">{N[3]}</span>
            <span className="reg">{tPeople('eyebrow')}</span>
          </div>
          <div className={styles.peopleGrid}>
            <div className={styles.peopleLede}>
              <h2 className={styles.sectionTitle} data-reveal>{tPeople('heading')}</h2>
              <p className={styles.lead} data-reveal style={{ '--reveal-delay': '120ms' }}>{tPeople('body')}</p>
              <p className={styles.flag} data-reveal style={{ '--reveal-delay': '200ms' }}>{tPeople('flag')}</p>
            </div>
            <ul className={styles.slots} data-reveal style={{ '--reveal-delay': '160ms' }}>
              {[0, 1, 2].map((i) => (
                <li key={i} className={styles.slot}>
                  <span className={`${styles.slotCross}`} aria-hidden="true" />
                  <span className={`regnum ${styles.slotNum}`}>{N[i]}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ═══ ٦ · رؤى قانونية / ذكاء قانوني (فاتح) ═══ */}
      <section id="insights" className={styles.insights}>
        <Construct lines={[0, 100]} className={styles.sectionConstruct} />
        <div className={`container ${styles.sectionInner}`}>
          <div className={styles.head} data-reveal>
            <span className="regnum accent">{N[4]}</span>
            <span className="reg">{tInsights('eyebrow')}</span>
          </div>
          <h2 className={styles.sectionTitle} data-reveal>{tInsights('heading')}</h2>
          <p className={styles.flag} data-reveal>{tInsights('flag')}</p>
          <div className={styles.journal}>
            <article className={styles.feature} data-reveal>
              <div className={styles.featureMeta}><span className="reg">{tInsights('eyebrow')}</span><span className={styles.dim}>—</span></div>
              <p className={styles.featureEmpty}>{tInsights('empty')}</p>
              <span className={styles.featureCross} aria-hidden="true" />
            </article>
            <ul className={styles.jList}>
              {[0, 1, 2].map((i) => (
                <li key={i} className={styles.jRow} data-reveal style={{ '--reveal-delay': `${i * 60}ms` }}>
                  <span className={`regnum ${styles.jNum}`}>{N[i]}</span>
                  <span className={styles.dim}>{tInsights('empty')}</span>
                  <span className={styles.jMeta}>—</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ═══ ٧ · الاستشارة (كحلي — الخاتمة الهادئة) ═══ */}
      <section id="consult" className={styles.consult}>
        <Construct lines={[50]} dark ticks={false} className={styles.consultConstruct} />
        <Arc className={styles.consultArc} ring />
        <div className={`container ${styles.consultInner}`}>
          <AlAounMark size={40} variant="white" title="" className={styles.consultMark} />
          <h2 className={styles.consultTitle} data-reveal>{tConsult('heading')}</h2>
          <p className={styles.consultBody} data-reveal style={{ '--reveal-delay': '120ms' }}>{tConsult('body')}</p>
          <Link href="/#contact" className={styles.consultBtn} data-reveal style={{ '--reveal-delay': '200ms' }}>{tConsult('cta')}</Link>
          <p className={styles.consultNote} data-reveal style={{ '--reveal-delay': '280ms' }}>{tConsult('disclaimer')}</p>
        </div>
      </section>
    </>
  );
}
