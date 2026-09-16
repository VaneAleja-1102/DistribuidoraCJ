let ventas = [];
// Cada venta tendrá esta forma:
// {
//   id: 1,
//   fecha: '2026-09-15T10:30:00.000Z',
//   total: 25500,
//   detalle: [
//     { productoId: 1, nombre: 'Arroz Diana 500g', cantidad: 2, precioUnitario: 3500, subtotal: 7000 },
//     { productoId: 2, nombre: 'Detergente Fab 1kg', cantidad: 1, precioUnitario: 12000, subtotal: 12000 }
//   ]
// }

let siguienteId = ventas.length > 0
  ? Math.max(...ventas.map((v) => v.id)) + 1
  : 1;

module.exports = {
  ventas,
  getSiguienteId: () => siguienteId++,
};