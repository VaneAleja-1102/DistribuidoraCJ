const { categorias, getSiguienteId } = require('../data/categorias');

const obtenerTodas = async () => {
  return categorias;
};

const obtenerPorId = async (id) => {
  const categoria = categorias.find((c) => c.id === Number(id));
  if (!categoria) {
    const error = new Error('Categoría no encontrada');
    error.status = 404;
    throw error;
  }
  return categoria;
};

const crear = async (datos) => {
  const nuevaCategoria = {
    id: getSiguienteId(),
    nombre: datos.nombre,
    descripcion: datos.descripcion || '',
  };
  categorias.push(nuevaCategoria);
  return nuevaCategoria;
};

const actualizar = async (id, datos) => {
  const categoria = await obtenerPorId(id);
  Object.assign(categoria, datos);
  return categoria;
};

const eliminar = async (id) => {
  const index = categorias.findIndex((c) => c.id === Number(id));
  if (index === -1) {
    const error = new Error('Categoría no encontrada');
    error.status = 404;
    throw error;
  }
  categorias.splice(index, 1);
  return { mensaje: 'Categoría eliminada correctamente' };
};

module.exports = {
  obtenerTodas,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
};