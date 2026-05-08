export const OP_STATUS_CFG = {
  pendiente_aprobacion: { label: 'Pendiente',   varColor: '--text2'  },
  confirmada:           { label: 'Confirmada',  varColor: '--blue'   },
  en_camino:            { label: 'En camino',   varColor: '--accent' },
  entregada:            { label: 'Entregada',   varColor: '--green'  },
  cancelada:            { label: 'Cancelada',   varColor: '--red'    },
};

export const OP_TRANSITIONS = {
  pendiente_aprobacion: ['confirmada', 'cancelada'],
  confirmada:           ['en_camino',  'cancelada'],
  en_camino:            ['entregada',  'cancelada'],
  entregada:            [],
  cancelada:            [],
};

export const OP_TIPO_PAGO = ['Transferencia', 'Tarjeta', 'Efectivo', 'Cheque', 'MercadoPago', 'Cuenta corriente', 'Otro'];
export const OP_AREAS     = ['IT', 'Finanzas', 'RRHH', 'Operaciones', 'Comercial', 'Dirección', 'Otro'];
