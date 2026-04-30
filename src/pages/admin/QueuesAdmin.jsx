import { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { C, iS } from '../../styles/tokens';
import Modal from '../../components/ui/Modal';
import FormField from '../../components/forms/FormField';

const PALETTE = [
  '#CF7452','#5ca89a','#6892b4','#c98c4a',
  '#78b07a','#9b78b0','#c46262','#6b8fbe',
  '#a87d52','#5e9e8a','#b06b8a','#7a9e5e',
];

const EMPTY = { id: '', name: '', owner_name: '', color: '#CF7452' };

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

function ConfirmDelete({ name, onConfirm, onCancel }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 11, color: C.text1 }}>¿Eliminar <b style={{ color: C.text0 }}>{name}</b>?</span>
      <button onClick={onConfirm} style={{ fontSize: 10, fontWeight: 500, color: '#fff', background: 'var(--red)', border: 'none', borderRadius: 3, padding: '2px 8px', cursor: 'pointer' }}>Sí</button>
      <button onClick={onCancel}  style={{ fontSize: 10, color: C.text2, background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 3, padding: '2px 8px', cursor: 'pointer' }}>No</button>
    </div>
  );
}

export default function QueuesAdmin() {
  const { queues, addQueue, updateQueue, removeQueue, toggleQueue, users } = useAdmin();
  const [modal,   setModal]   = useState(null);
  const [form,    setForm]    = useState(EMPTY);
  const [confirm, setConfirm] = useState(null);
  const [error,   setError]   = useState('');

  const agents = users.filter(u => ['admin','agent'].includes(u.role_id) && u.active);

  function openAdd()   { setForm(EMPTY); setModal('add'); setError(''); }
  function openEdit(q) { setForm({ id: q.id, name: q.name, owner_name: q.owner_name || '', color: q.color }); setModal('edit'); setError(''); }
  function closeModal(){ setModal(null); setError(''); }

  async function save() {
    if (!form.name.trim()) return;
    try {
      const payload = {
        ...form,
        id: form.id || form.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
      };
      if (modal === 'add') await addQueue(payload);
      else                 await updateQueue(payload);
      closeModal();
    } catch (e) { setError(e.message); }
  }

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const COLS = '18px 1fr 140px 70px 42px 100px';

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '22px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 500, color: C.text0, marginBottom: 2 }}>Bandejas</div>
          <div style={{ fontSize: 11, color: C.text2 }}>{queues.length} bandejas · {queues.filter(q => q.active).length} activas</div>
        </div>
        <button onClick={openAdd} style={{ background: 'var(--accent)', border: 'none', color: '#fff', fontSize: 11, fontWeight: 500, padding: '6px 14px', borderRadius: 4, cursor: 'pointer' }}>
          + Nueva bandeja
        </button>
      </div>

      <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 6, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: COLS, padding: '6px 14px', borderBottom: `1px solid ${C.border}`, background: C.bg3, gap: 12, alignItems: 'center' }}>
          {['','Nombre','Responsable','Tickets','Activa',''].map((h, i) => (
            <div key={i} style={{ fontSize: 9, fontWeight: 600, color: C.text2, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</div>
          ))}
        </div>

        {queues.map((q, i) => (
          <div key={q.id} style={{ display: 'grid', gridTemplateColumns: COLS, padding: '10px 14px', gap: 12, alignItems: 'center', borderBottom: i < queues.length - 1 ? `1px solid ${C.border}` : 'none', opacity: q.active ? 1 : 0.45, transition: 'opacity 0.2s' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: q.color, display: 'inline-block', flexShrink: 0 }} />
            <span style={{ fontSize: 12, fontWeight: 500, color: C.text0 }}>{q.name}</span>
            <span style={{ fontSize: 11, color: C.text1 }}>{q.owner_name || '—'}</span>
            <span style={{ fontSize: 11, color: C.text2 }}>{q.ticket_count ?? '—'}</span>
            <Toggle on={q.active} onToggle={() => toggleQueue(q.id)} />
            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
              {confirm === q.id ? (
                <ConfirmDelete name={q.name} onConfirm={async () => { try { await removeQueue(q.id); } catch {} setConfirm(null); }} onCancel={() => setConfirm(null)} />
              ) : (
                <>
                  <ActionBtn label="Editar"    onClick={() => openEdit(q)} />
                  <ActionBtn label="Eliminar"  danger onClick={() => setConfirm(q.id)} />
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <Modal title={modal === 'add' ? 'Nueva bandeja' : 'Editar bandeja'} onClose={closeModal} width={400}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <FormField label="Nombre">
              <input value={form.name} onChange={e => f('name', e.target.value)} placeholder="Nombre de la bandeja" style={{ ...iS, width: '100%' }} autoFocus />
            </FormField>
            <FormField label="Responsable">
              <select value={form.owner_name} onChange={e => f('owner_name', e.target.value)} style={{ ...iS, width: '100%' }}>
                <option value="">Sin asignar</option>
                {agents.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
              </select>
            </FormField>
            <FormField label="Color">
              <ColorPicker value={form.color} onChange={c => f('color', c)} />
            </FormField>
            {error && <div style={{ fontSize: 11, color: 'var(--red)' }}>{error}</div>}
            <ModalActions onCancel={closeModal} onSave={save} disabled={!form.name.trim()} />
          </div>
        </Modal>
      )}
    </div>
  );
}

function ActionBtn({ label, onClick, danger }) {
  return (
    <button onClick={onClick} style={{ fontSize: 10, color: danger ? 'var(--red)' : C.text1, background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 3, padding: '2px 8px', cursor: 'pointer', transition: 'all 0.12s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = danger ? 'var(--red)' : 'var(--accent)'; e.currentTarget.style.color = danger ? 'var(--red)' : 'var(--accent)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = danger ? 'var(--red)' : 'var(--text1)'; }}
    >{label}</button>
  );
}

function ModalActions({ onCancel, onSave, disabled }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
      <button onClick={onCancel} style={{ background: 'transparent', border: `1px solid ${C.border}`, color: C.text2, fontSize: 11, padding: '5px 14px', borderRadius: 4, cursor: 'pointer' }}>Cancelar</button>
      <button onClick={onSave} disabled={disabled} style={{ background: disabled ? C.bg3 : 'var(--accent)', border: 'none', color: disabled ? C.text2 : '#fff', fontSize: 11, fontWeight: 500, padding: '5px 16px', borderRadius: 4, cursor: disabled ? 'default' : 'pointer', transition: 'all 0.15s' }}>Guardar</button>
    </div>
  );
}
