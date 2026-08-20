'use client';
import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import {
  updateArticleTranslation, approveArticleTranslation,
  addArticleTranslation, setArticleActive,
} from '@/app/actions/content.js';

const LOCALES = ['ar', 'en'];

function StatusPill({ label, color }) {
  return (
    <span style={{ fontSize: '.78rem', color, boxShadow: `inset 0 0 0 1px ${color}55`, borderRadius: 'var(--r)', padding: '.25rem .65rem' }}>
      {label}
    </span>
  );
}

/** @param {{ articleId: string, translations: any[], myRole: string|null, isActive: boolean }} props */
export default function ArticleEditor({ articleId, translations, myRole, isActive }) {
  const t = useTranslations('admin');
  const [tab, setTab] = useState(translations.find((tr) => tr.locale === 'ar') ? 'ar' : (translations[0]?.locale || 'ar'));
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [active, setActive] = useState(isActive);

  const canApprove = myRole === 'admin' || myRole === 'legal';
  const canEdit = myRole === 'admin' || myRole === 'editor';

  const current = translations.find((tr) => tr.locale === tab);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBlockEnd: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '.4rem' }}>
          {LOCALES.map((loc) => {
            const tr = translations.find((x) => x.locale === loc);
            const activeTab = tab === loc;
            return (
              <button key={loc} type="button" onClick={() => setTab(loc)} style={{
                font: 'inherit', fontSize: '.88rem', padding: '.5rem 1.1rem', borderRadius: 'var(--r)',
                background: activeTab ? 'var(--clay)' : 'transparent', color: activeTab ? '#fff' : 'var(--platinum-2)',
                boxShadow: activeTab ? 'none' : 'inset 0 0 0 1px var(--hair-light-strong)', cursor: 'pointer',
              }}>
                {loc === 'ar' ? t('contentLocaleAr') : t('contentLocaleEn')}
                {!tr && <span style={{ marginInlineStart: '.4rem', opacity: .7 }}>·</span>}
              </button>
            );
          })}
        </div>
        <label className="body" style={{ fontSize: '.85rem', display: 'flex', alignItems: 'center', gap: '.5rem', color: 'var(--platinum-2)' }}>
          <input type="checkbox" checked={active} disabled={!canEdit || pending}
            onChange={(e) => { setActive(e.target.checked); startTransition(async () => { await setArticleActive({ id: articleId, isActive: e.target.checked }); }); }} />
          {t('contentActive')}
        </label>
      </div>

      {current ? (
        <ExistingTranslationForm
          key={current.id} articleId={articleId} tr={current} t={t} canEdit={canEdit} canApprove={canApprove}
          pending={pending} startTransition={startTransition} saved={saved} setSaved={setSaved}
        />
      ) : (
        <NewTranslationForm articleId={articleId} locale={tab} t={t} canEdit={canEdit} pending={pending} startTransition={startTransition} />
      )}
    </div>
  );
}

function ExistingTranslationForm({ articleId, tr, t, canEdit, canApprove, pending, startTransition, saved, setSaved }) {
  const [title, setTitle] = useState(tr.title);
  const [excerpt, setExcerpt] = useState(tr.excerpt || '');
  const [body, setBody] = useState(tr.body || '');

  const isPublishedApproved = tr.status === 'published' && tr.legal_approved;
  const statusColor = isPublishedApproved ? '#1C7D5A' : tr.status === 'legal_review' ? '#A0630D' : '#636874';

  function save() {
    startTransition(async () => {
      await updateArticleTranslation({ id: tr.id, title, excerpt, body });
      setSaved(true); setTimeout(() => setSaved(false), 1800);
    });
  }
  function submitForReview() {
    startTransition(async () => {
      await updateArticleTranslation({ id: tr.id, title, excerpt, body, status: 'legal_review' });
    });
  }
  function approve() {
    startTransition(async () => { await approveArticleTranslation({ translationId: tr.id, articleId }); });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', flexWrap: 'wrap' }}>
        <StatusPill label={t(`contentStatus_${tr.status}`)} color={statusColor} />
        {isPublishedApproved && tr.approverName && (
          <span className="body" style={{ fontSize: '.82rem', color: 'var(--muted)' }}>{t('contentApprovedNote')}: {tr.approverName}</span>
        )}
        {!tr.legal_approved && tr.status === 'legal_review' && (
          <span className="body" style={{ fontSize: '.82rem', color: '#A0630D' }}>{t('contentPendingApprovalNote')}</span>
        )}
      </div>

      <label className="body" style={{ fontSize: '.85rem', color: 'var(--platinum-3)' }}>
        {t('contentTitle')}
        <input value={title} onChange={(e) => setTitle(e.target.value)} disabled={!canEdit}
          style={{ display: 'block', width: '100%', marginBlockStart: '.35rem', font: 'inherit', fontSize: '.95rem', background: 'var(--surface-2)', color: 'var(--ink)', border: '1px solid var(--hair-light-strong)', borderRadius: 'var(--r)', padding: '.6rem .75rem' }} />
      </label>
      <label className="body" style={{ fontSize: '.85rem', color: 'var(--platinum-3)' }}>
        {t('contentExcerpt')}
        <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} disabled={!canEdit} rows={2}
          style={{ display: 'block', width: '100%', marginBlockStart: '.35rem', font: 'inherit', fontSize: '.9rem', background: 'var(--surface-2)', color: 'var(--ink)', border: '1px solid var(--hair-light-strong)', borderRadius: 'var(--r)', padding: '.6rem .75rem', resize: 'vertical' }} />
      </label>
      <label className="body" style={{ fontSize: '.85rem', color: 'var(--platinum-3)' }}>
        {t('contentBody')}
        <textarea value={body} onChange={(e) => setBody(e.target.value)} disabled={!canEdit} rows={12}
          style={{ display: 'block', width: '100%', marginBlockStart: '.35rem', font: 'inherit', fontSize: '.9rem', lineHeight: 1.7, background: 'var(--surface-2)', color: 'var(--ink)', border: '1px solid var(--hair-light-strong)', borderRadius: 'var(--r)', padding: '.75rem', resize: 'vertical' }} />
      </label>

      {canEdit && (
        <div style={{ display: 'flex', gap: '.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-ghost" disabled={pending} onClick={save}>{t('contentSave')}</button>
          {tr.status !== 'legal_review' && !isPublishedApproved && (
            <button type="button" className="btn-line" disabled={pending} onClick={submitForReview}>{t('contentSubmitForReview')}</button>
          )}
          {canApprove && !isPublishedApproved && (
            <button type="button" className="btn btn-solid" disabled={pending} onClick={approve}>{t('contentApprovePublish')}</button>
          )}
          {saved && <span style={{ color: '#1C7D5A', fontSize: '.85rem' }}>{t('contentSaved')}</span>}
        </div>
      )}
    </div>
  );
}

function NewTranslationForm({ articleId, locale, t, canEdit, pending, startTransition }) {
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [body, setBody] = useState('');
  const [done, setDone] = useState(false);

  function create() {
    if (!title.trim()) return;
    startTransition(async () => {
      const res = await addArticleTranslation({ articleId, locale, title, excerpt, body });
      if (res?.ok) setDone(true);
    });
  }

  if (done) return <p className="body" style={{ color: 'var(--muted)' }}>{t('contentSaved')} — {t('contentBackToList')}</p>;
  if (!canEdit) return <p className="body" style={{ color: 'var(--muted)' }}>{t('contentMissingTranslation')}</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <p className="body" style={{ color: 'var(--muted)', fontSize: '.85rem' }}>{t('contentMissingTranslation')} — {t('contentCreateHint')}</p>
      <label className="body" style={{ fontSize: '.85rem', color: 'var(--platinum-3)' }}>
        {t('contentTitle')}
        <input value={title} onChange={(e) => setTitle(e.target.value)}
          style={{ display: 'block', width: '100%', marginBlockStart: '.35rem', font: 'inherit', fontSize: '.95rem', background: 'var(--surface-2)', color: 'var(--ink)', border: '1px solid var(--hair-light-strong)', borderRadius: 'var(--r)', padding: '.6rem .75rem' }} />
      </label>
      <label className="body" style={{ fontSize: '.85rem', color: 'var(--platinum-3)' }}>
        {t('contentExcerpt')}
        <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2}
          style={{ display: 'block', width: '100%', marginBlockStart: '.35rem', font: 'inherit', fontSize: '.9rem', background: 'var(--surface-2)', color: 'var(--ink)', border: '1px solid var(--hair-light-strong)', borderRadius: 'var(--r)', padding: '.6rem .75rem', resize: 'vertical' }} />
      </label>
      <label className="body" style={{ fontSize: '.85rem', color: 'var(--platinum-3)' }}>
        {t('contentBody')}
        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={10}
          style={{ display: 'block', width: '100%', marginBlockStart: '.35rem', font: 'inherit', fontSize: '.9rem', lineHeight: 1.7, background: 'var(--surface-2)', color: 'var(--ink)', border: '1px solid var(--hair-light-strong)', borderRadius: 'var(--r)', padding: '.75rem', resize: 'vertical' }} />
      </label>
      <div>
        <button type="button" className="btn btn-solid" disabled={pending || !title.trim()} onClick={create}>{t('contentCreate')}</button>
      </div>
    </div>
  );
}
