export const SLA_RULES = [
  { id: 1, name: 'Urgente — crítico',    priority: 'urgent', dept: 'all', r1: '1h',  res: '4h',  esc: '2h',  on: true },
  { id: 2, name: 'Alta prioridad',        priority: 'high',   dept: 'all', r1: '4h',  res: '8h',  esc: '6h',  on: true },
  { id: 3, name: 'Media prioridad',       priority: 'medium', dept: 'all', r1: '8h',  res: '24h', esc: '16h', on: true },
  { id: 4, name: 'Baja prioridad',        priority: 'low',    dept: 'all', r1: '24h', res: '72h', esc: '48h', on: true },
  { id: 5, name: 'Bug producción — Dev',  priority: 'urgent', dept: 'Dev', r1: '30m', res: '2h',  esc: '1h',  on: true },
  { id: 6, name: 'Onboarding — RRHH',     priority: 'medium', dept: 'HR',  r1: '4h',  res: '48h', esc: '24h', on: true },
];
