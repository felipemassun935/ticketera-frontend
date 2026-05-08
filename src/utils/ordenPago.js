export function fmtMoney(amount) {
  if (amount === null || amount === undefined || amount === '' || isNaN(Number(amount))) return '—';
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2 }).format(Number(amount));
}

export function exportOpCSV(ops) {
  const headers = ['ID', 'Fecha pedido', 'Solicitante', 'Cliente', 'Descripción', 'Cantidad', 'Monto unitario', 'Costo final', 'Tipo pago', 'Estado', 'Fecha entrega', 'Área', 'Sede'];
  const rows = ops.map(op => [
    op.id, op.fechaPedido, op.solicitante, op.clienteAsociado || '',
    op.descripcion, op.cantidad, op.montoUnitario, op.costoFinal || '',
    op.tipoPago || '', op.estado, op.fechaEntrega || '',
    op.areaImplementacion || '', op.sedeImplementacion || '',
  ]);
  const csv = [headers, ...rows]
    .map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = `ordenes-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
  URL.revokeObjectURL(url);
}
