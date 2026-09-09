import { notFound } from 'next/navigation';
import { altLangs } from '@/lib/i18n-meta.js';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation.js';
import Breadcrumbs from '@/components/Breadcrumbs.js';
import PageUtilityIcons from '@/components/PageUtilityIcons.js';
import { TEAM, getTeamMember } from '@/lib/team-data.js';
import styles from './profile.module.css';

const SECTIONS = [
  { key: 'education', heading: 'educationHeading', number: '01' },
  { key: 'experience', heading: 'experienceHeading', number: '02' },
  { key: 'leadership', heading: 'leadershipHeading', number: '03' },
  { key: 'registrations', heading: 'registrationsHeading', number: '04' },
  { key: 'works', heading: 'worksHeading', number: '05' },
];

export function generateStaticParams() {
  return TEAM.flatMap((member) => [{ locale: 'ar', slug: member.slug }, { locale: 'en', slug: member.slug }]);
}

export async function generateMetadata({ params }) {
  const { slug, locale } = await params;
  const member = getTeamMember(slug);
  if (!member) return {};
  return { title: (member[locale] || member.ar).name, alternates: altLangs(locale, `/team/${slug}`) };
}

export default async function TeamMember({ params }) {
  const { slug, locale } = await params;
  setRequestLocale(locale);
  const member = getTeamMember(slug);
  if (!member) notFound();

  const profile = member[locale] || member.ar;
  const people = await getTranslations('people');
  const team = await getTranslations('teamPage');
  const contactLabel = locale === 'ar' ? 'تواصل مع المكتب' : 'Contact the firm';
  const profileLabel = locale === 'ar' ? 'الملف المهني' : 'Professional profile';

  return (
    <>
      <section className={`on-navy ${styles.hero}`}>
        <div className={`wrap ${styles.heroWrap}`}>
          <div className={styles.heroContent}>
            <Breadcrumbs locale={locale} items={[
              { label: locale === 'ar' ? 'الرئيسية' : 'Home', href: '/' },
              { label: people('heading'), href: '/team' },
              { label: profile.name },
            ]} />
            <span className={styles.kicker} data-reveal>{profileLabel}</span>
            <h1 className={`display d-1 ${styles.name}`} data-reveal>{profile.name}</h1>
            <p className={styles.role} data-reveal>{profile.role}<span aria-hidden="true"> · </span>{profile.title}</p>
            {profile.bio && <p className={`lead ${styles.bio}`} data-reveal>{profile.bio}</p>}
          </div>
          <div className={styles.portraitFrame} data-reveal>
            <img src={member.photoFull} alt={profile.name} />
            <span className={styles.portraitMark} aria-hidden="true">AL OUN</span>
          </div>
        </div>
      </section>

      <section className={`on-ivory ${styles.profile}`}>
        <div className={`wrap ${styles.profileWrap}`}>
          <aside className={styles.rail}>
            <span className={styles.railLabel}>{locale === 'ar' ? 'لمحة مهنية' : 'Professional standing'}</span>
            <div className={styles.railRule} />
            <PageUtilityIcons title={profile.name} locale={locale} />
          </aside>
          <div className={styles.content}>
            {profile.creds?.length > 0 && (
              <section className={styles.credentials} aria-label={locale === 'ar' ? 'نقاط الإثبات المهنية' : 'Professional credentials'}>
                {profile.creds.map((credential, index) => (
                  <div className={styles.credential} key={credential} data-reveal="stamp">
                    <span className={styles.credentialNumber}>0{index + 1}</span>
                    <p>{credential}</p>
                  </div>
                ))}
              </section>
            )}
            <div className={styles.sections}>
              {SECTIONS.map(({ key, heading, number }) => (
                Array.isArray(profile[key]) && profile[key].length > 0 ? (
                  <section className={styles.section} key={key}>
                    <div className={styles.sectionHead}>
                      <span>{number}</span>
                      <h2 className="display d-3">{team(heading)}</h2>
                    </div>
                    <ul className={styles.list}>
                      {profile[key].map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  </section>
                ) : null
              ))}
            </div>
            <section className={styles.contactCard}>
              <span>{locale === 'ar' ? 'تواصل' : 'Contact'}</span>
              <h2 className="display d-3">{locale === 'ar' ? 'ابدأ حديثًا مع المكتب.' : 'Start a conversation with the firm.'}</h2>
              <p>{locale === 'ar' ? 'للمسائل القانونية، يتواصل معك فريق المكتب بسرّية تامة.' : 'For legal matters, the firm’s team will respond in complete confidence.'}</p>
              <Link href="/contact?intent=legalConsultation" className="btn btn-solid">{contactLabel}<span className="arrow">→</span></Link>
            </section>
          </div>
        </div>
      </section>
    </>
  );
}
