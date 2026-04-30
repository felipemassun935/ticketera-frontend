export const QUEUES = [
  { id: 'it',        name: 'IT Soporte',  owner: 'Camilo Reyes', color: '#CF7452' },
  { id: 'dev',       name: 'Desarrollo',  owner: 'Ana Ríos',     color: '#5ca89a' },
  { id: 'devops',    name: 'DevOps',      owner: 'Camilo Reyes', color: '#6892b4' },
  { id: 'analytics', name: 'Analytics',   owner: 'Luis Herrera', color: '#c98c4a' },
  { id: 'finance',   name: 'Finanzas',    owner: 'Luis Herrera', color: '#78b07a' },
  { id: 'hr',        name: 'RRHH',        owner: 'Ana Ríos',     color: '#9b78b0' },
  { id: 'security',  name: 'Seguridad',   owner: 'Camilo Reyes', color: '#c46262' },
];

export const AGENTS = ['Camilo Reyes', 'Ana Ríos', 'Luis Herrera'];

export const UPDATE_CATS = [
  'Diagnóstico',
  'Escalado',
  'Información adicional',
  'Resolución',
  'Seguimiento',
  'Cierre',
  'Reasignación',
  'Otro',
];

export const STATUS_CFG = {
  new:      { label: 'Nuevo',     varColor: '--blue'   },
  open:     { label: 'Abierto',   varColor: '--accent'  },
  pending:  { label: 'Pendiente', varColor: '--amber'   },
  paused:   { label: 'Pausado',   varColor: '--text2'   },
  resolved: { label: 'Resuelto',  varColor: '--green'   },
  closed:   { label: 'Cerrado',   varColor: '--text2'   },
};

export const PRI_CFG = {
  urgent: { label: 'Urgente', varColor: '--red'   },
  high:   { label: 'Alta',    varColor: '--amber'  },
  medium: { label: 'Media',   varColor: '--blue'   },
  low:    { label: 'Baja',    varColor: '--text2'  },
};

export const ROLE_USERS = {
  agent:    'Camilo Reyes',
  admin:    'Patricia Lara',
  customer: 'María García',
};

export const NOW = new Date('2026-04-29T11:00');

export const CATEGORIES = [
  'Infraestructura',
  'Bug',
  'Acceso Software',
  'Hardware',
  'Seguridad',
  'Identidad',
  'Onboarding',
  'Finanzas',
  'Otro',
];

export const SLA_MAP = {
  urgent: ['1h',  '4h' ],
  high:   ['4h',  '8h' ],
  medium: ['8h',  '24h'],
  low:    ['24h', '72h'],
};
