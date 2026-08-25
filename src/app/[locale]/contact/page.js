import { Suspense } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { altLangs } from '@/lib/i18n-meta.js';
import ContactIntentRouter from '@/components/ContactIntentRouter.js';
import PageHeroImage from '@/components/PageHeroImage.js';
import s from '../shared.module.css';

export function generateStaticParams() { return [{ locale: 'ar' }, { locale: 'en' }]; }
export async function generateMetadata({ params }) { const { locale } = await params; const t = await getTranslations({ locale, namespace: 'contactPage' }); return { title: t('heading'), description: t('lead'), alternates: altLangs(locale, '/contact') }; }

export default async function Contact({ params }) {
  const { locale } = await params; setRequestLocale(locale);
  const t = await getTranslations('contactPage');
  const tc = await getTranslations('consultCta');
  return (
    <>
      <section className={`on-espresso ${s.pageHead} section-tight`} style={{ position: 'relative', overflow: 'hidden' }}>
        <PageHeroImage src="/kuwait/forum-mall-plaza.webp" />
        <div className="wrap" style={{ position: 'relative', zIndex: 1 }}>
          <span className="eyebrow" data-reveal>{t('eyebrow')}</span>
          <h1 className="display d-1" data-reveal style={{ marginBlock: '1.2rem 1.5rem' }}>{t('heading')}</h1>
          <p className="lead" data-reveal style={{ maxWidth: '48ch' }}>{t('lead')}</p>
        </div>
      </section>

      <section className="on-navy section-tight">
        <div className="wrap">
          <h2 className="display d-2" data-reveal style={{ color: '#fff', marginBlockEnd: '2.25rem' }}>{t('processHeading')}</h2>
          <div className="grid cols-3">
            {[1, 2, 3].map((n) => (
              <div key={n} data-reveal>
                <span className="idx">{String(n).padStart(2, '0')}</span>
                <h3 className="display d-3" style={{ marginBlock: '.6rem .4rem', color: '#fff' }}>{t(`processStep${n}T`)}</h3>
                <p className="body" style={{ fontSize: '.95rem' }}>{t(`processStep${n}D`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="on-ivory section">
        <div className={`wrap ${s.split}`}>
          <div data-reveal>
            <span className="eyebrow">{t('infoHeading')}</span>
            <div style={{ marginBlockStart: '1.5rem' }}>
              <div className={s.infoRow}><span className={s.infoLabel}>{t('phoneLabelInfo')}</span><a className={s.infoVal} href="tel:+96599010470" dir="ltr" style={{ color: 'var(--ink)' }}>+965 99010470</a></div>
              <div className={s.infoRow}><span className={s.infoLabel}>{t('emailLabelInfo')}</span><a className={s.infoVal} href="mailto:Aloun.Law@gmail.com" style={{ color: 'var(--ink)' }}>Aloun.Law@gmail.com</a></div>
              <div className={s.infoRow}><span className={s.infoLabel}>{t('addressLabel')}</span><span className={s.infoVal} style={{ color: 'var(--ink)' }}>{t('addressValue')}</span></div>
              <div className={s.infoRow}><span className={s.infoLabel}>{t('hoursLabel')}</span><span className={s.infoVal} style={{ color: 'var(--ink)' }}>{t('hoursValue')}</span></div>
            </div>
            <p className="muted" style={{ marginBlockStart: '2rem', fontSize: '0.85rem', maxWidth: '40ch' }}>{tc('disclaimer')}</p>
          </div>
          <div data-reveal>
            <span className="eyebrow">{t('formHeading')}</span>
            <div style={{ marginBlockStart: '1.5rem' }}><Suspense fallback={null}><ContactIntentRouter /></Suspense></div>
          </div>
        </div>
      </section>

      <section className="on-navy section">
        <div className="wrap">
          <span className="eyebrow" data-reveal>{t('mapHeading')}</span>
          <h2 className="display d-2" data-reveal style={{ marginBlock: '1rem 2rem', color: '#fff' }}>{t('addressValue')}</h2>
          <div className={s.locGrid} data-reveal>
            <div className={s.mapFrame}>
              <iframe
                title={t('mapHeading')}
                src={`https://www.google.com/maps?q=29.3415005,48.0259086&hl=${locale === 'ar' ? 'ar' : 'en'}&z=16&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className={s.locSide}>
              <a href="https://www.google.com/maps/dir/?api=1&destination=29.3415005,48.0259086" target="_blank" rel="noopener noreferrer" className="btn btn-solid" style={{ width: 'fit-content' }}>
                {t('directionsBtn')} <span className="arrow">→</span>
              </a>
              <div className={s.qrBox}>
                <img src="/media/qr-office-location.png" alt={t('qrCaption')} width={132} height={132} />
                <span className={s.qrCaption}>{t('qrCaption')}</span>
              </div>
            </div>
            <div className={s.routeCard}>
              <video
                className={s.routeVideo}
                src="/media/al-oun-office-route.mp4"
                poster="/media/al-oun-office-route-poster.jpg"
                autoPlay muted loop playsInline preload="metadata"
                aria-label={t('routeHeading')}
              />
              <div className={s.routeCaption}>
                <span className={s.routeHeading}>{t('routeHeading')}</span>
                <span>{t('routeCaption')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="on-white section">
        <div className="wrap">
          <div className={s.officeGrid}>
            <div className={s.officeMedia}>
              <video
                className={s.officeVideo}
                poster="/media/office-interior-poster.jpg"
                autoPlay muted loop playsInline preload="metadata"
                aria-label={t('officeHead')}
              >
                <source src="/media/office-interior.webm" type="video/webm" />
                <source src="/media/office-interior.mp4" type="video/mp4" />
              </video>
            </div>
            <div className={s.officeText} data-reveal>
              <span className="eyebrow">{t('officeEye')}</span>
              <h2 className="display d-2" style={{ marginBlock: '1.2rem 1rem' }}>{t('officeHead')}</h2>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
