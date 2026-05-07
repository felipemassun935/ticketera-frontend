import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useAdmin } from '../../context/AdminContext';
import { C, iS } from '../../styles/tokens';
import Modal from '../../components/ui/Modal';
import { HoursTable } from '../HoursView';

function currentMonth() {
  const d = new Date();
  return { month: d.getMonth() + 1, year: d.getFullYear() };
}

function ActionButton({ children, onClick, tone = 'default', disabled }) {
  const color = tone === 'green' ? C.green : tone === 'red' ? C.red : C.text2;
  return (
    <button disabled={disabled} onClick={onClick} style={{ border: `1px solid ${C.border}`, background: 'transparent', color: disabled ? C.text2 : color, borderRadius: 4, padding: '4px 8px', fontSize: 10, cursor: disabled ? 'default' : 'pointer', marginRight: 4 }}>
      {children}
    </button>
  );
}

export default function HoursReviewAdmin() {
  const { queues, users } = useAdmin();
  const [{ month, year }, setPeriod] = useState(currentMonth);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [rejecting, setRejecting] = useState(null);
  const [comment, setComment] = useState('');
  const [filters, setFilters] = useState({ user_id: '', project_id: '', status: 'pending' });

  async function load() {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        month: String(month),
        year: String(year),
        limit: '400',
      });
      if (filters.user_id) params.set('user_id', filters.user_id);
      if (filters.project_id) params.set('project_id', filters.project_id);
      if (filters.status) params.set('status', filters.status);
      const { entries } = await api.get(`/admin/hours?${params.toString()}`);
      setEntries(entries);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [month, year, filters.user_id, filters.project_id, filters.status]);

  async function approve(entry) {
    try {
      const { entry: updated } = await api.patch(`/admin/hours/${entry.id}/approve`, {});
      setEntries(rows => rows.map(r => r.id === updated.id ? updated : r));
      setSelected(s => s?.id === updated.id ? updated : s);
    } catch (e) {
      setError(e.message);
    }
  }

  async function reject() {
    if (!rejecting) return;
    try {
      const { entry: updated } = await api.patch(`/admin/hours/${rejecting.id}/reject`, { comment });
      setEntries(rows => rows.map(r => r.id === updated.id ? updated : r));
      setRejecting(null);
      setComment('');
      setSelected(s => s?.id === updated.id ? updated : s);
    } catch (e) {
      setError(e.message);
    }
  }

  const pendingHours = entries.filter(e => e.status === 'pending').reduce((sum, e) => sum + Number(e.hours), 0);
  const totalHours = entries.reduce((sum, e) => sum + Number(e.hours), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <div style={{ flex: 1, padding: '10px 18px', borderRight: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 19, fontWeight: 600, color: C.amber, lineHeight: 1 }}>{pendingHours.toFixed(2)} h</div>
          <div style={{ fontSize: 10, color: C.text2, marginTop: 3 }}>Pendientes en filtros</div>
        </div>
        <div style={{ flex: 1, padding: '10px 18px' }}>
          <div style={{ fontSize: 19, fontWeight: 600, color: C.text0, lineHeight: 1 }}>{totalHours.toFixed(2)} h</div>
          <div style={{ fontSize: 10, color: C.text2, marginTop: 3 }}>Total listado</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderBottom: `1px solid ${C.border}`, background: C.bg1, flexShrink: 0, flexWrap: 'wrap' }}>
        <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))} style={{ ...iS, width: 130, padding: '4px 8px', fontSize: 11 }}>
          <option value="pending">Pendientes</option>
          <option value="approved">Aprobadas</option>
          <option value="rejected">Rechazadas</option>
          <option value="all">Todos</option>
        </select>
        <select value={filters.user_id} onChange={e => setFilters(f => ({ ...f, user_id: e.target.value }))} style={{ ...iS, width: 170, padding: '4px 8px', fontSize: 11 }}>
          <option value="">Todos los usuarios</option>
          {users.filter(u => u.active).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
        <select value={filters.project_id} onChange={e => setFilters(f => ({ ...f, project_id: e.target.value }))} style={{ ...iS, width: 160, padding: '4px 8px', fontSize: 11 }}>
          <option value="">Todos los proyectos</option>
          {queues.map(q => <option key={q.id} value={q.id}>{q.name}</option>)}
        </select>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          <select value={month} onChange={e => setPeriod(p => ({ ...p, month: Number(e.target.value) }))} style={{ ...iS, width: 118, padding: '4px 8px', fontSize: 11 }}>
            {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{new Date(2026, i, 1).toLocaleString('es-AR', { month: 'long' })}</option>)}
          </select>
          <input type="number" value={year} onChange={e => setPeriod(p => ({ ...p, year: Number(e.target.value) || p.year }))} style={{ ...iS, width: 82, padding: '4px 8px', fontSize: 11 }} />
        </div>
      </div>

      {error && <div style={{ padding: '8px 18px', color: C.red, fontSize: 11, borderBottom: `1px solid ${C.border}` }}>{error}</div>}

      <HoursTable
        admin
        entries={entries}
        loading={loading}
        onSelect={setSelected}
        actions={entry => (
          <>
            <ActionButton tone="green" disabled={entry.status === 'approved'} onClick={() => approve(entry)}>Aprobar</ActionButton>
            <ActionButton tone="red" disabled={entry.status === 'rejected'} onClick={() => { setRejecting(entry); setComment(''); }}>Rechazar</ActionButton>
          </>
        )}
      />

      {selected && (
        <Modal title={`Registro #${selected.id}`} onClose={() => setSelected(null)} width={540}>
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px 12px', fontSize: 12, marginBottom: 16 }}>
            <div style={{ color: C.text2 }}>Usuario</div><div style={{ color: C.text0 }}>{selected.user_name}</div>
            <div style={{ color: C.text2 }}>Fecha</div><div style={{ color: C.text0 }}>{selected.date}</div>
            <div style={{ color: C.text2 }}>Proyecto</div><div style={{ color: C.text0 }}>{selected.project_name}</div>
            <div style={{ color: C.text2 }}>Horas</div><div style={{ color: C.text0 }}>{Number(selected.hours).toFixed(2)}</div>
            <div style={{ color: C.text2 }}>Descripción</div><div style={{ color: C.text0, whiteSpace: 'pre-wrap' }}>{selected.description}</div>
            {selected.rejection_comment && <><div style={{ color: C.text2 }}>Comentario</div><div style={{ color: C.red }}>{selected.rejection_comment}</div></>}
          </div>
          <ActionButton tone="green" disabled={selected.status === 'approved'} onClick={() => approve(selected)}>Aprobar</ActionButton>
          <ActionButton tone="red" disabled={selected.status === 'rejected'} onClick={() => { setRejecting(selected); setComment(''); }}>Rechazar</ActionButton>
        </Modal>
      )}

      {rejecting && (
        <Modal title={`Rechazar registro #${rejecting.id}`} onClose={() => setRejecting(null)} width={440}>
          <div style={{ fontSize: 11, color: C.text2, marginBottom: 10 }}>Comentario de rechazo</div>
          <textarea value={comment} onChange={e => setComment(e.target.value)} rows={4} placeholder="Motivo del rechazo…" style={{ ...iS, resize: 'vertical', lineHeight: 1.5, marginBottom: 14 }} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button onClick={() => setRejecting(null)} style={{ background: 'transparent', border: `1px solid ${C.border}`, color: C.text2, fontSize: 11, padding: '6px 14px', borderRadius: 4, cursor: 'pointer' }}>Cancelar</button>
            <button onClick={reject} style={{ background: C.red, border: 'none', color: '#fff', fontSize: 11, fontWeight: 500, padding: '6px 16px', borderRadius: 4, cursor: 'pointer' }}>Rechazar</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
