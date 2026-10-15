export const WHATSAPP_NUMBER = '96599010470';

export function whatsappHref(locale) {
  const text = locale === 'ar'
    ? 'مرحبًا، أودّ الاستفسار عن استشارة قانونية مع مجموعة العون.'
    : "Hello, I'd like to inquire about a legal consultation with Al Oun.";

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}
