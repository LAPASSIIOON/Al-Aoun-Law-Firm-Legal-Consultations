/** علامة المونوجرام الهندسية بشفافية منخفضة — لمسة هوية هادئة فوق صورة الهيرو، بطلب د. هيثم.
 *  تستخدم الآن ملف SVG متجهي حقيقي (مسارات حقيقية، لا صورة نقطية) — حدّة كاملة مهما كبر حجم العرض. */
export default function HeroMarkWatermark() {
  return (
    <img
      src="/brand/al-aoun-mark.svg"
      alt=""
      aria-hidden="true"
      style={{
        position: 'absolute',
        insetInlineEnd: '2%',
        top: '38%',
        inlineSize: '42%',
        maxInlineSize: '520px',
        blockSize: 'auto',
        opacity: 0.28,
        zIndex: 1,
        pointerEvents: 'none',
        userSelect: 'none',
        filter: 'brightness(0) invert(1)', // currentColor لا يعمل عبر <img> — نحوّل الأسود الافتراضي لأبيض نقي
      }}
    />
  );
}
