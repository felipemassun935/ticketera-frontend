import { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { C, iS } from '../styles/tokens';
import Modal from '../components/ui/Modal';
import FormField from '../components/forms/FormField';

const PALETTE = [
  '#c46262','#c98c4a','#6892b4','#888888',
  '#CF7452','#5ca89a','#78b07a','#9b78b0',
  '#6b8fbe','#a87d52','#5e9e8a','#b06b8a',
];

const EMPTY = { id: '', label: '', color: '#6892b4', r1: '', res: '', esc: '' };

function ColorPicker({ value, onChange }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {PALETTE.map(c => (
        <button key={c} type="button" onClick={() => onChange(c)} style={{ width: 22, height: 22, borderRadius: '50%', background: c, border: 'none', cursor: 'pointer', outline: value === c ? `2px solid ${C.text0}` : '2px solid transparent', outlineOffset: 2, transition: 'outline 0.1s' }} />
      ))}
    </div>
  );
}

function Toggle({ on, onToggle }) {
  return (
    <button onClick={onToggle} style={{ width: 30, height: 16, borderRadius: 8, border: 'none', cursor: 'pointer', background: on ? 'var(--accent)' : C.bg3, position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
      <span style={{ position: 'absolute', top: 2, left: on ? 14 : 2, width: 12, height: 12, borderRadius: '50%', background: '#fff', transition: 'left 0.18s' }} />
    </button>
  );
}

function TimeInput({ label, value, onChange }) {
  return (
    <FormField label={label}>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder="ej: 4h, 30m" style={{ ...iS, width: '100%', fontFamily: 'IBM Plex Mono' }} />
    </FormField>
  );
}

export default function SLAView({ role }) {
  const { priorities, addPriority, updatePriority, removePriority, togglePriority } = useAdmin();
  const isAdmin = role === 'admin';

  const [modal,   setModal]   = useState(null);
  const [form,    setForm]    = useState(EMPTY);
  const [confirm, setConfirm] = useState(null);
  const [error,   setError]   = useState('');
  const [delErr,  setDelErr]  = useState('');

  function openAdd()   { setForm(EMPTY); setModal('add'); setError(''); }
  function openEdit(p) { setForm({ id: p.id, label: p.label, color: p.color, r1: p.r1 || '', res: p.res || '', esc: p.esc || '' }); setModal('edit'); setError(''); }
  function closeModal(){ setModal(null); setError(''); }
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  async function save() {
    if (!form.label.trim()) return;
    try {
      const slug = form.id || form.label.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
      const payload = { id: slug, label: form.label, color: form.color, r1: form.r1 || null, res: form.res || null, esc: form.esc || null };
      if (modal === 'add') await addPriority(payload);
      else                 await updatePriority({ ...payload, id: form.id });
      closeModal();
    } catch (e) { setError(e.message); }
  }

  const COLS = isAdmin ? '16px 1fr 100px 86px 86px 86px 46px 90px' : '16px 1fr 100px 86px 86px 86px 46px';
  const HEADERS = ['', 'Nombre', 'Color', '1ª Resp.', 'Resolución', 'Escalar', 'On', ...(isAdmin ? [''] : [])];

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '22px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 500, color: C.text0, marginBottom: 1 }}>Prioridades y SLA</div>
          <div style={{ fontSize: 11, color: C.text2 }}>{priorities.length} prioridades · {priorities.filter(p => p.active).length} activas</div>
        </div>
        {isAdmin && (
          <button onClick={openAdd} style={{ background: 'var(--accent)', border: 'none', color: '#fff', fontSize: 11, fontWeight: 500, padding: '6px 14px', borderRadius: 4, cursor: 'pointer' }}>
            + Nueva prioridad
          </button>
        )}
      </div>

      <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 6, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: COLS, padding: '6px 14px', borderBottom: `1px solid ${C.border}`, background: C.bg3, gap: 10, alignItems: 'center' }}>
          {HEADERS.map((h, i) => <div key={i} style={{ fontSize: 9, fontWeight: 600, color: C.text2, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</div>)}
        </div>

        {delErr && (
          <div style={{ padding: '8px 14px', fontSize: 11, color: 'var(--red)', background: 'rgba(200,80,80,0.08)', borderBottom: `1px solid ${C.border}` }}>
            {delErr}
          </div>
        )}

        {priorities.length === 0 && (
          <div style={{ padding: '24px', textAlign: 'center', fontSize: 12, color: C.text2 }}>Sin prioridades configuradas</div>
        )}

        {priorities.map((p, i) => {
          const border = i < priorities.length - 1 ? `1px solid ${C.border}` : 'none';
          if (confirm === p.id) {
            return (
              <div key={p.id} style={{ padding: '10px 14px', borderBottom: border, display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(200,80,80,0.04)' }}>
                <span style={{ fontSize: 11, color: C.text1, flex: 1 }}>
                  ¿Eliminar prioridad <b style={{ color: C.text0 }}>{p.label}</b>?
                </span>
                <button
                  onClick={async () => {
                    setDelErr('');
                    try { await removePriority(p.id); setConfirm(null); }
                    catch (e) { setDelErr(e.message); setConfirm(null); }
                  }}
                  style={{ fontSize: 10, fontWeight: 500, color: '#fff', background: 'var(--red)', border: 'none', borderRadius: 3, padding: '3px 10px', cursor: 'pointer' }}
                >Eliminar</button>
                <button onClick={() => setConfirm(null)} style={{ fontSize: 10, color: C.text2, background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 3, padding: '3px 10px', cursor: 'pointer' }}>Cancelar</button>
              </div>
            );
          }
          return (
            <div key={p.id} style={{ display: 'grid', gridTemplateColumns: COLS, padding: '10px 14px', gap: 10, alignItems: 'center', borderBottom: border, opacity: p.active ? 1 : 0.4, transition: 'opacity 0.2s' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: p.color, display: 'inline-block', flexShrink: 0 }} />
              <span style={{ fontSize: 12, fontWeight: 500, color: p.color }}>{p.label}</span>
              <span style={{ fontSize: 10, fontFamily: 'IBM Plex Mono', color: C.text2 }}>{p.id}</span>
              <span style={{ fontSize: 11, fontFamily: 'IBM Plex Mono', color: 'var(--teal)' }}>{p.r1 || '—'}</span>
              <span style={{ fontSize: 11, fontFamily: 'IBM Plex Mono', color: 'var(--blue)' }}>{p.res || '—'}</span>
              <span style={{ fontSize: 11, fontFamily: 'IBM Plex Mono', color: 'var(--amber)' }}>{p.esc || '—'}</span>
              <Toggle on={p.active} onToggle={() => togglePriority(p.id)} />
              {isAdmin && (
                <div style={{ display: 'flex', gap: 4 }}>
                  <ActionBtn label="Editar"   onClick={() => openEdit(p)} />
                  <ActionBtn label="Eliminar" danger onClick={() => { setDelErr(''); setConfirm(p.id); }} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {modal && (
        <Modal title={modal === 'add' ? 'Nueva prioridad' : `Editar — ${form.label}`} onClose={closeModal} width={420}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <FormField label="Nombre">
              <input value={form.label} onChange={e => f('label', e.target.value)} placeholder="Ej: Urgente, Alta, Media…" style={{ ...iS, width: '100%' }} autoFocus />
            </FormField>

            {modal === 'add' && (
              <FormField label="ID (slug)">
                <input
                  value={form.id || form.label.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')}
                  onChange={e => f('id', e.target.value)}
                  placeholder="se genera automáticamente"
                  style={{ ...iS, width: '100%', fontFamily: 'IBM Plex Mono', fontSize: 11 }}
                />
                <div style={{ fontSize: 10, color: C.text2, marginTop: 3 }}>Este ID se almacena en los tickets y no se puede cambiar después.</div>
              </FormField>
            )}

            <FormField label="Color">
              <ColorPicker value={form.color} onChange={c => f('color', c)} />
            </FormField>

            <div style={{ fontSize: 11, fontWeight: 500, color: C.text1, marginBottom: -6 }}>Tiempos de SLA</div>
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
              <button onClick={save} disabled={!form.label.trim()} style={{ background: form.label.trim() ? 'var(--accent)' : C.bg3, border: 'none', color: form.label.trim() ? '#fff' : C.text2, fontSize: 11, fontWeight: 500, padding: '5px 16px', borderRadius: 4, cursor: form.label.trim() ? 'pointer' : 'default', transition: 'all 0.15s' }}>
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
    <button onClick={onClick}
      style={{ fontSize: 10, color: danger ? 'var(--red)' : C.text1, background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 3, padding: '2px 6px', cursor: 'pointer', transition: 'all 0.12s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = danger ? 'var(--red)' : 'var(--accent)'; e.currentTarget.style.color = danger ? 'var(--red)' : 'var(--accent)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = danger ? 'var(--red)' : C.text1; }}
    >{label}</button>
  );
}
