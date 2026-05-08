import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { C, iS } from '../styles/tokens';
import { OP_STATUS_CFG, OP_TRANSITIONS, OP_TIPO_PAGO } from '../constants/ordenesPago';
import { fmtMoney } from '../utils/ordenPago';
import { opService } from '../services/ordenPagoService';
import { fmtTs } from '../utils/time';

// ── Small UI pieces ──────────────────────────────────────────────

function StatusBadge({ estado }) {
  const c = OP_STATUS_CFG[estado] || { label: estado, varColor: '--text2' };
  return (
    <span style={{ fontSize: 11, fontWeight: 600, color: `var(${c.varColor})`, padding: '2px 9px', border: `1px solid var(${c.varColor})`, borderRadius: 10, opacity: 0.9 }}>
      {c.label}
    </span>
  );
}

function Field({ label, value, mono }) {
  if (!value && value !== 0) return null;
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.text2, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 12, color: C.text0, fontFamily: mono ? 'IBM Plex Mono' : undefined, wordBreak: 'break-word' }}>{value}</div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.accent, padding: '14px 0 8px', borderBottom: `1px solid ${C.border}`, marginBottom: 14 }}>
      {children}
    </div>
  );
}

const HISTORY_ICON = {
  created:     { d: 'M12 2a10 10 0 100 20A10 10 0 0012 2zm0 6v4m0 4v.01', color: 'var(--blue)'   },
  estado:      { d: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',     color: 'var(--accent)' },
  seguimiento: { d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', color: 'var(--teal)'   },
  nota:        { d: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.42-4.03 8-9 8a9.9 9.9 0 01-4.26-.96L3 21l1.9-5.06C3.71 14.46 3 13.31 3 12c0-4.42 4.03-8 9-8s9 3.58 9 8z', color: 'var(--text1)' },
  edit:        { d: 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z', color: 'var(--amber)' },
};

function HistoryEntry({ entry, isLast }) {
  const cfg = HISTORY_ICON[entry.type] || HISTORY_ICON.nota;
  return (
    <div style={{ display: 'flex', gap: 10, paddingBottom: isLast ? 0 : 16, position: 'relative' }}>
      {!isLast && <div style={{ position: 'absolute', left: 11, top: 24, bottom: 0, width: 1, background: C.border }} />}
      <div style={{ width: 22, height: 22, borderRadius: '50%', border: `1px solid ${C.border}`, background: C.bg2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={cfg.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d={cfg.d} />
        </svg>
      </div>
      <div style={{ flex: 1, paddingTop: 2, minWidth: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, fontWeight: 500, color: C.text0 }}>{entry.usuario}</span>
          <span style={{ fontSize: 9, color: C.text2 }}>{fmtTs(entry.fecha)}</span>
          <span style={{ fontSize: 9, fontWeight: 600, color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{entry.accion}</span>
        </div>
        {entry.nota && (
          <div style={{ fontSize: 12, color: C.text1, lineHeight: 1.6, background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 5, padding: '6px 10px', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
            {entry.nota}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────

export default function OrdenPagoDetail({ op: init, onBack, role, onUpdate, onEdit }) {
  const { user }    = useAuth();
  const [op, setOp] = useState(init);
  const histRef     = useRef(null);

  const [tab,        setTab]        = useState('datos');    // 'datos' | 'seguimiento'
  const [comment,    setComment]    = useState('');
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState('');
  const [estadoModal, setEstadoModal] = useState(false);
  const [newEstado,  setNewEstado]  = useState('');
  const [estadoNota, setEstadoNota] = useState('');

  // Seguimiento inline edit state
  const [seg, setSeg] = useState({
    fechaEntrega: op.fechaEntrega || '',
    costoFinal:   op.costoFinal   || '',
    tipoPago:     op.tipoPago     || '',
    detallePago:  op.detallePago  || '',
  });
  const [segSaved, setSegSaved] = useState(true);

  useEffect(() => {
    if (histRef.current) histRef.current.scrollTop = histRef.current.scrollHeight;
  }, [op.history?.length]);

  function sync(updated) { setOp(updated); onUpdate(updated); }

  async function addNote() {
    if (!comment.trim() || saving) return;
    setSaving(true);
    try { sync(opService.addNote(op.id, user?.name || 'Usuario', comment)); setComment(''); }
    catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }

  async function applyEstado() {
    if (!newEstado || saving) return;
    setSaving(true);
    try { sync(opService.changeStatus(op.id, newEstado, user?.name || 'Usuario', estadoNota)); setEstadoModal(false); setEstadoNota(''); }
    catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }

  async function saveSeguimiento() {
    if (saving) return;
    setSaving(true);
    try {
      sync(opService.updateSeguimiento(op.id, seg, user?.name || 'Usuario'));
      setSegSaved(true);
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }

  const transitions  = OP_TRANSITIONS[op.estado] || [];
  const montoTotal   = (Number(op.cantidad) || 0) * (Number(op.montoUnitario) || 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', borderBottom: `1px solid ${C.border}`, background: C.bg1, flexShrink: 0, flexWrap: 'wrap' }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 4, border: `1px solid ${C.border}`, background: 'transparent', color: C.text2, cursor: 'pointer', fontSize: 11 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Volver
        </button>
        <span style={{ fontSize: 11, fontFamily: 'IBM Plex Mono', color: C.text2 }}>{op.id}</span>
        <StatusBadge estado={op.estado} />
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          {transitions.length > 0 && (
            <button onClick={() => { setNewEstado(transitions[0]); setEstadoModal(true); }}
              style={{ padding: '4px 12px', borderRadius: 4, border: 'none', background: 'var(--accent)', color: '#fff', fontSize: 11, fontWeight: 500, cursor: 'pointer' }}>
              Cambiar estado
            </button>
          )}
          <button onClick={onEdit}
            style={{ padding: '4px 12px', borderRadius: 4, border: `1px solid ${C.border}`, background: 'transparent', color: C.text1, fontSize: 11, cursor: 'pointer' }}>
            Editar datos
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Left — main content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, background: C.bg1, flexShrink: 0 }}>
            {[['datos', 'Datos de la orden'], ['seguimiento', 'Seguimiento']].map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)}
                style={{ padding: '8px 18px', border: 'none', background: 'transparent', fontSize: 11, fontWeight: tab === id ? 600 : 400, color: tab === id ? 'var(--accent)' : C.text2, cursor: 'pointer', borderBottom: tab === id ? '2px solid var(--accent)' : '2px solid transparent', transition: 'all 0.12s' }}>
                {label}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

            {/* ── Tab: Datos ── */}
            {tab === 'datos' && (
              <div style={{ maxWidth: 640 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  <Field label="Fecha de pedido"   value={op.fechaPedido} />
                  <Field label="Solicitante"        value={op.solicitante} />
                  <Field label="Cliente asociado"   value={op.clienteAsociado} />
                </div>
                <Field label="Descripción de producto" value={op.descripcion} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  <Field label="Cantidad"        value={op.cantidad} />
                  <Field label="Monto unitario"  value={fmtMoney(op.montoUnitario)} />
                  <Field label="Subtotal"        value={fmtMoney(montoTotal)} />
                </div>
                {op.linkReferencia && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.text2, marginBottom: 2 }}>Link de referencia</div>
                    <a href={op.linkReferencia} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: 'var(--accent)', wordBreak: 'break-all' }}>{op.linkReferencia}</a>
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <Field label="Área de implementación" value={op.areaImplementacion} />
                  <Field label="Sede de implementación" value={op.sedeImplementacion} />
                </div>
                <Field label="Dirección de envío" value={op.direccionEnvio} />
                {op.observaciones && <Field label="Observaciones" value={op.observaciones} />}
              </div>
            )}

            {/* ── Tab: Seguimiento ── */}
            {tab === 'seguimiento' && (
              <div style={{ maxWidth: 580 }}>
                <div style={{ fontSize: 11, color: C.text2, marginBottom: 18, lineHeight: 1.5 }}>
                  Completá los datos de seguimiento una vez que la orden avance. Los cambios quedan registrados en el historial.
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <div>
                    <label style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.text2, display: 'block', marginBottom: 4 }}>Fecha de entrega</label>
                    <input type="date" value={seg.fechaEntrega} onChange={e => { setSeg(s => ({ ...s, fechaEntrega: e.target.value })); setSegSaved(false); }} style={{ ...iS, width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.text2, display: 'block', marginBottom: 4 }}>Costo final</label>
                    <input type="number" min="0" step="0.01" value={seg.costoFinal} onChange={e => { setSeg(s => ({ ...s, costoFinal: e.target.value })); setSegSaved(false); }} placeholder="0.00" style={{ ...iS, width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.text2, display: 'block', marginBottom: 4 }}>Tipo de pago</label>
                    <select value={seg.tipoPago} onChange={e => { setSeg(s => ({ ...s, tipoPago: e.target.value })); setSegSaved(false); }} style={{ ...iS, width: '100%' }}>
                      <option value="">Sin especificar</option>
                      {OP_TIPO_PAGO.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.text2, display: 'block', marginBottom: 4 }}>Detalle</label>
                    <input value={seg.detallePago} onChange={e => { setSeg(s => ({ ...s, detallePago: e.target.value })); setSegSaved(false); }} placeholder="Referencia, cuotas, comprobante…" style={{ ...iS, width: '100%' }} />
                  </div>
                </div>

                {!segSaved && (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button onClick={saveSeguimiento} disabled={saving}
                      style={{ padding: '6px 16px', borderRadius: 4, border: 'none', background: 'var(--accent)', color: '#fff', fontSize: 11, fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
                      {saving ? 'Guardando…' : 'Guardar seguimiento'}
                    </button>
                    <span style={{ fontSize: 11, color: C.text2 }}>Cambios sin guardar</span>
                  </div>
                )}
                {segSaved && (op.fechaEntrega || op.costoFinal || op.tipoPago) && (
                  <div style={{ fontSize: 11, color: 'var(--green)' }}>✓ Seguimiento guardado</div>
                )}

                {error && <div style={{ marginTop: 8, fontSize: 11, color: 'var(--red)' }}>{error}</div>}
              </div>
            )}
          </div>

          {/* Note input — sticky bottom */}
          <div style={{ padding: '10px 18px', borderTop: `1px solid ${C.border}`, background: C.bg1, flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <textarea
                value={comment} onChange={e => setComment(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) addNote(); }}
                placeholder="Agregar observación… (Ctrl+Enter para guardar)"
                rows={2}
                style={{ ...iS, flex: 1, resize: 'none', lineHeight: 1.6 }}
              />
              <button onClick={addNote} disabled={!comment.trim() || saving}
                style={{ padding: '6px 14px', borderRadius: 4, border: 'none', background: comment.trim() && !saving ? 'var(--accent)' : C.bg3, color: comment.trim() && !saving ? '#fff' : C.text2, fontSize: 11, fontWeight: 500, cursor: comment.trim() && !saving ? 'pointer' : 'default', flexShrink: 0, transition: 'all 0.15s' }}>
                {saving ? '…' : 'Agregar'}
              </button>
            </div>
          </div>
        </div>

        {/* Right — timeline */}
        <div ref={histRef} style={{ width: 300, borderLeft: `1px solid ${C.border}`, overflowY: 'auto', padding: '16px 14px', flexShrink: 0 }}>
          <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.text2, marginBottom: 16 }}>Historial</div>
          {(op.history || []).map((h, i) => (
            <HistoryEntry key={i} entry={h} isLast={i === (op.history.length - 1)} />
          ))}
          {(!op.history || op.history.length === 0) && (
            <div style={{ fontSize: 11, color: C.text2 }}>Sin historial</div>
          )}
        </div>
      </div>

      {/* Modal: cambiar estado */}
      {estadoModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 8, padding: 20, width: 360, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text0, marginBottom: 4 }}>Cambiar estado</div>
            <div>
              <label style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.text2, display: 'block', marginBottom: 5 }}>Nuevo estado</label>
              <select value={newEstado} onChange={e => setNewEstado(e.target.value)} style={{ ...iS, width: '100%' }}>
                {transitions.map(s => <option key={s} value={s}>{OP_STATUS_CFG[s]?.label || s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.text2, display: 'block', marginBottom: 5 }}>Nota (opcional)</label>
              <textarea value={estadoNota} onChange={e => setEstadoNota(e.target.value)} rows={3} style={{ ...iS, width: '100%', resize: 'vertical' }} placeholder="Comentario sobre el cambio…" />
            </div>
            {error && <span style={{ fontSize: 11, color: 'var(--red)' }}>{error}</span>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
              <button onClick={() => setEstadoModal(false)} style={{ padding: '5px 12px', borderRadius: 4, border: `1px solid ${C.border}`, background: 'transparent', color: C.text1, fontSize: 12, cursor: 'pointer' }}>Cancelar</button>
              <button onClick={applyEstado} disabled={saving} style={{ padding: '5px 14px', borderRadius: 4, border: 'none', background: 'var(--accent)', color: '#fff', fontSize: 12, fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Guardando…' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
