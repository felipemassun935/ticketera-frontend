export function timeAgo(ts) {
  const mins = Math.floor((new Date() - new Date(ts)) / 60000);
  if (mins < 1)    return 'ahora';
  if (mins < 60)   return `${mins}m`;
  if (mins < 1440) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  const d = Math.floor(mins / 1440);
  const h = Math.floor((mins % 1440) / 60);
  return h > 0 ? `${d}d ${h}h` : `${d}d`;
}

export function fmtTs(ts) {
  const d = new Date(ts);
  return (
    d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' }) +
    ' · ' +
    d.toTimeString().slice(0, 5)
  );
}
