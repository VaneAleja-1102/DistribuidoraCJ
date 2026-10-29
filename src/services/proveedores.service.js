const { consultar } = require('../config/database');
const { crearError, construirSet } = require('../utils/sql.util');

const COLUMNAS = 'id, nombre, telefono, email';
const MAPA = { nombre: 'nombre', telefono: 'telefono', email: 'email' };

const obtenerTodos = async () => {
  const resultado = await consultar(`SELECT ${COLUMNAS} FROM public.proveedores ORDER BY id`);
  return resultado.rows;
};

const obtenerPorId = async (id) => {
  const resultado = await consultar(
    `SELECT ${COLUMNAS} FROM public.proveedores WHERE id = $1`,
    [id]
  );
  if (resultado.rowCount === 0) throw crearError(404, 'Proveedor no encontrado');
  return resultado.rows[0];
};

const crear = async (datos) => {
  try {
    const resultado = await consultar(
      `INSERT INTO public.proveedores (nombre, telefono, email)
       VALUES ($1, $2, $3)
       RETURNING ${COLUMNAS}`,
      [datos.nombre, datos.telefono ?? '', datos.email ?? '']
    );
    return resultado.rows[0];
  } catch (error) {
    if (error.code === '23505') throw crearError(409, 'Ya existe un proveedor con ese nombre');
    throw error;
  }
};

const actualizar = async (id, datos) => {
  const { set, valores } = construirSet(MAPA, datos, 2);
  if (!set) return obtenerPorId(id);

  try {
    const resultado = await consultar(
      `UPDATE public.proveedores SET ${set} WHERE id = $1 RETURNING ${COLUMNAS}`,
      [id, ...valores]
    );
    if (resultado.rowCount === 0) throw crearError(404, 'Proveedor no encontrado');
    return resultado.rows[0];
  } catch (error) {
    if (error.code === '23505') throw crearError(409, 'Ya existe un proveedor con ese nombre');
    throw error;
  }
};

const eliminar = async (id) => {
  try {
    const resultado = await consultar(
      'DELETE FROM public.proveedores WHERE id = $1 RETURNING id',
      [id]
    );
    if (resultado.rowCount === 0) throw crearError(404, 'Proveedor no encontrado');
    return { mensaje: 'Proveedor eliminado correctamente' };
  } catch (error) {
    if (error.code === '23503') {
      throw crearError(409, 'No se puede eliminar el proveedor porque tiene productos asociados');
    }
    throw error;
  }
};

module.exports = { obtenerTodos, obtenerPorId, crear, actualizar, eliminar };