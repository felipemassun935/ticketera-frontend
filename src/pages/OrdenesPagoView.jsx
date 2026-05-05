import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { C, iS } from '../styles/tokens';
import { OP_STATUS_CFG, OP_PRIORIDAD_CFG } from '../constants/ordenesPago';
import { fmtMoney, exportOpCSV } from '../utils/ordenPago';
import { opService } from '../services/ordenPagoService';
import { fmtTs } from '../utils/time';
import Modal from '../components/ui/Modal';
import OrdenPagoForm from './OrdenPagoForm';
import OrdenPagoDetail from './OrdenPagoDetail';

function StatusBadgeOP({ estado }) {
  const c = OP_STATUS_CFG[estado] || { label: estado, varColor: '--text2' };
  return <span style={{ fontSize: 10, fontWeight: 500, color: `var(${c.varColor})` }}>{c.label}</span>;
}

function PriBadgeOP({ prioridad }) {
  const c = OP_PRIORIDAD_CFG[prioridad];
  if (!c) return null;
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: `var(${c.varColor})` }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: `var(${c.varColor})`, flexShrink: 0 }} />
      {c.label}
    </span>
  );
}

function ActionBtn({ onClick, title, children, danger }) {
  return (
    <button onClick={e => { e.stopPropagation(); onClick(); }} title={title}
      style={{ padding: '3px 7px', borderRadius: 3, border: `1px solid ${C.border}`, background: 'transparent', color: danger ? C.red : C.text2, cursor: 'pointer', fontSize: 10, display: 'flex', alignItems: 'center', gap: 3, transition: 'all 0.1s' }}
      onMouseEnter={e => (e.currentTarget.style.background = C.bg3)}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      {children}
    </button>
  );
}

const STAT_KEYS = [
  { key: 'pendiente_aprobacion', label: 'Pendientes aprobación', varColor: '--text2' },
  { key: 'pendiente_pago',       label: 'Pendientes pago',       varColor: '--amber' },
  { key: 'pagado_total',         label: 'Pagadas',               varColor: '--green' },
  { key: 'rechazada',            label: 'Rechazadas',            varColor: '--red'   },
];

const COLS = '48px 100px 1fr 120px 1fr 130px 110px 110px 130px 110px 120px';
const HEADERS = ['', 'Fecha', 'Descripción', 'Solicitante', 'Proveedor', 'Total', 'Tipo pago', 'Estado', 'Fecha pago', 'Prioridad', 'Acciones'];

export default function OrdenesPagoView({ role }) {
  const { user } = useAuth();
  const [view, setView]         = useState('list'); // 'list' | 'detail' | 'form'
  const [ops, setOps]           = useState([]);
  const [selected, setSelected] = useState(null);
  const [editOp, setEditOp]     = useState(null);
  const [confirm, setConfirm]   = useState(null);

  const [search,      setSearch]      = useState('');
  const [estadoF,     setEstadoF]     = useState('all');
  const [prioridadF,  setPrioridadF]  = useState('all');
  const [proveedorF,  setProveedorF]  = useState('');
  const [clienteF,    setClienteF]    = useState('');
  const [fechaDesde,  setFechaDesde]  = useState('');
  const [fechaHasta,  setFechaHasta]  = useState('');

  function loadOps() {
    setOps(opService.list());
  }

  useEffect(() => { loadOps(); }, []);

  // ── View switches ──────────────────────────────────────
  if (view === 'detail' && selected) {
    return (
      <OrdenPagoDetail
        op={selected}
        role={role}
        onBack={() => { setView('list'); setSelected(null); }}
        onUpdate={updated => { setSelected(updated); loadOps(); }}
      />
    );
  }

  if (view === 'form') {
    return (
      <OrdenPagoForm
        op={editOp}
        onBack={() => { setView('list'); setEditOp(null); }}
        onSaved={saved => { loadOps(); setView('list'); setEditOp(null); }}
      />
    );
  }

  // ── Filters ───────────────────────────────────────────
  let rows = [...ops];
  if (estadoF !== 'all')  rows = rows.filter(op => op.estadoPago === estadoF);
  if (prioridadF !== 'all') rows = rows.filter(op => op.prioridad === prioridadF);
  if (proveedorF.trim())  rows = rows.filter(op => (op.proveedor || '').toLowerCase().includes(proveedorF.toLowerCase()));
  if (clienteF.trim())    rows = rows.filter(op => (op.clienteNombre || '').toLowerCase().includes(clienteF.toLowerCase()));
  if (fechaDesde)         rows = rows.filter(op => op.fechaSolicitud >= fechaDesde);
  if (fechaHasta)         rows = rows.filter(op => op.fechaSolicitud <= fechaHasta);
  if (search.trim()) {
    const q = search.toLowerCase();
    rows = rows.filter(op => [op.id, op.descripcion, op.solicitante, op.proveedor, op.clienteNombre].join(' ').toLowerCase().includes(q));
  }

  // ── Stats ─────────────────────────────────────────────
  const totalGastado = ops.filter(op => ['pagado_total', 'pagado_parcial'].includes(op.estadoPago)).reduce((s, op) => s + (op.totalFinal || 0), 0);

  function doDelete(id) {
    opService.delete(id);
    loadOps();
    setConfirm(null);
  }

  function doDuplicate(id) {
    opService.duplicate(id);
    loadOps();
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Stats dashboard */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        {STAT_KEYS.map(({ key, label, varColor }, i) => {
          const count = ops.filter(op => op.estadoPago === key).length;
          return (
            <div key={key} style={{ flex: 1, padding: '10px 18px', borderRight: i < STAT_KEYS.length - 1 ? `1px solid ${C.border}` : 'none', cursor: 'pointer' }}
              onClick={() => setEstadoF(estadoF === key ? 'all' : key)}>
              <div style={{ fontSize: 19, fontWeight: 600, color: `var(${varColor})`, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{count}</div>
              <div style={{ fontSize: 10, color: C.text2, marginTop: 3 }}>{label}</div>
            </div>
          );
        })}
        <div style={{ flex: 1, padding: '10px 18px' }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: C.green, lineHeight: 1 }}>{fmtMoney(totalGastado)}</div>
          <div style={{ fontSize: 10, color: C.text2, marginTop: 3 }}>Total gastado</div>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderBottom: `1px solid ${C.border}`, background: C.bg1, flexShrink: 0, flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ position: 'relative', width: 200 }}>
          <svg style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text2)" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar…" style={{ ...iS, paddingLeft: 26, fontSize: 11, padding: '5px 8px 5px 26px' }} />
        </div>

        {/* Estado filter pills */}
        <div style={{ display: 'flex', gap: 1 }}>
          <button onClick={() => setEstadoF('all')} style={{ padding: '3px 8px', borderRadius: 3, border: 'none', fontSize: 10, fontWeight: 500, background: estadoF === 'all' ? C.accentMuted : 'transparent', color: estadoF === 'all' ? C.accent : C.text2, cursor: 'pointer' }}>
            Todos
          </button>
          {Object.entries(OP_STATUS_CFG).map(([k, v]) => (
            <button key={k} onClick={() => setEstadoF(k)} style={{ padding: '3px 8px', borderRadius: 3, border: 'none', fontSize: 10, fontWeight: 500, background: estadoF === k ? C.accentMuted : 'transparent', color: estadoF === k ? C.accent : C.text2, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {v.label}
            </button>
          ))}
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Prioridad */}
          <select value={prioridadF} onChange={e => setPrioridadF(e.target.value)} style={{ ...iS, padding: '4px 8px', fontSize: 11, width: 'auto' }}>
            <option value="all">Prioridad</option>
            {Object.entries(OP_PRIORIDAD_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>

          {/* Cliente */}
          <input value={clienteF} onChange={e => setClienteF(e.target.value)} placeholder="Cliente…" style={{ ...iS, padding: '4px 8px', fontSize: 11, width: 110 }} />

          {/* Proveedor */}
          <input value={proveedorF} onChange={e => setProveedorF(e.target.value)} placeholder="Proveedor…" style={{ ...iS, padding: '4px 8px', fontSize: 11, width: 110 }} />

          {/* Fecha desde */}
          <input type="date" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)} style={{ ...iS, padding: '4px 8px', fontSize: 11, width: 130 }} />
          <input type="date" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)} style={{ ...iS, padding: '4px 8px', fontSize: 11, width: 130 }} />

          {/* Export */}
          <button onClick={() => exportOpCSV(rows)} title="Exportar Excel" style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 4, border: `1px solid ${C.border}`, background: 'transparent', color: C.text2, cursor: 'pointer', fontSize: 10 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Excel
          </button>

          {/* Nueva orden */}
          <button onClick={() => { setEditOp(null); setView('form'); }} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 4, border: 'none', background: C.accent, color: '#fff', fontSize: 11, fontWeight: 500, cursor: 'pointer' }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nueva orden
          </button>
        </div>
      </div>

      {/* Table header */}
      <div style={{ display: 'grid', gridTemplateColumns: COLS, padding: '4px 18px', borderBottom: `1px solid ${C.border}`, background: C.bg1, flexShrink: 0 }}>
        {HEADERS.map(h => (
          <div key={h} style={{ fontSize: 9, fontWeight: 600, color: C.text2, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</div>
        ))}
      </div>

      {/* Rows */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {rows.length === 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 160, color: C.text2, fontSize: 12 }}>
            {ops.length === 0 ? 'Aún no hay órdenes de pago. Creá la primera.' : 'Sin resultados con los filtros aplicados.'}
          </div>
        )}
        {rows.map((op, i) => (
          <div key={op.id}
            onClick={() => { setSelected(op); setView('detail'); }}
            style={{ display: 'grid', gridTemplateColumns: COLS, padding: '8px 18px', borderBottom: `1px solid ${C.border}`, cursor: 'pointer', transition: 'background 0.08s', background: i % 2 === 0 ? 'transparent' : 'rgba(128,100,80,0.03)', alignItems: 'center' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg2)')}
            onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(128,100,80,0.03)')}
          >
            {/* ID */}
            <div style={{ fontSize: 9, fontFamily: 'IBM Plex Mono', color: C.text2 }}>{op.id?.split('-').slice(2).join('-')}</div>
            {/* Fecha */}
            <div style={{ fontSize: 11, color: C.text1 }}>{op.fechaSolicitud}</div>
            {/* Descripción */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 500, color: C.text0, lineHeight: 1.3, marginBottom: 2 }}>{op.descripcion}</div>
              {op.clienteNombre && <div style={{ fontSize: 10, color: C.text2 }}>{op.clienteNombre}</div>}
            </div>
            {/* Solicitante */}
            <div style={{ fontSize: 11, color: C.text1 }}>{op.solicitante}</div>
            {/* Proveedor */}
            <div style={{ fontSize: 11, color: C.text1 }}>{op.proveedor || '—'}</div>
            {/* Total */}
            <div style={{ fontSize: 12, fontWeight: 600, color: C.text0, fontVariantNumeric: 'tabular-nums' }}>
              {fmtMoney(op.totalFinal, op.moneda)}
            </div>
            {/* Tipo pago */}
            <div style={{ fontSize: 10, color: C.text2 }}>{op.tipoPago}</div>
            {/* Estado */}
            <div><StatusBadgeOP estado={op.estadoPago} /></div>
            {/* Fecha pago */}
            <div style={{ fontSize: 10, color: C.text2 }}>{op.fechaPago || '—'}</div>
            {/* Prioridad */}
            <div><PriBadgeOP prioridad={op.prioridad} /></div>
            {/* Acciones */}
            <div style={{ display: 'flex', gap: 4 }}>
              <ActionBtn onClick={() => { setSelected(op); setView('detail'); }} title="Ver detalle">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                Ver
              </ActionBtn>
              <ActionBtn onClick={() => { setEditOp(op); setView('form'); }} title="Editar">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </ActionBtn>
              <ActionBtn onClick={() => doDuplicate(op.id)} title="Duplicar">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
              </ActionBtn>
              <ActionBtn onClick={() => setConfirm(op.id)} title="Eliminar" danger>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
              </ActionBtn>
            </div>
          </div>
        ))}
      </div>

      {/* Confirm delete */}
      {confirm && (
        <Modal title="Eliminar orden" onClose={() => setConfirm(null)} width={340}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ fontSize: 12, color: C.text1, lineHeight: 1.5 }}>
              ¿Confirmás que querés eliminar la orden <span style={{ fontFamily: 'IBM Plex Mono', color: C.text0 }}>{confirm}</span>? Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => setConfirm(null)} style={{ padding: '5px 12px', borderRadius: 4, border: `1px solid ${C.border}`, background: 'transparent', color: C.text1, fontSize: 12, cursor: 'pointer' }}>Cancelar</button>
              <button onClick={() => doDelete(confirm)} style={{ padding: '5px 14px', borderRadius: 4, border: 'none', background: C.red, color: '#fff', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>Eliminar</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
