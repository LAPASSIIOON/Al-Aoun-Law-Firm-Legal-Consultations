import { getTranslations, setRequestLocale } from 'next-intl/server';
import { createAnonClient } from '@/lib/supabase-server.js';
import { altLangs } from '@/lib/i18n-meta.js';
import PartnerApplicationForm from '@/components/PartnerApplicationForm.js';
import Breadcrumbs from '@/components/Breadcrumbs.js';
import s from '../../shared.module.css';

export function generateStaticParams() { return [{ locale: 'ar' }, { locale: 'en' }]; }
export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'partnerApply' });
  return { title: t('heading'), description: t('lead'), alternates: altLangs(locale, '/international/partner-with-us') };
}

async function fetchOptions(locale) {
  try {
    const supabase = createAnonClient();
    const { data: c } = await supabase.from('v_active_countries').select('id, name_ar, name_en').order('name_en');
    const { data: pa } = await supabase.from('practice_area_translations')
      .select('practice_area_id, title').eq('locale', locale).eq('status', 'published').eq('legal_approved', true);
    return {
      countries: (c || []).map((x) => ({ id: x.id, name: locale === 'ar' ? x.name_ar : x.name_en })),
      practiceAreas: (pa || []).map((x) => ({ id: x.practice_area_id, title: x.title })),
    };
  } catch (e) { return { countries: [], practiceAreas: [] }; }
}

/** @param {{ params: Promise<{ locale: string }> }} props */
export default async function PartnerWithUs({ params }) {
  const { locale } = await params; setRequestLocale(locale);
  const t = await getTranslations('partnerApply');
  const { countries, practiceAreas } = await fetchOptions(locale);

  return (
    <>
      <section className={`on-navy ${s.pageHead} section-tight`}>
        <div className="wrap">
          <Breadcrumbs items={[
            { label: locale === 'ar' ? 'الرئيسية' : 'Home', href: '/' },
            { label: locale === 'ar' ? 'دولي' : 'International', href: '/international' },
            { label: t('heading') },
          ]} />
          <span className="eyebrow" data-reveal>{t('eyebrow')}</span>
          <h1 className="display d-1" data-reveal style={{ marginBlock: '1.2rem 1.5rem' }}>{t('heading')}</h1>
          <p className="lead" data-reveal style={{ maxWidth: '52ch' }}>{t('lead')}</p>
        </div>
      </section>
      <section className="on-ivory section">
        <div className="wrap" style={{ maxWidth: '52rem' }}>
          <PartnerApplicationForm countries={countries} practiceAreas={practiceAreas} />
        </div>
      </section>
    </>
  );
}
