import { getTranslations, setRequestLocale } from 'next-intl/server';
import { altLangs } from '@/lib/i18n-meta.js';
import { Link } from '@/i18n/navigation.js';
import PageHeroImage from '@/components/PageHeroImage.js';
import { createAnonClient } from '@/lib/supabase-server.js';
import { INTERNATIONAL_ANCHOR, RELATIONSHIP_COUNTRIES } from '@/lib/international-relations.js';
import s from '../shared.module.css';
import hs from '../home.module.css';

export const revalidate = 300;
export function generateStaticParams() { return [{ locale: 'ar' }, { locale: 'en' }]; }
export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'international' });
  return { title: t('heading'), description: t('lead'), alternates: altLangs(locale, '/international') };
}

/** @param {{ params: Promise<{ locale: string }> }} props */
export default async function International({ params }) {
  const { locale } = await params; setRequestLocale(locale);
  const t = await getTranslations('international');
  const n = await getTranslations('nav');

  let jurisdictions = [];
  try {
    const supabase = createAnonClient();
    const { data } = await supabase.from('v_active_jurisdictions').select('id, name_ar, name_en').order('name_en');
    jurisdictions = (data || []).map((x) => (locale === 'ar' ? x.name_ar : x.name_en));
  } catch (e) { jurisdictions = []; }

  const howSteps = [1, 2, 3, 4, 5];

  /* تحصين فصل الطبقتين: أي دولة معتمدة في طبقة العلاقات (المصدر الثابت) تُستبعد آليًا
     من قائمة التغطية — فلا تظهر دولة في الطبقتين معًا حتى لو دخلت مستقبلًا في بيانات
     نظام الإحالة. الاستبعاد بالاسمين المعرَّبين والإنجليزيين معًا، والمرتكز (الكويت) كذلك. */
  const stratumAExcluded = new Set([
    INTERNATIONAL_ANCHOR.ar, INTERNATIONAL_ANCHOR.en,
    ...RELATIONSHIP_COUNTRIES.flatMap((rc) => [rc.ar, rc.en]),
  ]);

  return (
    <>
      <section className={`on-navy ${s.pageHead} section-tight`} style={{ position: 'relative', overflow: 'hidden' }}>
        <PageHeroImage src="/kuwait/skyline-water-reflection.webp" />
        <div className="wrap" style={{ position: 'relative', zIndex: 1 }}>
          <span className="eyebrow" data-reveal>{t('eyebrow')}</span>
          <h1 className="display d-1" data-reveal style={{ marginBlock: '1.2rem 1.5rem' }}>{t('heading')}</h1>
          <p className="lead" data-reveal style={{ maxWidth: '54ch' }}>{t('lead')}</p>
        </div>
      </section>

      {/* الازدواج — القرار المعماري الأهم في الصفحة، مُوسَّع لثلاث مسارات (المسار الأوسط كان ناقصًا فعليًا) */}
      <section className="on-white section">
        <div className="wrap">
          <div className={`${s.forkGrid} ${s.forkGrid3}`}>
            <div className={s.forkCard} data-reveal>
              <span className="eyebrow">{t('forkClientEye')}</span>
              <h2 className="display d-2" style={{ marginBlock: '1rem .9rem' }}>{t('forkClientHead')}</h2>
              <p className="body">{t('forkClientBody')}</p>
              <p style={{ marginBlockStart: '1.5rem' }}>
                <Link href={`/contact?intent=kuwaitCounsel&from=/${locale}/international`} className="btn btn-solid">{t('forkClientCta')} <span className="arrow">→</span></Link>
              </p>
            </div>
            <div className={s.forkCard} data-reveal>
              <span className="eyebrow">{t('forkOutboundEye')}</span>
              <h2 className="display d-2" style={{ marginBlock: '1rem .9rem' }}>{t('forkOutboundHead')}</h2>
              <p className="body">{t('forkOutboundBody')}</p>
              <p style={{ marginBlockStart: '1.5rem' }}>
                <Link href={`/contact?intent=internationalMatter&from=/${locale}/international`} className="btn-line">{t('forkOutboundCta')} <span className="arrow">→</span></Link>
              </p>
            </div>
            <div className={s.forkCard} data-reveal>
              <span className="eyebrow">{t('forkFirmEye')}</span>
              <h2 className="display d-2" style={{ marginBlock: '1rem .9rem' }}>{t('forkFirmHead')}</h2>
              <p className="body">{t('forkFirmBody')}</p>
              <p style={{ marginBlockStart: '1.5rem' }}>
                <Link href="/international/for-law-firms" className="btn-line">{t('forkFirmCta')} <span className="arrow">→</span></Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* كيف نعمل */}
      <section className="on-navy section">
        <div className="wrap">
          <h2 className="display d-2" data-reveal style={{ color: '#fff', marginBlockEnd: '2.25rem' }}>{t('howHeading')}</h2>
          <div className="grid cols-3">
            {howSteps.map((n2) => (
              <div key={n2} data-reveal style={{ marginBlockEnd: '1.5rem' }}>
                <span className="idx">{String(n2).padStart(2, '0')}</span>
                <h3 className="display d-3" style={{ marginBlock: '.6rem .4rem', color: '#fff' }}>{t(`how${n2}T`)}</h3>
                <p className="body" style={{ fontSize: '.95rem' }}>{t(`how${n2}D`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* لماذا الكويت مركز الثقل */}
      <section className="on-white section">
        <div className="wrap">
          <span className="eyebrow" data-reveal>{t('anchorEye')}</span>
          <h2 className="display d-2" data-reveal style={{ marginBlock: '1rem 1.2rem', maxWidth: '20ch' }}>{t('anchorHead')}</h2>
          <p className="body" data-reveal style={{ fontSize: '1.05rem', maxWidth: '62ch' }}>{t('anchorBody')}</p>
        </div>
      </section>

      {/* D3 «سجلّ الممرّات» — طبقتان مفصولتان بصرامة:
          الطبقة أ (العلاقات): دول ذات علاقات مهنية موثَّقة من مصدر ثابت معتمد — نص كامل الحجم،
          الدولة تُعلن والطرف المهني لا يُنشر. لا خرائط ولا عُقد ولا أشعّة (تقاعدت خريطة الشبكة —
          كانت تعرض بيانات تغطية كأنها علاقات). الطبقة ب (التغطية): ولايات نظام الإحالة من
          قاعدة البيانات كنصّ هادئ غير تفاعلي تحت نصّ الإفصاح المعتمد القائم. */}
      <section className="on-paper section-tight">
        <div className="wrap">
          <h2 className="display d-2" data-reveal style={{ marginBlockEnd: '1.5rem', maxWidth: '26ch' }}>{t('relHead')}</h2>
          <div className={hs.intlList}>
            {RELATIONSHIP_COUNTRIES.map((rc) => (
              <div key={rc.code} className={hs.intlRowStatic} data-reveal="file">
                <span className={hs.intlCorridor}>
                  {locale === 'ar' ? INTERNATIONAL_ANCHOR.ar : INTERNATIONAL_ANCHOR.en}
                  {' '}<span aria-hidden="true">⇄</span>{' '}
                  {locale === 'ar' ? rc.ar : rc.en}
                </span>
                <span className={hs.intlDesc}>{t('relChinaDesc')}</span>
              </div>
            ))}
          </div>
          <p className={hs.intlDiscretion} data-reveal>{t('relDiscretion')}</p>

          {jurisdictions.length > 0 && (
            <div style={{ marginBlockStart: 'clamp(2.5rem,5vh,3.5rem)' }}>
              <span className="eyebrow" data-reveal>{t('jurisdictionsEye')}</span>
              <h3 className="display d-3" data-reveal style={{ marginBlock: '1rem .9rem', maxWidth: '26ch' }}>{t('jurisdictionsHead')}</h3>
              <p className="body" data-reveal style={{ maxWidth: '58ch', marginBlockEnd: '1.75rem' }}>{t('jurisdictionsBody')}</p>
              <ul className={hs.intlCoverage} data-reveal>
                {jurisdictions.filter((nm) => !stratumAExcluded.has(nm)).map((nm) => (
                  <li key={nm}>{nm}</li>
                ))}
              </ul>
            </div>
          )}

          <p data-reveal style={{ marginBlockStart: '2.25rem' }}>
            <Link href="/international/refer-a-matter" className="btn btn-solid">
              {locale === 'ar' ? 'أحِل ملفًا إلينا' : 'Refer a matter to us'} <span className="arrow">→</span>
            </Link>
          </p>
        </div>
      </section>

      {/* الحوكمة */}
      <section className="on-navy section-tight">
        <div className="wrap">
          <span className="eyebrow" data-reveal>{t('govEye')}</span>
          <h2 className="display d-2" data-reveal style={{ color: '#fff', marginBlock: '1rem 1.1rem', maxWidth: '22ch' }}>{t('govHead')}</h2>
          <p className="body" data-reveal style={{ maxWidth: '58ch' }}>{t('govBody')}</p>
        </div>
      </section>

      {/* اتصال مزدوج */}
      <section className="on-paper section">
        <div className="wrap">
          <div className={s.forkGrid}>
            <div data-reveal>
              <h3 className="display d-3" style={{ marginBlockEnd: '1.1rem' }}>{t('ctaClientHead')}</h3>
              <Link href="/contact" className="btn btn-solid">{n('consult')} <span className="arrow">→</span></Link>
            </div>
            <div data-reveal>
              <h3 className="display d-3" style={{ marginBlockEnd: '1.1rem' }}>{t('ctaFirmHead')}</h3>
              <Link href="/international/for-law-firms" className="btn-line">{t('forkFirmCta')} <span className="arrow">→</span></Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
