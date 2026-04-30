import { useState, useRef, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { STATUS_CFG, UPDATE_CATS } from '../constants';
import { api } from '../services/api';
import { C, iS } from '../styles/tokens';
import { fmtTs, timeAgo } from '../utils/time';
import { slaVarColor, slaLabel } from '../utils/sla';
import Icon from '../components/ui/Icon';
import StatusBadge from '../components/ui/StatusBadge';
import PriBadge from '../components/ui/PriBadge';
import Avatar from '../components/ui/Avatar';
import Dot from '../components/ui/Dot';
import QDot from '../components/ui/QDot';
import HistoryEntry from '../components/ticket/HistoryEntry';
import { PanelSection, PanelRow } from '../components/ticket/PanelSection';

export default function TicketDetail({ ticket: init, onBack, role, onUpdate }) {
  const { queues, users } = useAdmin();
  const [ticket,    setTicket]    = useState(init);
  const [newStatus, setNewStatus] = useState(init.status);
  const [newCat,    setNewCat]    = useState(UPDATE_CATS[0]);
  const [comment,   setComment]   = useState('');
  const [saving,    setSaving]    = useState(false);
  const [targetQ,   setTargetQ]   = useState('');
  const [moveNote,  setMoveNote]  = useState('');
  const [moveOpen,   setMoveOpen]   = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignVal,  setAssignVal]  = useState('');
  const histRef = useRef(null);

  useEffect(() => {
    if (histRef.current) histRef.current.scrollTop = histRef.current.scrollHeight;
  }, [ticket.history?.length]);

  async function addUpdate() {
    if (!comment.trim() || saving) return;
    setSaving(true);
    try {
      const { ticket: t } = await api.post(`/tickets/${ticket.id}/update`, { comment, status: newStatus, category: newCat });
      setTicket(t);
      onUpdate(t);
      setComment('');
    } finally { setSaving(false); }
  }

  async function doAssign(userId) {
    setSaving(true);
    try {
      const { ticket: t } = await api.patch(`/tickets/${ticket.id}`, {
        assignee_id: userId === '' ? null : Number(userId),
      });
      setTicket(t);
      onUpdate(t);
      setAssignOpen(false);
    } finally { setSaving(false); }
  }

  async function doMove() {
    if (!targetQ || saving) return;
    setSaving(true);
    try {
      const { ticket: t } = await api.post(`/tickets/${ticket.id}/move`, { queue_id: targetQ, note: moveNote });
      setTicket(t);
      onUpdate(t);
      setMoveOpen(false);
      setTargetQ('');
      setMoveNote('');
    } finally { setSaving(false); }
  }

  const q        = queues.find(x => x.id === ticket.queue_id);
  const slaColor = slaVarColor(ticket.sla_deadline, ticket.status);

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Main column */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <div style={{ padding: '11px 18px', borderBottom: `1px solid ${C.border}`, background: C.bg1, flexShrink: 0 }}>
          <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'transparent', border: 'none', color: C.text2, cursor: 'pointer', fontSize: 11, marginBottom: 9, padding: 0 }}>
            <Icon d="M19 12H5M12 5l-7 7 7 7" size={11} varColor="--text2" /> Volver
          </button>
          <div style={{ fontSize: 14, fontWeight: 500, color: C.text0, marginBottom: 6, lineHeight: 1.35 }}>{ticket.title}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 10, fontFamily: 'IBM Plex Mono', color: C.text2 }}>{ticket.id}</span>
            <StatusBadge status={ticket.status} />
            <PriBadge priority={ticket.priority} />
            {q && <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: C.text1 }}><QDot qid={q.id} />{q.name}</span>}
          </div>
        </div>

        {/* Timeline */}
        <div ref={histRef} style={{ flex: 1, overflowY: 'auto', padding: '20px 22px' }}>
          {(ticket.history || []).map((e, i) => (
            <HistoryEntry key={e.id} entry={e} isLast={i === ticket.history.length - 1} />
          ))}
        </div>

        {/* Update form — agents and admins only */}
        {role !== 'customer' && (
          <div style={{ padding: '12px 18px', borderTop: `1px solid ${C.border}`, background: C.bg1, flexShrink: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 7 }}>
              <div>
                <label style={{ fontSize: 9, color: C.text2, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 3 }}>Estado</label>
                <select value={newStatus} onChange={e => setNewStatus(e.target.value)} style={{ ...iS, width: '100%' }}>
                  {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 9, color: C.text2, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 3 }}>Categoría</label>
                <select value={newCat} onChange={e => setNewCat(e.target.value)} style={{ ...iS, width: '100%' }}>
                  {UPDATE_CATS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <textarea
              value={comment} onChange={e => setComment(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) addUpdate(); }}
              placeholder="Escribe una actualización… (Ctrl+Enter para guardar)"
              rows={2} style={{ ...iS, width: '100%', resize: 'none', lineHeight: 1.6, marginBottom: 7 }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={addUpdate} disabled={!comment.trim() || saving}
                style={{ background: comment.trim() && !saving ? 'var(--accent)' : C.bg3, border: 'none', color: comment.trim() && !saving ? '#fff' : C.text2, fontSize: 11, fontWeight: 500, padding: '5px 16px', borderRadius: 4, cursor: comment.trim() && !saving ? 'pointer' : 'default', transition: 'all 0.15s' }}
              >
                {saving ? 'Guardando…' : 'Guardar actualización'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right panel */}
      <div style={{ width: 232, background: C.bg1, borderLeft: `1px solid ${C.border}`, overflowY: 'auto', flexShrink: 0 }}>
        <div style={{ padding: '14px' }}>
          <PanelSection label="SLA">
            <div style={{ fontSize: 11, color: `var(${slaColor})`, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5 }}>
              <Dot varColor={slaColor} size={5} />
              {slaLabel(ticket.sla_deadline, ticket.status)}
            </div>
          </PanelSection>

          {role !== 'customer' && (
            <PanelSection label="Bandeja">
              {q && <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}><QDot qid={q.id} /><span style={{ fontSize: 12, color: C.text0, fontWeight: 500 }}>{q.name}</span></div>}
              <button
                onClick={() => setMoveOpen(o => !o)}
                style={{ width: '100%', background: 'transparent', border: `1px solid ${C.border}`, color: C.text1, fontSize: 11, padding: '5px 0', borderRadius: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, transition: 'border-color 0.12s' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <Icon d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" size={11} varColor="--text2" /> Mover a bandeja
              </button>
              {moveOpen && (
                <div style={{ marginTop: 7, background: C.bg0, border: `1px solid ${C.border}`, borderRadius: 5, padding: '10px' }}>
                  <label style={{ fontSize: 9, color: C.text2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 4 }}>Destino</label>
                  <select value={targetQ} onChange={e => setTargetQ(e.target.value)} style={{ ...iS, width: '100%', marginBottom: 7, fontSize: 11 }}>
                    <option value="">Seleccionar…</option>
                    {queues.filter(x => x.id !== ticket.queue_id).map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
                  </select>
                  <label style={{ fontSize: 9, color: C.text2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 4 }}>Motivo</label>
                  <input value={moveNote} onChange={e => setMoveNote(e.target.value)} placeholder="Opcional…" style={{ ...iS, width: '100%', marginBottom: 7, fontSize: 11 }} />
                  <div style={{ display: 'flex', gap: 5 }}>
                    <button onClick={() => { setMoveOpen(false); setTargetQ(''); }} style={{ flex: 1, background: 'transparent', border: `1px solid ${C.border}`, color: C.text2, fontSize: 10, padding: '4px 0', borderRadius: 3, cursor: 'pointer' }}>Cancelar</button>
                    <button onClick={doMove} disabled={!targetQ || saving} style={{ flex: 1, background: targetQ && !saving ? 'var(--accent)' : C.bg3, border: 'none', color: targetQ && !saving ? '#fff' : C.text2, fontSize: 10, fontWeight: 500, padding: '4px 0', borderRadius: 3, cursor: targetQ && !saving ? 'pointer' : 'default', transition: 'all 0.15s' }}>
                      {saving ? '…' : 'Mover'}
                    </button>
                  </div>
                </div>
              )}
            </PanelSection>
          )}

          {role !== 'customer' && (
            <PanelSection label="Asignado a">
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
                <Avatar name={ticket.assignee_name || 'SA'} size={20} />
                <span style={{ fontSize: 11, color: C.text1, flex: 1 }}>{ticket.assignee_name || 'Sin asignar'}</span>
              </div>
              <button
                onClick={() => { setAssignVal(ticket.assignee?.id?.toString() ?? ''); setAssignOpen(o => !o); }}
                style={{ width: '100%', background: 'transparent', border: `1px solid ${C.border}`, color: C.text1, fontSize: 11, padding: '5px 0', borderRadius: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, transition: 'border-color 0.12s' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <Icon d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" size={11} varColor="--text2" /> Cambiar agente
              </button>
              {assignOpen && (
                <div style={{ marginTop: 7, background: C.bg0, border: `1px solid ${C.border}`, borderRadius: 5, padding: '10px' }}>
                  <label style={{ fontSize: 9, color: C.text2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 4 }}>Agente</label>
                  <select value={assignVal} onChange={e => setAssignVal(e.target.value)} style={{ ...iS, width: '100%', marginBottom: 7, fontSize: 11 }}>
                    <option value="">Sin asignar</option>
                    {users.filter(u => u.active && u.role_id !== 'customer').map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                  <div style={{ display: 'flex', gap: 5 }}>
                    <button onClick={() => setAssignOpen(false)} style={{ flex: 1, background: 'transparent', border: `1px solid ${C.border}`, color: C.text2, fontSize: 10, padding: '4px 0', borderRadius: 3, cursor: 'pointer' }}>Cancelar</button>
                    <button onClick={() => doAssign(assignVal)} disabled={saving} style={{ flex: 1, background: !saving ? 'var(--accent)' : C.bg3, border: 'none', color: !saving ? '#fff' : C.text2, fontSize: 10, fontWeight: 500, padding: '4px 0', borderRadius: 3, cursor: !saving ? 'pointer' : 'default', transition: 'all 0.15s' }}>
                      {saving ? '…' : 'Asignar'}
                    </button>
                  </div>
                </div>
              )}
            </PanelSection>
          )}

          <PanelSection label="Solicitante">
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <Avatar name={ticket.requester_name} size={20} />
              <div>
                <div style={{ fontSize: 11, color: C.text0, fontWeight: 500 }}>{ticket.requester_name}</div>
                <div style={{ fontSize: 10, color: C.text2 }}>{ticket.requester_email}</div>
              </div>
            </div>
          </PanelSection>

          <PanelSection label="Detalles">
            <PanelRow l="Área"        v={ticket.dept} />
            <PanelRow l="Categoría"   v={ticket.category} />
            <PanelRow l="Creado"      v={fmtTs(ticket.created_at)} />
            <PanelRow l="Actualizado" v={timeAgo(ticket.updated_at) + ' atrás'} />
          </PanelSection>

          <PanelSection label="Historial">
            <PanelRow l="Entradas"       v={(ticket.history || []).length} />
            <PanelRow l="Movimientos"    v={(ticket.history || []).filter(h => h.type === 'queue_move').length} />
            <PanelRow l="Cambios estado" v={(ticket.history || []).filter(h => h.type === 'status_change').length} />
            <PanelRow l="Comentarios"    v={(ticket.history || []).filter(h => h.type === 'comment').length} />
          </PanelSection>

          {(ticket.tags || []).length > 0 && (
            <PanelSection label="Etiquetas">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {ticket.tags.map(t => <span key={t} style={{ fontSize: 9, color: C.text2, padding: '1px 6px', border: `1px solid ${C.border}`, borderRadius: 2 }}>#{t}</span>)}
              </div>
            </PanelSection>
          )}
        </div>
      </div>
    </div>
  );
}
