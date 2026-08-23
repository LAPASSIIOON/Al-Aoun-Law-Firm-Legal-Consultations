import Image from 'next/image';

/** خلفية الهيرو — صورة ثابتة عالية الجودة لأبراج الكويت (بدل الفيديو منخفض الجودة)، بحركة بطيئة واحدة. */
export default function HeroImageBackground() {
  return (
    <div className="hero-slow-zoom" style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <Image
        src="/kuwait/hero-glass-towers-v2.webp"
        alt=""
        aria-hidden="true"
        fill
        priority
        sizes="100vw"
        style={{ objectFit: 'cover' }}
      />
    </div>
  );
}
