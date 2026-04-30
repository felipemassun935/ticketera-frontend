import { useAuth } from '../../context/AuthContext';
import { useAdmin } from '../../context/AdminContext';
import { C } from '../../styles/tokens';
import Dot from '../ui/Dot';

function SidebarBtn({ id, label, badge, dot, icon, active, onClick }) {
  const on = active === id;
  let prefix;
  if (dot)       prefix = <Dot hex={dot} size={6} />;
  else if (icon) prefix = <span style={{ opacity: on ? 1 : 0.5, display: 'flex' }}>{icon}</span>;
  else           prefix = <span style={{ width: 6 }} />;

  return (
    <button
      onClick={() => onClick(id)}
      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px', borderRadius: 4, border: 'none', background: on ? C.accentMuted : 'transparent', color: on ? C.accent : C.text1, cursor: 'pointer', textAlign: 'left', fontSize: 12, fontWeight: on ? 500 : 400, transition: 'all 0.12s' }}
    >
      {prefix}
      <span style={{ flex: 1 }}>{label}</span>
      {badge > 0 && <span style={{ fontSize: 10, color: on ? C.accent : C.text2, fontVariantNumeric: 'tabular-nums' }}>{badge}</span>}
    </button>
  );
}

function Section({ label, children }) {
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.text2, padding: '10px 10px 4px' }}>{label}</div>
      {children}
    </div>
  );
}

export default function Sidebar({ active, setActive, tickets, role }) {
  const { user }   = useAuth();
  const { queues } = useAdmin();

  const qc = {};
  queues.forEach(q => {
    qc[q.id] = tickets.filter(t => t.queue_id === q.id && !['closed','resolved'].includes(t.status)).length;
  });

  const myCount  = tickets.filter(t => t.assignee_name === user?.name && !['closed','resolved'].includes(t.status)).length;
  const unCount  = tickets.filter(t => !t.assignee_name && !['closed','resolved'].includes(t.status)).length;
  const allCount = tickets.filter(t => !['closed','resolved'].includes(t.status)).length;

  const toolItems = [
    { id: 'create', label: 'Nuevo ticket' },
    { id: 'kb',     label: 'Conocimiento' },
    ...(role !== 'customer' ? [
      { id: 'templates', label: 'Plantillas' },
      { id: 'sla',       label: 'SLA / Reglas' },
      { id: 'reports',   label: 'Reportes' },
    ] : []),
  ];

  return (
    <div style={{ width: 200, background: C.bg1, borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', height: '100%', flexShrink: 0 }}>
      {/* Brand */}
      <div style={{ padding: '16px 14px 13px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.text0, letterSpacing: '-0.01em' }}>Ticketera</div>
            <div style={{ fontSize: 9, color: C.text2, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Equilybrio</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 4px' }}>
        <Section label="Vista">
          <SidebarBtn id="all"        label="Todas"       badge={allCount} active={active} onClick={setActive} />
          {role !== 'customer' && <SidebarBtn id="mine" label="Mis tickets" badge={myCount} active={active} onClick={setActive} />}
          <SidebarBtn id="unassigned" label="Sin asignar" badge={unCount}  active={active} onClick={setActive} />
        </Section>

        {role !== 'customer' && queues.length > 0 && (
          <Section label="Bandejas">
            {queues.map(q => (
              <SidebarBtn key={q.id} id={`q_${q.id}`} label={q.name} badge={qc[q.id] || 0} dot={q.color} active={active} onClick={setActive} />
            ))}
          </Section>
        )}

        <Section label="Herramientas">
          {toolItems.map(n => <SidebarBtn key={n.id} id={n.id} label={n.label} active={active} onClick={setActive} />)}
        </Section>

        {role === 'admin' && (
          <Section label="Administración">
            <SidebarBtn id="admin_queues" label="Bandejas" active={active} onClick={setActive}
              icon={<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>}
            />
            <SidebarBtn id="admin_users" label="Usuarios" active={active} onClick={setActive}
              icon={<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>}
            />
            <SidebarBtn id="admin_roles" label="Roles" active={active} onClick={setActive}
              icon={<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>}
            />
          </Section>
        )}
      </div>
    </div>
  );
}
