'use client';
import { useState, useTransition, useMemo, Fragment } from 'react';
import { useTranslations } from 'next-intl';
import { updateStage, updateNotes } from '@/app/actions/admin.js';
import styles from './AdminTable.module.css';

function toCsv(rows, columns, stageLabel, cellValue) {
  const header = [...columns.map((c) => c.label), 'Stage', 'Notes'].join(',');
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = rows.map((r) => [...columns.map((c) => esc(cellValue(r, c))), esc(stageLabel(r.stage)), esc(r.internal_notes)].join(','));
  return [header, ...lines].join('\r\n');
}

function downloadCsv(text, filename) {
  const blob = new Blob(['\uFEFF' + text], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Server Components cannot pass functions as props to Client Components (Next.js RSC constraint) —
 * detailConfig/lookups are plain serializable data; this component interprets them at render time.
 * @param {{
 *   rows: any[], tableType: 'consultation'|'referral'|'partnership', stageOptions: string[],
 *   columns: {key:string,label:string}[], emptyLabel: string,
 *   detailConfig?: {titleKey:string, fields:{labelKey:string, key:string, dir?:string, translatePrefix?:string, lookup?:string, isArray?:boolean}[]}[],
 *   lookups?: Record<string, Record<string,string>>
 * }} props
 */
export default function AdminTable({ rows, tableType, stageOptions, columns, emptyLabel, detailConfig, lookups }) {
  const t = useTranslations('admin');
  const [data, setData] = useState(rows);
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [openRow, setOpenRow] = useState(null);
  const [notesDraft, setNotesDraft] = useState('');
  const [savedFlash, setSavedFlash] = useState(null);

  // تسمية بشرية لأي قيمة حالة خام؛ رجوع آمن للقيمة الخام نفسها لو ظهرت حالة جديدة لم تُترجَم بعد — لا يكسر الواجهة أبدًا.
  const stageLabel = (s) => (t.has(`stage_${s}`) ? t(`stage_${s}`) : s);

  // يحوّل قيمة حقل خام إلى نص عرض نهائي حسب وصف الحقل (ترجمة مباشرة، أو بحث في lookup، أو مصفوفة مفصولة بفواصل).
  function resolveFieldValue(row, field) {
    const raw = row[field.key];
    if (field.isArray) return Array.isArray(raw) ? raw.map((v) => (field.lookup ? lookups?.[field.lookup]?.[v] || v : v)).join(', ') : null;
    if (raw == null || raw === '') return null;
    if (field.lookup) return lookups?.[field.lookup]?.[raw] || null;
    if (field.translatePrefix) return t.has(`${field.translatePrefix}_${raw}`) ? t(`${field.translatePrefix}_${raw}`) : raw;
    return String(raw);
  }

  // قيمة خلية العمود المختصر: تترجم قيم enum عبر translatePrefix، أو تعرض حقلًا بديلًا منسّقًا مسبقًا عبر displayKey (مثل التاريخ المنسَّق من الخادم).
  function cellValue(row, col) {
    if (col.displayKey && row[col.displayKey] != null) return row[col.displayKey];
    const raw = row[col.key];
    if (raw == null || raw === '') return '—';
    if (col.translatePrefix && t.has(`${col.translatePrefix}_${raw}`)) return t(`${col.translatePrefix}_${raw}`);
    return String(raw);
  }

  function onStageChange(id, stage) {
    setData((cur) => cur.map((r) => (r.id === id ? { ...r, stage } : r)));
    startTransition(async () => { await updateStage({ table: tableType, id, stage }); });
  }

  function toggleRow(row) {
    if (openRow === row.id) { setOpenRow(null); return; }
    setOpenRow(row.id);
    setNotesDraft(row.internal_notes || '');
  }

  function saveNotes(id) {
    setData((cur) => cur.map((r) => (r.id === id ? { ...r, internal_notes: notesDraft } : r)));
    startTransition(async () => {
      await updateNotes({ table: tableType, id, notes: notesDraft });
      setSavedFlash(id);
      setTimeout(() => setSavedFlash((f) => (f === id ? null : f)), 1800);
    });
  }

  const filtered = useMemo(() => {
    return data.filter((r) => {
      if (stageFilter !== 'all' && r.stage !== stageFilter) return false;
      if (dateFrom && r.created_at && r.created_at.slice(0, 10) < dateFrom) return false;
      if (dateTo && r.created_at && r.created_at.slice(0, 10) > dateTo) return false;
      if (!query.trim()) return true;
      const q = query.trim().toLowerCase();
      return columns.some((c) => String(r[c.key] ?? '').toLowerCase().includes(q))
        || String(r.internal_notes ?? '').toLowerCase().includes(q);
    });
  }, [data, query, stageFilter, dateFrom, dateTo, columns]);

  if (!data.length) return <p className="body" style={{ color: 'var(--muted)' }}>{emptyLabel}</p>;

  return (
    <div>
      <div className={styles.toolbar}>
        <input
          type="text" className={styles.search} placeholder={t('tableSearchPlaceholder')}
          value={query} onChange={(e) => setQuery(e.target.value)}
        />
        <select className={styles.select} value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}>
          <option value="all">{t('tableAllStages')}</option>
          {stageOptions.map((s) => <option key={s} value={s}>{stageLabel(s)}</option>)}
        </select>
        <input type="date" className={styles.select} value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} aria-label={t('tableDateFrom')} title={t('tableDateFrom')} />
        <input type="date" className={styles.select} value={dateTo} onChange={(e) => setDateTo(e.target.value)} aria-label={t('tableDateTo')} title={t('tableDateTo')} />
        {(dateFrom || dateTo) && (
          <button type="button" className={styles.notesBtn} onClick={() => { setDateFrom(''); setDateTo(''); }}>{t('tableClearDates')}</button>
        )}
        <span className={styles.count}>{filtered.length} / {data.length}</span>
        <button type="button" className="btn-line" style={{ fontSize: '.82rem', marginInlineStart: 'auto' }}
          onClick={() => downloadCsv(toCsv(filtered, columns, stageLabel, cellValue), `${tableType}-${new Date().toISOString().slice(0, 10)}.csv`)}>
          {t('tableExportCsv')}
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="body" style={{ color: 'var(--muted)', padding: '1rem 0' }}>{t('tableNoResults')}</p>
      ) : (
        <div className={styles.wrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                {columns.map((c) => <th key={c.key}>{c.label}</th>)}
                <th>{t('tableColStage')}</th>
                <th>{t('detailNotesHeading')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const isOpen = openRow === r.id;
                return (
                  <Fragment key={r.id}>
                    <tr className={styles.rowClickable} onClick={() => toggleRow(r)}>
                      {columns.map((c) => <td key={c.key} data-label={c.label}>{cellValue(r, c)}</td>)}
                      <td data-label={t('tableColStage')} onClick={(e) => e.stopPropagation()}>
                        <select className={styles.select} value={r.stage} disabled={pending} onChange={(e) => onStageChange(r.id, e.target.value)}>
                          {stageOptions.map((s) => <option key={s} value={s}>{stageLabel(s)}</option>)}
                        </select>
                      </td>
                      <td data-label={t('detailNotesHeading')}>
                        <button type="button" className={styles.notesBtn} onClick={(e) => { e.stopPropagation(); toggleRow(r); }}>
                          {isOpen ? t('hideDetails') : t('viewDetails')}
                        </button>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr>
                        <td colSpan={columns.length + 2} className={styles.detailRow}>
                          <div className={styles.detailGrid}>
                            {(detailConfig || []).map((sec) => (
                              <div key={sec.titleKey} className={styles.detailSection}>
                                <h4 className={styles.detailSectionTitle}>{t(sec.titleKey)}</h4>
                                {sec.fields.map((field) => (
                                  <div key={field.labelKey} className={styles.detailItem}>
                                    <span className={styles.detailLabel}>{t(field.labelKey)}</span>
                                    <span className={styles.detailValue} dir={field.dir}>{resolveFieldValue(r, field) || t('notProvided')}</span>
                                  </div>
                                ))}
                              </div>
                            ))}
                            <div className={styles.detailSection}>
                              <h4 className={styles.detailSectionTitle}>{t('detailNotesHeading')}</h4>
                              <textarea
                                className={styles.notesArea} rows={3} value={notesDraft}
                                onChange={(e) => setNotesDraft(e.target.value)}
                                placeholder={t('tableNotePlaceholder')}
                              />
                              <div style={{ display: 'flex', gap: '.6rem', alignItems: 'center', marginBlockStart: '.5rem' }}>
                                <button type="button" className="btn btn-solid" style={{ fontSize: '.82rem' }} disabled={pending} onClick={() => saveNotes(r.id)}>
                                  {t('tableSaveNote')}
                                </button>
                                {savedFlash === r.id && <span className={styles.savedFlash}>{t('tableSaved')}</span>}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
