import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation.js';
import s from '../shared.module.css';

export function generateStaticParams() { return [{ locale: 'ar' }, { locale: 'en' }]; }
export async function generateMetadata({ params }) { const { locale } = await params; const t = await getTranslations({ locale, namespace: 'about' }); return { title: t('heading'), description: t('lead') }; }

export default async function About({ params }) {
  const { locale } = await params; setRequestLocale(locale);
  const t = await getTranslations('about');
  const th = await getTranslations('history');
  const tt = await getTranslations('trust');
  const tph = await getTranslations('philosophy');
  const values = tph.raw('items');
  return (
    <>
      <section className={`on-espresso ${s.pageHead} section-tight`}>
        <div className="wrap">
          <span className="eyebrow" data-reveal>{t('eyebrow')}</span>
          <h1 className="display d-1" data-reveal style={{ marginBlock: '1.2rem 1.5rem', maxWidth: '18ch' }}>{t('heading')}</h1>
          <p className="lead" data-reveal style={{ maxWidth: '48ch' }}>{t('lead')}</p>
        </div>
      </section>
      <section className="on-ivory section">
        <div className="wrap-narrow wrap">
          <span className="eyebrow" data-reveal>{th('eyebrow')}</span>
          <h2 className="display d-2" data-reveal style={{ marginBlock: '1rem 1.5rem' }}>{t('storyHeading')}</h2>
          <div className="prose" data-reveal>
            <p className="body" style={{ fontSize: '1.1rem', maxWidth: '68ch' }}>{th('body')}</p>
            <p className="body" style={{ marginBlockStart: '1.25rem', maxWidth: '68ch' }}>{tt('body')}</p>
          </div>
        </div>
      </section>
      <section className="on-espresso section">
        <div className="wrap">
          <span className="eyebrow" data-reveal>{tph('eyebrow')}</span>
          <h2 className="display d-2" data-reveal style={{ marginBlock: '1rem 0.9rem' }}>{t('valuesHeading')}</h2>
          <p className="lead" data-reveal style={{ marginBlockEnd: '3rem', maxWidth: '52ch' }}>{tph('lead')}</p>
          <div className="grid cols-3">
            {values.map((v, i) => (
              <div key={i} data-reveal style={{ paddingBlockStart: '1.2rem', borderBlockStart: '1px solid var(--hair-dark)' }}>
                <span className="idx">{String(i+1).padStart(2,'0')}</span>
                <h3 className="d-3 display" style={{ marginBlockStart: '0.6rem' }}>{v}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="on-graphite section">
        <div className="wrap-narrow wrap">
          <span className="eyebrow" data-reveal>{tt('eyebrow')}</span>
          <h2 className="display d-2" data-reveal style={{ marginBlock: '1rem 1.4rem' }}>{t('kuwaitHeading')}</h2>
          <p className="body" data-reveal style={{ maxWidth: '60ch' }}>{t('kuwaitBody')}</p>
          <Link href="/contact" className="btn btn-solid" data-reveal style={{ marginBlockStart: '2.25rem' }}>{t('cta')}<span className="arrow">→</span></Link>
        </div>
      </section>
    </>
  );
}
