import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation.js';
import s from './shared.module.css';

export default async function NotFound() {
  const t = await getTranslations('notFound');
  return (
    <section className={`on-espresso ${s.pageHead} section`} style={{ minBlockSize: '70vh', display: 'flex', alignItems: 'center' }}>
      <div className="wrap-narrow wrap">
        <span className="idx">404</span>
        <h1 className="display d-hero" style={{ marginBlock: '1rem 1.2rem' }}>{t('heading')}</h1>
        <p className="lead" style={{ marginBlockEnd: '2rem' }}>{t('body')}</p>
        <Link href="/" className="btn btn-solid">{t('back')}<span className="arrow">→</span></Link>
      </div>
    </section>
  );
}
