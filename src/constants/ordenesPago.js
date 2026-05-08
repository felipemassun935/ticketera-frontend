export const OP_STATUS_CFG = {
  pendiente_aprobacion: { label: 'Pendiente aprobación', varColor: '--text2'  },
  aprobada:             { label: 'Aprobada',              varColor: '--blue'   },
  rechazada:            { label: 'Rechazada',             varColor: '--red'    },
  en_proceso:           { label: 'En proceso',            varColor: '--accent' },
  entregada:            { label: 'Entregada',             varColor: '--green'  },
  cancelada:            { label: 'Cancelada',             varColor: '--text1'  },
};

export const OP_TRANSITIONS = {
  pendiente_aprobacion: ['aprobada', 'rechazada', 'cancelada'],
  aprobada:             ['en_proceso', 'cancelada'],
  rechazada:            [],
  en_proceso:           ['entregada', 'cancelada'],
  entregada:            [],
  cancelada:            [],
};

export const OP_TIPO_PAGO = ['Transferencia', 'Tarjeta', 'Efectivo', 'Cheque', 'MercadoPago', 'Cuenta corriente', 'Otro'];
export const OP_AREAS     = ['IT', 'Finanzas', 'RRHH', 'Operaciones', 'Comercial', 'Dirección', 'Otro'];
