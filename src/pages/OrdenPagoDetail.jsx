import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { C, iS } from '../styles/tokens';
import { OP_STATUS_CFG, OP_PRIORIDAD_CFG, OP_TRANSITIONS } from '../constants/ordenesPago';
import { fmtMoney } from '../utils/ordenPago';
import { opService } from '../services/ordenPagoService';
import { fmtTs } from '../utils/time';
import Modal from '../components/ui/Modal';

function InfoRow({ label, value, mono }) {
  if (!value && value !== 0) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
      <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.text2 }}>{label}</span>
      <span style={{ fontSize: 12, color: C.text0, fontFamily: mono ? 'IBM Plex Mono' : undefined }}>{value}</span>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.accent, padding: '14px 0 8px', borderBottom: `1px solid ${C.border}`, marginBottom: 12 }}>
      {children}
    </div>
  );
}

function StatusBadgeOP({ estado }) {
  const c = OP_STATUS_CFG[estado] || OP_STATUS_CFG.pendiente_aprobacion;
  return (
    <span style={{ fontSize: 11, fontWeight: 600, color: `var(${c.varColor})`, padding: '2px 8px', border: `1px solid var(${c.varColor})`, borderRadius: 12, opacity: 0.9 }}>
      {c.label}
    </span>
  );
}

export default function OrdenPagoDetail({ op: init, onBack, role, onUpdate }) {
  const { user }    = useAuth();
  const [op, setOp] = useState(init);
  const [modal, setModal]     = useState(null); // 'estado' | 'nota'
  const [newEstado, setNewEstado] = useState('');
  const [nota, setNota]       = useState('');
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  const transitions = OP_TRANSITIONS[op.estadoPago] || [];
  const isCancelled = op.estadoPago === 'cancelada';

  async function applyStatus() {
    if (!newEstado || saving) return;
    setSaving(true);
    setError('');
    try {
      const updated = opService.changeStatus(op.id, newEstado, user?.name || 'Usuario', nota);
      setOp(updated);
      onUpdate(updated);
      setModal(null);
      setNota('');
    } catch (e) {
      setError(e.message);
    } finally { setSaving(false); }
  }

  async function addNote() {
    if (!nota.trim() || saving) return;
    setSaving(true);
    setError('');
    try {
      const updated = opService.addNote(op.id, user?.name || 'Usuario', nota);
      setOp(updated);
      onUpdate(updated);
      setModal(null);
      setNota('');
    } catch (e) {
      setError(e.message);
    } finally { setSaving(false); }
  }

  const pri = OP_PRIORIDAD_CFG[op.prioridad];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', borderBottom: `1px solid ${C.border}`, background: C.bg1, flexShrink: 0 }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 4, border: `1px solid ${C.border}`, background: 'transparent', color: C.text2, cursor: 'pointer', fontSize: 11 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
          Volver
        </button>
        <span style={{ fontSize: 12, fontFamily: 'IBM Plex Mono', color: C.text2 }}>{op.id}</span>
        <StatusBadgeOP estado={op.estadoPago} />
        {pri && <span style={{ fontSize: 10, color: `var(${pri.varColor})`, fontWeight: 500 }}>{pri.label}</span>}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          {!isCancelled && transitions.length > 0 && (
            <button onClick={() => { setNewEstado(transitions[0]); setModal('estado'); }} style={{ padding: '4px 12px', borderRadius: 4, border: 'none', background: C.accent, color: '#fff', fontSize: 11, fontWeight: 500, cursor: 'pointer' }}>
              Cambiar estado
            </button>
          )}
          <button onClick={() => setModal('nota')} style={{ padding: '4px 12px', borderRadius: 4, border: `1px solid ${C.border}`, background: 'transparent', color: C.text1, fontSize: 11, cursor: 'pointer' }}>
            Agregar nota
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Main content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          <div style={{ maxWidth: 660 }}>
            <SectionLabel>Solicitud</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              <InfoRow label="Fecha solicitud" value={op.fechaSolicitud} />
              <InfoRow label="Solicitante" value={op.solicitante} />
              <InfoRow label="Área" value={op.area} />
              <InfoRow label="Cliente" value={op.clienteNombre} />
              <InfoRow label="Proyecto" value={op.proyectoNombre} />
              <InfoRow label="Prioridad" value={pri?.label} />
            </div>
            {op.justificacion && <InfoRow label="Justificación" value={op.justificacion} />}

            <SectionLabel>Producto / Servicio</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              <InfoRow label="Tipo" value={op.tipoItem} />
              <InfoRow label="Moneda" value={op.moneda} />
            </div>
            <InfoRow label="Descripción" value={op.descripcion} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
              <InfoRow label="Cantidad" value={op.cantidad} />
              <InfoRow label="Unidad" value={op.unidad} />
              <InfoRow label="Precio unitario" value={fmtMoney(op.precioUnitario, op.moneda)} />
              <InfoRow label="Subtotal" value={fmtMoney(op.subtotal, op.moneda)} />
            </div>

            <SectionLabel>Proveedor</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <InfoRow label="Proveedor" value={op.proveedor} />
              <InfoRow label="CUIT" value={op.cuitProveedor} mono />
              <InfoRow label="Contacto" value={op.contactoProveedor} />
              <InfoRow label="Email" value={op.emailProveedor} />
              <InfoRow label="Teléfono" value={op.telefonoProveedor} />
            </div>

            <SectionLabel>Entrega</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <InfoRow label="Sede" value={op.sedeImplementacion} />
              <InfoRow label="Dirección envío" value={op.direccionEnvio} />
              <InfoRow label="Fecha estimada" value={op.fechaEntregaEstimada} />
              <InfoRow label="Fecha real" value={op.fechaEntregaReal} />
            </div>

            <SectionLabel>Pago</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
              <InfoRow label="IVA" value={fmtMoney(op.iva, op.moneda)} />
              <InfoRow label="Descuento" value={fmtMoney(op.descuento, op.moneda)} />
              <InfoRow label="Costo envío" value={fmtMoney(op.costoEnvio, op.moneda)} />
              <div style={{ marginBottom: 10 }}>
                <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.text2, display: 'block', marginBottom: 2 }}>Total final</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: C.green }}>{fmtMoney(op.totalFinal, op.moneda)}</span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <InfoRow label="Tipo de pago" value={op.tipoPago} />
              <InfoRow label="Fecha de pago" value={op.fechaPago} />
              <InfoRow label="N° Factura" value={op.numeroFactura} mono />
              <InfoRow label="N° Comprobante" value={op.numeroComprobante} mono />
              <InfoRow label="Banco" value={op.banco} />
              <InfoRow label="CBU / Alias" value={op.aliasOCBU} mono />
            </div>
            {op.detallePago && <InfoRow label="Detalle de pago" value={op.detallePago} />}
            {op.observaciones && <InfoRow label="Observaciones" value={op.observaciones} />}
          </div>
        </div>

        {/* Right panel — history */}
        <div style={{ width: 280, borderLeft: `1px solid ${C.border}`, overflowY: 'auto', padding: '16px 14px', flexShrink: 0 }}>
          <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.text2, marginBottom: 14 }}>Historial</div>
          {(op.history || []).slice().reverse().map((h, i) => (
            <div key={i} style={{ marginBottom: 14, paddingBottom: 12, borderBottom: `1px solid ${C.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 500, color: C.text0 }}>{h.usuario}</span>
                <span style={{ fontSize: 9, color: C.text2 }}>{fmtTs(h.fecha)}</span>
              </div>
              <div style={{ fontSize: 10, color: C.text2, fontWeight: 500, marginBottom: 3 }}>{h.accion}</div>
              <div style={{ fontSize: 11, color: C.text1, lineHeight: 1.5 }}>{h.cambio}</div>
            </div>
          ))}
          {(!op.history || op.history.length === 0) && (
            <div style={{ fontSize: 11, color: C.text2 }}>Sin historial</div>
          )}
        </div>
      </div>

      {/* Modal: cambiar estado */}
      {modal === 'estado' && (
        <Modal title="Cambiar estado" onClose={() => setModal(null)} width={360}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.text2, display: 'block', marginBottom: 6 }}>Nuevo estado</label>
              <select value={newEstado} onChange={e => setNewEstado(e.target.value)} style={iS}>
                {transitions.map(s => <option key={s} value={s}>{OP_STATUS_CFG[s]?.label || s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.text2, display: 'block', marginBottom: 6 }}>Nota (opcional)</label>
              <textarea value={nota} onChange={e => setNota(e.target.value)} style={{ ...iS, resize: 'vertical', minHeight: 64 }} placeholder="Comentario sobre el cambio…" />
            </div>
            {error && <span style={{ fontSize: 11, color: C.red }}>{error}</span>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
              <button onClick={() => setModal(null)} style={{ padding: '5px 12px', borderRadius: 4, border: `1px solid ${C.border}`, background: 'transparent', color: C.text1, fontSize: 12, cursor: 'pointer' }}>Cancelar</button>
              <button onClick={applyStatus} disabled={saving} style={{ padding: '5px 14px', borderRadius: 4, border: 'none', background: C.accent, color: '#fff', fontSize: 12, fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Guardando…' : 'Confirmar'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: agregar nota */}
      {modal === 'nota' && (
        <Modal title="Agregar nota" onClose={() => setModal(null)} width={360}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <textarea value={nota} onChange={e => setNota(e.target.value)} style={{ ...iS, resize: 'vertical', minHeight: 80 }} placeholder="Escribí una nota…" autoFocus />
            {error && <span style={{ fontSize: 11, color: C.red }}>{error}</span>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => setModal(null)} style={{ padding: '5px 12px', borderRadius: 4, border: `1px solid ${C.border}`, background: 'transparent', color: C.text1, fontSize: 12, cursor: 'pointer' }}>Cancelar</button>
              <button onClick={addNote} disabled={saving || !nota.trim()} style={{ padding: '5px 14px', borderRadius: 4, border: 'none', background: C.accent, color: '#fff', fontSize: 12, fontWeight: 500, cursor: saving || !nota.trim() ? 'not-allowed' : 'pointer', opacity: saving || !nota.trim() ? 0.6 : 1 }}>
                {saving ? 'Guardando…' : 'Agregar'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
