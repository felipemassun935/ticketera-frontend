import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { C } from '../styles/tokens';
import PriBadge from '../components/ui/PriBadge';

export default function SLAView() {
  const [rules,   setRules]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/sla-rules')
      .then(r => setRules(r.rules))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function toggle(id) {
    try {
      const { rule } = await api.patch(`/sla-rules/${id}/toggle`);
      setRules(rs => rs.map(x => x.id === id ? rule : x));
    } catch {}
  }

  const COLS    = '1fr 80px 60px 96px 96px 96px 52px';
  const HEADERS = ['Regla', 'Prioridad', 'Área', '1ª Resp.', 'Resolución', 'Escalar', 'On'];

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '22px' }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: C.text0, marginBottom: 1 }}>Reglas de SLA</div>
        <div style={{ fontSize: 11, color: C.text2 }}>Tiempos de respuesta por prioridad</div>
      </div>

      <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 6, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: COLS, padding: '6px 14px', borderBottom: `1px solid ${C.border}`, background: C.bg3 }}>
          {HEADERS.map(h => <div key={h} style={{ fontSize: 9, fontWeight: 600, color: C.text2, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</div>)}
        </div>

        {loading && <div style={{ padding: '16px', fontSize: 12, color: C.text2 }}>Cargando…</div>}

        {rules.map((r, i) => (
          <div key={r.id} style={{ display: 'grid', gridTemplateColumns: COLS, padding: '10px 14px', borderBottom: i < rules.length - 1 ? `1px solid ${C.border}` : 'none', alignItems: 'center', opacity: r.active ? 1 : 0.4, transition: 'opacity 0.2s' }}>
            <div style={{ fontSize: 12, color: C.text0 }}>{r.name}</div>
            <PriBadge priority={r.priority} />
            <div style={{ fontSize: 11, color: C.text1 }}>{r.dept}</div>
            <div style={{ fontSize: 11, fontFamily: 'IBM Plex Mono', color: 'var(--teal)' }}>{r.r1}</div>
            <div style={{ fontSize: 11, fontFamily: 'IBM Plex Mono', color: 'var(--blue)' }}>{r.res}</div>
            <div style={{ fontSize: 11, fontFamily: 'IBM Plex Mono', color: 'var(--amber)' }}>{r.esc}</div>
            <button
              onClick={() => toggle(r.id)}
              style={{ width: 30, height: 16, borderRadius: 8, border: 'none', cursor: 'pointer', background: r.active ? 'var(--accent)' : C.bg3, position: 'relative', transition: 'background 0.2s' }}
            >
              <span style={{ position: 'absolute', top: 2, left: r.active ? 14 : 2, width: 12, height: 12, borderRadius: '50%', background: '#fff', transition: 'left 0.18s' }} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
