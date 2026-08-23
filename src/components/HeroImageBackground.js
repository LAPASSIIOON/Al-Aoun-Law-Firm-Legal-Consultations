import Image from 'next/image';

/** خلفية الهيرو — صورة ثابتة عالية الجودة لأبراج الكويت (بدل الفيديو منخفض الجودة). */
export default function HeroImageBackground() {
  return (
    <Image
      src="/kuwait/hero-glass-towers-v2.webp"
      alt=""
      aria-hidden="true"
      fill
      priority
      sizes="100vw"
      style={{ objectFit: 'cover' }}
    />
  );
}
