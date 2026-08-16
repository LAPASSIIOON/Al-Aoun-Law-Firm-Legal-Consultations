'use client';
import { useState, useTransition } from 'react';
import { updateStage } from '@/app/actions/admin.js';
import styles from './AdminTable.module.css';

/** @param {{ rows: any[], tableType: 'consultation'|'referral'|'partnership', stageOptions: string[], columns: {key:string,label:string}[], emptyLabel: string }} props */
export default function AdminTable({ rows, tableType, stageOptions, columns, emptyLabel }) {
  const [data, setData] = useState(rows);
  const [pending, startTransition] = useTransition();

  function onStageChange(id, stage) {
    setData((cur) => cur.map((r) => (r.id === id ? { ...r, stage } : r)));
    startTransition(async () => { await updateStage({ table: tableType, id, stage }); });
  }

  if (!data.length) return <p className="body" style={{ color: 'var(--muted)' }}>{emptyLabel}</p>;

  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((c) => <th key={c.key}>{c.label}</th>)}
            <th>Stage</th>
          </tr>
        </thead>
        <tbody>
          {data.map((r) => (
            <tr key={r.id}>
              {columns.map((c) => <td key={c.key} data-label={c.label}>{String(r[c.key] ?? '—')}</td>)}
              <td>
                <select className={styles.select} value={r.stage} disabled={pending} onChange={(e) => onStageChange(r.id, e.target.value)}>
                  {stageOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
