import { getTranslations, setRequestLocale } from 'next-intl/server';
import s from '../shared.module.css';

export function generateStaticParams() { return [{ locale: 'ar' }, { locale: 'en' }]; }
export async function generateMetadata({ params }) { const { locale } = await params; const t = await getTranslations({ locale, namespace: 'careers' }); return { title: t('heading'), description: t('lead') }; }

export default async function Careers({ params }) {
  const { locale } = await params; setRequestLocale(locale);
  const t = await getTranslations('careers');
  const points = t.raw('points');
  return (
    <>
      <section className={`on-espresso ${s.pageHead} section-tight`}>
        <div className="wrap">
          <span className="eyebrow" data-reveal>{t('eyebrow')}</span>
          <h1 className="display d-1" data-reveal style={{ marginBlock: '1.2rem 1.5rem' }}>{t('heading')}</h1>
          <p className="lead" data-reveal style={{ maxWidth: '48ch' }}>{t('lead')}</p>
        </div>
      </section>
      <section className="on-ivory section">
        <div className={`wrap ${s.split}`}>
          <div data-reveal>
            <span className="eyebrow">{t('cultureHeading')}</span>
            <h2 className="display d-2" style={{ marginBlockStart: '1rem' }}>{t('cultureHeading')}</h2>
          </div>
          <div data-reveal>
            <p className="body" style={{ fontSize: '1.1rem' }}>{t('cultureBody')}</p>
            <ul className={s.pointList}>
              {points.map((p, i) => (<li key={i} className={s.point}><span className="body" style={{ color: 'var(--ink)' }}>{p}</span></li>))}
            </ul>
          </div>
        </div>
      </section>
      <section className="on-graphite section">
        <div className="wrap-narrow wrap">
          <div className={s.emptyBox} data-reveal>
            <span className="tag">{t('eyebrow')}</span>
            <h2 className="display d-3">{t('noOpeningsHeading')}</h2>
            <p className="body">{t('noOpeningsBody')}</p>
            <a href="mailto:Aloun.Law@gmail.com" className="btn btn-ghost" style={{ marginBlockStart: '0.5rem' }}>{t('applyCta')}<span className="arrow">→</span></a>
          </div>
        </div>
      </section>
    </>
  );
}
