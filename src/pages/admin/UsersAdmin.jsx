import { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { C, iS } from '../../styles/tokens';
import Modal from '../../components/ui/Modal';
import FormField from '../../components/forms/FormField';
import Avatar from '../../components/ui/Avatar';

const EMPTY = { name: '', email: '', role_id: 'agent', password: '' };

function Toggle({ on, onToggle }) {
  return (
    <button onClick={onToggle} style={{ width: 30, height: 16, borderRadius: 8, border: 'none', cursor: 'pointer', background: on ? 'var(--accent)' : C.bg3, position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
      <span style={{ position: 'absolute', top: 2, left: on ? 14 : 2, width: 12, height: 12, borderRadius: '50%', background: '#fff', transition: 'left 0.18s' }} />
    </button>
  );
}

function RolePill({ roleId, roles }) {
  const r = roles.find(x => x.id === roleId);
  return (
    <span style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: r?.color || C.text2, background: (r?.color || '#888') + '18', border: `1px solid ${(r?.color || '#888')}44`, borderRadius: 3, padding: '2px 6px' }}>
      {r?.label || roleId}
    </span>
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

export default function UsersAdmin() {
  const { users, addUser, updateUser, removeUser, toggleUser, roles } = useAdmin();
  const [modal,   setModal]   = useState(null);
  const [form,    setForm]    = useState(EMPTY);
  const [confirm, setConfirm] = useState(null);
  const [search,  setSearch]  = useState('');
  const [roleF,   setRoleF]   = useState('all');
  const [error,   setError]   = useState('');

  function openAdd()   { setForm(EMPTY); setModal('add'); setError(''); }
  function openEdit(u) { setForm({ id: u.id, name: u.name, email: u.email, role_id: u.role_id, password: '' }); setModal('edit'); setError(''); }
  function closeModal(){ setModal(null); setError(''); }

  async function save() {
    if (!form.name.trim() || !form.email.trim()) return;
    try {
      if (modal === 'add') await addUser(form);
      else                 await updateUser(form);
      closeModal();
    } catch (e) { setError(e.message); }
  }

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  let rows = [...users];
  if (roleF !== 'all') rows = rows.filter(u => u.role_id === roleF);
  if (search) rows = rows.filter(u => [u.name, u.email].join(' ').toLowerCase().includes(search.toLowerCase()));

  const COLS = '200px 1fr 90px 42px 120px';

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '22px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 500, color: C.text0, marginBottom: 2 }}>Usuarios</div>
          <div style={{ fontSize: 11, color: C.text2 }}>{users.length} usuarios · {users.filter(u => u.active).length} activos</div>
        </div>
        <button onClick={openAdd} style={{ background: 'var(--accent)', border: 'none', color: '#fff', fontSize: 11, fontWeight: 500, padding: '6px 14px', borderRadius: 4, cursor: 'pointer' }}>
          + Nuevo usuario
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center' }}>
        <div style={{ position: 'relative', width: 220 }}>
          <svg style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)' }} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--text2)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar…" style={{ ...iS, paddingLeft: 24, fontSize: 11 }} />
        </div>
        <div style={{ display: 'flex', gap: 1 }}>
          {['all', ...roles.map(r => r.id)].map(rid => {
            const r = roles.find(x => x.id === rid);
            return (
              <button key={rid} onClick={() => setRoleF(rid)} style={{ padding: '3px 9px', borderRadius: 3, border: 'none', fontSize: 10, fontWeight: 500, background: roleF === rid ? C.accentMuted : 'transparent', color: roleF === rid ? C.accent : C.text2, cursor: 'pointer' }}>
                {rid === 'all' ? 'Todos' : r?.label || rid}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 6, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: COLS, padding: '6px 14px', borderBottom: `1px solid ${C.border}`, background: C.bg3, gap: 12 }}>
          {['Nombre','Email','Rol','Activo',''].map((h, i) => (
            <div key={i} style={{ fontSize: 9, fontWeight: 600, color: C.text2, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</div>
          ))}
        </div>

        {rows.length === 0 && <div style={{ padding: '24px', textAlign: 'center', fontSize: 12, color: C.text2 }}>Sin resultados</div>}

        {rows.map((u, i) => (
          <div key={u.id} style={{ display: 'grid', gridTemplateColumns: COLS, padding: '10px 14px', gap: 12, alignItems: 'center', borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : 'none', opacity: u.active ? 1 : 0.45, transition: 'opacity 0.2s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar name={u.name} size={24} />
              <span style={{ fontSize: 12, fontWeight: 500, color: C.text0 }}>{u.name}</span>
            </div>
            <span style={{ fontSize: 10, color: C.text1, fontFamily: 'IBM Plex Mono' }}>{u.email}</span>
            <RolePill roleId={u.role_id} roles={roles} />
            <Toggle on={u.active} onToggle={() => toggleUser(u.id)} />
            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
              {confirm === u.id ? (
                <ConfirmDelete name={u.name} onConfirm={async () => { try { await removeUser(u.id); } catch {} setConfirm(null); }} onCancel={() => setConfirm(null)} />
              ) : (
                <>
                  <ActionBtn label="Editar"   onClick={() => openEdit(u)} />
                  <ActionBtn label="Eliminar" danger onClick={() => setConfirm(u.id)} />
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <Modal title={modal === 'add' ? 'Nuevo usuario' : 'Editar usuario'} onClose={closeModal} width={420}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <FormField label="Nombre">
              <input value={form.name} onChange={e => f('name', e.target.value)} placeholder="Nombre completo" style={{ ...iS, width: '100%' }} autoFocus />
            </FormField>
            <FormField label="Correo">
              <input type="email" value={form.email} onChange={e => f('email', e.target.value)} placeholder="usuario@equilybrio.com" style={{ ...iS, width: '100%' }} />
            </FormField>
            <FormField label={modal === 'add' ? 'Contraseña inicial' : 'Nueva contraseña (opcional)'}>
              <input type="text" value={form.password} onChange={e => f('password', e.target.value)} placeholder="equilybrio2026" style={{ ...iS, width: '100%' }} />
            </FormField>
            <FormField label="Rol">
              <select value={form.role_id} onChange={e => f('role_id', e.target.value)} style={{ ...iS, width: '100%' }}>
                {roles.map(r => <option key={r.id} value={r.id}>{r.label} — {r.description}</option>)}
              </select>
            </FormField>
            {error && <div style={{ fontSize: 11, color: 'var(--red)' }}>{error}</div>}
            <ModalActions onCancel={closeModal} onSave={save} disabled={!form.name.trim() || !form.email.trim()} />
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
