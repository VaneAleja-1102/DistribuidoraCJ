const { proveedores, getSiguienteId } = require('../data/proveedores');

const obtenerTodos = async () => {
  return proveedores;
};

const obtenerPorId = async (id) => {
  const proveedor = proveedores.find((p) => p.id === Number(id));
  if (!proveedor) {
    const error = new Error('Proveedor no encontrado');
    error.status = 404;
    throw error;
  }
  return proveedor;
};

const crear = async (datos) => {
  const nuevoProveedor = {
    id: getSiguienteId(),
    nombre: datos.nombre,
    telefono: datos.telefono || '',
    email: datos.email || '',
  };
  proveedores.push(nuevoProveedor);
  return nuevoProveedor;
};

const actualizar = async (id, datos) => {
  const proveedor = await obtenerPorId(id);
  Object.assign(proveedor, datos);
  return proveedor;
};

const eliminar = async (id) => {
  const index = proveedores.findIndex((p) => p.id === Number(id));
  if (index === -1) {
    const error = new Error('Proveedor no encontrado');
    error.status = 404;
    throw error;
  }
  proveedores.splice(index, 1);
  return { mensaje: 'Proveedor eliminado correctamente' };
};

module.exports = {
  obtenerTodos,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
};