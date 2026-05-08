import { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { PRI_CFG } from '../constants';
import { C, iS } from '../styles/tokens';
import Modal from '../components/ui/Modal';
import FormField from '../components/forms/FormField';
import PriBadge from '../components/ui/PriBadge';

const EMPTY = { name: '', priority: 'medium', dept: 'all', r1: '', res: '', esc: '' };

function Toggle({ on, onToggle }) {
  return (
    <button
      onClick={onToggle}
      style={{ width: 30, height: 16, borderRadius: 8, border: 'none', cursor: 'pointer', background: on ? 'var(--accent)' : C.bg3, position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}
    >
      <span style={{ position: 'absolute', top: 2, left: on ? 14 : 2, width: 12, height: 12, borderRadius: '50%', background: '#fff', transition: 'left 0.18s' }} />
    </button>
  );
}

function TimeInput({ label, value, onChange }) {
  return (
    <FormField label={label}>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="ej: 4h, 30m, 2d"
        style={{ ...iS, width: '100%', fontFamily: 'IBM Plex Mono' }}
      />
    </FormField>
  );
}

export default function SLAView({ role }) {
  const { slaRules, addSlaRule, updateSlaRule, removeSlaRule, toggleSlaRule } = useAdmin();
  const isAdmin = role === 'admin';

  const [modal,   setModal]   = useState(null);
  const [form,    setForm]    = useState(EMPTY);
  const [confirm, setConfirm] = useState(null);
  const [error,   setError]   = useState('');
  const [delErr,  setDelErr]  = useState('');

  function openAdd()   { setForm(EMPTY); setModal('add'); setError(''); }
  function openEdit(r) { setForm({ id: r.id, name: r.name, priority: r.priority, dept: r.dept || 'all', r1: r.r1 || '', res: r.res || '', esc: r.esc || '' }); setModal('edit'); setError(''); }
  function closeModal(){ setModal(null); setError(''); }
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  async function save() {
    if (!form.name.trim() || !form.priority) return;
    try {
      const payload = { name: form.name, priority: form.priority, dept: form.dept || 'all', r1: form.r1 || null, res: form.res || null, esc: form.esc || null };
      if (modal === 'add') await addSlaRule(payload);
      else                 await updateSlaRule({ ...payload, id: form.id });
      closeModal();
    } catch (e) { setError(e.message); }
  }

  const COLS = isAdmin ? '1fr 80px 60px 96px 96px 96px 52px 90px' : '1fr 80px 60px 96px 96px 96px 52px';
  const HEADERS = isAdmin
    ? ['Regla', 'Prioridad', 'Área', '1ª Resp.', 'Resolución', 'Escalar', 'On', '']
    : ['Regla', 'Prioridad', 'Área', '1ª Resp.', 'Resolución', 'Escalar', 'On'];

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '22px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 500, color: C.text0, marginBottom: 1 }}>Reglas de SLA</div>
          <div style={{ fontSize: 11, color: C.text2 }}>{slaRules.length} reglas · {slaRules.filter(r => r.active).length} activas</div>
        </div>
        {isAdmin && (
          <button onClick={openAdd} style={{ background: 'var(--accent)', border: 'none', color: '#fff', fontSize: 11, fontWeight: 500, padding: '6px 14px', borderRadius: 4, cursor: 'pointer' }}>
            + Nueva regla
          </button>
        )}
      </div>

      <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 6, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: COLS, padding: '6px 14px', borderBottom: `1px solid ${C.border}`, background: C.bg3, gap: 8 }}>
          {HEADERS.map(h => <div key={h} style={{ fontSize: 9, fontWeight: 600, color: C.text2, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</div>)}
        </div>

        {delErr && (
          <div style={{ padding: '8px 14px', fontSize: 11, color: 'var(--red)', background: 'rgba(200,80,80,0.08)', borderBottom: `1px solid ${C.border}` }}>
            {delErr}
          </div>
        )}

        {slaRules.length === 0 && (
          <div style={{ padding: '24px', textAlign: 'center', fontSize: 12, color: C.text2 }}>Sin reglas configuradas</div>
        )}

        {slaRules.map((r, i) => {
          const border = i < slaRules.length - 1 ? `1px solid ${C.border}` : 'none';
          if (confirm === r.id) {
            return (
              <div key={r.id} style={{ padding: '10px 14px', borderBottom: border, display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(200,80,80,0.04)' }}>
                <span style={{ fontSize: 11, color: C.text1, flex: 1 }}>
                  ¿Eliminar regla <b style={{ color: C.text0 }}>{r.name}</b>?
                </span>
                <button
                  onClick={async () => {
                    setDelErr('');
                    try { await removeSlaRule(r.id); setConfirm(null); }
                    catch (e) { setDelErr(e.message); setConfirm(null); }
                  }}
                  style={{ fontSize: 10, fontWeight: 500, color: '#fff', background: 'var(--red)', border: 'none', borderRadius: 3, padding: '3px 10px', cursor: 'pointer' }}
                >
                  Eliminar
                </button>
                <button onClick={() => setConfirm(null)} style={{ fontSize: 10, color: C.text2, background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 3, padding: '3px 10px', cursor: 'pointer' }}>
                  Cancelar
                </button>
              </div>
            );
          }
          return (
            <div key={r.id} style={{ display: 'grid', gridTemplateColumns: COLS, padding: '10px 14px', borderBottom: border, alignItems: 'center', gap: 8, opacity: r.active ? 1 : 0.4, transition: 'opacity 0.2s' }}>
              <div style={{ fontSize: 12, color: C.text0 }}>{r.name}</div>
              <PriBadge priority={r.priority} />
              <div style={{ fontSize: 11, color: C.text1 }}>{r.dept || 'all'}</div>
              <div style={{ fontSize: 11, fontFamily: 'IBM Plex Mono', color: 'var(--teal)' }}>{r.r1 || '—'}</div>
              <div style={{ fontSize: 11, fontFamily: 'IBM Plex Mono', color: 'var(--blue)' }}>{r.res || '—'}</div>
              <div style={{ fontSize: 11, fontFamily: 'IBM Plex Mono', color: 'var(--amber)' }}>{r.esc || '—'}</div>
              <Toggle on={r.active} onToggle={() => toggleSlaRule(r.id)} />
              {isAdmin && (
                <div style={{ display: 'flex', gap: 4 }}>
                  <ActionBtn label="Editar"   onClick={() => openEdit(r)} />
                  <ActionBtn label="Eliminar" danger onClick={() => { setDelErr(''); setConfirm(r.id); }} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {modal && (
        <Modal title={modal === 'add' ? 'Nueva regla SLA' : 'Editar regla SLA'} onClose={closeModal} width={460}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <FormField label="Nombre de la regla">
              <input value={form.name} onChange={e => f('name', e.target.value)} placeholder="Ej: Urgente — producción" style={{ ...iS, width: '100%' }} autoFocus />
            </FormField>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <FormField label="Prioridad">
                <select value={form.priority} onChange={e => f('priority', e.target.value)} style={{ ...iS, width: '100%' }}>
                  {Object.entries(PRI_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </FormField>
              <FormField label="Área / Dept">
                <input value={form.dept} onChange={e => f('dept', e.target.value)} placeholder="all, Dev, HR…" style={{ ...iS, width: '100%' }} />
              </FormField>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              <TimeInput label="1ª Respuesta" value={form.r1}  onChange={v => f('r1',  v)} />
              <TimeInput label="Resolución"   value={form.res} onChange={v => f('res', v)} />
              <TimeInput label="Escalar en"   value={form.esc} onChange={v => f('esc', v)} />
            </div>

            <div style={{ fontSize: 10, color: C.text2, background: C.bg0, border: `1px solid ${C.border}`, borderRadius: 4, padding: '7px 10px' }}>
              Formatos válidos: <span style={{ fontFamily: 'IBM Plex Mono' }}>30m · 1h · 4h · 2d</span>
            </div>

            {error && <div style={{ fontSize: 11, color: 'var(--red)' }}>{error}</div>}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={closeModal} style={{ background: 'transparent', border: `1px solid ${C.border}`, color: C.text2, fontSize: 11, padding: '5px 14px', borderRadius: 4, cursor: 'pointer' }}>Cancelar</button>
              <button onClick={save} disabled={!form.name.trim()} style={{ background: form.name.trim() ? 'var(--accent)' : C.bg3, border: 'none', color: form.name.trim() ? '#fff' : C.text2, fontSize: 11, fontWeight: 500, padding: '5px 16px', borderRadius: 4, cursor: form.name.trim() ? 'pointer' : 'default', transition: 'all 0.15s' }}>
                Guardar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function ActionBtn({ label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      style={{ fontSize: 10, color: danger ? 'var(--red)' : C.text1, background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 3, padding: '2px 6px', cursor: 'pointer', transition: 'all 0.12s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = danger ? 'var(--red)' : 'var(--accent)'; e.currentTarget.style.color = danger ? 'var(--red)' : 'var(--accent)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = danger ? 'var(--red)' : C.text1; }}
    >
      {label}
    </button>
  );
}
