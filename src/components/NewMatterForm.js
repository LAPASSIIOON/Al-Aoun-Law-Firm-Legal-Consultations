'use client';
import { useState, useTransition, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation.js';
import { createMatter, listClientMembers } from '@/app/actions/matters.js';

export default function NewMatterForm() {
  const t = useTranslations('admin');
  const router = useRouter();
  const [clients, setClients] = useState(null);
  const [clientId, setClientId] = useState('');
  const [title, setTitle] = useState('');
  const [reference, setReference] = useState('');
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');

  useEffect(() => {
    listClientMembers().then((rows) => { setClients(rows); if (rows[0]) setClientId(rows[0].id); });
  }, []);

  function create() {
    if (!clientId || !title.trim()) return;
    setError('');
    startTransition(async () => {
      const res = await createMatter({ clientId, title, reference });
      if (res?.error) { setError(res.error); return; }
      router.push(`/admin/matters/${res.id}`);
    });
  }

  if (clients === null) return null;
  if (clients.length === 0) return <p className="body" style={{ color: 'var(--muted)' }}>{t('matterNoClients')}</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '520px' }}>
      <label className="body" style={{ fontSize: '.85rem', color: 'var(--platinum-3)' }}>
        {t('matterClient')}
        <select value={clientId} onChange={(e) => setClientId(e.target.value)}
          style={{ display: 'block', width: '100%', marginBlockStart: '.35rem', font: 'inherit', fontSize: '.9rem', background: 'var(--surface-2)', color: 'var(--ink)', border: '1px solid var(--hair-light-strong)', borderRadius: 'var(--r)', padding: '.6rem .75rem' }}>
          {clients.map((c) => <option key={c.id} value={c.id}>{c.display_name} — {c.email}</option>)}
        </select>
      </label>
      <label className="body" style={{ fontSize: '.85rem', color: 'var(--platinum-3)' }}>
        {t('matterTitle')}
        <input value={title} onChange={(e) => setTitle(e.target.value)}
          style={{ display: 'block', width: '100%', marginBlockStart: '.35rem', font: 'inherit', fontSize: '.95rem', background: 'var(--surface-2)', color: 'var(--ink)', border: '1px solid var(--hair-light-strong)', borderRadius: 'var(--r)', padding: '.6rem .75rem' }} />
      </label>
      <label className="body" style={{ fontSize: '.85rem', color: 'var(--platinum-3)' }}>
        {t('matterReference')}
        <input value={reference} onChange={(e) => setReference(e.target.value)}
          style={{ display: 'block', width: '100%', marginBlockStart: '.35rem', font: 'inherit', fontSize: '.9rem', background: 'var(--surface-2)', color: 'var(--ink)', border: '1px solid var(--hair-light-strong)', borderRadius: 'var(--r)', padding: '.6rem .75rem' }} />
      </label>
      {error && <p style={{ color: '#B42722', fontSize: '.85rem' }}>{error}</p>}
      <div>
        <button type="button" className="btn btn-solid" disabled={pending || !clientId || !title.trim()} onClick={create}>{t('matterCreate')}</button>
      </div>
    </div>
  );
}
