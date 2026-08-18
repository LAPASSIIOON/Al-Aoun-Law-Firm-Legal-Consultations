export const MEMBER_TYPE_LABELS = {
  lawyer: 'محامٍ',
  consultant: 'مستشار قانوني',
  law_firm: 'مكتب/هيئة محاماة',
  company: 'شركة',
  institution: 'جهة مؤسسية',
  client: 'عميل',
  individual: 'فرد',
  organization: 'جهة/مكتب',
};

export const MEMBER_TYPE_LABELS_EN = {
  lawyer: 'Lawyer',
  consultant: 'Legal consultant',
  law_firm: 'Law firm',
  company: 'Company',
  institution: 'Institution',
  client: 'Client',
  individual: 'Individual',
  organization: 'Organization',
};

/** @param {string} locale @param {string} type */
export function memberTypeLabel(locale, type) {
  const map = locale === 'en' ? MEMBER_TYPE_LABELS_EN : MEMBER_TYPE_LABELS;
  return map[type] || type;
}
