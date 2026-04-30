import { NOW } from '../constants';

export function timeAgo(ts) {
  const d = Math.floor((NOW - new Date(ts)) / 60000);
  if (d < 1)    return 'ahora';
  if (d < 60)   return `${d}m`;
  if (d < 1440) return `${Math.floor(d / 60)}h`;
  return `${Math.floor(d / 1440)}d`;
}

export function fmtTs(ts) {
  const d = new Date(ts);
  return (
    d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' }) +
    ' · ' +
    d.toTimeString().slice(0, 5)
  );
}
