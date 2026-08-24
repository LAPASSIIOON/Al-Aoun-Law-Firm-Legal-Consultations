/** خريطة شبكية — الكويت مركزًا متّصلًا بالولايات القضائية الحقيقية الإحدى عشرة.
 *  تُعيد استخدام نمط رسم الخطوط الحالي في الموقع (align-mark) حرفيًا لضمان الانسجام. */
export default function JurisdictionsNetwork({ jurisdictions, hubLabel, locale }) {
  const size = 600;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 225;
  const n = jurisdictions.length;
  const spokeLen = radius; // كل الأشعّة بنفس الطول (دائرة مثالية) — طول واحد لكل الخطوط

  const points = jurisdictions.map((name, i) => {
    // نبدأ من الأعلى (-90°) ونوزّع بالتساوي، نتجنّب التداخل مع تسمية المركز
    const angle = (-90 + (360 / n) * i) * (Math.PI / 180);
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    // موضع النص حسب زاوية العقدة — يمين/يسار/فوق/تحت لتفادي التراكب
    const deg = (angle * 180) / Math.PI;
    let anchor = 'middle', dx = 0, dy = -16;
    if (deg > -60 && deg < 60) { anchor = locale === 'ar' ? 'end' : 'start'; dx = deg > 0 ? 16 : 16; dy = 4; }
    else if (deg > 120 || deg < -120) { anchor = locale === 'ar' ? 'start' : 'end'; dx = -16; dy = 4; }
    else if (deg >= 60 && deg <= 120) { dy = 24; }
    return { name, x, y, anchor, dx, dy, delay: i * 0.06 };
  });

  return (
    <div data-reveal style={{ maxWidth: '620px', margin: '0 auto' }}>
      <svg className="align-mark" viewBox={`0 0 ${size} ${size}`} width="100%" height="auto" role="img" aria-label={hubLabel}>
        {points.map((p, i) => (
          <line
            key={`line-${i}`}
            x1={cx} y1={cy} x2={p.x} y2={p.y}
            style={{ '--am-len': spokeLen, transitionDelay: `${0.1 + p.delay}s` }}
          />
        ))}
        {points.map((p, i) => (
          <g key={`node-${i}`} className="jn-node" style={{ transitionDelay: `${0.35 + p.delay}s` }}>
            <circle cx={p.x} cy={p.y} r="6" fill="var(--surface)" stroke="var(--clay-bright)" strokeWidth="1.6" />
            <text x={p.x + p.dx} y={p.y + p.dy} textAnchor={p.anchor} className="jn-label">{p.name}</text>
          </g>
        ))}
        <circle cx={cx} cy={cy} r="15" fill="var(--clay-bright)" />
        <circle cx={cx} cy={cy} r="15" fill="none" stroke="var(--clay-bright)" strokeWidth="1.6" opacity="0.4">
          <animate attributeName="r" values="15;30;15" dur="3.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.4;0;0.4" dur="3.5s" repeatCount="indefinite" />
        </circle>
        <text x={cx} y={cy + 34} textAnchor="middle" className="jn-hub-label">{hubLabel}</text>
      </svg>
    </div>
  );
}
