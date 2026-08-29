import { getTranslations, setRequestLocale } from 'next-intl/server';
import { altLangs } from '@/lib/i18n-meta.js';
import { jsonLdScript } from '@/lib/json-ld.js';
import s from '../shared.module.css';

export function generateStaticParams() { return [{ locale: 'ar' }, { locale: 'en' }]; }
export async function generateMetadata({ params }) { const { locale } = await params; const t = await getTranslations({ locale, namespace: 'faq' }); return { title: t('heading'), description: t('lead'), alternates: altLangs(locale, '/faq') }; }

export default async function FaqPage({ params }) {
  const { locale } = await params; setRequestLocale(locale);
  const t = await getTranslations('faq');
  const items = t.raw('items');

  // مخطَّط FAQPage — أسئلة وأجوبة حقيقية فقط، مطابقة تمامًا للنص المعروض على الصفحة (لا فرق بين ما يُعرَض للزائر وما يُقرأ للآلة)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: it.q,
      acceptedAnswer: { '@type': 'Answer', text: it.a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />
      <section className={`on-espresso ${s.pageHead} section-tight`}>
        <div className="wrap">
          <span className="eyebrow" data-reveal>{t('eyebrow')}</span>
          <h1 className="display d-1" data-reveal style={{ marginBlock: '1.2rem 1.5rem' }}>{t('heading')}</h1>
          <p className="lead" data-reveal style={{ maxWidth: '52ch' }}>{t('lead')}</p>
        </div>
      </section>
      <section className="on-ivory section">
        <div className="wrap-narrow wrap">
          <ul className={s.legalList}>
            {items.map((it, i) => (
              <li key={i} className={s.legalItem} data-reveal>
                <h2 className={s.legalH}>{it.q}</h2>
                <p className="body" style={{ color: 'var(--muted)' }}>{it.a}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
