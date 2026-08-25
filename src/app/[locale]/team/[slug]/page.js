import { notFound } from 'next/navigation';
import { altLangs } from '@/lib/i18n-meta.js';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation.js';
import Breadcrumbs from '@/components/Breadcrumbs.js';
import PageUtilityIcons from '@/components/PageUtilityIcons.js';
import { TEAM, getTeamMember } from '@/lib/team-data.js';
import s from '../../shared.module.css';
import h from '../../home.module.css';

export function generateStaticParams() { return TEAM.flatMap((m) => [{ locale: 'ar', slug: m.slug }, { locale: 'en', slug: m.slug }]); }
export async function generateMetadata({ params }) {
  const { slug, locale } = await params;
  const m = getTeamMember(slug);
  if (!m) return {};
  return { title: (m[locale] || m.ar).name, alternates: altLangs(locale, `/team/${slug}`) };
}

export default async function TeamMember({ params }) {
  const { slug, locale } = await params; setRequestLocale(locale);
  const m = getTeamMember(slug);
  if (!m) notFound();
  const f = m[locale] || m.ar;
  const t = await getTranslations('people');
  const tp = await getTranslations('teamPage');

  return (
    <section className={`on-ivory ${s.pageHead} section`}>
      <div className="wrap">
        <Breadcrumbs locale={locale} items={[
          { label: locale === 'ar' ? 'الرئيسية' : 'Home', href: '/' },
          { label: t('heading'), href: '/team' },
          { label: f.name },
        ]} />
        <div className={h.founder}>
          <div className={`${h.founderMedia} img-zoom-frame`}><img src={m.photoFull} alt={f.name} /></div>
          <div>
            <h1 className="display d-1">{f.name}</h1>
            <p className={h.founderRole} style={{ fontSize: '1.05rem' }}>{f.role} · {f.title}</p>
            {f.bio && <p className="body" style={{ marginBlockStart: '1.25rem', maxWidth: '60ch' }}>{f.bio}</p>}
            <ul className={s.pointList} style={{ marginBlockStart: '1.5rem' }}>
              {f.creds.map((c, i) => (<li key={i} className={s.point} data-reveal="stamp"><span className="body" style={{ color: 'var(--ink)' }}>{c}</span></li>))}
            </ul>
            <PageUtilityIcons title={f.name} locale={locale} />

            {f.education && (
              <>
                <h2 className="display d-3" style={{ fontSize: '1.15rem', marginBlockStart: '2.25rem', marginBlockEnd: '.75rem' }}>{tp('educationHeading')}</h2>
                <ul className={s.pointList}>
                  {f.education.map((c, i) => (<li key={i} className={s.point}><span className="body" style={{ color: 'var(--ink)' }}>{c}</span></li>))}
                </ul>
              </>
            )}
            {f.experience && (
              <>
                <h2 className="display d-3" style={{ fontSize: '1.15rem', marginBlockStart: '2.25rem', marginBlockEnd: '.75rem' }}>{tp('experienceHeading')}</h2>
                <ul className={s.pointList}>
                  {f.experience.map((c, i) => (<li key={i} className={s.point}><span className="body" style={{ color: 'var(--ink)' }}>{c}</span></li>))}
                </ul>
              </>
            )}

            <a href="mailto:Aloun.Law@gmail.com" className="btn btn-solid" style={{ marginBlockStart: '2rem' }}>{locale === 'ar' ? 'تواصل مع المكتب' : 'Contact the firm'}<span className="arrow">→</span></a>
          </div>
        </div>
      </div>
    </section>
  );
}
