import { getTranslations, setRequestLocale } from 'next-intl/server';
import { altLangs } from '@/lib/i18n-meta.js';
import s from '../shared.module.css';

export function generateStaticParams() { return [{ locale: 'ar' }, { locale: 'en' }]; }
export async function generateMetadata({ params }) { const { locale } = await params; const t = await getTranslations({ locale, namespace: 'privacy' }); return { title: t('heading'), description: t('intro'), alternates: altLangs(locale, '/privacy') }; }

export default async function Page({ params }) {
  const { locale } = await params; setRequestLocale(locale);
  const t = await getTranslations('privacy');
  const sections = t.raw('sections');
  return (
    <section className={`on-ivory ${s.pageHead} section`}>
      <div className="wrap-narrow wrap">
        <span className="eyebrow" data-reveal>{t('eyebrow')}</span>
        <h1 className="display d-1" data-reveal style={{ marginBlock: '1.2rem 0.9rem' }}>{t('heading')}</h1>
        <span className={s.updated} data-reveal>{t('updated')}</span>
        <p className="body" data-reveal style={{ marginBlockStart: '1.75rem', maxWidth: '68ch' }}>{t('intro')}</p>
        <div className={s.pending} data-reveal>{t('pending')}</div>
        <ul className={s.legalList}>
          {sections.map((sec, i) => (
            <li key={i} className={s.legalItem} data-reveal>
              <h2 className={s.legalH}>{sec.h}</h2>
              <p className="body" style={{ color: 'var(--muted)' }}>{sec.b}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
