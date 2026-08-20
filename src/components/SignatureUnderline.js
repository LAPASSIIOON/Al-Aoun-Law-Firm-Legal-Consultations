/** علامة محاذاة مستقيمة ترسم نفسها أسفل العناوين المحورية عند ظهورها لأول مرة —
 *  بديل قوس التوقيع القديم (كان صدى لقوس اللوجو، قرار معتمَد بإيقافه): خط دقيق واحد،
 *  ينتمي للغة السجل المرجعي (خطوط الدليل والعلامات) لا لهندسة اللوجو. */
export default function SignatureUnderline({ width = 84 }) {
  return (
    <svg className="align-mark" width={width} height="6" viewBox={`0 0 ${width} 6`} aria-hidden="true" style={{ '--am-len': width - 4 }}>
      <line x1="2" y1="3" x2={width - 2} y2="3" />
    </svg>
  );
}
