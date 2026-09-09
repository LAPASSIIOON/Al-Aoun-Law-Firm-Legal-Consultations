import { getTranslations, setRequestLocale } from 'next-intl/server';
import { altLangs } from '@/lib/i18n-meta.js';
import { Link } from '@/i18n/navigation.js';
import PageHeroImage from '@/components/PageHeroImage.js';
import { getTeamMember } from '@/lib/team-data.js';
import styles from './about.module.css';

export function generateStaticParams() {
  return [{ locale: 'ar' }, { locale: 'en' }];
}

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'about' });
  return { title: t('heading'), description: t('lead'), alternates: altLangs(locale, '/about') };
}

export default async function About({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const about = await getTranslations('about');
  const history = await getTranslations('history');
  const trust = await getTranslations('trust');
  const philosophy = await getTranslations('philosophy');
  const founder = getTeamMember('haitham-al-aoun');
  const founderProfile = founder[locale] || founder.ar;
  const values = philosophy.raw('items');

  return (
    <>
      <section className={`on-navy ${styles.hero}`}>
        <PageHeroImage src="/kuwait/courthouse-columns.webp" />
        <div className={`wrap ${styles.heroInner}`}>
          <span className={styles.label} data-reveal>{about('eyebrow')}</span>
          <h1 className={`display d-1 ${styles.heading}`} data-reveal>{about('heading')}</h1>
          <p className={`lead ${styles.lead}`} data-reveal>{about('lead')}</p>
        </div>
      </section>

      <section className={`on-ivory ${styles.story}`}>
        <div className={`wrap ${styles.storyGrid}`}>
          <header>
            <span className={styles.label}>{history('eyebrow')}</span>
            <h2 className="display d-2" data-reveal>{about('storyHeading')}</h2>
          </header>
          <div className={styles.storyBody} data-reveal="slow">
            <p className={styles.statement}>{history('body')}</p>
            <p className="body">{trust('body')}</p>
          </div>
        </div>
      </section>

      <section className={`on-white ${styles.leadership}`}>
        <div className={`wrap ${styles.leadershipGrid}`}>
          <div className={styles.portrait} data-reveal>
            <img src={founder.photoFull} alt={founderProfile.name} />
          </div>
          <div className={styles.leadershipCopy} data-reveal="slow">
            <span className={styles.label}>{locale === 'ar' ? 'القيادة' : 'Leadership'}</span>
            <h2 className="display d-2">{founderProfile.name}</h2>
            <p className={styles.role}>{founderProfile.role} · {founderProfile.title}</p>
            <p className="body">{founderProfile.bio}</p>
            <Link href="/team/haitham-al-aoun" className="btn-line">
              {locale === 'ar' ? 'استعرض الملف المهني' : 'View professional profile'}<span className="arrow">→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className={`on-espresso ${styles.values}`}>
        <div className={`wrap ${styles.valuesGrid}`}>
          <header>
            <span className={styles.label}>{philosophy('eyebrow')}</span>
            <h2 className="display d-2" data-reveal>{about('valuesHeading')}</h2>
            <p className="lead" data-reveal>{philosophy('lead')}</p>
          </header>
          <ul className={styles.valueList}>
            {values.map((value) => <li key={value} data-reveal>{value}</li>)}
          </ul>
        </div>
      </section>

      <section className={`on-graphite ${styles.presence}`}>
        <div className={`wrap ${styles.presenceGrid}`}>
          <div>
            <span className={styles.label} data-reveal>{trust('eyebrow')}</span>
            <h2 className="display d-2" data-reveal>{about('kuwaitHeading')}</h2>
          </div>
          <div data-reveal="slow">
            <p className="body">{about('kuwaitBody')}</p>
            <p className={styles.affiliation}>{about('groupAffiliation')}</p>
            <Link href="/contact" className="btn btn-solid">{about('cta')}<span className="arrow">→</span></Link>
          </div>
        </div>
      </section>
    </>
  );
}
