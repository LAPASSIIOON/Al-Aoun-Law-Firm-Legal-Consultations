import { getTranslations, setRequestLocale } from 'next-intl/server';
import { altLangs } from '@/lib/i18n-meta.js';
import { Link } from '@/i18n/navigation.js';
import { TEAM } from '@/lib/team-data.js';
import s from '../shared.module.css';
import h from '../home.module.css';

export function generateStaticParams() { return [{ locale: 'ar' }, { locale: 'en' }]; }
export async function generateMetadata({ params }) { const { locale } = await params; const t = await getTranslations({ locale, namespace: 'people' }); return { title: t('heading'), alternates: altLangs('/team') }; }

export default async function Team({ params }) {
  const { locale } = await params; setRequestLocale(locale);
  const t = await getTranslations('people');
  const tt = await getTranslations('teamPage');
  const founder = TEAM.find((m) => m.isFounder || m.tier === 'founder');
  const partners = TEAM.filter((m) => m.tier === 'partner');
  const members = TEAM.filter((m) => !m.isFounder && m.tier !== 'founder' && m.tier !== 'partner');
  const ff = (founder?.[locale] || founder?.ar);

  return (
    <>
      <section className={`on-espresso ${s.pageHead} section-tight`}>
        <div className="wrap">
          <span className="eyebrow" data-reveal>{t('eyebrow')}</span>
          <h1 className="display d-1" data-reveal style={{ marginBlock: '1.2rem 1.5rem' }}>{t('heading')}</h1>
          <p className="lead" data-reveal style={{ maxWidth: '52ch' }}>{tt('lead')}</p>
        </div>
      </section>

      {founder && (
        <section className="on-ivory section">
          <div className="wrap">
            <span className="eyebrow" data-reveal>{tt('founderHeading')}</span>
            <div className={h.founder} data-reveal>
              <div className={`${h.founderMedia} img-zoom-frame`}><img src={founder.photoThumb} alt={ff.name} /></div>
              <div>
                <h2 className="display d-2">{ff.name}</h2>
                <p className={h.founderRole}>{ff.role} · {ff.title}</p>
                <p className="body" style={{ marginBlockStart: '1.25rem' }}>{ff.bio}</p>
                <Link href={`/team/${founder.slug}`} className="btn-line" style={{ marginBlockStart: '1.75rem' }}>{locale === 'ar' ? 'الملف الكامل' : 'Full profile'}<span className="arrow">→</span></Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {partners.length > 0 && (
        <section className="on-graphite section">
          <div className="wrap">
            <span className="eyebrow" data-reveal>{tt('partnersHeading')}</span>
            <div style={{ display: 'grid', gap: '2.75rem', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', marginBlockStart: '1.75rem' }}>
              {partners.map((m) => {
                const mm = m[locale] || m.ar;
                return (
                  <Link key={m.slug} href={`/team/${m.slug}`} data-reveal style={{ display: 'block', color: 'inherit' }}>
                    <div className="img-zoom-frame" style={{ borderRadius: 'var(--r-lg)', overflow: 'hidden', aspectRatio: '1000/1042', marginBlockEnd: '1.15rem' }}>
                      <img src={m.photoThumb} alt={mm.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <h3 className="display d-3" style={{ fontSize: '1.4rem', marginBlockEnd: '.3rem' }}>{mm.name}</h3>
                    <p className="body" style={{ fontSize: '.98rem', color: 'var(--clay-bright)', marginBlockEnd: '.15rem' }}>{mm.role}</p>
                    <p className="body" style={{ fontSize: '.88rem', color: 'var(--platinum-2)', marginBlockEnd: '.9rem' }}>{mm.title}</p>
                    <span className="btn-line" style={{ fontSize: '.88rem' }}>{locale === 'ar' ? 'الملف الكامل' : 'Full profile'}<span className="arrow">→</span></span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {members.length > 0 ? (
        <section className={`${partners.length > 0 ? 'on-ivory' : 'on-graphite'} section`}>
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
      ) : (partners.length === 0 && (
        <section className="on-graphite section-tight section">
          <div className="wrap-narrow wrap">
            <div className={s.emptyBox} data-reveal>
              <span className="tag">{t('forthcoming')}</span>
              <p className="body">{tt('memberForthcoming')}</p>
            </div>
          </div>
        </section>
      ))}
    </>
  );
}
