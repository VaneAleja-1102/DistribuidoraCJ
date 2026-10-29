const { consultar } = require('../config/database');
const { crearError, construirSet } = require('../utils/sql.util');

// snake_case (SQL) → camelCase (API), para no cambiar el contrato JSON
const COLUMNAS = `
  id,
  nombre,
  precio::float8 AS precio,
  stock,
  categoria_id AS "categoriaId",
  proveedor_id AS "proveedorId"
`;
const MAPA = {
  nombre: 'nombre',
  precio: 'precio',
  stock: 'stock',
  categoriaId: 'categoria_id',
  proveedorId: 'proveedor_id',
};

const obtenerTodos = async () => {
  const resultado = await consultar(`SELECT ${COLUMNAS} FROM public.productos ORDER BY id`);
  return resultado.rows;
};

const obtenerPorId = async (id) => {
  const resultado = await consultar(
    `SELECT ${COLUMNAS} FROM public.productos WHERE id = $1`,
    [id]
  );
  if (resultado.rowCount === 0) throw crearError(404, 'Producto no encontrado');
  return resultado.rows[0];
};

const traducirError = (error) => {
  if (error.code === '23503') return crearError(400, 'La categoría o el proveedor indicado no existe');
  if (error.code === '23514') return crearError(400, 'El precio y el stock no pueden ser negativos');
  return error;
};

const crear = async (datos) => {
  try {
    const resultado = await consultar(
      `INSERT INTO public.productos (nombre, precio, stock, categoria_id, proveedor_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING ${COLUMNAS}`,
      [datos.nombre, datos.precio, datos.stock ?? 0, datos.categoriaId, datos.proveedorId]
    );
    return resultado.rows[0];
  } catch (error) {
    throw traducirError(error);
  }
};

const actualizar = async (id, datos) => {
  const { set, valores } = construirSet(MAPA, datos, 2);
  if (!set) return obtenerPorId(id);

  try {
    const resultado = await consultar(
      `UPDATE public.productos SET ${set} WHERE id = $1 RETURNING ${COLUMNAS}`,
      [id, ...valores]
    );
    if (resultado.rowCount === 0) throw crearError(404, 'Producto no encontrado');
    return resultado.rows[0];
  } catch (error) {
    throw traducirError(error);
  }
};

const eliminar = async (id) => {
  try {
    const resultado = await consultar(
      'DELETE FROM public.productos WHERE id = $1 RETURNING id',
      [id]
    );
    if (resultado.rowCount === 0) throw crearError(404, 'Producto no encontrado');
    return { mensaje: 'Producto eliminado correctamente' };
  } catch (error) {
    // venta_detalle.producto_id impide borrar un producto ya vendido
    if (error.code === '23503') {
      throw crearError(409, 'No se puede eliminar el producto porque aparece en ventas registradas');
    }
    throw error;
  }
};

// El descuento de stock ahora ocurre dentro de la transacción de ventas.service.js

module.exports = { obtenerTodos, obtenerPorId, crear, actualizar, eliminar };