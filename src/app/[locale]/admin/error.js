'use client';

import { useTranslations } from 'next-intl';

export default function AdminError({ reset }) {
  const t = useTranslations('admin');

  return (
    <section role="alert" style={{ paddingBlock: '3rem' }}>
      <h1 className="display d-2" style={{ marginBlockEnd: '.75rem' }}>{t('dataErrorTitle')}</h1>
      <p className="body" style={{ color: 'var(--muted)', marginBlockEnd: '1.5rem' }}>{t('dataErrorBody')}</p>
      <button type="button" className="btn btn-solid" onClick={reset}>{t('dataErrorRetry')}</button>
    </section>
  );
}
