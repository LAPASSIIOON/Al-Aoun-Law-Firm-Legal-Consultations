import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation.js';
import styles from './page.module.css';

const AR_NUM = ['٠١','٠٢','٠٣','٠٤','٠٥','٠٦','٠٧'];
const EN_NUM = ['01','02','03','04','05','06','07'];

/** علامة العون: دائرة + محور متقاطع — مشتقة من هندسة اللوجو (لا نسخة منه) */
function Cross({ className }) {
  return (
    <svg className={className} viewBox="0 0 18 18" width="14" height="14" aria-hidden="true" focusable="false">
      <circle cx="9" cy="9" r="7" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.85" />
      <path d="M9 0.5V17.5M0.5 9H17.5" stroke="currentColor" strokeWidth="1" opacity="0.85" />
    </svg>
  );
}

export default async function HomePage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const N = locale === 'ar' ? AR_NUM : EN_NUM;
  const ar = locale === 'ar';

  const tBrand = await getTranslations('brand');
  const tInst = await getTranslations('institution');
  const tHero = await getTranslations('hero');
  const tTrust = await getTranslations('trust');
  const tHist = await getTranslations('history');
  const tPhil = await getTranslations('philosophy');
  const tPractice = await getTranslations('practiceAreas');
  const tPeople = await getTranslations('people');
  const tInsights = await getTranslations('insights');
  const tConsult = await getTranslations('consultCta');
  const values = tPhil.raw('items');

  return (
    <>
      {/* ═══ الافتتاح — حجر الأساس ═══ */}
      <section id="opening" className={styles.opening}>
        <div className={styles.openLight} aria-hidden="true" />
        <div className={`container ${styles.openInner}`}>
          {/* الترويسة */}
          <div className={styles.masthead} data-reveal>
            <span className={styles.openWord}>{tBrand('fullName')}</span>
            <Cross className={styles.mastheadMark} />
            <span className={`reg ${styles.mastheadMeta}`}>{tInst('est')} · {tInst('kuwait')}</span>
          </div>
          <span className={styles.mastheadRule} data-wipe aria-hidden="true" />

          {/* السطر المُعرِّف */}
          <h1 className={styles.openLine} data-rise><span>{tHero('headline')}</span></h1>

          {/* حجر الأساس: 2000 على خط ممتد */}
          <div className={styles.cornerstone}>
            <span className={styles.baseRule} data-wipe aria-hidden="true" />
            <div className={styles.monRow}>
              <span className={`reg ${styles.monEst}`}>{tInst('est')}</span>
              <span className={`monnum ${styles.monYear}`} data-reveal style={{ '--reveal-delay': '150ms' }}>2000</span>
              <span className={`reg ${styles.monKw}`}>{tInst('kuwait')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ ٠١ الهوية ═══ */}
      <section id="identity" className={styles.identity}>
        <div className={`container ${styles.block}`}>
          <SectionHead n={N[0]} label={tTrust('eyebrow')} />
          <div className={styles.idGrid}>
            <h2 className={styles.idTitle} data-reveal>{tTrust('heading')}</h2>
            <div className={styles.idBody}>
              <p className={styles.lead} data-reveal style={{ '--reveal-delay': '100ms' }}>{tTrust('body')}</p>
              <p className={styles.note} data-reveal style={{ '--reveal-delay': '180ms' }}>{tTrust('note')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ ٠٢ التأسيس ═══ */}
      <section id="history" className={styles.history}>
        <div className={styles.openLight} aria-hidden="true" />
        <div className={`container ${styles.block}`}>
          <SectionHead n={N[1]} label={tHist('eyebrow')} dark />
          <div className={styles.histGrid}>
            <div className={styles.histText}>
              <h2 className={styles.histTitle} data-reveal>{tHist('heading')}</h2>
              <p className={styles.histBody} data-reveal style={{ '--reveal-delay': '120ms' }}>{tHist('body')}</p>
            </div>
            <div className={styles.histLine} aria-hidden="true">
              <span className={`monnum ${styles.histYear}`}>2000</span>
              <span className={styles.histTrack} data-wipe />
              <span className={`reg ${styles.histNow}`}>{ar ? 'اليوم' : 'TODAY'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ ٠٣ المبادئ — البيان ═══ */}
      <section id="philosophy" className={styles.philosophy}>
        <div className={`container ${styles.block}`}>
          <SectionHead n={N[2]} label={tPhil('eyebrow')} />
          <div className={styles.philHead}>
            <h2 className={styles.philTitle} data-reveal>{tPhil('heading')}</h2>
            <p className={styles.philLead} data-reveal style={{ '--reveal-delay': '100ms' }}>{tPhil('lead')}</p>
          </div>
          <ol className={styles.manifesto}>
            {values.map((v, i) => (
              <li key={v} className={styles.value} data-reveal style={{ '--reveal-delay': `${i * 55}ms` }}>
                <span className={`regnum ${styles.valNum}`}>{`0${i + 1}`}</span>
                <span className={styles.valName}>{v}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ═══ ٠٤ مجالات الممارسة — دليل قيد الإعداد ═══ */}
      <section id="expertise" className={styles.expertise}>
        <div className={`container ${styles.block}`}>
          <SectionHead n={N[3]} label={tPractice('eyebrow')} />
          <div className={styles.expGrid}>
            <h2 className={styles.blockTitle} data-reveal>{tPractice('heading')}</h2>
            <div className={styles.expBody}>
              <p className={styles.lead} data-reveal style={{ '--reveal-delay': '100ms' }}>{tPractice('note')}</p>
            </div>
          </div>
          <ul className={styles.indexList} aria-hidden="true">
            {[0,1,2,3].map((i) => (
              <li key={i} className={styles.indexLine} data-reveal style={{ '--reveal-delay': `${i * 60}ms` }}>
                <span className={`regnum ${styles.indexNum}`}>{N[i]}</span>
                <span className={styles.indexTrack} />
                <span className={`reg ${styles.indexTag}`}>{tPractice('forthcoming')}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ═══ ٠٥ الفريق ═══ */}
      <section id="people" className={styles.people}>
        <div className={`container ${styles.block}`}>
          <SectionHead n={N[4]} label={tPeople('eyebrow')} dark />
          <div className={styles.peopleGrid}>
            <div className={styles.peopleLede}>
              <h2 className={styles.peopleTitle} data-reveal>{tPeople('heading')}</h2>
              <p className={styles.peopleBody} data-reveal style={{ '--reveal-delay': '120ms' }}>{tPeople('body')}</p>
              <p className={styles.peopleNote} data-reveal style={{ '--reveal-delay': '200ms' }}>{tPeople('note')}</p>
            </div>
            <ul className={styles.portraits} data-reveal style={{ '--reveal-delay': '150ms' }}>
              {[0,1,2].map((i) => (
                <li key={i} className={styles.portrait}>
                  <span className={styles.portraitFrame} aria-hidden="true"><Cross className={styles.portraitMark} /></span>
                  <span className={`reg ${styles.portraitCap}`}>{tPeople('forthcoming')}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ═══ ٠٦ رؤى قانونية — منشور قادم ═══ */}
      <section id="knowledge" className={styles.knowledge}>
        <div className={`container ${styles.block}`}>
          <SectionHead n={N[5]} label={tInsights('eyebrow')} />
          <div className={styles.expGrid}>
            <h2 className={styles.blockTitle} data-reveal>{tInsights('heading')}</h2>
            <div className={styles.expBody}>
              <p className={styles.lead} data-reveal style={{ '--reveal-delay': '100ms' }}>{tInsights('note')}</p>
            </div>
          </div>
          <div className={styles.journal} data-reveal style={{ '--reveal-delay': '140ms' }}>
            <span className={`reg ${styles.journalVol}`}>{ar ? 'المجلد ٠١' : 'VOL. 01'}</span>
            <span className={styles.journalRule} />
            <span className={`reg ${styles.journalTag}`}>{tInsights('forthcoming')}</span>
          </div>
        </div>
      </section>

      {/* ═══ ٠٧ استشارة ═══ */}
      <section id="action" className={styles.action}>
        <div className={styles.openLight} aria-hidden="true" />
        <div className={`container ${styles.actionInner}`}>
          <span className={`reg ${styles.actionReg}`}>{N[6]} · {tConsult('eyebrow')}</span>
          <h2 className={styles.actionTitle} data-rise><span>{tConsult('heading')}</span></h2>
          <p className={styles.actionBody} data-reveal style={{ '--reveal-delay': '140ms' }}>{tConsult('body')}</p>
          <Link href="/#contact" className={styles.actionBtn} data-reveal style={{ '--reveal-delay': '220ms' }}>{tConsult('cta')}</Link>
          <p className={styles.actionNote} data-reveal style={{ '--reveal-delay': '300ms' }}>{tConsult('disclaimer')}</p>
        </div>
      </section>
    </>
  );

  function SectionHead({ n, label, dark }) {
    return (
      <div className={`${styles.head} ${dark ? styles.headDark : ''}`} data-reveal>
        <span className={`regnum ${styles.headNum}`}>{n}</span>
        <span className={styles.headRule} data-wipe />
        <span className="reg">{label}</span>
      </div>
    );
  }
}
