const { productos, getSiguienteId } = require('../data/productos');

const obtenerTodos = async () => {
  return productos;
};

const obtenerPorId = async (id) => {
  const producto = productos.find((p) => p.id === Number(id));
  if (!producto) {
    const error = new Error('Producto no encontrado');
    error.status = 404;
    throw error;
  }
  return producto;
};

const crear = async (datos) => {
  const nuevoProducto = {
    id: getSiguienteId(),
    nombre: datos.nombre,
    precio: Number(datos.precio),
    stock: datos.stock !== undefined ? Number(datos.stock) : 0,
    categoriaId: Number(datos.categoriaId),
    proveedorId: Number(datos.proveedorId),
  };
  productos.push(nuevoProducto);
  return nuevoProducto;
};

const actualizar = async (id, datos) => {
  const producto = await obtenerPorId(id);
  Object.assign(producto, datos);
  return producto;
};

const eliminar = async (id) => {
  const index = productos.findIndex((p) => p.id === Number(id));
  if (index === -1) {
    const error = new Error('Producto no encontrado');
    error.status = 404;
    throw error;
  }
  productos.splice(index, 1);
  return { mensaje: 'Producto eliminado correctamente' };
};

// Este método lo vamos a usar luego desde Ventas para descontar stock
const descontarStock = async (id, cantidad) => {
  const producto = await obtenerPorId(id);
  if (producto.stock < cantidad) {
    const error = new Error(`Stock insuficiente para el producto "${producto.nombre}"`);
    error.status = 400;
    throw error;
  }
  producto.stock -= cantidad;
  return producto;
};

module.exports = {
  obtenerTodos,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
  descontarStock,
};