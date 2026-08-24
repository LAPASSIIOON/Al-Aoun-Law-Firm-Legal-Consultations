'use client';
import { useState } from 'react';

const PrintIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-2M6 14h12v7H6z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
  </svg>
);
const ShareIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="18" cy="5" r="2.6" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="6" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="18" cy="19" r="2.6" stroke="currentColor" strokeWidth="1.6" />
    <path d="M8.3 10.6 15.7 6.4M8.3 13.4l7.4 4.2" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

/** أيقونتا طباعة/مشاركة حقيقيتان — الطباعة تشمل "حفظ كـPDF" عبر مربّع حوار الطباعة الأصلي بالمتصفح، بلا خط أنابيب PDF مصطنَع. */
export default function PageUtilityIcons({ title, locale }) {
  const [copied, setCopied] = useState(false);

  async function onShare() {
    const shareData = { title, url: window.location.href };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (e) { /* المستخدم ألغى — لا حاجة لفعل شيء */ }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (e) { /* تجاهل بصمت */ }
    }
  }

  const label = { print: locale === 'ar' ? 'طباعة' : 'Print', share: locale === 'ar' ? 'مشاركة' : 'Share', copied: locale === 'ar' ? 'تم النسخ' : 'Copied' };

  return (
    <div className="no-print" style={{ display: 'flex', gap: '.6rem', marginBlockStart: '1.5rem' }}>
      <button
        type="button"
        onClick={() => window.print()}
        aria-label={label.print}
        style={{ display: 'flex', alignItems: 'center', gap: '.4rem', padding: '.5rem .9rem', borderRadius: '999px', boxShadow: 'inset 0 0 0 1px var(--hair-dark-strong)', background: 'transparent', color: 'inherit', fontSize: '.82rem', cursor: 'pointer' }}
      >
        <PrintIcon /> {label.print}
      </button>
      <button
        type="button"
        onClick={onShare}
        aria-label={label.share}
        style={{ display: 'flex', alignItems: 'center', gap: '.4rem', padding: '.5rem .9rem', borderRadius: '999px', boxShadow: 'inset 0 0 0 1px var(--hair-dark-strong)', background: 'transparent', color: 'inherit', fontSize: '.82rem', cursor: 'pointer' }}
      >
        <ShareIcon /> {copied ? label.copied : label.share}
      </button>
    </div>
  );
}
