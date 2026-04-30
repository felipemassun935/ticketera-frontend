import { useState } from 'react';
import { QUEUES, AGENTS, STATUS_CFG, NOW } from '../constants';
import { C, iS } from '../styles/tokens';
import { slaVarColor, slaLabel } from '../utils/sla';
import Avatar from '../components/ui/Avatar';
import Dot from '../components/ui/Dot';
import StatusBadge from '../components/ui/StatusBadge';
import PriBadge from '../components/ui/PriBadge';
import QDot from '../components/ui/QDot';

const CUSTOMER_EMAIL = 'm.garcia@equilybrio.com';

export default function InboxView({ tickets, onSelect, role, active }) {
  const [search,  setSearch]  = useState('');
  const [statusF, setStatusF] = useState('all');
  const [agentF,  setAgentF]  = useState('all');

  const USERS = { agent: 'Camilo Reyes', admin: 'Patricia Lara', customer: 'María García' };

  let rows = [...tickets];
  if (active === 'mine')          rows = rows.filter((t) => t.assignee === USERS[role]);
  if (active === 'unassigned')    rows = rows.filter((t) => t.assignee === 'Sin asignar');
  if (active.startsWith('q_'))   rows = rows.filter((t) => t.queue === active.slice(2));
  if (role === 'customer')        rows = rows.filter((t) => t.requesterEmail === CUSTOMER_EMAIL);
  if (statusF !== 'all')          rows = rows.filter((t) => t.status === statusF);
  if (agentF !== 'all')           rows = rows.filter((t) => t.assignee === agentF);
  if (search) rows = rows.filter((t) => [t.title, t.id, t.requester].join(' ').toLowerCase().includes(search.toLowerCase()));
  rows.sort((a, b) => new Date(b.updated) - new Date(a.updated));

  const stats = [
    ['Activos',      tickets.filter((t) => !['closed', 'resolved'].includes(t.status)).length, null],
    ['Urgentes',     tickets.filter((t) => t.priority === 'urgent' && !['closed', 'resolved'].includes(t.status)).length, '--red'],
    ['SLA vencidos', tickets.filter((t) => new Date(t.slaDeadline) < NOW && !['closed', 'resolved'].includes(t.status)).length, '--amber'],
    ['Sin asignar',  tickets.filter((t) => t.assignee === 'Sin asignar' && !['closed', 'resolved'].includes(t.status)).length, null],
  ];

  const qActive  = QUEUES.find((q) => `q_${q.id}` === active);
  const ctxLabel = active === 'all' ? null : active === 'mine' ? 'Mis tickets' : active === 'unassigned' ? 'Sin asignar' : qActive ? qActive.name : null;

  const COLS = '80px 1fr 110px 90px 74px 80px 88px';
  const HEADERS = ['ID', 'Asunto', 'Solicitante', 'Bandeja', 'Prioridad', 'Estado', 'SLA'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Stats row */}
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
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar…"
            style={{ ...iS, paddingLeft: 26, fontSize: 11, padding: '5px 8px 5px 26px' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 1 }}>
          {['all', 'new', 'open', 'pending', 'resolved', 'closed'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusF(s)}
              style={{
                padding: '3px 9px',
                borderRadius: 3,
                border: 'none',
                fontSize: 10,
                fontWeight: 500,
                background: statusF === s ? C.accentMuted : 'transparent',
                color: statusF === s ? C.accent : C.text2,
                cursor: 'pointer',
                transition: 'all 0.1s',
              }}
            >
              {s === 'all' ? 'Todos' : STATUS_CFG[s]?.label || s}
            </button>
          ))}
        </div>

        {role !== 'customer' && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 10, color: C.text2 }}>Responsable</span>
            <select
              value={agentF}
              onChange={(e) => setAgentF(e.target.value)}
              style={{ ...iS, padding: '4px 8px', fontSize: 11, width: 'auto' }}
            >
              <option value="all">Todos</option>
              {AGENTS.map((a) => <option key={a} value={a}>{a}</option>)}
              <option value="Sin asignar">Sin asignar</option>
            </select>
          </div>
        )}
      </div>

      {/* Table header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: COLS,
          padding: '4px 18px',
          borderBottom: `1px solid ${C.border}`,
          background: C.bg1,
          flexShrink: 0,
        }}
      >
        {HEADERS.map((h) => (
          <div key={h} style={{ fontSize: 9, fontWeight: 600, color: C.text2, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</div>
        ))}
      </div>

      {/* Rows */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {rows.length === 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 160, color: C.text2, fontSize: 12 }}>
            Sin resultados
          </div>
        )}
        {rows.map((t, i) => {
          const sc = slaVarColor(t.slaDeadline, t.status);
          const q  = QUEUES.find((x) => x.id === t.queue);
          return (
            <div
              key={t.id}
              onClick={() => onSelect(t)}
              style={{
                display: 'grid',
                gridTemplateColumns: COLS,
                padding: '9px 18px',
                borderBottom: `1px solid ${C.border}`,
                cursor: 'pointer',
                transition: 'background 0.08s',
                background: i % 2 === 0 ? 'transparent' : 'rgba(128,100,80,0.03)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg2)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(128,100,80,0.03)')}
            >
              <div style={{ fontSize: 10, fontFamily: 'IBM Plex Mono', color: C.text2, paddingTop: 1 }}>{t.id}</div>

              <div>
                <div style={{ fontSize: 12, fontWeight: 500, color: C.text0, marginBottom: 3, lineHeight: 1.35 }}>{t.title}</div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {t.tags.map((tag) => (
                    <span key={tag} style={{ fontSize: 9, color: C.text2, padding: '0 4px', border: `1px solid ${C.border}`, borderRadius: 2 }}>#{tag}</span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, alignSelf: 'center' }}>
                <Avatar name={t.requester} size={18} />
                <span style={{ fontSize: 11, color: C.text1 }}>{t.requester.split(' ')[0]}</span>
              </div>

              <div style={{ alignSelf: 'center' }}>
                {q && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: C.text1 }}>
                    <QDot qid={q.id} size={6} />{q.name}
                  </span>
                )}
              </div>

              <div style={{ alignSelf: 'center' }}><PriBadge priority={t.priority} /></div>
              <div style={{ alignSelf: 'center' }}><StatusBadge status={t.status} /></div>

              <div
                style={{
                  alignSelf: 'center',
                  fontSize: 10,
                  color: `var(${sc})`,
                  fontWeight: sc !== '--text1' ? 500 : 400,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                }}
              >
                {sc !== '--text1' && <Dot varColor={sc} size={4} />}
                {slaLabel(t.slaDeadline, t.status)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
