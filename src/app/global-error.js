'use client';

/**
 * الملاذ الأخير: يعمل فقط حين يفشل [locale]/layout.js نفسه، فلا وجود لـ<html> ولا
 * لمزوّد الترجمة ولا لأي CSS من التخطيط. لذلك يصيّر مستنده بنفسه، بأنماط سطرية
 * فقط، وبنصّ ثنائي اللغة مكتوب هنا مباشرة — لأن تحديد لغة الزائر غير متاح في هذه الحالة.
 */
export default function GlobalError({ error, reset }) {
  return (
    <html lang="ar" dir="rtl">
      <body style={{ margin: 0, background: '#0e1826', color: '#e8ecf1',
        fontFamily: 'system-ui, -apple-system, "Segoe UI", Tahoma, sans-serif',
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <main role="alert" style={{ maxWidth: '34rem', padding: '2rem 1.5rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 600, margin: '0 0 .75rem' }}>
            تعذّر تحميل الصفحة
          </h1>
          <p style={{ fontSize: '1rem', lineHeight: 1.8, opacity: .8, margin: '0 0 1.75rem' }}>
            حدث خلل تقني مؤقّت. أعد المحاولة، وإن تكرّر فتواصل معنا مباشرة.
          </p>
          <hr style={{ border: 0, borderTop: '1px solid rgba(255,255,255,.12)', margin: '0 0 1.75rem' }} />
          <h2 lang="en" dir="ltr" style={{ fontSize: '1.15rem', fontWeight: 600, margin: '0 0 .6rem' }}>
            This page could not be loaded
          </h2>
          <p lang="en" dir="ltr" style={{ fontSize: '.95rem', lineHeight: 1.7, opacity: .8, margin: '0 0 1.75rem' }}>
            A temporary technical fault occurred. Please try again, and contact us directly if it persists.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{ font: 'inherit', fontSize: '.95rem', color: '#e8ecf1', background: '#3f6d99',
              border: 0, borderRadius: '.4rem', padding: '.8rem 1.6rem', cursor: 'pointer' }}
          >
            إعادة المحاولة · Try again
          </button>
          {error?.digest && (
            <p dir="ltr" style={{ marginTop: '2rem', fontSize: '.75rem', opacity: .5, fontFamily: 'monospace' }}>
              {error.digest}
            </p>
          )}
        </main>
      </body>
    </html>
  );
}
