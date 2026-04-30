import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAdmin } from '../context/AdminContext';
import { STATUS_CFG } from '../constants';
import { C, iS } from '../styles/tokens';
import { slaVarColor, slaLabel } from '../utils/sla';
import Avatar from '../components/ui/Avatar';
import Dot from '../components/ui/Dot';
import StatusBadge from '../components/ui/StatusBadge';
import PriBadge from '../components/ui/PriBadge';
import QDot from '../components/ui/QDot';

export default function InboxView({ tickets, onSelect, role, active, loading }) {
  const { user }          = useAuth();
  const { queues, users } = useAdmin();
  const [search,      setSearch]      = useState('');
  const [statusF,     setStatusF]     = useState('all');
  const [agentF,      setAgentF]      = useState('all');
  const [showClosed,  setShowClosed]  = useState(false);

  const agentNames = role === 'admin'
    ? users.filter(u => ['admin', 'agent'].includes(u.role_id) && u.active).map(u => u.name)
    : [...new Set(tickets.map(t => t.assignee_name).filter(Boolean))];

  let rows = [...tickets];
  if (active === 'mine')       rows = rows.filter(t => t.assignee_name === user.name);
  if (active === 'unassigned') rows = rows.filter(t => !t.assignee_name);
  if (active.startsWith('q_')) rows = rows.filter(t => t.queue_id === active.slice(2));
  if (role === 'customer')     rows = rows.filter(t => t.requester_email === user.email);

  // Closed tickets are hidden by default; toggle shows only closed
  if (showClosed) {
    rows = rows.filter(t => t.status === 'closed');
  } else {
    rows = rows.filter(t => t.status !== 'closed');
    if (statusF !== 'all') rows = rows.filter(t => t.status === statusF);
  }

  if (agentF !== 'all') rows = rows.filter(t => t.assignee_name === agentF);
  if (search) {
    const q = search.toLowerCase();
    rows = rows.filter(t => [t.title, t.id, t.requester_name].join(' ').toLowerCase().includes(q));
  }
  rows.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

  const now   = new Date();
  const stats = [
    ['Activos',      tickets.filter(t => !['closed','resolved'].includes(t.status)).length, null],
    ['Urgentes',     tickets.filter(t => t.priority === 'urgent' && !['closed','resolved'].includes(t.status)).length, '--red'],
    ['SLA vencidos', tickets.filter(t => t.sla_deadline && new Date(t.sla_deadline) < now && !['closed','resolved'].includes(t.status)).length, '--amber'],
    ['Sin asignar',  tickets.filter(t => !t.assignee_name && !['closed','resolved'].includes(t.status)).length, null],
  ];

  const qActive  = queues.find(q => `q_${q.id}` === active);
  const ctxLabel = active === 'all' ? null : active === 'mine' ? 'Mis tickets' : active === 'unassigned' ? 'Sin asignar' : qActive ? qActive.name : null;

  const COLS    = '80px 1fr 110px 90px 74px 80px 88px';
  const HEADERS = ['ID', 'Asunto', 'Solicitante', 'Bandeja', 'Prioridad', 'Estado', 'SLA'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Stats */}
      {role !== 'customer' && (
        <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          {stats.map(([l, v, vc], i) => (
            <div key={l} style={{ flex: 1, padding: '10px 18px', borderRight: i < stats.length - 1 ? `1px solid ${C.border}` : 'none' }}>
              <div style={{ fontSize: 19, fontWeight: 600, color: vc ? `var(${vc})` : C.text0, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{v}</div>
              <div style={{ fontSize: 10, color: C.text2, marginTop: 3 }}>{l}</div>
            </div>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderBottom: `1px solid ${C.border}`, background: C.bg1, flexShrink: 0, flexWrap: 'wrap' }}>
        {ctxLabel && <span style={{ fontSize: 11, fontWeight: 500, color: C.accent, marginRight: 2 }}>{ctxLabel}</span>}
        <div style={{ position: 'relative', width: 200 }}>
          <svg style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text2)" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar…" style={{ ...iS, paddingLeft: 26, fontSize: 11, padding: '5px 8px 5px 26px' }} />
        </div>
        {!showClosed && (
          <div style={{ display: 'flex', gap: 1 }}>
            {['all','new','open','pending','resolved'].map(s => (
              <button key={s} onClick={() => setStatusF(s)} style={{ padding: '3px 9px', borderRadius: 3, border: 'none', fontSize: 10, fontWeight: 500, background: statusF === s ? C.accentMuted : 'transparent', color: statusF === s ? C.accent : C.text2, cursor: 'pointer', transition: 'all 0.1s' }}>
                {s === 'all' ? 'Todos' : STATUS_CFG[s]?.label || s}
              </button>
            ))}
          </div>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          {role !== 'customer' && (
            <>
              <span style={{ fontSize: 10, color: C.text2 }}>Responsable</span>
              <select value={agentF} onChange={e => setAgentF(e.target.value)} style={{ ...iS, padding: '4px 8px', fontSize: 11, width: 'auto' }}>
                <option value="all">Todos</option>
                {agentNames.map(a => <option key={a} value={a}>{a}</option>)}
                <option value="">Sin asignar</option>
              </select>
            </>
          )}
          <button
            onClick={() => { setShowClosed(v => !v); setStatusF('all'); }}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 3, border: `1px solid ${showClosed ? 'var(--text2)' : C.border}`, fontSize: 10, fontWeight: showClosed ? 500 : 400, background: showClosed ? C.bg3 : 'transparent', color: showClosed ? C.text1 : C.text2, cursor: 'pointer', transition: 'all 0.1s' }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/>
            </svg>
            Archivados
          </button>
        </div>
      </div>

      {/* Header */}
      <div style={{ display: 'grid', gridTemplateColumns: COLS, padding: '4px 18px', borderBottom: `1px solid ${C.border}`, background: C.bg1, flexShrink: 0 }}>
        {HEADERS.map(h => <div key={h} style={{ fontSize: 9, fontWeight: 600, color: C.text2, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</div>)}
      </div>

      {/* Rows */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 80, color: C.text2, fontSize: 12 }}>Cargando…</div>}
        {!loading && rows.length === 0 && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 160, color: C.text2, fontSize: 12 }}>Sin resultados</div>}
        {rows.map((t, i) => {
          const sc = slaVarColor(t.sla_deadline, t.status);
          const q  = queues.find(x => x.id === t.queue_id);
          return (
            <div
              key={t.id}
              onClick={() => onSelect(t)}
              style={{ display: 'grid', gridTemplateColumns: COLS, padding: '9px 18px', borderBottom: `1px solid ${C.border}`, cursor: 'pointer', transition: 'background 0.08s', background: i % 2 === 0 ? 'transparent' : 'rgba(128,100,80,0.03)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg2)')}
              onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(128,100,80,0.03)')}
            >
              <div style={{ fontSize: 10, fontFamily: 'IBM Plex Mono', color: C.text2, paddingTop: 1 }}>{t.id}</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, color: C.text0, marginBottom: 3, lineHeight: 1.35 }}>{t.title}</div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {(t.tags || []).map(tag => <span key={tag} style={{ fontSize: 9, color: C.text2, padding: '0 4px', border: `1px solid ${C.border}`, borderRadius: 2 }}>#{tag}</span>)}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, alignSelf: 'center' }}>
                <Avatar name={t.requester_name} size={18} />
                <span style={{ fontSize: 11, color: C.text1 }}>{t.requester_name.split(' ')[0]}</span>
              </div>
              <div style={{ alignSelf: 'center' }}>
                {q && <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: C.text1 }}><QDot qid={q.id} size={6} />{q.name}</span>}
              </div>
              <div style={{ alignSelf: 'center' }}><PriBadge priority={t.priority} /></div>
              <div style={{ alignSelf: 'center' }}><StatusBadge status={t.status} /></div>
              <div style={{ alignSelf: 'center', fontSize: 10, color: `var(${sc})`, fontWeight: sc !== '--text1' ? 500 : 400, display: 'flex', alignItems: 'center', gap: 3 }}>
                {sc !== '--text1' && <Dot varColor={sc} size={4} />}
                {slaLabel(t.sla_deadline, t.status)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
