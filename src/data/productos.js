let productos = [
  {
    id: 1,
    nombre: 'Caneca pintura',
    precio: 250000,
    stock: 10,
    categoriaId: 1,   // pinturas
    proveedorId: 1,   // pintuco
  },
  {
    id: 2,
    nombre: 'Galon Pintura Mate',
    precio: 50000,
    stock: 5,
    categoriaId: 1,   // pinturas
    proveedorId: 2,   // pintuland
  },
  {
    id: 3,
    nombre: 'Lija 180 roja',
    precio: 1800,
    stock: 20,
    categoriaId: 2,   // lijas
    proveedorId: 3,   // lijascol
  },
];

let siguienteId = productos.length > 0
  ? Math.max(...productos.map((p) => p.id)) + 1
  : 1;

module.exports = {
  productos,
  getSiguienteId: () => siguienteId++,
};