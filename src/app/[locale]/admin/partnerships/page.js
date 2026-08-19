import { getTranslations, getLocale } from 'next-intl/server';
import { listPartnerships } from '@/app/actions/admin.js';
import AdminTable from '@/components/AdminTable.js';

const STAGES = ['new','under_review','contacted','declined','active'];

const DETAIL_CONFIG = [
  { titleKey: 'detailContact', fields: [
      { labelKey: 'colFirm', key: 'firm_name' },
      { labelKey: 'colContact', key: 'contact_name' },
      { labelKey: 'colEmail', key: 'email', dir: 'ltr' },
      { labelKey: 'colPhone', key: 'phone', dir: 'ltr' },
      { labelKey: 'detailWebsite', key: 'website', dir: 'ltr' },
      { labelKey: 'detailCity', key: 'city' },
  ]},
  { titleKey: 'detailRequest', fields: [
      { labelKey: 'colType', key: 'applicant_type', translatePrefix: 'applicantType' },
      { labelKey: 'detailMessage', key: 'message' },
      { labelKey: 'detailCollabInterests', key: 'collaboration_interests', isArray: true },
  ]},
  { titleKey: 'detailTimeline', fields: [
      { labelKey: 'detailSubmittedAt', key: '_created_fmt' },
      { labelKey: 'detailReviewedAt', key: '_reviewed_fmt' },
  ]},
];

export default async function AdminPartnerships() {
  const t = await getTranslations('admin');
  const locale = await getLocale();
  const rawRows = await listPartnerships();
  const fmtDate = (v) => (v ? new Date(v).toLocaleString(locale === 'ar' ? 'ar-KW' : 'en-GB') : null);
  const rows = rawRows.map((r) => ({ ...r, _created_fmt: fmtDate(r.created_at), _reviewed_fmt: fmtDate(r.reviewed_at) }));

  return (
    <>
      <h1 className="display d-2" style={{ marginBlockEnd: '1.5rem' }}>{t('navPartnerships')}</h1>
      <AdminTable
        rows={rows} tableType="partnership" stageOptions={STAGES} emptyLabel={t('emptyList')}
        columns={[
          { key: 'reference', label: t('colRef') }, { key: 'firm_name', label: t('colFirm') },
          { key: 'contact_name', label: t('colContact') }, { key: 'applicant_type', label: t('colType') },
          { key: 'email', label: t('colEmail') }, { key: 'created_at', label: t('colSubmitted') },
        ]}
        detailConfig={DETAIL_CONFIG}
      />
    </>
  );
}
