import { getTranslations, setRequestLocale } from 'next-intl/server';
import { altLangs } from '@/lib/i18n-meta.js';
import { Link } from '@/i18n/navigation.js';
import { TEAM } from '@/lib/team-data.js';
import s from '../shared.module.css';
import h from '../home.module.css';

export function generateStaticParams() { return [{ locale: 'ar' }, { locale: 'en' }]; }
export async function generateMetadata({ params }) { const { locale } = await params; const t = await getTranslations({ locale, namespace: 'people' }); return { title: t('heading'), alternates: altLangs(locale, '/team') }; }

/** ملف محترف "مميّز" بمعاملة متساوية — يُستخدَم لكل شخص، بلا تمييز بصري بين الأول والثاني.
 *  reverse=true تعكس ترتيب الصورة/النص عند سطح المكتب فقط (إيقاع تحريري، لا فرق أهمية). */
function ProfileBlock({ member, locale, reverse, ctaLabel }) {
  const f = member[locale] || member.ar;
  const creds = (f.creds || []).slice(0, 4);
  return (
    <div className={`${h.founder} ${reverse ? h.founderReverse : ''}`} data-reveal>
      <div className={`${h.founderMedia} img-zoom-frame`}>
        <img src={member.photoThumb} alt={f.name} />
      </div>
      <div>
        <h2 className="display d-2">{f.name}</h2>
        <p className={h.founderRole}>{f.role} · {f.title}</p>
        {f.bio && <p className="body" style={{ marginBlockStart: '1.25rem', maxWidth: '58ch' }}>{f.bio}</p>}
        {creds.length > 0 && (
          <ul className={s.pointList} style={{ marginBlockStart: '1.5rem' }}>
            {creds.map((c, i) => (<li key={i} className={s.point}><span className="body" style={{ color: 'var(--ink)' }}>{c}</span></li>))}
          </ul>
        )}
        <Link href={`/team/${member.slug}`} className="btn-line" style={{ marginBlockStart: '1.75rem' }}>{ctaLabel}<span className="arrow">→</span></Link>
      </div>
    </div>
  );
}

export default async function Team({ params }) {
  const { locale } = await params; setRequestLocale(locale);
  const t = await getTranslations('people');
  const tt = await getTranslations('teamPage');
  const founder = TEAM.find((m) => m.isFounder || m.tier === 'founder');
  const partners = TEAM.filter((m) => !m.isFounder && m.tier === 'partner');
  const members = TEAM.filter((m) => !m.isFounder && m.tier !== 'founder' && m.tier !== 'partner');
  const ctaLabel = locale === 'ar' ? 'استعرض الملف المهني' : 'View professional profile';
  const featured = [founder, ...partners].filter(Boolean);

  return (
    <>
      <section className={`on-espresso ${s.pageHead} section-tight`}>
        <div className="wrap">
          <span className="eyebrow" data-reveal>{t('eyebrow')}</span>
          <h1 className="display d-1" data-reveal style={{ marginBlock: '1.2rem 1.5rem' }}>{t('heading')}</h1>
          <p className="lead" data-reveal style={{ maxWidth: '58ch' }}>{tt('lead')}</p>
        </div>
      </section>

      {featured.map((m, i) => (
        <section key={m.slug} className={i % 2 === 0 ? 'on-ivory section' : 'on-graphite section'}>
          <div className="wrap">
            <ProfileBlock member={m} locale={locale} reverse={i % 2 === 1} ctaLabel={ctaLabel} />
          </div>
        </section>
      ))}

      {members.length > 0 && (
        <section className="on-ivory section">
          <div className="wrap">
            <span className="eyebrow" data-reveal>{tt('teamHeading')}</span>
            <div style={{ display: 'grid', gap: '2.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', marginBlockStart: '1.5rem' }}>
              {members.map((m) => {
                const mm = m[locale] || m.ar;
                return (
                  <Link key={m.slug} href={`/team/${m.slug}`} data-reveal style={{ display: 'block', color: 'inherit' }}>
                    <div className="img-zoom-frame" style={{ borderRadius: 'var(--r-lg)', overflow: 'hidden', aspectRatio: '1000/1042', marginBlockEnd: '1rem' }}>
                      <img src={m.photoThumb} alt={mm.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <h3 className="display d-3" style={{ fontSize: '1.25rem', marginBlockEnd: '.25rem' }}>{mm.name}</h3>
                    <p className="body" style={{ fontSize: '.9rem', color: 'var(--platinum-2)' }}>{mm.role}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
