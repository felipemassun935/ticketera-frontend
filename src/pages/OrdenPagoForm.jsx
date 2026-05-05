import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { C, iS } from '../styles/tokens';
import { OP_TIPO_ITEM, OP_MONEDAS, OP_TIPO_PAGO, OP_AREAS, OP_UNIDADES, OP_PRIORIDAD_CFG } from '../constants/ordenesPago';
import { calcSubtotal, calcTotal, fmtMoney } from '../utils/ordenPago';
import { opService } from '../services/ordenPagoService';
import FormField from '../components/forms/FormField';

const EMPTY = {
  fechaSolicitud:     new Date().toISOString().slice(0, 10),
  solicitante:        '',
  clienteNombre:      '',
  proyectoNombre:     '',
  area:               'IT',
  prioridad:          'normal',
  justificacion:      '',
  tipoItem:           'Producto',
  descripcion:        '',
  cantidad:           1,
  unidad:             'unidad',
  precioUnitario:     0,
  moneda:             'ARS',
  proveedor:          '',
  cuitProveedor:      '',
  contactoProveedor:  '',
  emailProveedor:     '',
  telefonoProveedor:  '',
  direccionEnvio:     '',
  sedeImplementacion: '',
  fechaEntregaEstimada: '',
  fechaEntregaReal:   '',
  iva:                0,
  descuento:          0,
  costoEnvio:         0,
  tipoPago:           'Transferencia',
  fechaPago:          '',
  numeroFactura:      '',
  numeroComprobante:  '',
  banco:              '',
  aliasOCBU:          '',
  detallePago:        '',
  observaciones:      '',
};

function SectionTitle({ children }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.accent, padding: '18px 0 8px', borderBottom: `1px solid ${C.border}`, marginBottom: 14 }}>
      {children}
    </div>
  );
}

function Row({ children, cols = 2 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 12, marginBottom: 12 }}>
      {children}
    </div>
  );
}

export default function OrdenPagoForm({ op, onBack, onSaved }) {
  const { user } = useAuth();
  const editing  = !!op;

  const [form, setForm] = useState(editing ? { ...EMPTY, ...op } : { ...EMPTY, solicitante: user?.name || '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const subtotal   = calcSubtotal(form.cantidad, form.precioUnitario);
  const totalFinal = calcTotal(subtotal, form.iva, form.costoEnvio, form.descuento);

  async function submit() {
    if (!form.descripcion.trim()) { setError('La descripción es obligatoria.'); return; }
    if (Number(form.cantidad) <= 0) { setError('La cantidad debe ser mayor a 0.'); return; }
    if (Number(form.precioUnitario) < 0) { setError('El precio unitario no puede ser negativo.'); return; }
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, cantidad: Number(form.cantidad), precioUnitario: Number(form.precioUnitario), iva: Number(form.iva), descuento: Number(form.descuento), costoEnvio: Number(form.costoEnvio), subtotal, totalFinal };
      const saved = editing ? opService.update(op.id, payload) : opService.create(payload);
      onSaved(saved);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  const showDireccion  = form.tipoItem !== 'Servicio';
  const showBanco      = form.tipoPago === 'Transferencia';
  const showCuotas     = form.tipoPago === 'Tarjeta';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px', borderBottom: `1px solid ${C.border}`, background: C.bg1, flexShrink: 0 }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 4, border: `1px solid ${C.border}`, background: 'transparent', color: C.text2, cursor: 'pointer', fontSize: 11 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
          Volver
        </button>
        <span style={{ fontSize: 13, fontWeight: 600, color: C.text0 }}>{editing ? `Editar ${op.id}` : 'Nueva orden de pago'}</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px' }}>
        <div style={{ maxWidth: 800 }}>

          {/* Solicitud */}
          <SectionTitle>Solicitud</SectionTitle>
          <Row cols={3}>
            <FormField label="Fecha solicitud">
              <input type="date" value={form.fechaSolicitud} onChange={e => f('fechaSolicitud', e.target.value)} style={iS} />
            </FormField>
            <FormField label="Solicitante *">
              <input value={form.solicitante} onChange={e => f('solicitante', e.target.value)} style={iS} placeholder="Nombre" />
            </FormField>
            <FormField label="Área">
              <select value={form.area} onChange={e => f('area', e.target.value)} style={iS}>
                {OP_AREAS.map(a => <option key={a}>{a}</option>)}
              </select>
            </FormField>
          </Row>
          <Row cols={3}>
            <FormField label="Cliente">
              <input value={form.clienteNombre} onChange={e => f('clienteNombre', e.target.value)} style={iS} placeholder="Nombre del cliente" />
            </FormField>
            <FormField label="Proyecto (opcional)">
              <input value={form.proyectoNombre} onChange={e => f('proyectoNombre', e.target.value)} style={iS} placeholder="Proyecto" />
            </FormField>
            <FormField label="Prioridad">
              <select value={form.prioridad} onChange={e => f('prioridad', e.target.value)} style={iS}>
                {Object.entries(OP_PRIORIDAD_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </FormField>
          </Row>
          <Row cols={1}>
            <FormField label="Justificación">
              <textarea value={form.justificacion} onChange={e => f('justificacion', e.target.value)} style={{ ...iS, resize: 'vertical', minHeight: 60 }} placeholder="Motivo de la solicitud" />
            </FormField>
          </Row>

          {/* Producto / Servicio */}
          <SectionTitle>Producto / Servicio</SectionTitle>
          <Row cols={2}>
            <FormField label="Tipo de ítem">
              <select value={form.tipoItem} onChange={e => f('tipoItem', e.target.value)} style={iS}>
                {OP_TIPO_ITEM.map(t => <option key={t}>{t}</option>)}
              </select>
            </FormField>
            <FormField label="Moneda">
              <select value={form.moneda} onChange={e => f('moneda', e.target.value)} style={iS}>
                {OP_MONEDAS.map(m => <option key={m}>{m}</option>)}
              </select>
            </FormField>
          </Row>
          <Row cols={1}>
            <FormField label="Descripción *">
              <input value={form.descripcion} onChange={e => f('descripcion', e.target.value)} style={iS} placeholder="Descripción del producto o servicio" />
            </FormField>
          </Row>
          <Row cols={4}>
            <FormField label="Cantidad">
              <input type="number" min="1" value={form.cantidad} onChange={e => f('cantidad', e.target.value)} style={iS} />
            </FormField>
            <FormField label="Unidad">
              <select value={form.unidad} onChange={e => f('unidad', e.target.value)} style={iS}>
                {OP_UNIDADES.map(u => <option key={u}>{u}</option>)}
              </select>
            </FormField>
            <FormField label="Precio unitario">
              <input type="number" min="0" step="0.01" value={form.precioUnitario} onChange={e => f('precioUnitario', e.target.value)} style={iS} />
            </FormField>
            <FormField label="Subtotal">
              <div style={{ ...iS, color: C.text1, background: C.bg2, cursor: 'default' }}>{fmtMoney(subtotal, form.moneda)}</div>
            </FormField>
          </Row>

          {/* Proveedor */}
          <SectionTitle>Proveedor</SectionTitle>
          <Row cols={2}>
            <FormField label="Proveedor">
              <input value={form.proveedor} onChange={e => f('proveedor', e.target.value)} style={iS} placeholder="Nombre del proveedor" />
            </FormField>
            <FormField label="CUIT">
              <input value={form.cuitProveedor} onChange={e => f('cuitProveedor', e.target.value)} style={iS} placeholder="XX-XXXXXXXX-X" />
            </FormField>
          </Row>
          <Row cols={3}>
            <FormField label="Contacto">
              <input value={form.contactoProveedor} onChange={e => f('contactoProveedor', e.target.value)} style={iS} placeholder="Nombre contacto" />
            </FormField>
            <FormField label="Email proveedor">
              <input type="email" value={form.emailProveedor} onChange={e => f('emailProveedor', e.target.value)} style={iS} placeholder="email@proveedor.com" />
            </FormField>
            <FormField label="Teléfono">
              <input value={form.telefonoProveedor} onChange={e => f('telefonoProveedor', e.target.value)} style={iS} placeholder="+54 11 XXXX-XXXX" />
            </FormField>
          </Row>

          {/* Entrega */}
          <SectionTitle>Entrega</SectionTitle>
          <Row cols={2}>
            <FormField label="Sede implementación">
              <input value={form.sedeImplementacion} onChange={e => f('sedeImplementacion', e.target.value)} style={iS} placeholder="Casa Central, Sucursal…" />
            </FormField>
            {showDireccion && (
              <FormField label="Dirección de envío">
                <input value={form.direccionEnvio} onChange={e => f('direccionEnvio', e.target.value)} style={iS} placeholder="Calle 123, Ciudad" />
              </FormField>
            )}
          </Row>
          <Row cols={2}>
            <FormField label="Fecha entrega estimada">
              <input type="date" value={form.fechaEntregaEstimada} onChange={e => f('fechaEntregaEstimada', e.target.value)} style={iS} />
            </FormField>
            <FormField label="Fecha entrega real">
              <input type="date" value={form.fechaEntregaReal} onChange={e => f('fechaEntregaReal', e.target.value)} style={iS} />
            </FormField>
          </Row>

          {/* Pago */}
          <SectionTitle>Pago</SectionTitle>
          <Row cols={4}>
            <FormField label="IVA">
              <input type="number" min="0" step="0.01" value={form.iva} onChange={e => f('iva', e.target.value)} style={iS} />
            </FormField>
            <FormField label="Descuento">
              <input type="number" min="0" step="0.01" value={form.descuento} onChange={e => f('descuento', e.target.value)} style={iS} />
            </FormField>
            <FormField label="Costo envío">
              <input type="number" min="0" step="0.01" value={form.costoEnvio} onChange={e => f('costoEnvio', e.target.value)} style={iS} />
            </FormField>
            <FormField label="Total final">
              <div style={{ ...iS, color: C.green, fontWeight: 600, background: C.bg2, cursor: 'default' }}>{fmtMoney(totalFinal, form.moneda)}</div>
            </FormField>
          </Row>
          <Row cols={2}>
            <FormField label="Tipo de pago">
              <select value={form.tipoPago} onChange={e => f('tipoPago', e.target.value)} style={iS}>
                {OP_TIPO_PAGO.map(t => <option key={t}>{t}</option>)}
              </select>
            </FormField>
            <FormField label="Fecha de pago">
              <input type="date" value={form.fechaPago} onChange={e => f('fechaPago', e.target.value)} style={iS} />
            </FormField>
          </Row>
          <Row cols={2}>
            <FormField label="N° Factura">
              <input value={form.numeroFactura} onChange={e => f('numeroFactura', e.target.value)} style={iS} placeholder="0001-00012345" />
            </FormField>
            <FormField label="N° Comprobante">
              <input value={form.numeroComprobante} onChange={e => f('numeroComprobante', e.target.value)} style={iS} placeholder="Comprobante de pago" />
            </FormField>
          </Row>
          {showBanco && (
            <Row cols={2}>
              <FormField label="Banco">
                <input value={form.banco} onChange={e => f('banco', e.target.value)} style={iS} placeholder="Banco Nación, Santander…" />
              </FormField>
              <FormField label="CBU / Alias">
                <input value={form.aliasOCBU} onChange={e => f('aliasOCBU', e.target.value)} style={iS} placeholder="CBU o alias" />
              </FormField>
            </Row>
          )}
          <Row cols={1}>
            <FormField label={showCuotas ? 'Detalle de pago (cuotas, plan, etc.)' : 'Detalle de pago'}>
              <input value={form.detallePago} onChange={e => f('detallePago', e.target.value)} style={iS} placeholder="Información adicional sobre el pago" />
            </FormField>
          </Row>
          <Row cols={1}>
            <FormField label="Observaciones">
              <textarea value={form.observaciones} onChange={e => f('observaciones', e.target.value)} style={{ ...iS, resize: 'vertical', minHeight: 70 }} placeholder="Notas internas…" />
            </FormField>
          </Row>

        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 28px', borderTop: `1px solid ${C.border}`, background: C.bg1, flexShrink: 0 }}>
        <span style={{ fontSize: 11, color: C.red }}>{error}</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onBack} style={{ padding: '6px 14px', borderRadius: 4, border: `1px solid ${C.border}`, background: 'transparent', color: C.text1, fontSize: 12, cursor: 'pointer' }}>
            Cancelar
          </button>
          <button onClick={submit} disabled={saving} style={{ padding: '6px 16px', borderRadius: 4, border: 'none', background: C.accent, color: '#fff', fontSize: 12, fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear orden'}
          </button>
        </div>
      </div>
    </div>
  );
}
