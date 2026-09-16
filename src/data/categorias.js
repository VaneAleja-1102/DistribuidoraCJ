  let categorias = [
    { id: 1, nombre: 'Pinturas', descripcion: 'Productos de pinturas' },
    { id: 2, nombre: 'Lijas', descripcion: 'Producto para alisar, limpiar superficies' },
    { id: 3, nombre: 'Tinner', descripcion: 'Producto para limpiar'}
  ];

  let siguienteId = categorias.length > 0
    ? Math.max(...categorias.map((c) => c.id)) + 1
    : 1;

  module.exports = {
    categorias,
    getSiguienteId: () => siguienteId++,
  };