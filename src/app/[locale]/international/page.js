import { getTranslations, setRequestLocale } from 'next-intl/server';
import { altLangs } from '@/lib/i18n-meta.js';
import { Link } from '@/i18n/navigation.js';
import PageHeroImage from '@/components/PageHeroImage.js';
import CoordinationField from '@/components/CoordinationField.js';
import { createAnonClient } from '@/lib/supabase-server.js';
import { INTERNATIONAL_ANCHOR, RELATIONSHIP_COUNTRIES } from '@/lib/international-relations.js';
import s from '../shared.module.css';

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

  /* D3.1 «حقل التنسيق»: قائمة حقل واحدة بمساواة بصرية تامة — دمج تغطية نظام الإحالة
     (قاعدة البيانات) مع دول العلاقات الموثَّقة (المصدر الثابت المعتمد)، بلا تكرار،
     باستبعاد الكويت (المرتكز)، وبترتيب قانوني حتمي واحد (أبجدي إنجليزي) في الاتجاهين.
     التمييز الوقائعي يبقى في بيانات الحوكمة والنص الشارح — لا في أي ترتيب بصري. */
  /* أمان وقائعي عند تعذّر بيانات التغطية: لا حقل «الصين وحدها» أبدًا — ذلك يعيد
     ترتيب الأهمية الذي صُمّمت D3.1 لإزالته، ولا دول مُختلَقة ولا نسخة ثابتة من
     قائمة التغطية. الحقل وتعليقه («هذه الولايات») لا يُعرضان إلا ببيانات تغطية حقيقية. */
  let fieldCountries = [];
  try {
    const supabase = createAnonClient();
    const { data } = await supabase.from('v_active_jurisdictions').select('id, name_ar, name_en').order('name_en');
    const coverage = (data || []).filter((x) => x.name_en !== INTERNATIONAL_ANCHOR.en);
    if (coverage.length > 0) {
      const merged = new Map();
      coverage.forEach((x) => merged.set(x.name_en, { en: x.name_en, ar: x.name_ar }));
      RELATIONSHIP_COUNTRIES.forEach((rc) => merged.set(rc.en, { en: rc.en, ar: rc.ar }));
      fieldCountries = [...merged.values()].sort((a, b) => a.en.localeCompare(b.en));
    }
  } catch (e) { fieldCountries = []; }
  const fieldNames = fieldCountries.map((c2) => (locale === 'ar' ? c2.ar : c2.en));

  const howSteps = [1, 2, 3, 4, 5];

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

      {/* D3.1 «حقل التنسيق» — حقل مساحي واحد يضمّ كل الدول بمساواة بصرية تامة
          (تقاعد سطر الصين المنفرد وقائمة التغطية التابعة اللذان أوحيا بترتيب أهمية).
          الشرح الوقائعي المعتمد أسفل الحقل يوضح اختلاف الآلية بحسب الولاية —
          دون وسم أي دولة بصريًا. مفاتيح D3 القديمة (relHead/relChinaDesc/relDiscretion
          وjurisdictionsHead/Body) محفوظة في الترجمة غير معروضة، تفاديًا لتضخّم لا داعي له. */}
      <section className="on-paper section-tight">
        <div className="wrap">
          <span className="eyebrow" data-reveal>{t('jurisdictionsEye')}</span>
          {/* الحقل والتعليق مشروطان ببيانات تغطية حقيقية — لا حقل أحادي الدولة ولا
              «هذه الولايات» بلا حقل؛ بقية القسم (والصفحة) يعملان طبيعيًا في كل الأحوال */}
          {fieldNames.length > 0 && (
            <>
              <div style={{ marginBlockStart: 'clamp(1.75rem,3.5vh,2.5rem)' }}>
                <CoordinationField
                  variant="full"
                  dir={locale === 'ar' ? 'rtl' : 'ltr'}
                  countries={fieldNames}
                  anchorLabel={locale === 'ar' ? INTERNATIONAL_ANCHOR.ar : INTERNATIONAL_ANCHOR.en}
                />
              </div>
              <p className="body" data-reveal style={{ maxWidth: '58ch', marginBlockStart: '1.75rem', fontSize: '.95rem' }}>
                {t('fieldCaption')}
              </p>
            </>
          )}
          <p data-reveal style={{ marginBlockStart: '2rem' }}>
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
