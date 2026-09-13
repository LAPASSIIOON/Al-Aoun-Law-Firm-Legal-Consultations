import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation.js';
import { altLangs } from '@/lib/i18n-meta.js';
import { jsonLdScript } from '@/lib/json-ld.js';
import s from '../shared.module.css';
import styles from './faq.module.css';

export function generateStaticParams() { return [{ locale: 'ar' }, { locale: 'en' }]; }
export async function generateMetadata({ params }) { const { locale } = await params; const t = await getTranslations({ locale, namespace: 'faq' }); return { title: t('heading'), description: t('lead'), alternates: altLangs(locale, '/faq') }; }

export default async function FaqPage({ params }) {
  const { locale } = await params; setRequestLocale(locale);
  const t = await getTranslations('faq');
  const items = t.raw('items');
  const ar = locale === 'ar';

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
      <section className={`on-espresso ${s.pageHead} ${styles.hero} section-tight`}>
        <div className={`wrap ${styles.heroGrid}`}>
          <div>
            <span className="eyebrow" data-reveal>{t('eyebrow')}</span>
            <h1 className="display d-1" data-reveal style={{ marginBlock: '1.2rem 1.5rem' }}>{t('heading')}</h1>
            <p className="lead" data-reveal style={{ maxWidth: '52ch' }}>{t('lead')}</p>
          </div>
          <div className={styles.indexMark} aria-hidden="true">
            <span className={styles.indexNumber}>{String(items.length).padStart(2, '0')}</span>
            <span className={styles.indexRule} />
            <span>{ar ? 'إجابات واضحة' : 'CLEAR ANSWERS'}</span>
          </div>
        </div>
      </section>
      <section className="on-white section">
        <div className="wrap-narrow wrap">
          <div className={styles.sectionHead}>
            <span className="eyebrow">{ar ? 'دليل سريع' : 'Quick guide'}</span>
            <h2 className="display d-2">{ar ? 'ابدأ بالسؤال الأقرب إليك.' : 'Start with the question closest to yours.'}</h2>
          </div>
          <ol className={styles.list}>
            {items.map((it, i) => (
              <li key={i} className={styles.item}>
                <details className={styles.disclosure} open={i === 0}>
                  <summary className={styles.summary}>
                    <span className={styles.number}>{String(i + 1).padStart(2, '0')}</span>
                    <span className={styles.question}>{it.q}</span>
                    <span className={styles.toggle} aria-hidden="true" />
                  </summary>
                  <div className={styles.answer}>
                    <p className="body">{it.a}</p>
                  </div>
                </details>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={`on-navy-raised ${styles.closing}`}>
        <div className={`wrap ${styles.closingInner}`}>
          <div>
            <span className="eyebrow">{ar ? 'سؤالك مختلف؟' : 'A different question?'}</span>
            <h2 className="display d-2">{ar ? 'ابدأ بطلب واضح وسري.' : 'Start with a clear, confidential request.'}</h2>
          </div>
          <Link href="/contact" className="btn btn-solid">
            {ar ? 'طلب استشارة' : 'Request a Consultation'} <span className="arrow">→</span>
          </Link>
        </div>
      </section>
    </>
  );
}
