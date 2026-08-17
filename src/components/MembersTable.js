'use client';
import { useState, useTransition } from 'react';
import { setMemberRole } from '@/app/actions/admin.js';
import styles from './AdminTable.module.css';

const TYPE_LABELS = {
  lawyer: 'محامٍ', consultant: 'مستشار قانوني', law_firm: 'مكتب/هيئة محاماة',
  company: 'شركة', institution: 'جهة مؤسسية', client: 'عميل',
  individual: 'فرد', organization: 'جهة/مكتب',
};

/** @param {{ rows: any[], emptyLabel: string }} props */
export default function MembersTable({ rows, emptyLabel }) {
  const [data, setData] = useState(rows);
  const [confirmId, setConfirmId] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [pending, startTransition] = useTransition();

  const activeAdminCount = data.filter((m) => m.role === 'admin' && m.is_active).length;

  function apply(id, patch) {
    setData((cur) => cur.map((m) => (m.id === id ? { ...m, ...patch } : m)));
    startTransition(async () => {
      const row = data.find((m) => m.id === id);
      const next = { ...row, ...patch };
      await setMemberRole({ memberId: id, role: next.role, isActive: next.is_active });
    });
    setConfirmId(null); setConfirmAction(null);
  }

  function ask(id, action) { setConfirmId(id); setConfirmAction(action); }
  function cancel() { setConfirmId(null); setConfirmAction(null); }

  if (!data.length) return <p className="body" style={{ color: 'var(--muted)' }}>{emptyLabel}</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '.9rem' }}>
      {data.map((m) => {
        const isAdmin = m.role === 'admin';
        const isLastAdmin = isAdmin && m.is_active && activeAdminCount <= 1;
        const isConfirming = confirmId === m.id;

        return (
          <div key={m.id} style={{
            border: '1px solid var(--hair-light-strong)', borderRadius: 'var(--r-lg)',
            padding: '1.1rem 1.3rem', background: m.is_active ? 'transparent' : 'rgba(180,39,34,.06)',
            display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem', justifyContent: 'space-between',
          }}>
            <div style={{ minWidth: '220px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginBlockEnd: '.25rem' }}>
                <strong style={{ fontFamily: 'var(--f-display)' }}>{m.display_name}</strong>
                {isAdmin && <span style={{ fontSize: '.72rem', fontWeight: 700, color: '#8D4A07', background: '#FCF1DE', padding: '.15rem .55rem', borderRadius: '999px' }}>Admin</span>}
                {!m.is_active && <span style={{ fontSize: '.72rem', fontWeight: 700, color: '#A7201B', background: '#FBEAE9', padding: '.15rem .55rem', borderRadius: '999px' }}>معطَّل</span>}
              </div>
              <div className="body" style={{ fontSize: '.85rem', color: 'var(--muted)' }} dir="ltr">{m.email}</div>
              <div className="body" style={{ fontSize: '.85rem', color: 'var(--muted)' }}>{TYPE_LABELS[m.member_type] || m.member_type}</div>
              {m.phone && <div className="body" style={{ fontSize: '.85rem', color: 'var(--muted)' }} dir="ltr">{m.phone}</div>}
              {m.organization_name && <div className="body" style={{ fontSize: '.85rem', color: 'var(--muted)' }}>{m.organization_name}</div>}
              {m.license_number && <div className="body" style={{ fontSize: '.85rem', color: 'var(--muted)' }} dir="ltr">{m.license_number}</div>}
            </div>

            {isConfirming ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', flexWrap: 'wrap' }}>
                <span className="body" style={{ fontSize: '.85rem' }}>
                  {confirmAction === 'grant' && `تأكيد منح "${m.display_name}" صلاحية المشرف؟`}
                  {confirmAction === 'revoke' && `تأكيد سحب صلاحية المشرف من "${m.display_name}"؟`}
                  {confirmAction === 'deactivate' && `تأكيد تعطيل حساب "${m.display_name}"؟`}
                  {confirmAction === 'activate' && `تأكيد إعادة تفعيل حساب "${m.display_name}"؟`}
                </span>
                <button className="btn btn-solid" style={{ padding: '.4rem .9rem', fontSize: '.85rem' }} disabled={pending}
                  onClick={() => {
                    if (confirmAction === 'grant') apply(m.id, { role: 'admin' });
                    if (confirmAction === 'revoke') apply(m.id, { role: 'member' });
                    if (confirmAction === 'deactivate') apply(m.id, { is_active: false });
                    if (confirmAction === 'activate') apply(m.id, { is_active: true });
                  }}>تأكيد</button>
                <button className="btn-line" style={{ padding: '.4rem .9rem', fontSize: '.85rem' }} onClick={cancel}>إلغاء</button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap' }}>
                {!isAdmin && m.is_active && (
                  <button className="btn btn-solid" style={{ padding: '.5rem 1rem', fontSize: '.85rem' }} onClick={() => ask(m.id, 'grant')}>منح صلاحية المشرف</button>
                )}
                {isAdmin && (
                  <button className="btn-line" style={{ padding: '.5rem 1rem', fontSize: '.85rem' }}
                    disabled={isLastAdmin} title={isLastAdmin ? 'لا يمكن سحب صلاحية آخر مشرف نشط' : ''}
                    onClick={() => ask(m.id, 'revoke')}>سحب صلاحية المشرف</button>
                )}
                {m.is_active ? (
                  <button className="btn-line" style={{ padding: '.5rem 1rem', fontSize: '.85rem' }}
                    disabled={isLastAdmin} title={isLastAdmin ? 'لا يمكن تعطيل آخر مشرف نشط' : ''}
                    onClick={() => ask(m.id, 'deactivate')}>تعطيل الحساب</button>
                ) : (
                  <button className="btn-line" style={{ padding: '.5rem 1rem', fontSize: '.85rem' }} onClick={() => ask(m.id, 'activate')}>إعادة التفعيل</button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
