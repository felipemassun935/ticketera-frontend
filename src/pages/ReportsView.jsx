import { C } from '../styles/tokens';
import Avatar from '../components/ui/Avatar';

const BARS = [
  ['IT',        12, 28],
  ['Dev',        5, 14],
  ['DevOps',     7, 11],
  ['Analytics',  3,  9],
  ['Finanzas',   2,  6],
  ['RRHH',       3,  7],
  ['Seguridad',  4,  8],
];

const METRICS = [
  ['Total (mes)', '127', '+12%',  false],
  ['Resueltos',   '98',  '77%',   true ],
  ['T. respuesta','2.4h','-18%',  true ],
  ['CSAT',        '4.6/5','+0.2', true ],
];

const AGENTS = [
  ['Camilo Reyes', 34, '1.8h', 4.8],
  ['Ana Ríos',     28, '2.1h', 4.7],
  ['Luis Herrera', 21, '3.2h', 4.4],
];

export default function ReportsView() {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '22px' }}>
      <div style={{ fontSize: 14, fontWeight: 500, color: C.text0, marginBottom: 1 }}>Reportes</div>
      <div style={{ fontSize: 11, color: C.text2, marginBottom: 18 }}>Abril 2026</div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 18 }}>
        {METRICS.map(([l, v, d, up]) => (
          <div key={l} style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 5, padding: '12px' }}>
            <div style={{ fontSize: 10, color: C.text2, marginBottom: 5 }}>{l}</div>
            <div style={{ fontSize: 22, fontWeight: 600, color: C.text0, fontVariantNumeric: 'tabular-nums' }}>{v}</div>
            <div style={{ fontSize: 10, color: up ? 'var(--green)' : 'var(--red)', marginTop: 2 }}>{d}</div>
          </div>
        ))}
      </div>

      {/* Bar chart by queue */}
      <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 5, padding: '14px', marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: C.text0, marginBottom: 13 }}>Por bandeja</div>
        {BARS.map(([l, o, r]) => (
          <div key={l} style={{ display: 'grid', gridTemplateColumns: '68px 1fr 34px', gap: 8, alignItems: 'center', marginBottom: 7 }}>
            <span style={{ fontSize: 10, color: C.text2, textAlign: 'right' }}>{l}</span>
            <div style={{ position: 'relative', height: 12, background: C.bg3, borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${(r / 40) * 100}%`, background: 'var(--green)', opacity: 0.3, borderRadius: 2 }} />
              <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${(o / 40) * 100}%`, background: 'var(--accent)', opacity: 0.8, borderRadius: 2 }} />
            </div>
            <span style={{ fontSize: 10, color: C.text1, fontVariantNumeric: 'tabular-nums' }}>{o + r}</span>
          </div>
        ))}
      </div>

      {/* Agents table */}
      <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 5, padding: '14px' }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: C.text0, marginBottom: 10 }}>Agentes</div>
        {AGENTS.map(([n, r, t, cs]) => (
          <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 0', borderBottom: `1px solid ${C.border}` }}>
            <Avatar name={n} size={24} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: C.text0 }}>{n}</div>
              <div style={{ fontSize: 10, color: C.text2 }}>T. prom. {t}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: C.text0 }}>{r} resueltos</div>
              <div style={{ fontSize: 10, color: 'var(--green)' }}>CSAT {cs}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
