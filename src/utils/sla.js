import { NOW } from '../constants';

export function slaVarColor(dl, status) {
  if (['resolved', 'closed'].includes(status)) return '--green';
  const r = (new Date(dl) - NOW) / 60000;
  return r < 0 ? '--red' : r < 60 ? '--red' : r < 180 ? '--amber' : '--text1';
}

export function slaLabel(dl, status) {
  if (['resolved', 'closed'].includes(status)) return 'Cumplido';
  const r = Math.floor((new Date(dl) - NOW) / 60000);
  if (r < 0)    return `Vencido ${Math.abs(r)}m`;
  if (r < 60)   return `${r}m restantes`;
  if (r < 1440) return `${Math.floor(r / 60)}h restantes`;
  return `${Math.floor(r / 1440)}d restantes`;
}
