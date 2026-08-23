import Image from 'next/image';

/** خلفية صورة حقيقية لرأس صفحة داخلية + طبقة تعتيم لوضوح النص فوقها. */
export default function PageHeroImage({ src, position = 'center' }) {
  return (
    <>
      <Image
        src={src}
        alt=""
        aria-hidden="true"
        fill
        sizes="100vw"
        style={{ objectFit: 'cover', objectPosition: position }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(9,14,22,.88) 0%, rgba(9,14,22,.72) 55%, rgba(9,14,22,.55) 100%)',
        }}
      />
    </>
  );
}
