'use client';
import { useState, useRef, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser.js';
import { recordMatterFile, getFileSignedUrl, cleanupFailedMatterUpload } from '@/app/actions/matters.js';

function fmtSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** الصيغ المعتمَدة — للفلترة المبكّرة في الواجهة فقط. الخادم هو المرجع، وهذه ليست ضابطًا أمنيًا. */
const ACCEPT_ATTR = '.pdf,.docx,.xlsx,.jpg,.jpeg,.png,.heic,.heif';
/** خريطة امتداد ⇄ نوع مطابقة لقائمة الخادم — تُستخدَم للرفض المبكّر حين يعلن المتصفّح نوعًا. */
const ALLOWED_TYPES = {
  pdf: ['application/pdf'],
  docx: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  xlsx: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  jpg: ['image/jpeg'],
  jpeg: ['image/jpeg'],
  png: ['image/png'],
  heic: ['image/heic'],
  heif: ['image/heif'],
};
const ALLOWED_EXT = Object.keys(ALLOWED_TYPES);
const MAX_FILE_BYTES = 25 * 1024 * 1024;
const MAX_NAME = 120;

/**
 * تطبيع اسم الملف قبل بناء المسار — يجب أن يوافق ما يقبله الخادم.
 * تحسين سلامة وقابلية قراءة فقط؛ لا يُعتمَد عليه أمنيًا (الخادم يعيد التحقّق).
 */
function normalizeFileName(raw) {
  const dot = raw.lastIndexOf('.');
  const ext = dot > 0 ? raw.slice(dot + 1).toLowerCase() : '';
  let base = dot > 0 ? raw.slice(0, dot) : raw;
  base = base
    .normalize('NFC')
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001F\u007F]/g, '')      // محارف تحكّم
    .replace(/[/\\]/g, '')                       // فواصل مسارات — يمنع التعشيش
    .replace(/[^A-Za-z0-9\u0600-\u06FF._ -]/g, '') // إبقاء العربية واللاتينية وعلامات آمنة
    .replace(/\s+/g, ' ')                        // توحيد المسافات
    .trim()
    .replace(/^[.\s-]+|[.\s-]+$/g, '');          // نقاط/مسافات بادئة أو لاحقة
  if (!base) base = 'file';                       // منع الاسم الفارغ
  const room = MAX_NAME - (ext ? ext.length + 1 : 0);
  if (base.length > room) {
    // إعادة تنظيف بعد القصّ: القصّ قد يترك نقطة/مسافة/شرطة في النهاية فينتج اسمًا يرفضه الخادم
    base = base.slice(0, room).replace(/[.\s-]+$/, '').trim();
    if (!base) base = 'file';
  }
  return ext ? `${base}.${ext}` : base;
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

    // فحوصات مبكّرة لتجربة المستخدم فقط — رفض واضح قبل رفع لا طائل منه. الخادم يظل المرجع.
    const ext = file.name.includes('.') ? file.name.split('.').pop().toLowerCase() : '';
    const extOk = ALLOWED_EXT.includes(ext);
    const sizeOk = file.size > 0 && file.size <= MAX_FILE_BYTES;
    // النوع المُعلَن من المتصفّح: يُفحَص فقط إن وُجد. لا نفترض نوعًا عند غيابه — يحسم الخادم.
    const mimeOk = !file.type || (extOk && ALLOWED_TYPES[ext].includes(file.type.toLowerCase()));
    if (!extOk || !sizeOk || !mimeOk) {
      setError(t('matterUploadError'));
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    setUploading(true);
    setError('');
    try {
      const supabase = createSupabaseBrowserClient();
      const safeName = normalizeFileName(file.name);
      const path = `${matterId}/${crypto.randomUUID()}-${safeName}`;
      const { error: upErr } = await supabase.storage.from('matter-files').upload(path, file);
      if (upErr) { setError(t('matterUploadError')); setUploading(false); return; }
      // عقد مُصغَّر: الخادم يشتقّ الاسم والحجم والنوع من كائن Storage الفعلي.
      const res = await recordMatterFile({ matterId, storagePath: path });
      if (res?.error) {
        // F-07: الكائن مرفوع بالفعل والإنهاء فشل — نطلب تنظيفًا تعويضيًا لمسار واحد بالضبط.
        // لا إعادة رفع تلقائية إطلاقًا.
        const cu = await cleanupFailedMatterUpload({ matterId, storagePath: path });
        if (cu?.ok && cu.result === 'already_finalized') {
          // سباق: الإنهاء نجح فعلًا رغم ظنّ المتصفّح بالفشل. لم يُحذف شيء.
          // نبني الصف من القيم القانونية العائدة من الخادم حصرًا — لا safeName
          // ولا file.size ولا file.type ولا طابع زمني محلي (قاعدة المرحلة ١).
          if (cu.file) {
            setError('');
            setFiles((cur) => cur.some((f) => f.storage_path === cu.file.storagePath) ? cur : [{
              id: cu.file.id, file_name: cu.file.fileName, storage_path: cu.file.storagePath,
              file_size: cu.file.fileSize, mime_type: cu.file.mimeType,
              created_at: cu.file.createdAt, uploaded_by: currentUserId,
            }, ...cur]);
            setUploading(false);
            return;
          }
          // لم تصل القيم القانونية لسبب ما: لا نختلق بيانات — نعرض الخطأ الأصلي.
        }
        // نجح التنظيف أو فشل: نعرض في الحالتين خطأ الرفع الأصلي حتى لا يحجبه خطأ التنظيف.
        setError(t('matterUploadError'));
        setUploading(false);
        return;
      }
      setFiles((cur) => [{
        id: path, file_name: res.fileName, storage_path: path, file_size: res.fileSize,
        mime_type: res.mimeType, created_at: new Date().toISOString(), uploaded_by: currentUserId,
      }, ...cur]);
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
          <input ref={inputRef} type="file" accept={ACCEPT_ATTR} onChange={handleFile} disabled={uploading} style={{ display: 'none' }} />
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
