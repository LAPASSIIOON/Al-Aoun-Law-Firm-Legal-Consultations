import { getTranslations, setRequestLocale } from 'next-intl/server';
import { altLangs } from '@/lib/i18n-meta.js';
import { Link } from '@/i18n/navigation.js';
import { TEAM } from '@/lib/team-data.js';
import styles from './team.module.css';

export function generateStaticParams() {
  return [{ locale: 'ar' }, { locale: 'en' }];
}

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'people' });
  return { title: t('heading'), alternates: altLangs(locale, '/team') };
}

function ProfessionalCard({ member, locale, ctaLabel, index }) {
  const profile = member[locale] || member.ar;
  const proofLines = (profile.creds || []).slice(0, 2);

  return (
    <article className={styles.card} data-reveal>
      <Link href={`/team/${member.slug}`} className={`${styles.media} img-zoom-frame`} aria-label={`${ctaLabel}: ${profile.name}`}>
        <img src={member.photoThumb} alt="" />
        <span className={styles.index} aria-hidden="true">0{index + 1}</span>
      </Link>
      <div className={styles.cardBody}>
        <span className={styles.role}>{profile.role}</span>
        <h2 className="display d-3">{profile.name}</h2>
        <p className={styles.title}>{profile.title}</p>
        {profile.bio && <p className={`body ${styles.cardBio}`}>{profile.bio}</p>}
        {proofLines.length > 0 && (
          <div className={styles.proofLines}>
            {proofLines.map((credential) => <p key={credential}>{credential}</p>)}
          </div>
        )}
        <Link href={`/team/${member.slug}`} className={`btn-line ${styles.cardCta}`}>{ctaLabel}<span className="arrow">→</span></Link>
      </div>
    </article>
  );
}

export default async function Team({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const people = await getTranslations('people');
  const team = await getTranslations('teamPage');
  const ctaLabel = locale === 'ar' ? 'استعرض الملف المهني' : 'View professional profile';
  const featured = [...TEAM].sort((a, b) => {
    const rank = { founder: 0, partner: 1 };
    return (rank[a.tier] ?? 2) - (rank[b.tier] ?? 2);
  });

  return (
    <>
      <section className={`on-navy ${styles.hero}`}>
        <div className={`wrap ${styles.heroInner}`}>
          <div>
            <span className={styles.kicker} data-reveal>{people('eyebrow')}</span>
            <h1 className={`display d-1 ${styles.heading}`} data-reveal>{people('heading')}</h1>
          </div>
          <p className={`lead ${styles.lead}`} data-reveal>{team('lead')}</p>
          <span className={styles.heroMark} aria-hidden="true">AL OUN</span>
        </div>
      </section>

      <section className={`on-ivory ${styles.directory}`}>
        <div className="wrap">
          <div className={styles.directoryHead}>
            <span>{locale === 'ar' ? 'القيادة القانونية' : 'Legal leadership'}</span>
            <p>{locale === 'ar' ? 'خبرات متكاملة، ومسؤولية مهنية مباشرة.' : 'Complementary experience with direct professional responsibility.'}</p>
          </div>
          <div className={styles.grid}>
            {featured.map((member, index) => (
              <ProfessionalCard key={member.slug} member={member} locale={locale} ctaLabel={ctaLabel} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className={`on-navy ${styles.closing}`}>
        <div className={`wrap ${styles.closingInner}`}>
          <div data-reveal>
            <span className={styles.kicker}>{locale === 'ar' ? 'ابدأ من هنا' : 'Start here'}</span>
            <h2 className="display d-2">{team('closingHead')}</h2>
            <p className="lead">{team('closingBody')}</p>
          </div>
          <Link href="/contact?intent=legalConsultation" className="btn btn-solid" data-reveal>{team('closingCta')}<span className="arrow">→</span></Link>
        </div>
      </section>
    </>
  );
}
