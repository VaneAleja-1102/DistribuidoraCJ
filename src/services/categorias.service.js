const { consultar } = require('../config/database');
const { crearError, construirSet } = require('../utils/sql.util');

const COLUMNAS = 'id, nombre, descripcion';
const MAPA = { nombre: 'nombre', descripcion: 'descripcion' };

const obtenerTodas = async () => {
  const resultado = await consultar(`SELECT ${COLUMNAS} FROM public.categorias ORDER BY id`);
  return resultado.rows;
};

const obtenerPorId = async (id) => {
  const resultado = await consultar(
    `SELECT ${COLUMNAS} FROM public.categorias WHERE id = $1`,
    [id]
  );
  if (resultado.rowCount === 0) throw crearError(404, 'Categoría no encontrada');
  return resultado.rows[0];
};

const crear = async (datos) => {
  try {
    const resultado = await consultar(
      `INSERT INTO public.categorias (nombre, descripcion)
       VALUES ($1, $2)
       RETURNING ${COLUMNAS}`,
      [datos.nombre, datos.descripcion ?? '']
    );
    return resultado.rows[0];
  } catch (error) {
    if (error.code === '23505') throw crearError(409, 'Ya existe una categoría con ese nombre');
    throw error;
  }
};

const actualizar = async (id, datos) => {
  const { set, valores } = construirSet(MAPA, datos, 2);
  if (!set) return obtenerPorId(id); // no llegó ningún campo permitido

  try {
    const resultado = await consultar(
      `UPDATE public.categorias SET ${set} WHERE id = $1 RETURNING ${COLUMNAS}`,
      [id, ...valores]
    );
    if (resultado.rowCount === 0) throw crearError(404, 'Categoría no encontrada');
    return resultado.rows[0];
  } catch (error) {
    if (error.code === '23505') throw crearError(409, 'Ya existe una categoría con ese nombre');
    throw error;
  }
};

const eliminar = async (id) => {
  try {
    const resultado = await consultar(
      'DELETE FROM public.categorias WHERE id = $1 RETURNING id',
      [id]
    );
    if (resultado.rowCount === 0) throw crearError(404, 'Categoría no encontrada');
    return { mensaje: 'Categoría eliminada correctamente' };
  } catch (error) {
    // La FK productos.categoria_id impide borrar una categoría en uso
    if (error.code === '23503') {
      throw crearError(409, 'No se puede eliminar la categoría porque tiene productos asociados');
    }
    throw error;
  }
};

module.exports = { obtenerTodas, obtenerPorId, crear, actualizar, eliminar };