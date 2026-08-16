'use client';
import { useState, useTransition } from 'react';
import { setMemberRole } from '@/app/actions/admin.js';
import styles from './AdminTable.module.css';

const ROLES = ['member', 'admin'];

/** @param {{ rows: any[], emptyLabel: string }} props */
export default function MembersTable({ rows, emptyLabel }) {
  const [data, setData] = useState(rows);
  const [pending, startTransition] = useTransition();

  function onChange(id, patch) {
    setData((cur) => cur.map((m) => (m.id === id ? { ...m, ...patch } : m)));
    const row = data.find((m) => m.id === id);
    const next = { ...row, ...patch };
    startTransition(async () => { await setMemberRole({ memberId: id, role: next.role, isActive: next.is_active }); });
  }

  if (!data.length) return <p className="body" style={{ color: 'var(--muted)' }}>{emptyLabel}</p>;

  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr><th>Name</th><th>Email</th><th>Type</th><th>Role</th><th>Active</th></tr>
        </thead>
        <tbody>
          {data.map((m) => (
            <tr key={m.id}>
              <td>{m.display_name}</td>
              <td dir="ltr">{m.email}</td>
              <td>{m.member_type}</td>
              <td>
                <select className={styles.select} value={m.role} disabled={pending} onChange={(e) => onChange(m.id, { role: e.target.value })}>
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </td>
              <td>
                <input type="checkbox" checked={m.is_active} disabled={pending} onChange={(e) => onChange(m.id, { is_active: e.target.checked })} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
