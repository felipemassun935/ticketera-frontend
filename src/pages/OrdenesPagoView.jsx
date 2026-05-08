import { useState, useEffect } from 'react';
import { C, iS } from '../styles/tokens';
import { OP_STATUS_CFG } from '../constants/ordenesPago';
import { fmtMoney, exportOpCSV } from '../utils/ordenPago';
import { opService } from '../services/ordenPagoService';
import OrdenPagoForm from './OrdenPagoForm';
import OrdenPagoDetail from './OrdenPagoDetail';

function StatusBadge({ estado }) {
  const c = OP_STATUS_CFG[estado] || { label: estado, varColor: '--text2' };
  return <span style={{ fontSize: 10, fontWeight: 600, color: `var(${c.varColor})` }}>{c.label}</span>;
}

const STAT_KEYS = [
  { key: 'pendiente_aprobacion', label: 'Pendientes',  varColor: '--text2'  },
  { key: 'confirmada',           label: 'Confirmadas', varColor: '--blue'   },
  { key: 'en_camino',            label: 'En camino',   varColor: '--accent' },
  { key: 'entregada',            label: 'Entregadas',  varColor: '--green'  },
];

const COLS = '60px 100px 1fr 140px 140px 120px 90px 80px';
const HEADERS = ['ID', 'Fecha', 'Descripción', 'Solicitante', 'Cliente', 'Subtotal', 'Estado', 'Acciones'];

export default function OrdenesPagoView({ role }) {
  const [view,     setView]     = useState('list');
  const [ops,      setOps]      = useState([]);
  const [selected, setSelected] = useState(null);
  const [editOp,   setEditOp]   = useState(null);
  const [confirm,  setConfirm]  = useState(null);
  const [search,   setSearch]   = useState('');
  const [estadoF,  setEstadoF]  = useState('all');

  function reload() { setOps(opService.list()); }
  useEffect(() => { reload(); }, []);

  if (view === 'detail' && selected) {
    return (
      <OrdenPagoDetail
        op={selected}
        role={role}
        onBack={() => { setView('list'); setSelected(null); }}
        onUpdate={updated => { setSelected(updated); reload(); }}
        onEdit={() => { setEditOp(selected); setView('form'); }}
      />
    );
  }

  if (view === 'form') {
    return (
      <OrdenPagoForm
        op={editOp}
        onBack={() => { setView('list'); setEditOp(null); }}
        onSaved={saved => {
          reload();
          if (editOp) { setSelected(saved); setView('detail'); }
          else { setView('list'); }
          setEditOp(null);
        }}
      />
    );
  }

  let rows = [...ops];
  if (estadoF !== 'all') rows = rows.filter(op => op.estado === estadoF);
  if (search.trim()) {
    const q = search.toLowerCase();
    rows = rows.filter(op => [op.id, op.descripcion, op.solicitante, op.clienteAsociado].join(' ').toLowerCase().includes(q));
  }

  const totalEntregado = ops
    .filter(op => ['en_camino', 'entregada'].includes(op.estado))
    .reduce((s, op) => s + (Number(op.costoFinal) || (Number(op.cantidad) || 0) * (Number(op.montoUnitario) || 0)), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Stats */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        {STAT_KEYS.map(({ key, label, varColor }, i) => (
          <div key={key}
            style={{ flex: 1, padding: '10px 18px', borderRight: i < STAT_KEYS.length - 1 ? `1px solid ${C.border}` : 'none', cursor: 'pointer' }}
            onClick={() => setEstadoF(estadoF === key ? 'all' : key)}>
            <div style={{ fontSize: 20, fontWeight: 600, color: `var(${varColor})`, lineHeight: 1 }}>{ops.filter(op => op.estado === key).length}</div>
            <div style={{ fontSize: 10, color: C.text2, marginTop: 3 }}>{label}</div>
          </div>
        ))}
        <div style={{ flex: 1, padding: '10px 18px' }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--green)', lineHeight: 1 }}>{fmtMoney(totalEntregado)}</div>
          <div style={{ fontSize: 10, color: C.text2, marginTop: 3 }}>Total entregado</div>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderBottom: `1px solid ${C.border}`, background: C.bg1, flexShrink: 0 }}>
        <div style={{ position: 'relative', width: 220 }}>
          <svg style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)' }} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--text2)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar…" style={{ ...iS, paddingLeft: 26, fontSize: 11 }} />
        </div>

        <div style={{ display: 'flex', gap: 1 }}>
          <button onClick={() => setEstadoF('all')} style={{ padding: '3px 9px', borderRadius: 3, border: 'none', fontSize: 10, fontWeight: 500, background: estadoF === 'all' ? C.accentMuted : 'transparent', color: estadoF === 'all' ? C.accent : C.text2, cursor: 'pointer' }}>Todos</button>
          {Object.entries(OP_STATUS_CFG).map(([k, v]) => (
            <button key={k} onClick={() => setEstadoF(k)} style={{ padding: '3px 9px', borderRadius: 3, border: 'none', fontSize: 10, fontWeight: 500, background: estadoF === k ? C.accentMuted : 'transparent', color: estadoF === k ? C.accent : C.text2, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {v.label}
            </button>
          ))}
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button onClick={() => exportOpCSV(rows)}
            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 4, border: `1px solid ${C.border}`, background: 'transparent', color: C.text2, cursor: 'pointer', fontSize: 10 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Excel
          </button>
          <button onClick={() => { setEditOp(null); setView('form'); }}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 4, border: 'none', background: 'var(--accent)', color: '#fff', fontSize: 11, fontWeight: 500, cursor: 'pointer' }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nueva orden
          </button>
        </div>
      </div>

      {/* Table header */}
      <div style={{ display: 'grid', gridTemplateColumns: COLS, padding: '5px 18px', borderBottom: `1px solid ${C.border}`, background: C.bg1, flexShrink: 0, gap: 10 }}>
        {HEADERS.map(h => <div key={h} style={{ fontSize: 9, fontWeight: 600, color: C.text2, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</div>)}
      </div>

      {/* Rows */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {rows.length === 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 160, color: C.text2, fontSize: 12 }}>
            {ops.length === 0 ? 'Aún no hay órdenes. Creá la primera.' : 'Sin resultados para los filtros aplicados.'}
          </div>
        )}
        {rows.map((op, i) => {
          const subtotal = (Number(op.cantidad) || 0) * (Number(op.montoUnitario) || 0);
          const border   = i < rows.length - 1 ? `1px solid ${C.border}` : 'none';
          if (confirm === op.id) {
            return (
              <div key={op.id} style={{ padding: '10px 18px', borderBottom: border, display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(200,80,80,0.04)' }}>
                <span style={{ fontSize: 11, color: C.text1, flex: 1 }}>¿Eliminar orden <b style={{ color: C.text0 }}>{op.id}</b>?</span>
                <button onClick={() => { opService.delete(op.id); reload(); setConfirm(null); }} style={{ fontSize: 10, fontWeight: 500, color: '#fff', background: 'var(--red)', border: 'none', borderRadius: 3, padding: '3px 10px', cursor: 'pointer' }}>Eliminar</button>
                <button onClick={() => setConfirm(null)} style={{ fontSize: 10, color: C.text2, background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 3, padding: '3px 10px', cursor: 'pointer' }}>Cancelar</button>
              </div>
            );
          }
          return (
            <div key={op.id}
              onClick={() => { setSelected(op); setView('detail'); }}
              style={{ display: 'grid', gridTemplateColumns: COLS, padding: '9px 18px', borderBottom: border, cursor: 'pointer', alignItems: 'center', gap: 10, transition: 'background 0.08s' }}
              onMouseEnter={e => (e.currentTarget.style.background = C.bg2)}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{ fontSize: 9, fontFamily: 'IBM Plex Mono', color: C.text2 }}>{op.id?.slice(-7)}</div>
              <div style={{ fontSize: 11, color: C.text1 }}>{op.fechaPedido}</div>
              <div style={{ fontSize: 12, fontWeight: 500, color: C.text0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{op.descripcion}</div>
              <div style={{ fontSize: 11, color: C.text1 }}>{op.solicitante}</div>
              <div style={{ fontSize: 11, color: C.text1 }}>{op.clienteAsociado || '—'}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.text0, fontVariantNumeric: 'tabular-nums' }}>{fmtMoney(subtotal)}</div>
              <StatusBadge estado={op.estado} />
              <div style={{ display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
                <button onClick={() => { setSelected(op); setView('detail'); }} title="Ver"
                  style={{ padding: '3px 7px', borderRadius: 3, border: `1px solid ${C.border}`, background: 'transparent', color: C.text2, cursor: 'pointer', fontSize: 10, transition: 'all 0.1s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = C.bg3)}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>Ver</button>
                <button onClick={() => setConfirm(op.id)} title="Eliminar"
                  style={{ padding: '3px 7px', borderRadius: 3, border: `1px solid ${C.border}`, background: 'transparent', color: 'var(--red)', cursor: 'pointer', fontSize: 10, transition: 'all 0.1s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = C.bg3)}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>✕</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
