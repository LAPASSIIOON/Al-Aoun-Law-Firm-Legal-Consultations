// A customer's status view must never carry staff notes or operational metadata.
const FIELDS = {
  consultations: ['id', 'reference', 'stage', 'created_at', 'email'],
  referrals: ['id', 'reference', 'stage', 'created_at', 'referring_firm_name'],
  partnerships: ['id', 'reference', 'stage', 'created_at', 'email'],
};

/** @param {string} type @param {unknown} rows */
export function customerRequests(type, rows) {
  const fields = Object.hasOwn(FIELDS, type) ? FIELDS[type] : null;
  if (!fields || !Array.isArray(rows)) return [];
  return rows
    .filter((row) => row !== null && typeof row === 'object' && !Array.isArray(row))
    .map((row) => Object.fromEntries(
      fields.filter((field) => Object.hasOwn(row, field)).map((field) => [field, row[field]])
    ));
}
