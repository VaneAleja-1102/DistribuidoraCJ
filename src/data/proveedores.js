let proveedores = [
  { id: 1, nombre: 'Pintuco', telefono: '3001234567', email: 'pintuco@gmail.com' },
  { id: 2, nombre: 'Pintuland', telefono: '3109876543', email: 'pintuland@gmail.com' },
  { id: 3, nombre: 'LijasCol', telefono: '3109876543', email: 'lijas@gmail.com'}
];

let siguienteId = proveedores.length > 0
  ? Math.max(...proveedores.map((p) => p.id)) + 1
  : 1;

module.exports = {
  proveedores,
  getSiguienteId: () => siguienteId++,
};