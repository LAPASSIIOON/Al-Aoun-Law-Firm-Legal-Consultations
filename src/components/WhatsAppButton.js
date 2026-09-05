/**
 * زر واتساب العائم — «الختم الهادئ» (تمريرة العناصر العائمة).
 *
 * في السكون ينتمي للنظام المؤسسي (سطح كحلي مرتفع + رمز بلاتيني + حلقة شعرية —
 * نفس لغة زر التمرير لأعلى)، وعند نيّة المستخدم (تحويم/تركيز/ضغط) يمتلئ بأخضر
 * واتساب الرسمي — هذا هو الاستخدام الوحيد المعتمد للأخضر #25D366 في الموقع كله،
 * استثناءٌ مقصود خارج نظام التوكِنز لأنه لون علامة طرف ثالث لا لون هويتنا.
 *
 * مكوّن خادم الآن: حالات التفاعل CSS خالصة (hover/focus-visible/active) بلا أي
 * JS للعميل — ما يضيف تلقائيًا حالة لوحة المفاتيح وتغذيةً راجعة للمس كانتا غائبتين.
 * لا نبض، لا ارتداد، لا شارات. الموضع والمقاس ٥٠×٥٠ والسلوك كما هما، مع دعم
 * المنطقة الآمنة: env(safe-area-inset-bottom) يُضاف للإزاحة السفلية على الآيفون.
 */
export default function WhatsAppButton({ locale }) {
  const text = locale === 'ar'
    ? 'مرحبًا، أودّ الاستفسار عن استشارة قانونية مع مجموعة العون.'
    : "Hello, I'd like to inquire about a legal consultation with Al Oun.";
  const href = `https://wa.me/96599010470?text=${encodeURIComponent(text)}`;
  return (
    <>
      <style>{`
        .waQuietSeal{position:fixed;inset-block-end:calc(5.5rem + env(safe-area-inset-bottom, 0px));
          inset-inline-end:1.25rem;z-index:60;inline-size:50px;block-size:50px;border-radius:50%;
          background:var(--surface-2);color:var(--platinum);
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 6px 18px rgba(0,0,0,.35), inset 0 0 0 1px var(--hair-dark-strong);
          transition:background .2s var(--ease),color .2s var(--ease),transform .2s var(--ease)}
        .waQuietSeal:hover,.waQuietSeal:focus-visible,.waQuietSeal:active{
          background:#25D366;color:#fff}
        .waQuietSeal:hover,.waQuietSeal:focus-visible{transform:scale(1.08)}
        .waQuietSeal:active{transform:scale(1)}
        @media (prefers-reduced-motion:reduce){
          .waQuietSeal{transition:none}
          .waQuietSeal:hover,.waQuietSeal:focus-visible{transform:none}
        }
      `}</style>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={locale === 'ar' ? 'تواصل عبر واتساب' : 'Chat on WhatsApp'}
        className="no-print waQuietSeal"
      >
        <svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <path fill="currentColor" d="M16.02 3C9.4 3 4 8.36 4 15c0 2.35.63 4.55 1.72 6.45L4 29l7.73-1.68A11.9 11.9 0 0 0 16.02 27C22.64 27 28 21.64 28 15S22.64 3 16.02 3Z" opacity="0"/>
          <path fill="currentColor" d="M23.47 19.15c-.32-.16-1.9-.94-2.2-1.04-.3-.11-.51-.16-.73.16-.22.32-.84 1.04-1.03 1.25-.19.22-.38.24-.7.08-.32-.16-1.35-.5-2.57-1.58-.95-.85-1.59-1.9-1.78-2.22-.19-.32-.02-.49.14-.65.14-.14.32-.38.48-.57.16-.19.21-.32.32-.54.11-.22.05-.41-.03-.57-.08-.16-.73-1.76-1-2.41-.26-.63-.53-.54-.73-.55-.19-.01-.41-.01-.63-.01-.22 0-.57.08-.87.41-.3.32-1.14 1.12-1.14 2.72 0 1.6 1.17 3.15 1.33 3.37.16.22 2.29 3.5 5.55 4.91.78.34 1.38.54 1.85.69.78.25 1.48.21 2.04.13.62-.09 1.9-.78 2.17-1.53.27-.75.27-1.4.19-1.53-.08-.13-.29-.21-.61-.37Z"/>
          <path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="M16 27.5c-2.05 0-4-.55-5.68-1.5L5 27.5l1.53-5.14A11.44 11.44 0 0 1 4.5 15.5C4.5 8.87 9.87 3.5 16.5 3.5S28.5 8.87 28.5 15.5 23.13 27.5 16.5 27.5c-.17 0-.34 0-.5-.01v.01Zm.5-1.5c5.8 0 10.5-4.7 10.5-10.5S22.3 5 16.5 5 6 9.7 6 15.5c0 2.02.57 3.9 1.56 5.5l.24.39-.9 3.02 3.1-.85.38.22a10.44 10.44 0 0 0 5.62 1.62Z"/>
        </svg>
      </a>
    </>
  );
}
