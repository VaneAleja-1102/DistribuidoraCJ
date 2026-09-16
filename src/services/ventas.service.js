const { ventas, getSiguienteId } = require('../data/ventas');
const productosService = require('./productos.service');

const obtenerTodas = async () => {
  return ventas;
};

const obtenerPorId = async (id) => {
  const venta = ventas.find((v) => v.id === Number(id));
  if (!venta) {
    const error = new Error('Venta no encontrada');
    error.status = 404;
    throw error;
  }
  return venta;
};

const crear = async (datos) => {
  const { detalle } = datos;

  // 1. Verificar stock de TODOS los productos antes de descontar nada
  for (const linea of detalle) {
    const producto = await productosService.obtenerPorId(linea.productoId);
    if (producto.stock < linea.cantidad) {
      const error = new Error(
        `Stock insuficiente para "${producto.nombre}". Disponible: ${producto.stock}, solicitado: ${linea.cantidad}`
      );
      error.status = 400;
      throw error;
    }
  }

  // 2. Si todo tiene stock, ahora sí se descuenta y se arma el detalle final
  const detalleFinal = [];
  let total = 0;

  for (const linea of detalle) {
    const producto = await productosService.obtenerPorId(linea.productoId);
    await productosService.descontarStock(linea.productoId, linea.cantidad);

    const subtotal = producto.precio * linea.cantidad;
    total += subtotal;

    detalleFinal.push({
      productoId: producto.id,
      nombre: producto.nombre,
      cantidad: linea.cantidad,
      precioUnitario: producto.precio,
      subtotal,
    });
  }

  const nuevaVenta = {
    id: getSiguienteId(),
    fecha: new Date().toISOString(),
    total,
    detalle: detalleFinal,
  };

  ventas.push(nuevaVenta);
  return nuevaVenta;
};

const eliminar = async (id) => {
  const index = ventas.findIndex((v) => v.id === Number(id));
  if (index === -1) {
    const error = new Error('Venta no encontrada');
    error.status = 404;
    throw error;
  }
  ventas.splice(index, 1);
  return { mensaje: 'Venta eliminada correctamente' };
};

module.exports = {
  obtenerTodas,
  obtenerPorId,
  crear,
  eliminar,
};