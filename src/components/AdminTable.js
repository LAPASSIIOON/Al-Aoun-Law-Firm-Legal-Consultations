'use client';
import { useState, useTransition, useMemo, Fragment } from 'react';
import { updateStage, updateNotes } from '@/app/actions/admin.js';
import styles from './AdminTable.module.css';

function toCsv(rows, columns) {
  const header = [...columns.map((c) => c.label), 'Stage', 'Notes'].join(',');
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = rows.map((r) => [...columns.map((c) => esc(r[c.key])), esc(r.stage), esc(r.internal_notes)].join(','));
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

/** @param {{ rows: any[], tableType: 'consultation'|'referral'|'partnership', stageOptions: string[], columns: {key:string,label:string}[], emptyLabel: string }} props */
export default function AdminTable({ rows, tableType, stageOptions, columns, emptyLabel }) {
  const [data, setData] = useState(rows);
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [openNotes, setOpenNotes] = useState(null);
  const [notesDraft, setNotesDraft] = useState('');
  const [savedFlash, setSavedFlash] = useState(null);

  function onStageChange(id, stage) {
    setData((cur) => cur.map((r) => (r.id === id ? { ...r, stage } : r)));
    startTransition(async () => { await updateStage({ table: tableType, id, stage }); });
  }

  function openNotesFor(row) {
    if (openNotes === row.id) { setOpenNotes(null); return; }
    setOpenNotes(row.id);
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
      if (!query.trim()) return true;
      const q = query.trim().toLowerCase();
      return columns.some((c) => String(r[c.key] ?? '').toLowerCase().includes(q))
        || String(r.internal_notes ?? '').toLowerCase().includes(q);
    });
  }, [data, query, stageFilter, columns]);

  if (!data.length) return <p className="body" style={{ color: 'var(--muted)' }}>{emptyLabel}</p>;

  return (
    <div>
      <div className={styles.toolbar}>
        <input
          type="text" className={styles.search} placeholder="بحث…"
          value={query} onChange={(e) => setQuery(e.target.value)}
        />
        <select className={styles.select} value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}>
          <option value="all">كل الحالات</option>
          {stageOptions.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className={styles.count}>{filtered.length} / {data.length}</span>
        <button type="button" className="btn-line" style={{ fontSize: '.82rem', marginInlineStart: 'auto' }}
          onClick={() => downloadCsv(toCsv(filtered, columns), `${tableType}-${new Date().toISOString().slice(0, 10)}.csv`)}>
          تصدير CSV ↓
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="body" style={{ color: 'var(--muted)', padding: '1rem 0' }}>لا نتائج مطابقة.</p>
      ) : (
        <div className={styles.wrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                {columns.map((c) => <th key={c.key}>{c.label}</th>)}
                <th>Stage</th>
                <th>ملاحظات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <Fragment key={r.id}>
                  <tr>
                    {columns.map((c) => <td key={c.key} data-label={c.label}>{String(r[c.key] ?? '—')}</td>)}
                    <td>
                      <select className={styles.select} value={r.stage} disabled={pending} onChange={(e) => onStageChange(r.id, e.target.value)}>
                        {stageOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td>
                      <button type="button" className={styles.notesBtn} onClick={() => openNotesFor(r)}>
                        {r.internal_notes ? 'عرض الملاحظة' : '+ إضافة ملاحظة'}
                      </button>
                    </td>
                  </tr>
                  {openNotes === r.id && (
                    <tr>
                      <td colSpan={columns.length + 2} className={styles.notesRow}>
                        <textarea
                          className={styles.notesArea} rows={3} value={notesDraft}
                          onChange={(e) => setNotesDraft(e.target.value)}
                          placeholder="ملاحظة داخلية — لن تظهر للعميل أبدًا…"
                        />
                        <div style={{ display: 'flex', gap: '.6rem', alignItems: 'center', marginBlockStart: '.5rem' }}>
                          <button type="button" className="btn btn-solid" style={{ fontSize: '.82rem' }} disabled={pending} onClick={() => saveNotes(r.id)}>
                            حفظ الملاحظة
                          </button>
                          {savedFlash === r.id && <span className={styles.savedFlash}>تم الحفظ ✓</span>}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
