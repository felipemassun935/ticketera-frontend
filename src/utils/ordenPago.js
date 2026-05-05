export function calcSubtotal(cantidad, precioUnitario) {
  return (Number(cantidad) || 0) * (Number(precioUnitario) || 0);
}

export function calcTotal(subtotal, iva, costoEnvio, descuento) {
  return (Number(subtotal) || 0) + (Number(iva) || 0) + (Number(costoEnvio) || 0) - (Number(descuento) || 0);
}

export function fmtMoney(amount, moneda = 'ARS') {
  if (amount === null || amount === undefined || amount === '') return '-';
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: moneda,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function exportOpCSV(ops) {
  const headers = ['ID', 'Fecha', 'Solicitante', 'Cliente', 'Descripción', 'Proveedor',
    'Total', 'Moneda', 'Tipo Pago', 'Estado', 'Fecha Pago', 'N° Factura', 'N° Comprobante'];
  const rows = ops.map(op => [
    op.id,
    op.fechaSolicitud,
    op.solicitante,
    op.clienteNombre || '',
    op.descripcion,
    op.proveedor || '',
    op.totalFinal,
    op.moneda,
    op.tipoPago,
    op.estadoPago,
    op.fechaPago || '',
    op.numeroFactura || '',
    op.numeroComprobante || '',
  ]);
  const csv = [headers, ...rows]
    .map(row => row.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ordenes-pago-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
