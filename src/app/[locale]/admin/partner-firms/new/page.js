import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation.js';
import { getMyContentRole, listActiveCountries } from '@/app/actions/content.js';
import NewPartnerFirmForm from '@/components/NewPartnerFirmForm.js';

export default async function AdminNewPartnerFirm() {
  const t = await getTranslations('admin');
  const myRole = await getMyContentRole();
  const countries = await listActiveCountries();

  return (
    <>
      <Link href="/admin/partner-firms" className="body" style={{ fontSize: '.85rem', color: 'var(--clay)', display: 'inline-block', marginBlockEnd: '1rem' }}>
        {t('contentBackToList')}
      </Link>
      <h1 className="display d-2" style={{ marginBlockEnd: '1.5rem' }}>{t('contentNewPartnerFirm')}</h1>
      {!myRole ? (
        <p className="body" style={{ color: '#B42722' }}>{t('contentNoAccess')}</p>
      ) : (
        <NewPartnerFirmForm countries={countries} />
      )}
    </>
  );
}
