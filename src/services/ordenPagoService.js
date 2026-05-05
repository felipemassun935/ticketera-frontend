// localStorage-based persistence for Órdenes de Pago.
// Replace load/save with real API calls when the backend is ready.

const KEY = 'ticketera_ops';

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
  catch { return []; }
}

function save(ops) {
  localStorage.setItem(KEY, JSON.stringify(ops));
}

function nextId() {
  const ops  = load();
  const year = new Date().getFullYear();
  const num  = String(ops.length + 1).padStart(4, '0');
  return `OP-${year}-${num}`;
}

export const opService = {
  list() {
    return [...load()].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  },

  get(id) {
    return load().find(op => op.id === id) || null;
  },

  create(data) {
    const ops = load();
    const now = new Date().toISOString();
    const op = {
      ...data,
      id: nextId(),
      estadoPago: 'pendiente_aprobacion',
      history: [{
        usuario: data.solicitante || 'Sistema',
        accion: 'Orden creada',
        fecha: now,
        cambio: 'Orden de pago creada con estado Pendiente aprobación',
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
    if (idx === -1) throw new Error('OP no encontrada');
    ops[idx] = { ...ops[idx], ...data, updatedAt: new Date().toISOString() };
    save(ops);
    return ops[idx];
  },

  delete(id) {
    save(load().filter(op => op.id !== id));
  },

  changeStatus(id, newStatus, usuario, nota = '') {
    const ops = load();
    const idx = ops.findIndex(op => op.id === id);
    if (idx === -1) throw new Error('OP no encontrada');
    const oldLabel = ops[idx].estadoPago;
    ops[idx].estadoPago = newStatus;
    ops[idx].history = [
      ...(ops[idx].history || []),
      {
        usuario,
        accion: 'Cambio de estado',
        fecha: new Date().toISOString(),
        cambio: `${usuario} cambió estado de "${oldLabel}" a "${newStatus}"${nota ? '. ' + nota : ''}`,
      },
    ];
    ops[idx].updatedAt = new Date().toISOString();
    save(ops);
    return ops[idx];
  },

  addNote(id, usuario, nota) {
    const ops = load();
    const idx = ops.findIndex(op => op.id === id);
    if (idx === -1) throw new Error('OP no encontrada');
    ops[idx].history = [
      ...(ops[idx].history || []),
      { usuario, accion: 'Nota', fecha: new Date().toISOString(), cambio: nota },
    ];
    ops[idx].updatedAt = new Date().toISOString();
    save(ops);
    return ops[idx];
  },

  duplicate(id) {
    const src = this.get(id);
    if (!src) throw new Error('OP no encontrada');
    const { id: _id, createdAt: _c, updatedAt: _u, history: _h, estadoPago: _e, ...rest } = src;
    return this.create(rest);
  },
};
