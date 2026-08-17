/** علامة مائية هادئة أسفل يسار البطل — شعار العون الكامل بشفافية منخفضة،
 * وخلفه حلقة قوس رفيعة (رسمها مستقل، لا جزء من ملف الشعار) تدور ببطء شديد
 * لا يُلاحَظ إلا بالتأمل — إحياءٌ هادئ لا تشتيت. مخفية على الشاشات الضيقة. */
export default function HeroWatermark() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute', insetInlineEnd: '2%', insetBlockEnd: '3%',
        width: 'min(34vw, 460px)', height: 'min(34vw, 460px)',
        pointerEvents: 'none', display: 'none',
      }}
      className="hero-watermark"
    >
      <img src="/brand/al-aoun-logo-white.png" alt="" style={{ position: 'absolute', inset: '8%', width: '84%', height: '84%', objectFit: 'contain', opacity: 0.55 }} />
    </div>
  );
}
