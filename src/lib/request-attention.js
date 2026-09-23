export const NEW_REQUEST_ATTENTION_MS = 24 * 60 * 60 * 1000;

export function needsNewRequestAttention(record, now = Date.now()) {
  if (record?.stage !== 'new' || !record.created_at) return false;
  const createdAt = Date.parse(record.created_at);
  return Number.isFinite(createdAt) && now - createdAt >= NEW_REQUEST_ATTENTION_MS;
}

export function withAttentionFlag(records, now = Date.now()) {
  return records
    .map((record) => ({ ...record, _needs_attention: needsNewRequestAttention(record, now) }))
    .sort((a, b) => {
      if (a._needs_attention !== b._needs_attention) return a._needs_attention ? -1 : 1;
      if (a._needs_attention) return Date.parse(a.created_at) - Date.parse(b.created_at);
      return 0;
    });
}
