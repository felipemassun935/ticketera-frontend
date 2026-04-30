import { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { PERMISSIONS } from '../../constants/roles';
import { C, iS } from '../../styles/tokens';
import Modal from '../../components/ui/Modal';
import FormField from '../../components/forms/FormField';

const PALETTE = [
  '#CF7452','#5ca89a','#6892b4','#c98c4a',
  '#78b07a','#9b78b0','#c46262','#6b8fbe',
];

const EMPTY_ROLE = {
  label: '', description: '', color: '#6892b4',
  permissions: Object.fromEntries(PERMISSIONS.map(p => [p.id, false])),
};

function ColorPicker({ value, onChange }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {PALETTE.map(c => (
        <button key={c} type="button" onClick={() => onChange(c)} style={{
          width: 20, height: 20, borderRadius: '50%', background: c, border: 'none', cursor: 'pointer',
          outline: value === c ? `2px solid ${C.text0}` : '2px solid transparent', outlineOffset: 2,
        }} />
      ))}
    </div>
  );
}

function PermToggle({ on, onChange, disabled }) {
  return (
    <button
      onClick={() => !disabled && onChange(!on)}
      style={{
        width: 28, height: 15, borderRadius: 8, border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        background: on ? 'var(--accent)' : C.bg3,
        position: 'relative', transition: 'background 0.2s', flexShrink: 0,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <span style={{
        position: 'absolute', top: 1.5, left: on ? 13 : 1.5,
        width: 12, height: 12, borderRadius: '50%',
        background: '#fff', transition: 'left 0.18s',
      }} />
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

export default function RolesAdmin() {
  const { roles, addRole, updateRole, removeRole, users } = useAdmin();
  const [modal,   setModal]   = useState(null);   // null | 'add' | 'edit'
  const [form,    setForm]    = useState(EMPTY_ROLE);
  const [confirm, setConfirm] = useState(null);

  function openAdd()   { setForm(EMPTY_ROLE); setModal('add'); }
  function openEdit(r) { setForm(r);          setModal('edit'); }
  function closeModal(){ setModal(null); }

  function save() {
    if (!form.label.trim()) return;
    const payload = {
      ...form,
      id: form.id || `role_${form.label.toLowerCase().replace(/\s+/g, '_')}`,
    };
    if (modal === 'add') addRole(payload);
    else                 updateRole(payload);
    closeModal();
  }

  function togglePerm(permId) {
    setForm(f => ({
      ...f,
      permissions: { ...f.permissions, [permId]: !f.permissions[permId] },
    }));
  }

  const usersPerRole = (roleId) => roles.find(r => r.id === roleId)?.user_count ?? 0;

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '22px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 500, color: C.text0, marginBottom: 2 }}>Roles y permisos</div>
          <div style={{ fontSize: 11, color: C.text2 }}>{roles.length} roles configurados</div>
        </div>
        <button
          onClick={openAdd}
          style={{ background: 'var(--accent)', border: 'none', color: '#fff', fontSize: 11, fontWeight: 500, padding: '6px 14px', borderRadius: 4, cursor: 'pointer' }}
        >
          + Nuevo rol
        </button>
      </div>

      {/* Permission matrix */}
      <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 6, overflow: 'hidden' }}>
        {/* Column headers */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `200px repeat(${roles.length}, 1fr) 80px`,
          padding: '8px 14px', borderBottom: `1px solid ${C.border}`, background: C.bg3,
          gap: 8, alignItems: 'center',
        }}>
          <div style={{ fontSize: 9, fontWeight: 600, color: C.text2, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Permiso</div>
          {roles.map(r => (
            <div key={r.id} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: r.color }}>{r.label}</div>
              <div style={{ fontSize: 9, color: C.text2 }}>{usersPerRole(r.id)} usuarios</div>
            </div>
          ))}
          <div />
        </div>

        {/* Permission rows */}
        {PERMISSIONS.map((perm, pi) => (
          <div key={perm.id} style={{
            display: 'grid',
            gridTemplateColumns: `200px repeat(${roles.length}, 1fr) 80px`,
            padding: '9px 14px', gap: 8, alignItems: 'center',
            borderBottom: pi < PERMISSIONS.length - 1 ? `1px solid ${C.border}` : 'none',
            background: pi % 2 === 0 ? 'transparent' : 'rgba(128,100,80,0.02)',
          }}>
            <span style={{ fontSize: 11, color: C.text1 }}>{perm.label}</span>
            {roles.map(r => (
              <div key={r.id} style={{ display: 'flex', justifyContent: 'center' }}>
                <PermToggle
                  on={!!r.permissions[perm.id]}
                  disabled={!r.editable}
                  onChange={(val) => updateRole({
                    ...r,
                    permissions: { ...r.permissions, [perm.id]: val },
                  })}
                />
              </div>
            ))}
            <div />
          </div>
        ))}

        {/* Role action row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `200px repeat(${roles.length}, 1fr) 80px`,
          padding: '10px 14px', gap: 8, alignItems: 'center',
          borderTop: `1px solid ${C.border}`, background: C.bg3,
        }}>
          <div style={{ fontSize: 9, color: C.text2, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>Acciones</div>
          {roles.map(r => (
            <div key={r.id} style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
              <ActionBtn label="Editar" onClick={() => openEdit(r)} />
              {r.editable && (
                confirm === r.id
                  ? <ConfirmDelete name={r.label} onConfirm={() => { removeRole(r.id); setConfirm(null); }} onCancel={() => setConfirm(null)} />
                  : <ActionBtn label="Eliminar" danger onClick={() => setConfirm(r.id)} />
              )}
            </div>
          ))}
          <div />
        </div>
      </div>

      {/* Role cards summary */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(roles.length, 3)}, 1fr)`, gap: 10, marginTop: 16 }}>
        {roles.map(r => (
          <div key={r.id} style={{
            background: C.bg2, border: `1px solid ${C.border}`,
            borderTop: `2px solid ${r.color}`,
            borderRadius: 6, padding: '12px 14px',
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: r.color, marginBottom: 2 }}>{r.label}</div>
            <div style={{ fontSize: 11, color: C.text2, marginBottom: 10 }}>{r.description}</div>
            <div style={{ fontSize: 10, color: C.text1 }}>
              <span style={{ color: C.text0, fontWeight: 500 }}>{Object.values(r.permissions).filter(Boolean).length}</span>
              <span style={{ color: C.text2 }}> / {PERMISSIONS.length} permisos activos</span>
            </div>
            <div style={{ fontSize: 10, color: C.text2, marginTop: 3 }}>
              <span style={{ color: C.text0, fontWeight: 500 }}>{usersPerRole(r.id)}</span> usuarios activos
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modal && (
        <Modal
          title={modal === 'add' ? 'Nuevo rol' : `Editar rol — ${form.label}`}
          onClose={closeModal}
          width={460}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <FormField label="Nombre">
                <input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} placeholder="Ej: Supervisor" style={{ ...iS, width: '100%' }} autoFocus />
              </FormField>
              <FormField label="Descripción">
                <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Descripción breve" style={{ ...iS, width: '100%' }} />
              </FormField>
            </div>

            <FormField label="Color">
              <ColorPicker value={form.color} onChange={c => setForm(f => ({ ...f, color: c }))} />
            </FormField>

            <FormField label="Permisos">
              <div style={{ background: C.bg0, border: `1px solid ${C.border}`, borderRadius: 5, overflow: 'hidden' }}>
                {PERMISSIONS.map((perm, pi) => (
                  <div key={perm.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderBottom: pi < PERMISSIONS.length - 1 ? `1px solid ${C.border}` : 'none',
                    background: pi % 2 === 0 ? 'transparent' : 'rgba(128,100,80,0.02)',
                  }}>
                    <span style={{ fontSize: 11, color: C.text1 }}>{perm.label}</span>
                    <PermToggle
                      on={!!form.permissions[perm.id]}
                      disabled={false}
                      onChange={() => togglePerm(perm.id)}
                    />
                  </div>
                ))}
              </div>
            </FormField>

            {!form.editable && form.id && (
              <div style={{ fontSize: 11, color: C.amber, background: `${C.amber}11`, border: `1px solid ${C.amber}33`, borderRadius: 4, padding: '7px 10px' }}>
                Este rol del sistema solo puede editarse parcialmente.
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={closeModal} style={{ background: 'transparent', border: `1px solid ${C.border}`, color: C.text2, fontSize: 11, padding: '5px 14px', borderRadius: 4, cursor: 'pointer' }}>Cancelar</button>
              <button
                onClick={save}
                disabled={!form.label.trim()}
                style={{ background: !form.label.trim() ? C.bg3 : 'var(--accent)', border: 'none', color: !form.label.trim() ? C.text2 : '#fff', fontSize: 11, fontWeight: 500, padding: '5px 16px', borderRadius: 4, cursor: !form.label.trim() ? 'default' : 'pointer', transition: 'all 0.15s' }}
              >
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
      style={{ fontSize: 10, color: danger ? 'var(--red)' : C.text1, background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 3, padding: '2px 8px', cursor: 'pointer', transition: 'all 0.12s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = danger ? 'var(--red)' : 'var(--accent)'; e.currentTarget.style.color = danger ? 'var(--red)' : 'var(--accent)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = danger ? 'var(--red)' : 'var(--text1)'; }}
    >
      {label}
    </button>
  );
}
