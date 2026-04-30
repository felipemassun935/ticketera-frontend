export function slaVarColor(dl, status, pausedAt) {
  if (['resolved', 'closed'].includes(status)) return '--green';
  if (status === 'paused') return '--text2';
  if (!dl) return '--text1';
  const r = (new Date(dl) - new Date()) / 60000;
  return r < 0 ? '--red' : r < 60 ? '--red' : r < 180 ? '--amber' : '--text1';
}

function fmtDuration(totalMinutes) {
  const abs  = Math.abs(Math.floor(totalMinutes));
  const days = Math.floor(abs / 1440);
  const hrs  = Math.floor((abs % 1440) / 60);
  const mins = abs % 60;

  if (days > 0) return `${days}d ${hrs}h`;
  if (hrs  > 0) return `${hrs}h ${mins}m`;
  return `${mins}m`;
}

export function slaLabel(dl, status, pausedAt) {
  if (['resolved', 'closed'].includes(status)) return 'Cumplido';
  if (!dl) return '—';

  if (status === 'paused' && pausedAt) {
    // Show time remaining frozen at the moment of pause
    const frozenMinutes = (new Date(dl) - new Date(pausedAt)) / 60000;
    return `Pausado · ${fmtDuration(frozenMinutes)}`;
  }

  const r = (new Date(dl) - new Date()) / 60000;
  if (r < 0) return `Vencido ${fmtDuration(r)}`;
  return `${fmtDuration(r)} restantes`;
}
