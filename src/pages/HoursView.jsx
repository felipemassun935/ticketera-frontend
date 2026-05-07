import { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../services/api';
import { useAdmin } from '../context/AdminContext';
import { C, iS } from '../styles/tokens';
import Modal from '../components/ui/Modal';
import FormField from '../components/forms/FormField';

const STATUS = {
  approved: { label: 'Aprobada', color: 'var(--green)', bg: 'rgba(120,176,122,0.14)' },
  pending:  { label: 'Pendiente', color: 'var(--amber)', bg: 'rgba(201,140,74,0.14)' },
  rejected: { label: 'Rechazada', color: 'var(--red)', bg: 'rgba(196,98,98,0.14)' },
};

function todayLocal() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

function currentMonth() {
  const d = new Date();
  return { month: d.getMonth() + 1, year: d.getFullYear() };
}

function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.pending;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', borderRadius: 999, padding: '2px 7px', fontSize: 10, fontWeight: 500, color: s.color, background: s.bg }}>
      {s.label}
    </span>
  );
}

function TabBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{ border: 'none', background: active ? C.accentMuted : 'transparent', color: active ? C.accent : C.text2, borderRadius: 5, padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
      {children}
    </button>
  );
}

function Kpi({ label, value, sub, color = C.text0 }) {
  return (
    <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 5, padding: 12 }}>
      <div style={{ fontSize: 10, color: C.text2, marginBottom: 5 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 600, color, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: C.text2, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

export default function HoursView() {
  const { queues } = useAdmin();
  const [{ month, year }, setPeriod] = useState(currentMonth);
  const [tab, setTab] = useState('load');
  const [entries, setEntries] = useState([]);
  const [stats, setStats] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [form, setForm] = useState({ date: todayLocal(), project_id: '', hours: 1, description: '' });
  const descriptionRef = useRef(null);

  const activeProjects = queues.filter(q => q.active);
  const projectId = form.project_id || activeProjects[0]?.id || '';
  const monthParam = `month=${month}&year=${year}`;

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [list, statRes] = await Promise.all([
        api.get(`/hours?${monthParam}&limit=300`),
        api.get(`/hours/stats?${monthParam}`),
      ]);
      setEntries(list.entries);
      setStats(statRes.stats);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [month, year]);

  useEffect(() => {
    const el = descriptionRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 360)}px`;
  }, [form.description]);

  const dailyTotal = useMemo(() => (
    entries.filter(e => e.date === form.date).reduce((sum, e) => sum + Number(e.hours || 0), 0)
  ), [entries, form.date]);

  function validate() {
    if (!form.date) return 'La fecha es obligatoria';
    if (!projectId) return 'Seleccioná un proyecto';
    if (!form.description.trim()) return 'La descripción es obligatoria';
    if (Number(form.hours) < 0.25 || Number(form.hours) > 24) return 'Las horas deben estar entre 0.25 y 24';
    if (dailyTotal + Number(form.hours) > 24) return `No podés superar 24 horas ese día. Ya cargaste ${dailyTotal.toFixed(2)} h.`;
    return '';
  }

  async function submit(e) {
    e.preventDefault();
    const msg = validate();
    if (msg) return setError(msg);
    setSaving(true);
    setError('');
    setOk('');
    try {
      await api.post('/hours', { ...form, project_id: projectId, hours: Number(form.hours) });
      setForm(p => ({ ...p, hours: 1, description: '' }));
      setOk('Horas cargadas y pendientes de aprobación.');
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  const maxProjectHours = Math.max(...(stats?.by_project || []).map(p => p.hours), 1);
  const inputStyle = { ...iS, fontSize: 14, padding: '10px 12px', height: 42, minHeight: 42, boxSizing: 'border-box' };
  const labelStyle = { fontSize: 11, marginBottom: 7 };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 24px', borderBottom: `1px solid ${C.border}`, background: C.bg1, flexShrink: 0, flexWrap: 'wrap' }}>
        <TabBtn active={tab === 'load'} onClick={() => setTab('load')}>Carga</TabBtn>
        <TabBtn active={tab === 'history'} onClick={() => setTab('history')}>Historial de Horas</TabBtn>
        <TabBtn active={tab === 'stats'} onClick={() => setTab('stats')}>Estadísticas</TabBtn>
        {tab !== 'load' && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
            <select value={month} onChange={e => setPeriod(p => ({ ...p, month: Number(e.target.value) }))} style={{ ...iS, width: 142, padding: '8px 10px', fontSize: 13 }}>
              {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{new Date(2026, i, 1).toLocaleString('es-AR', { month: 'long' })}</option>)}
            </select>
            <input type="number" value={year} onChange={e => setPeriod(p => ({ ...p, year: Number(e.target.value) || p.year }))} style={{ ...iS, width: 96, padding: '8px 10px', fontSize: 13 }} />
          </div>
        )}
      </div>

      {error && <div style={{ padding: '8px 18px', color: C.red, fontSize: 11, borderBottom: `1px solid ${C.border}` }}>{error}</div>}
      {ok && <div style={{ padding: '8px 18px', color: C.green, fontSize: 11, borderBottom: `1px solid ${C.border}` }}>{ok}</div>}

      {tab === 'load' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px 36px', maxWidth: 860, width: '100%', margin: '0 auto' }}>
          <div style={{ fontSize: 22, fontWeight: 650, color: C.text0, marginBottom: 4 }}>Carga de Horas</div>
          <div style={{ fontSize: 14, color: C.text2, marginBottom: 28 }}>Registrá horas trabajadas por proyecto</div>

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
              <FormField label="Fecha" labelStyle={labelStyle}>
                <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} style={inputStyle} />
              </FormField>
              <FormField label="Proyecto" labelStyle={labelStyle}>
                <select value={projectId} onChange={e => setForm(p => ({ ...p, project_id: e.target.value }))} style={inputStyle}>
                  {activeProjects.map(q => <option key={q.id} value={q.id}>{q.name}</option>)}
                </select>
              </FormField>
            </div>

            <FormField label={`Cantidad de horas · ${Number(form.hours).toFixed(2)} h`} labelStyle={labelStyle}>
              <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 6, padding: '14px 16px' }}>
                <input type="range" min="1" max="96" step="1" value={Math.round(Number(form.hours) * 4)} onChange={e => setForm(p => ({ ...p, hours: Number(e.target.value) / 4 }))} style={{ width: '100%', height: 24 }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: C.text2, marginTop: 8 }}>
                <span>0.25 h</span>
                <span>Total del día: {dailyTotal.toFixed(2)} h</span>
                <span>24 h</span>
                </div>
              </div>
            </FormField>

            <FormField label="Descripción" labelStyle={labelStyle}>
              <textarea
                ref={descriptionRef}
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                rows={8}
                placeholder="Detalle del trabajo realizado…"
                style={{ ...inputStyle, height: 'auto', minHeight: 190, maxHeight: 360, overflowY: 'auto', resize: 'vertical', lineHeight: 1.55 }}
              />
            </FormField>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button type="button" onClick={() => setForm({ date: todayLocal(), project_id: '', hours: 1, description: '' })} style={{ background: 'transparent', border: `1px solid ${C.border}`, color: C.text2, fontSize: 13, padding: '10px 18px', borderRadius: 5, cursor: 'pointer' }}>Limpiar</button>
              <button disabled={saving} style={{ background: saving ? C.bg3 : C.accent, border: 'none', color: '#fff', fontSize: 13, fontWeight: 600, padding: '10px 20px', borderRadius: 5, cursor: saving ? 'default' : 'pointer' }}>
                {saving ? 'Guardando…' : 'Guardar horas'}
              </button>
            </div>
          </form>
        </div>
      )}

      {tab === 'history' && (
        <HoursTable entries={entries} loading={loading} onSelect={setSelected} />
      )}

      {tab === 'stats' && stats && (
        <div style={{ flex: 1, overflowY: 'auto', padding: 22 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8, marginBottom: 14 }}>
            <Kpi label="Total del mes" value={`${stats.total_hours} h`} />
            <Kpi label="Pendientes" value={`${stats.pending_hours} h`} color={C.amber} />
            <Kpi label="Rechazadas" value={`${stats.rejected_hours} h`} color={C.red} />
            <Kpi label="Tasa aprobada" value={`${stats.approved_rate}%`} sub={`${stats.approved_hours} h aprobadas`} color={stats.approved_rate >= 70 ? C.green : C.amber} />
            <Kpi label="Promedio diario" value={`${stats.average_daily_hours} h`} sub={stats.top_day ? `Pico: ${stats.top_day.date} · ${stats.top_day.hours} h` : 'Sin cargas'} />
          </div>

          <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 5, padding: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: C.text0, marginBottom: 13 }}>Horas por proyecto</div>
            {stats.by_project.length === 0 && <div style={{ fontSize: 11, color: C.text2 }}>Sin datos en el mes seleccionado</div>}
            {stats.by_project.map(p => (
              <div key={p.project_id} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 52px', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: C.text1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.project_name}</span>
                <div style={{ height: 14, background: C.bg3, borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(p.hours / maxProjectHours) * 100}%`, background: p.project_color || C.accent, borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: 11, color: C.text0, fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}>{p.hours} h</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {selected && (
        <HourDetail entry={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

export function HoursTable({ entries, loading, onSelect, admin = false, actions }) {
  const cols = admin ? '110px 140px 130px 1fr 82px 96px 150px' : '116px 150px 82px 1fr 96px';
  const minWidth = admin ? 900 : 680;
  const headers = admin ? ['Fecha', 'Usuario', 'Proyecto', 'Horas', 'Descripción', 'Estado', 'Acciones'] : ['Fecha', 'Proyecto', 'Horas', 'Descripción', 'Estado'];
  return (
    <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'grid', gridTemplateColumns: cols, minWidth, padding: '6px 18px', borderBottom: `1px solid ${C.border}`, background: C.bg1 }}>
        {headers.map(h => <div key={h} style={{ fontSize: 9, fontWeight: 600, color: C.text2, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</div>)}
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading && <div style={{ padding: 22, fontSize: 12, color: C.text2 }}>Cargando horas…</div>}
        {!loading && entries.length === 0 && <div style={{ padding: 22, fontSize: 12, color: C.text2 }}>Sin registros para los filtros seleccionados.</div>}
        {!loading && entries.map((e, i) => (
          <div key={e.id} onClick={() => onSelect?.(e)} style={{ display: 'grid', gridTemplateColumns: cols, minWidth, padding: '8px 18px', borderBottom: `1px solid ${C.border}`, background: i % 2 ? 'rgba(128,100,80,0.03)' : 'transparent', alignItems: 'center', cursor: 'pointer' }}>
            <div style={{ fontSize: 11, color: C.text1 }}>{e.date}</div>
            {admin && <div style={{ fontSize: 11, color: C.text1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.user_name}</div>}
            <div style={{ fontSize: 11, color: C.text1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.project_name}</div>
            <div style={{ fontSize: 12, color: C.text0, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{Number(e.hours).toFixed(2)}</div>
            <div style={{ fontSize: 11, color: C.text1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.description}</div>
            <div><StatusBadge status={e.status} /></div>
            {admin && <div onClick={ev => ev.stopPropagation()}>{actions?.(e)}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function HourDetail({ entry, onClose }) {
  return (
    <Modal title={`Detalle de horas · ${entry.date}`} onClose={onClose} width={760}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
          <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 6, padding: '14px 16px' }}>
            <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.text2, marginBottom: 6 }}>Horas</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: C.text0, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{Number(entry.hours).toFixed(2)} h</div>
          </div>
          <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 6, padding: '14px 16px' }}>
            <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.text2, marginBottom: 8 }}>Estado</div>
            <StatusBadge status={entry.status} />
          </div>
          <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 6, padding: '14px 16px' }}>
            <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.text2, marginBottom: 6 }}>Proyecto</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: C.text0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.project_name}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '12px 18px', fontSize: 14, background: C.bg0, border: `1px solid ${C.border}`, borderRadius: 6, padding: 18 }}>
          <div style={{ color: C.text2, fontWeight: 600 }}>Fecha</div>
          <div style={{ color: C.text0 }}>{entry.date}</div>
          {entry.user_name && (
            <>
              <div style={{ color: C.text2, fontWeight: 600 }}>Usuario</div>
              <div style={{ color: C.text0 }}>{entry.user_name}</div>
            </>
          )}
          <div style={{ color: C.text2, fontWeight: 600 }}>Creado</div>
          <div style={{ color: C.text0 }}>{entry.created_at ? new Date(entry.created_at).toLocaleString('es-AR') : '—'}</div>
          {entry.reviewer_name && (
            <>
              <div style={{ color: C.text2, fontWeight: 600 }}>Revisado por</div>
              <div style={{ color: C.text0 }}>{entry.reviewer_name}</div>
            </>
          )}
          {entry.reviewed_at && (
            <>
              <div style={{ color: C.text2, fontWeight: 600 }}>Fecha revisión</div>
              <div style={{ color: C.text0 }}>{new Date(entry.reviewed_at).toLocaleString('es-AR')}</div>
            </>
          )}
        </div>

        <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 6, padding: 18 }}>
          <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.text2, marginBottom: 10 }}>Descripción del trabajo</div>
          <div style={{ color: C.text0, fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', wordBreak: 'break-word', maxHeight: 260, overflowY: 'auto', paddingRight: 8 }}>
            {entry.description}
          </div>
        </div>

        {entry.rejection_comment && (
          <div style={{ background: 'rgba(196,98,98,0.10)', border: '1px solid rgba(196,98,98,0.35)', borderRadius: 6, padding: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.red, marginBottom: 8 }}>Comentario de rechazo</div>
            <div style={{ color: C.red, fontSize: 13, lineHeight: 1.6 }}>{entry.rejection_comment}</div>
          </div>
        )}
      </div>
    </Modal>
  );
}
