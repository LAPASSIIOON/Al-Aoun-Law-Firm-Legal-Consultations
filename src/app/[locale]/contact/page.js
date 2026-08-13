import { getTranslations, setRequestLocale } from 'next-intl/server';
import ContactForm from '@/components/ContactForm.js';
import s from '../shared.module.css';

export function generateStaticParams() { return [{ locale: 'ar' }, { locale: 'en' }]; }
export async function generateMetadata({ params }) { const { locale } = await params; const t = await getTranslations({ locale, namespace: 'contactPage' }); return { title: t('heading'), description: t('lead') }; }

export default async function Contact({ params }) {
  const { locale } = await params; setRequestLocale(locale);
  const t = await getTranslations('contactPage');
  const tc = await getTranslations('consultCta');
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
            <span className="eyebrow">{t('infoHeading')}</span>
            <div style={{ marginBlockStart: '1.5rem' }}>
              <div className={s.infoRow}><span className={s.infoLabel}>{t('phoneLabelInfo')}</span><a className={s.infoVal} href="tel:+96599010470" dir="ltr" style={{ color: 'var(--ink)' }}>+965 99010470</a></div>
              <div className={s.infoRow}><span className={s.infoLabel}>{t('emailLabelInfo')}</span><a className={s.infoVal} href="mailto:Aloun.Law@gmail.com" style={{ color: 'var(--ink)' }}>Aloun.Law@gmail.com</a></div>
              <div className={s.infoRow}><span className={s.infoLabel}>{t('hoursLabel')}</span><span className={s.infoVal}>{t('hoursValue')}</span></div>
            </div>
            <p className="muted" style={{ marginBlockStart: '2rem', fontSize: '0.85rem', maxWidth: '40ch' }}>{tc('disclaimer')}</p>
          </div>
          <div data-reveal>
            <span className="eyebrow">{t('formHeading')}</span>
            <div style={{ marginBlockStart: '1.5rem' }}><ContactForm /></div>
          </div>
        </div>
      </section>
    </>
  );
}
