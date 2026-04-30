import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { C } from '../styles/tokens';
import Avatar from '../components/ui/Avatar';
import Dot from '../components/ui/Dot';

function KpiCard({ label, value, sub, subColor }) {
  return (
    <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 5, padding: '12px' }}>
      <div style={{ fontSize: 10, color: C.text2, marginBottom: 5 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 600, color: C.text0, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      {sub != null && (
        <div style={{ fontSize: 10, color: subColor ?? C.text2, marginTop: 2 }}>{sub}</div>
      )}
    </div>
  );
}

export default function ReportsView() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    setLoading(true);
    api.get('/reports')
      .then(d => setData(d))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.text2, fontSize: 12 }}>
        Cargando reportes…
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--red)', fontSize: 12 }}>
        Error al cargar reportes: {error}
      </div>
    );
  }

  const { period, kpis, by_queue, by_agent, by_priority } = data;
  const maxQueueTotal = Math.max(...by_queue.map(q => q.total), 1);

  const PRI_COLOR = { urgent: '--red', high: '--amber', medium: '--blue', low: '--text2' };
  const PRI_LABEL = { urgent: 'Urgente', high: 'Alta', medium: 'Media', low: 'Baja' };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '22px' }}>
      <div style={{ fontSize: 14, fontWeight: 500, color: C.text0, marginBottom: 1 }}>Reportes</div>
      <div style={{ fontSize: 11, color: C.text2, marginBottom: 18 }}>{period}</div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 18 }}>
        <KpiCard
          label="Total del mes"
          value={kpis.total}
          sub={`${kpis.open} activos`}
          subColor={C.text2}
        />
        <KpiCard
          label="Resueltos"
          value={kpis.resolved}
          sub={`${kpis.resolution_rate}% del total`}
          subColor={kpis.resolution_rate >= 70 ? 'var(--green)' : 'var(--amber)'}
        />
        <KpiCard
          label="SLA vencidos"
          value={kpis.sla_expired}
          sub={kpis.open ? `${Math.round(kpis.sla_expired / kpis.open * 100)}% de activos` : '—'}
          subColor={kpis.sla_expired > 0 ? 'var(--red)' : 'var(--green)'}
        />
        <KpiCard
          label="Sin asignar"
          value={kpis.unassigned}
          sub={kpis.open ? `${Math.round(kpis.unassigned / kpis.open * 100)}% de activos` : '—'}
          subColor={kpis.unassigned > 0 ? 'var(--amber)' : 'var(--green)'}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 12, marginBottom: 12 }}>
        {/* Bar chart by queue */}
        <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 5, padding: '14px' }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: C.text0, marginBottom: 13 }}>Por bandeja</div>
          {by_queue.length === 0 && (
            <div style={{ fontSize: 11, color: C.text2 }}>Sin datos este mes</div>
          )}
          {by_queue.map(({ queue_id, queue_name, open, resolved, total }) => (
            <div key={queue_id} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 34px', gap: 8, alignItems: 'center', marginBottom: 7 }}>
              <span style={{ fontSize: 10, color: C.text2, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={queue_name}>{queue_name}</span>
              <div style={{ position: 'relative', height: 12, background: C.bg3, borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${(resolved / maxQueueTotal) * 100}%`, background: 'var(--green)', opacity: 0.35, borderRadius: 2 }} />
                <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${(open / maxQueueTotal) * 100}%`, background: 'var(--accent)', opacity: 0.8, borderRadius: 2 }} />
              </div>
              <span style={{ fontSize: 10, color: C.text1, fontVariantNumeric: 'tabular-nums' }}>{total}</span>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: C.text2 }}>
              <div style={{ width: 8, height: 8, borderRadius: 1, background: 'var(--accent)', opacity: 0.8 }} /> Abiertos
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: C.text2 }}>
              <div style={{ width: 8, height: 8, borderRadius: 1, background: 'var(--green)', opacity: 0.35 }} /> Resueltos
            </div>
          </div>
        </div>

        {/* By priority */}
        <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 5, padding: '14px' }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: C.text0, marginBottom: 13 }}>Por prioridad</div>
          {Object.entries(by_priority).map(([pri, count]) => (
            <div key={pri} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 9 }}>
              <Dot varColor={PRI_COLOR[pri]} size={6} />
              <span style={{ flex: 1, fontSize: 11, color: C.text1 }}>{PRI_LABEL[pri]}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.text0, fontVariantNumeric: 'tabular-nums' }}>{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Agents table */}
      <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 5, padding: '14px' }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: C.text0, marginBottom: 10 }}>Agentes</div>
        {by_agent.length === 0 && (
          <div style={{ fontSize: 11, color: C.text2 }}>Sin tickets asignados este mes</div>
        )}
        {by_agent.map(({ name, resolved: res, open, total }) => (
          <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 0', borderBottom: `1px solid ${C.border}` }}>
            <Avatar name={name} size={24} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: C.text0 }}>{name}</div>
              <div style={{ fontSize: 10, color: C.text2 }}>{total} asignados · {open} abiertos</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: C.text0 }}>{res} resueltos</div>
              <div style={{ fontSize: 10, color: total ? (res / total >= 0.7 ? 'var(--green)' : 'var(--amber)') : C.text2 }}>
                {total ? `${Math.round(res / total * 100)}% tasa` : '—'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
