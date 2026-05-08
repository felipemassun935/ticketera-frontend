const KEY = 'ticketera_ops_v2';

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
  catch { return []; }
}

function save(ops) { localStorage.setItem(KEY, JSON.stringify(ops)); }

function nextId() {
  const ops = load();
  const year = new Date().getFullYear();
  const num  = String(ops.length + 1).padStart(4, '0');
  return `OP-${year}-${num}`;
}

export const opService = {
  list() {
    return [...load()].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  },

  get(id) { return load().find(op => op.id === id) || null; },

  create(data) {
    const ops = load();
    const now = new Date().toISOString();
    const op = {
      ...data,
      id: nextId(),
      estado: 'pendiente_aprobacion',
      costoFinal: '', tipoPago: '', detallePago: '', fechaEntrega: '',
      history: [{
        type: 'created',
        usuario: data.solicitante || 'Sistema',
        accion: 'Orden creada',
        nota: `Orden de compra creada. Producto: ${data.descripcion}`,
        fecha: now,
      }],
      createdAt: now,
      updatedAt: now,
    };
    ops.push(op);
    save(ops);
    return op;
  },

  update(id, data) {
    const ops = load();
    const idx = ops.findIndex(op => op.id === id);
    if (idx === -1) throw new Error('Orden no encontrada');
    const now = new Date().toISOString();
    ops[idx] = { ...ops[idx], ...data, updatedAt: now };
    ops[idx].history = [
      ...(ops[idx].history || []),
      { type: 'edit', usuario: data._usuario || 'Usuario', accion: 'Datos actualizados', nota: 'Se editaron los datos de la orden.', fecha: now },
    ];
    save(ops);
    return ops[idx];
  },

  updateSeguimiento(id, seguimiento, usuario) {
    const ops = load();
    const idx = ops.findIndex(op => op.id === id);
    if (idx === -1) throw new Error('Orden no encontrada');
    const now = new Date().toISOString();
    const cambios = Object.entries(seguimiento)
      .filter(([, v]) => v !== undefined && v !== '')
      .map(([k, v]) => {
        const labels = { fechaEntrega: 'Fecha entrega', costoFinal: 'Costo final', tipoPago: 'Tipo de pago', detallePago: 'Detalle' };
        return `${labels[k] || k}: ${v}`;
      }).join(' · ');
    ops[idx] = { ...ops[idx], ...seguimiento, updatedAt: now };
    ops[idx].history = [
      ...(ops[idx].history || []),
      { type: 'seguimiento', usuario, accion: 'Seguimiento actualizado', nota: cambios || 'Datos de seguimiento actualizados.', fecha: now },
    ];
    save(ops);
    return ops[idx];
  },

  changeStatus(id, newEstado, usuario, nota = '') {
    const ops = load();
    const idx = ops.findIndex(op => op.id === id);
    if (idx === -1) throw new Error('Orden no encontrada');
    const oldLabel = ops[idx].estado;
    const now = new Date().toISOString();
    ops[idx].estado = newEstado;
    ops[idx].history = [
      ...(ops[idx].history || []),
      { type: 'estado', usuario, accion: 'Cambio de estado', nota: `${oldLabel} → ${newEstado}${nota ? '. ' + nota : ''}`, fecha: now },
    ];
    ops[idx].updatedAt = now;
    save(ops);
    return ops[idx];
  },

  addNote(id, usuario, nota) {
    const ops = load();
    const idx = ops.findIndex(op => op.id === id);
    if (idx === -1) throw new Error('Orden no encontrada');
    const now = new Date().toISOString();
    ops[idx].history = [
      ...(ops[idx].history || []),
      { type: 'nota', usuario, accion: 'Observación', nota, fecha: now },
    ];
    ops[idx].updatedAt = now;
    save(ops);
    return ops[idx];
  },

  delete(id) { save(load().filter(op => op.id !== id)); },

  duplicate(id) {
    const src = this.get(id);
    if (!src) throw new Error('Orden no encontrada');
    const { id: _id, createdAt: _c, updatedAt: _u, history: _h, estado: _e, costoFinal: _cf, tipoPago: _tp, detallePago: _dp, fechaEntrega: _fe, ...rest } = src;
    return this.create(rest);
  },
};
