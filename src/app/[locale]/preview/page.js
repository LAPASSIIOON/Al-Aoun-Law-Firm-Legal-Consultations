import { getTranslations, setRequestLocale } from 'next-intl/server';
import StoneHero from '@/components/StoneHero.js';
import './preview.global.css';
import styles from './preview.module.css';

export const metadata = { robots: { index: false, follow: false } };

export default async function PreviewHero({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const ar = locale === 'ar';
  const tBrand = await getTranslations('brand');
  const tInst = await getTranslations('institution');
  const tHero = await getTranslations('hero');

  const founder = ar
    ? {
        kicker: 'المؤسِّس',
        name: 'الدكتور هيثم أحمد العون',
        title: 'محامٍ بالتمييز والدستورية · مؤسِّس ورئيس مجلس الإدارة',
        bio: 'حاصل على الدكتوراه في القانون الدستوري من جامعة القاهرة بتقدير امتياز، ومحامٍ أمام محكمتَي التمييز والدستورية. أسّس مجموعة العون ويرأس مجلس إدارتها، ويرأس المجلس العلمي الاستشاري بجمعية المحامين الكويتية.',
        creds: ['دكتوراه في القانون الدستوري — جامعة القاهرة · ٢٠١٧', 'رئيس المجلس العلمي الاستشاري — جمعية المحامين الكويتية', 'مقيّد بجدول الحُرّاس القضائيين — المحكمة الكلية'],
      }
    : {
        kicker: 'The Founder',
        name: 'Dr. Haitham Ahmed Al Aoun',
        title: 'Cassation & Constitutional Lawyer · Founder & Chairman',
        bio: 'Holder of a PhD in Constitutional Law from Cairo University (Excellent), admitted before the Court of Cassation and the Constitutional Court. Founder and Chairman of Al Aoun, and Head of the Scientific Advisory Council at the Kuwait Lawyers Association.',
        creds: ['PhD, Constitutional Law — Cairo University · 2017', 'Head of the Scientific Advisory Council — Kuwait Lawyers Association', 'Registered Judicial Guardian — The Grand Court'],
      };

  const arch = ar
    ? { kicker: 'العمارة والسلطة', heading: 'في قلب المنظومة القانونية الكويتية', caption: 'قصر العدل · الكويت' }
    : { kicker: 'Architecture & Authority', heading: 'At the heart of Kuwait’s legal system', caption: 'Palace of Justice · Kuwait' };

  return (
    <div className={styles.page}>
      {/* ═══ الهيرو ═══ */}
      <section className={styles.hero}>
        <StoneHero className={styles.stage} />
        <div className={styles.grain} aria-hidden="true" />
        <div className={styles.overlay}>
          <div className={styles.masthead}>
            <span className={styles.word}>{tBrand('fullName')}</span>
            <span className={styles.meta}>{tInst('est')} · {tInst('kuwait')}</span>
          </div>
          <span className={styles.rule} />
          <div className={styles.center}>
            <h1 className={styles.headline}>{tHero('headline')}</h1>
          </div>
          <div className={styles.heroFoot}>
            <span className={styles.scroll}>{ar ? 'مرِّر' : 'Scroll'}</span>
          </div>
        </div>
      </section>

      {/* ═══ قصر العدل — العمارة ═══ */}
      <section className={styles.arch}>
        <img className={styles.archImg} src="/media/palace-of-justice.jpg" alt={arch.caption} />
        <div className={styles.archScrim} aria-hidden="true" />
        <div className={styles.archText}>
          <span className={styles.kicker}>{arch.kicker}</span>
          <h2 className={styles.archHeading}>{arch.heading}</h2>
          <span className={styles.archCaption}>{arch.caption}</span>
        </div>
      </section>

      {/* ═══ المؤسِّس — د. هيثم ═══ */}
      <section className={styles.founder}>
        <div className={styles.founderGrid}>
          <figure className={styles.founderPhoto}>
            <img src="/media/founder-haitham.jpg" alt={founder.name} />
          </figure>
          <div className={styles.founderText}>
            <span className={styles.kicker}>{founder.kicker}</span>
            <h2 className={styles.founderName}>{founder.name}</h2>
            <span className={styles.founderTitle}>{founder.title}</span>
            <p className={styles.founderBio}>{founder.bio}</p>
            <ul className={styles.creds}>
              {founder.creds.map((c) => (
                <li key={c} className={styles.cred}><span className={styles.credMark} aria-hidden="true" />{c}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ═══ ختام عنّابي ═══ */}
      <section className={styles.after}>
        <p className={styles.afterLine}>{tHero('subhead')}</p>
      </section>
    </div>
  );
}
