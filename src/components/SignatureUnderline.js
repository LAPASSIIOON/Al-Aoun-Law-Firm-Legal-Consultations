/** خطٌّ يرسم نفسه أسفل العنوان عند ظهوره لأول مرة — امتداد بصري لقوس شعار العون.
 * عنصر بلا حالة، يعتمد كليًا على data-reveal الأب (لا JS إضافي). */
export default function SignatureUnderline({ width = 84 }) {
  return (
    <svg className="sig-underline" width={width} height="14" viewBox={`0 0 ${width} 14`} aria-hidden="true">
      <path d={`M2 8 Q ${width / 2} 14 ${width - 2} 6`} fill="none" stroke="var(--clay-bright)" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
