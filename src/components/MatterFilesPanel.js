'use client';
import { useState, useRef, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser.js';
import { recordMatterFile, getFileSignedUrl } from '@/app/actions/matters.js';

function fmtSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** @param {{ matterId: string, files: any[], currentUserId: string|null, clientId: string }} props */
export default function MatterFilesPanel({ matterId, files: initialFiles, currentUserId, clientId }) {
  const t = useTranslations('admin');
  const [files, setFiles] = useState(initialFiles);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();
  const inputRef = useRef(null);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const supabase = createSupabaseBrowserClient();
      const path = `${matterId}/${crypto.randomUUID()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from('matter-files').upload(path, file);
      if (upErr) { setError(t('matterUploadError')); setUploading(false); return; }
      const res = await recordMatterFile({ matterId, fileName: file.name, storagePath: path, fileSize: file.size, mimeType: file.type });
      if (res?.error) { setError(t('matterUploadError')); setUploading(false); return; }
      setFiles((cur) => [{ id: path, file_name: file.name, storage_path: path, file_size: file.size, mime_type: file.type, created_at: new Date().toISOString(), uploaded_by: currentUserId }, ...cur]);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function download(storagePath) {
    startTransition(async () => {
      const url = await getFileSignedUrl(storagePath);
      if (url) window.open(url, '_blank', 'noopener,noreferrer');
    });
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBlockEnd: '1rem' }}>
        <h2 className="display d-3" style={{ margin: 0 }}>{t('matterFilesHeading')}</h2>
        <label className="btn btn-solid" style={{ fontSize: '.85rem', cursor: 'pointer' }}>
          {uploading ? t('matterUploading') : t('matterUploadFile')}
          <input ref={inputRef} type="file" onChange={handleFile} disabled={uploading} style={{ display: 'none' }} />
        </label>
      </div>
      {error && <p style={{ color: '#B42722', fontSize: '.85rem', marginBlockEnd: '.75rem' }}>{error}</p>}

      {files.length === 0 ? (
        <p className="body" style={{ color: 'var(--muted)' }}>{t('matterNoFiles')}</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
          {files.map((f) => {
            const fromClient = f.uploaded_by === clientId;
            return (
              <div key={f.id} style={{
                display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '.75rem 1rem',
                padding: '.85rem 1rem', borderRadius: 'var(--r)', boxShadow: 'inset 0 0 0 1px var(--hair-light-strong)',
              }}>
                <span className="body" style={{ color: 'var(--ink)', fontWeight: 600, fontSize: '.9rem', flex: '1 1 200px', minWidth: 0, wordBreak: 'break-word' }}>{f.file_name}</span>
                <span style={{ fontSize: '.75rem', color: fromClient ? '#A0630D' : '#1D6A90' }}>
                  {fromClient ? t('matterFileFromClient') : t('matterFileFromFirm')}
                </span>
                <span style={{ fontSize: '.78rem', color: 'var(--muted)' }}>{fmtSize(f.file_size)}</span>
                <button type="button" className="btn-line" disabled={pending} onClick={() => download(f.storage_path)} style={{ fontSize: '.82rem' }}>
                  {t('matterDownload')}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
