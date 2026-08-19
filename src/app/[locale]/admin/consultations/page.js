import { getTranslations, getLocale } from 'next-intl/server';
import { listConsultations } from '@/app/actions/admin.js';
import { createAnonClient } from '@/lib/supabase-server.js';
import AdminTable from '@/components/AdminTable.js';

const STAGES = ['new', 'triage', 'conflict_check', 'cleared', 'conflict_found', 'contacted', 'closed'];

const DETAIL_CONFIG = [
  { titleKey: 'detailContact', fields: [
      { labelKey: 'colName', key: 'full_name' },
      { labelKey: 'colType', key: 'client_type', translatePrefix: 'clientType' },
      { labelKey: 'colEmail', key: 'email', dir: 'ltr' },
      { labelKey: 'colPhone', key: 'phone', dir: 'ltr' },
  ]},
  { titleKey: 'detailRequest', fields: [
      { labelKey: 'detailPracticeArea', key: 'practice_area_id', lookup: 'practiceAreas' },
      { labelKey: 'detailPreferredContact', key: 'preferred_contact', translatePrefix: 'contactMethod' },
      { labelKey: 'detailRoutingNote', key: 'routing_note' },
  ]},
  { titleKey: 'detailTimeline', fields: [
      { labelKey: 'detailSubmittedAt', key: '_created_fmt' },
      { labelKey: 'detailConflictChecked', key: '_conflict_checked_fmt' },
  ]},
];

async function fetchPracticeAreaNames(locale) {
  try {
    const supabase = createAnonClient();
    const { data } = await supabase.from('practice_area_translations')
      .select('practice_area_id, title').eq('locale', locale);
    return Object.fromEntries((data || []).map((r) => [r.practice_area_id, r.title]));
  } catch (e) { return {}; }
}

export default async function AdminConsultations() {
  const t = await getTranslations('admin');
  const locale = await getLocale();
  const [rawRows, paNames] = await Promise.all([listConsultations(), fetchPracticeAreaNames(locale)]);
  const fmtDate = (v) => (v ? new Date(v).toLocaleString(locale === 'ar' ? 'ar-KW' : 'en-GB') : null);
  // تنسيق التواريخ من جانب الخادم (لضمان اتساق اللغة) وإرفاقها كحقول إضافية بيانات صرفة — بلا أي دوال تُمرَّر لمكوّن العميل
  const rows = rawRows.map((r) => ({ ...r, _created_fmt: fmtDate(r.created_at), _conflict_checked_fmt: fmtDate(r.conflict_checked_at) }));

  return (
    <>
      <h1 className="display d-2" style={{ marginBlockEnd: '1.5rem' }}>{t('navConsultations')}</h1>
      <AdminTable
        rows={rows} tableType="consultation" stageOptions={STAGES} emptyLabel={t('emptyList')}
        columns={[
          { key: 'reference', label: t('colRef') }, { key: 'full_name', label: t('colName') },
          { key: 'client_type', label: t('colType'), translatePrefix: 'clientType' }, { key: 'phone', label: t('colPhone') },
          { key: 'email', label: t('colEmail') }, { key: 'created_at', label: t('colSubmitted'), displayKey: '_created_fmt' },
        ]}
        detailConfig={DETAIL_CONFIG}
        lookups={{ practiceAreas: paNames }}
      />
    </>
  );
}
