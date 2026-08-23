/** علامة المونوجرام الهندسية بشفافية منخفضة — لمسة هوية هادئة فوق صورة الهيرو، بطلب د. هيثم. */
export default function HeroMarkWatermark() {
  return (
    <img
      src="/brand/mark-watermark.png"
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
      }}
    />
  );
}
