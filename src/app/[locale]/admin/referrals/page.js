import { getTranslations, getLocale } from 'next-intl/server';
import { listReferrals } from '@/app/actions/admin.js';
import { createAnonClient } from '@/lib/supabase-server.js';
import AdminTable from '@/components/AdminTable.js';

const STAGES = ['new','triaged','conflict_check','cleared','conflict_found','partner_matching','partner_contacted','client_introduced','handled_internally','no_coverage','active','completed','closed'];

const DETAIL_CONFIG = [
  { titleKey: 'detailContact', fields: [
      { labelKey: 'colFirm', key: 'referring_firm_name' },
      { labelKey: 'colContact', key: 'referring_contact_name' },
      { labelKey: 'colEmail', key: 'referring_contact_email', dir: 'ltr' },
      { labelKey: 'colPhone', key: 'referring_contact_phone', dir: 'ltr' },
  ]},
  { titleKey: 'detailRequest', fields: [
      { labelKey: 'detailPracticeArea', key: 'practice_area_id', lookup: 'practiceAreas' },
      { labelKey: 'detailMatterSummary', key: 'matter_summary' },
      { labelKey: 'colUrgency', key: 'urgency', translatePrefix: 'urgency' },
      { labelKey: 'colType', key: 'client_type', translatePrefix: 'clientType' },
      { labelKey: 'detailDirection', key: 'direction', translatePrefix: 'direction' },
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

export default async function AdminReferrals() {
  const t = await getTranslations('admin');
  const locale = await getLocale();
  const [rawRows, paNames] = await Promise.all([listReferrals(), fetchPracticeAreaNames(locale)]);
  const fmtDate = (v) => (v ? new Date(v).toLocaleString(locale === 'ar' ? 'ar-KW' : 'en-GB') : null);
  const rows = rawRows.map((r) => ({ ...r, _created_fmt: fmtDate(r.created_at), _conflict_checked_fmt: fmtDate(r.conflict_checked_at) }));

  return (
    <>
      <h1 className="display d-2" style={{ marginBlockEnd: '1.5rem' }}>{t('navReferrals')}</h1>
      <AdminTable
        rows={rows} tableType="referral" stageOptions={STAGES} emptyLabel={t('emptyList')}
        columns={[
          { key: 'reference', label: t('colRef') }, { key: 'referring_firm_name', label: t('colFirm') },
          { key: 'referring_contact_name', label: t('colContact') }, { key: 'referring_contact_email', label: t('colEmail') },
          { key: 'urgency', label: t('colUrgency'), translatePrefix: 'urgency' }, { key: 'created_at', label: t('colSubmitted'), displayKey: '_created_fmt' },
        ]}
        detailConfig={DETAIL_CONFIG}
        lookups={{ practiceAreas: paNames }}
      />
    </>
  );
}
