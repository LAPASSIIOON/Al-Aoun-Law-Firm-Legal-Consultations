'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { subscribeNewsletter } from '@/app/actions/newsletter.js';

export default function NewsletterSubscribe({ locale }) {
  const t = useTranslations('footer');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [msg, setMsg] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setStatus('sending'); setMsg('');
    const res = await subscribeNewsletter({ email, locale });
    if (res?.ok) {
      setStatus('success'); setMsg(t('newsletterSuccess')); setEmail('');
    } else {
      setStatus('error');
      setMsg(res?.error === 'already_subscribed' ? t('newsletterDuplicate') : t('newsletterError'));
    }
  }

  return (
    <div>
      <p style={{ fontSize: '.85rem', color: 'var(--platinum-2)', marginBlockEnd: '.75rem' }}>{t('newsletterLead')}</p>
      <form onSubmit={onSubmit} style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
        <input
          type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder={t('newsletterPlaceholder')} dir="ltr"
          style={{
            flex: '1 1 180px', minInlineSize: '160px', padding: '.6rem .85rem', borderRadius: 'var(--r)',
            background: 'var(--surface-2)', color: 'var(--platinum)', boxShadow: 'inset 0 0 0 1px var(--hair-dark-strong)',
            fontSize: '.88rem',
          }}
        />
        <button type="submit" disabled={status === 'sending'} className="btn-line" style={{ fontSize: '.85rem' }}>
          {status === 'sending' ? t('newsletterSending') : t('newsletterSubmit')}
        </button>
      </form>
      {msg && (
        <p style={{ fontSize: '.8rem', marginBlockStart: '.5rem', color: status === 'success' ? '#5FBF95' : '#E08B85' }}>
          {msg}
        </p>
      )}
    </div>
  );
}
