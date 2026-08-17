/** علامة مائية هادئة أسفل يسار البطل — شعار العون الكامل بشفافية منخفضة،
 * وخلفه حلقة قوس رفيعة (رسمها مستقل، لا جزء من ملف الشعار) تدور ببطء شديد
 * لا يُلاحَظ إلا بالتأمل — إحياءٌ هادئ لا تشتيت. مخفية على الشاشات الضيقة. */
export default function HeroWatermark() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute', insetInlineEnd: '2%', insetBlockEnd: '4%',
        width: 'min(30vw, 380px)', height: 'min(30vw, 380px)',
        pointerEvents: 'none', display: 'none',
      }}
      className="hero-watermark"
    >
      <img src="/brand/al-aoun-mark-duotone.png" alt="" style={{ position: 'absolute', inset: '10%', width: '80%', height: '80%', objectFit: 'contain', opacity: 0.3 }} />
    </div>
  );
}
