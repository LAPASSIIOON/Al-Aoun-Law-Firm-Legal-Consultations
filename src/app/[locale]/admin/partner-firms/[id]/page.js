import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation.js';
import { getPartnerFirm, listActiveCountries } from '@/app/actions/content.js';
import EditPartnerFirmForm from '@/components/EditPartnerFirmForm.js';

export default async function AdminEditPartnerFirm({ params }) {
  const { id } = await params;
  const t = await getTranslations('admin');
  const firm = await getPartnerFirm(id);
  const countries = await listActiveCountries();

  return (
    <>
      <Link href="/admin/partner-firms" className="body" style={{ fontSize: '.85rem', color: 'var(--clay)', display: 'inline-block', marginBlockEnd: '1rem' }}>
        {t('contentBackToList')}
      </Link>
      {!firm ? (
        <p className="body" style={{ color: '#B42722' }}>{t('contentNoAccess')}</p>
      ) : (
        <>
          <h1 className="display d-2" style={{ marginBlockEnd: '1.5rem' }}>{firm.legal_name}</h1>
          <EditPartnerFirmForm firm={firm} countries={countries} />
        </>
      )}
    </>
  );
}
