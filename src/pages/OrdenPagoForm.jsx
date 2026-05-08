import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { C, iS } from '../styles/tokens';
import { OP_AREAS } from '../constants/ordenesPago';
import { opService } from '../services/ordenPagoService';
import FormField from '../components/forms/FormField';

const EMPTY = {
  fechaPedido:        new Date().toISOString().slice(0, 10),
  solicitante:        '',
  descripcion:        '',
  cantidad:           1,
  montoUnitario:      '',
  linkReferencia:     '',
  direccionEnvio:     '',
  areaImplementacion: 'IT',
  sedeImplementacion: '',
  clienteAsociado:    '',
  observaciones:      '',
};

function Row({ children, cols = 2 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 12, marginBottom: 12 }}>
      {children}
    </div>
  );
}

export default function OrdenPagoForm({ op, onBack, onSaved }) {
  const { user }   = useAuth();
  const editing    = !!op;
  const [form, setForm]   = useState(editing ? { ...EMPTY, ...op } : { ...EMPTY, solicitante: user?.name || '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  function submit() {
    if (!form.descripcion.trim()) { setError('La descripción es obligatoria.'); return; }
    if (!form.solicitante.trim()) { setError('El solicitante es obligatorio.'); return; }
    if (Number(form.cantidad) <= 0) { setError('La cantidad debe ser mayor a 0.'); return; }
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, cantidad: Number(form.cantidad), montoUnitario: Number(form.montoUnitario) || 0, _usuario: user?.name };
      const saved = editing ? opService.update(op.id, payload) : opService.create(payload);
      onSaved(saved);
    } catch (e) {
      setError(e.message);
      setSaving(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px', borderBottom: `1px solid ${C.border}`, background: C.bg1, flexShrink: 0 }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 4, border: `1px solid ${C.border}`, background: 'transparent', color: C.text2, cursor: 'pointer', fontSize: 11 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
          Volver
        </button>
        <span style={{ fontSize: 13, fontWeight: 600, color: C.text0 }}>{editing ? `Editar ${op.id}` : 'Nueva orden de compra'}</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
        <div style={{ maxWidth: 720 }}>

          <Row cols={3}>
            <FormField label="Fecha de pedido *">
              <input type="date" value={form.fechaPedido} onChange={e => f('fechaPedido', e.target.value)} style={{ ...iS, width: '100%' }} />
            </FormField>
            <FormField label="Solicitante *">
              <input value={form.solicitante} onChange={e => f('solicitante', e.target.value)} placeholder="Nombre completo" style={{ ...iS, width: '100%' }} />
            </FormField>
            <FormField label="Cliente asociado">
              <input value={form.clienteAsociado} onChange={e => f('clienteAsociado', e.target.value)} placeholder="Nombre del cliente" style={{ ...iS, width: '100%' }} />
            </FormField>
          </Row>

          <Row cols={1}>
            <FormField label="Descripción de producto *">
              <input value={form.descripcion} onChange={e => f('descripcion', e.target.value)} placeholder="Descripción detallada del producto o servicio" style={{ ...iS, width: '100%' }} />
            </FormField>
          </Row>

          <Row cols={3}>
            <FormField label="Cantidad">
              <input type="number" min="1" value={form.cantidad} onChange={e => f('cantidad', e.target.value)} style={{ ...iS, width: '100%' }} />
            </FormField>
            <FormField label="Monto unitario">
              <input type="number" min="0" step="0.01" value={form.montoUnitario} onChange={e => f('montoUnitario', e.target.value)} placeholder="0.00" style={{ ...iS, width: '100%' }} />
            </FormField>
            <FormField label="Link de referencia">
              <input value={form.linkReferencia} onChange={e => f('linkReferencia', e.target.value)} placeholder="https://…" style={{ ...iS, width: '100%' }} />
            </FormField>
          </Row>

          <Row cols={2}>
            <FormField label="Área de implementación">
              <select value={form.areaImplementacion} onChange={e => f('areaImplementacion', e.target.value)} style={{ ...iS, width: '100%' }}>
                {OP_AREAS.map(a => <option key={a}>{a}</option>)}
              </select>
            </FormField>
            <FormField label="Sede de implementación">
              <input value={form.sedeImplementacion} onChange={e => f('sedeImplementacion', e.target.value)} placeholder="Casa Central, Sucursal Norte…" style={{ ...iS, width: '100%' }} />
            </FormField>
          </Row>

          <Row cols={1}>
            <FormField label="Dirección de envío">
              <input value={form.direccionEnvio} onChange={e => f('direccionEnvio', e.target.value)} placeholder="Calle, número, ciudad" style={{ ...iS, width: '100%' }} />
            </FormField>
          </Row>

          <Row cols={1}>
            <FormField label="Observaciones">
              <textarea value={form.observaciones} onChange={e => f('observaciones', e.target.value)} placeholder="Notas, aclaraciones, requisitos especiales…" rows={3} style={{ ...iS, width: '100%', resize: 'vertical' }} />
            </FormField>
          </Row>

        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 28px', borderTop: `1px solid ${C.border}`, background: C.bg1, flexShrink: 0 }}>
        <span style={{ fontSize: 11, color: 'var(--red)' }}>{error}</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onBack} style={{ padding: '6px 14px', borderRadius: 4, border: `1px solid ${C.border}`, background: 'transparent', color: C.text1, fontSize: 12, cursor: 'pointer' }}>Cancelar</button>
          <button onClick={submit} disabled={saving} style={{ padding: '6px 16px', borderRadius: 4, border: 'none', background: 'var(--accent)', color: '#fff', fontSize: 12, fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear orden'}
          </button>
        </div>
      </div>
    </div>
  );
}
