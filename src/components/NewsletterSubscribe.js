'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { subscribeNewsletter } from '@/app/actions/newsletter.js';

/* Wave 1 — إغلاق وصولية الاشتراك:
   ١) تسمية حقيقية <label htmlFor> مرتبطة بالحقل (كانت placeholder وحده، وهو ليس تسمية).
      التسمية مخفية بصريًا فقط — التخطيط لم يتغيّر.
   ٢) منطقة إعلان role="status" aria-live="polite" موجودة في DOM دائمًا (لا تُركَّب عند
      وصول الرسالة) كي يلتقطها قارئ الشاشة فعلًا.
   ٣) الحالة لم تعد باللون وحده: علامة نصّية (✓ / !) تسبق الرسالة، واللون مكمّل لا حامل.
   لا تغيير في السلوك ولا في نصوص الاشتراك ولا في الإجراء الخادم. */
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

  const hidden = {
    position: 'absolute', inlineSize: '1px', blockSize: '1px', padding: 0, margin: '-1px',
    overflow: 'hidden', clip: 'rect(0 0 0 0)', clipPath: 'inset(50%)', whiteSpace: 'nowrap', border: 0,
  };

  return (
    <div>
      <p style={{ fontSize: '.85rem', color: 'var(--platinum-2)', marginBlockEnd: '.75rem' }}>{t('newsletterLead')}</p>
      <form onSubmit={onSubmit} style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
        <label htmlFor="newsletter-email" style={hidden}>{t('newsletterLabel')}</label>
        <input
          id="newsletter-email" name="email"
          type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder={t('newsletterPlaceholder')} dir="ltr"
          autoComplete="email" inputMode="email"
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
      <p
        role="status" aria-live="polite"
        style={{
          fontSize: '.8rem', marginBlockStart: msg ? '.5rem' : 0, minBlockSize: msg ? undefined : 0,
          color: status === 'success' ? '#5FBF95' : status === 'error' ? '#E08B85' : 'var(--platinum-2)',
        }}
      >
        {msg && (
          <>
            <span aria-hidden="true" style={{ marginInlineEnd: '.4rem', fontWeight: 600 }}>
              {status === 'success' ? '✓' : '!'}
            </span>
            {msg}
          </>
        )}
      </p>
    </div>
  );
}
