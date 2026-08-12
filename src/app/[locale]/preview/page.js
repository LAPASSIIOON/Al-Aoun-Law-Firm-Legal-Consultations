import { getTranslations, setRequestLocale } from 'next-intl/server';
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

  const t = ar
    ? {
        arch: { kicker: 'العمارة والسلطة', heading: 'في قلب المنظومة القانونية الكويتية', caption: 'قصر العدل · الكويت' },
        courts: { kicker: 'أمام القضاء', heading: 'حضورٌ أمام محاكم الكويت في كل الدرجات', caption: 'المجمّع القضائي · الكويت' },
        founder: {
          kicker: 'المؤسِّس',
          name: 'الدكتور هيثم أحمد العون',
          title: 'محامٍ بالتمييز والدستورية · مؤسِّس ورئيس مجلس الإدارة',
          bio: 'حاصل على الدكتوراه في القانون الدستوري من جامعة القاهرة بتقدير امتياز، ومحامٍ أمام محكمتَي التمييز والدستورية. أسّس مجموعة العون عام ٢٠٠٢ ويرأس مجلس إدارتها، ويرأس المجلس العلمي الاستشاري بجمعية المحامين الكويتية.',
          creds: ['دكتوراه في القانون الدستوري — جامعة القاهرة · ٢٠١٧', 'ليسانس الحقوق — جامعة القاهرة · ٢٠٠٠', 'رئيس المجلس العلمي الاستشاري — جمعية المحامين الكويتية', 'مقيّد بجدول الحُرّاس القضائيين — المحكمة الكلية'],
        },
      }
    : {
        arch: { kicker: 'Architecture & Authority', heading: 'At the heart of Kuwait’s legal system', caption: 'Palace of Justice · Kuwait' },
        courts: { kicker: 'Before the Courts', heading: 'Present before the courts of Kuwait, at every degree', caption: 'The Justice Complex · Kuwait' },
        founder: {
          kicker: 'The Founder',
          name: 'Dr. Haitham Ahmed Al Aoun',
          title: 'Cassation & Constitutional Lawyer · Founder & Chairman',
          bio: 'Holder of a PhD in Constitutional Law from Cairo University (Excellent), admitted before the Court of Cassation and the Constitutional Court. He founded Al Aoun in 2002 and chairs its board, and heads the Scientific Advisory Council at the Kuwait Lawyers Association.',
          creds: ['PhD, Constitutional Law — Cairo University · 2017', 'LL.B. in Law — Cairo University · 2000', 'Head of the Scientific Advisory Council — Kuwait Lawyers Association', 'Registered Judicial Guardian — The Grand Court'],
        },
      };

  return (
    <div className={styles.page}>
      {/* ═══ الهيرو — الكويت الحقيقية ═══ */}
      <section className={`${styles.hero} ${styles.onImage}`}>
        <div className={styles.heroMedia} aria-hidden="true">
          <img className={styles.heroImg} src="/media/hero-kuwait.jpg" alt="" />
          <div className={styles.heroScrim} />
        </div>
        <div className={styles.overlay}>
          <div className={styles.masthead}>
            <span className={styles.word}>{tBrand('fullName')}</span>
            <span className={styles.meta}>{tInst('est')} · {tInst('kuwait')}</span>
          </div>
          <span className={styles.rule} />
          <div className={styles.center}>
            <h1 className={styles.headline}>{tHero('headline')}</h1>
          </div>
          <div className={styles.heroFoot}><span className={styles.scroll}>{ar ? 'مرِّر' : 'Scroll'}</span></div>
        </div>
      </section>

      {/* ═══ قصر العدل ═══ */}
      <FullImage img="/media/palace-of-justice.jpg" data={t.arch} styles={styles} warm />

      {/* ═══ المؤسِّس ═══ */}
      <section className={styles.founder}>
        <div className={styles.founderGrid}>
          <figure className={styles.founderPhoto}><img src="/media/founder-haitham.jpg" alt={t.founder.name} /></figure>
          <div className={styles.founderText}>
            <span className={styles.kicker}>{t.founder.kicker}</span>
            <h2 className={styles.founderName}>{t.founder.name}</h2>
            <span className={styles.founderTitle}>{t.founder.title}</span>
            <p className={styles.founderBio}>{t.founder.bio}</p>
            <ul className={styles.creds}>
              {t.founder.creds.map((c) => (<li key={c} className={styles.cred}><span className={styles.credMark} aria-hidden="true" />{c}</li>))}
            </ul>
          </div>
        </div>
      </section>

      {/* ═══ داخل العدالة — المجمّع القضائي ═══ */}
      <FullImage img="/media/courthouse-atrium.jpg" data={t.courts} styles={styles} dark />
    </div>
  );
}

function FullImage({ img, data, styles, warm, dark }) {
  return (
    <section className={`${styles.full} ${dark ? styles.fullDark : ''}`}>
      <img className={`${styles.fullImg} ${warm ? styles.warm : ''}`} src={img} alt={data.caption} />
      <div className={styles.fullScrim} aria-hidden="true" />
      <div className={styles.fullText}>
        <span className={styles.kicker}>{data.kicker}</span>
        <h2 className={styles.fullHeading}>{data.heading}</h2>
        <span className={styles.fullCaption}>{data.caption}</span>
      </div>
    </section>
  );
}
