export const OP_STATUS_CFG = {
  pendiente_aprobacion: { label: 'Pendiente aprobación', varColor: '--text2'  },
  aprobada:             { label: 'Aprobada',              varColor: '--blue'   },
  rechazada:            { label: 'Rechazada',             varColor: '--red'    },
  pendiente_pago:       { label: 'Pendiente pago',        varColor: '--amber'  },
  pagado_parcial:       { label: 'Pagado parcial',        varColor: '--accent' },
  pagado_total:         { label: 'Pagado total',          varColor: '--green'  },
  cancelada:            { label: 'Cancelada',             varColor: '--text1'  },
};

export const OP_PRIORIDAD_CFG = {
  normal:  { label: 'Normal',   varColor: '--text2' },
  urgente: { label: 'Urgente',  varColor: '--amber' },
  critica: { label: 'Crítica',  varColor: '--red'   },
};

export const OP_TIPO_ITEM = ['Producto', 'Servicio', 'Suscripción', 'Repuesto', 'Licencia'];
export const OP_MONEDAS   = ['ARS', 'USD', 'EUR'];
export const OP_TIPO_PAGO = ['Transferencia', 'Tarjeta', 'Efectivo', 'Cheque', 'MercadoPago', 'Cuenta corriente'];
export const OP_AREAS     = ['IT', 'Finanzas', 'RRHH', 'Operaciones', 'Comercial', 'Dirección', 'Otro'];
export const OP_UNIDADES  = ['unidad', 'licencia', 'hora', 'mes', 'año', 'kit', 'caja'];

// Which states a given state can transition to
export const OP_TRANSITIONS = {
  pendiente_aprobacion: ['aprobada', 'rechazada', 'cancelada'],
  aprobada:             ['pendiente_pago', 'cancelada'],
  rechazada:            [],
  pendiente_pago:       ['pagado_parcial', 'pagado_total', 'cancelada'],
  pagado_parcial:       ['pagado_total', 'cancelada'],
  pagado_total:         [],
  cancelada:            [],
};
