const { consultar } = require('../config/database');
const { crearError, construirSet } = require('../utils/sql.util');

const COLUMNAS = `
  id,
  usuario_id AS "usuarioId",
  nombre,
  documento,
  telefono,
  activo
`;
const MAPA = {
  usuarioId: 'usuario_id',
  nombre: 'nombre',
  documento: 'documento',
  telefono: 'telefono',
  activo: 'activo',
};

const traducirError = (error) => {
  if (error.code === '23505') {
    if (error.constraint === 'vendedores_usuario_id_key') {
      return crearError(409, 'El usuario ya está asociado a un vendedor');
    }
    return crearError(409, 'Ya existe un vendedor con ese documento');
  }
  if (error.code === '23503') return crearError(400, 'El usuario asociado no existe');
  return error;
};

const obtenerTodos = async () => {
  const resultado = await consultar(`SELECT ${COLUMNAS} FROM public.vendedores ORDER BY id`);
  return resultado.rows;
};

const obtenerPorId = async (id) => {
  const resultado = await consultar(`SELECT ${COLUMNAS} FROM public.vendedores WHERE id = $1`, [id]);
  if (resultado.rowCount === 0) throw crearError(404, 'Vendedor no encontrado');
  return resultado.rows[0];
};

// ========================================
// Obtener vendedor por usuario (asociación usuario ↔ vendedor)
// ========================================
const obtenerVendedorPorUsuarioId = async (usuarioId) => {
  const resultado = await consultar(
    `SELECT ${COLUMNAS} FROM public.vendedores WHERE usuario_id = $1`,
    [usuarioId]
  );
  return resultado.rows[0] ?? null;
};

const crear = async (datos) => {
  try {
    const resultado = await consultar(
      `INSERT INTO public.vendedores (usuario_id, nombre, documento, telefono, activo)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING ${COLUMNAS}`,
      [datos.usuarioId ?? null, datos.nombre, datos.documento, datos.telefono ?? '', datos.activo ?? true]
    );
    return resultado.rows[0];
  } catch (error) {
    throw traducirError(error);
  }
};

// PUT: si no se envía usuarioId, se CONSERVA la asociación actual
const actualizar = async (id, datos) => {
  try {
    const resultado = await consultar(
      `UPDATE public.vendedores SET
         usuario_id = CASE WHEN $2::boolean THEN $3::bigint ELSE usuario_id END,
         nombre = $4, documento = $5, telefono = $6, activo = $7
       WHERE id = $1
       RETURNING ${COLUMNAS}`,
      [
        id,
        Object.hasOwn(datos, 'usuarioId'),
        datos.usuarioId ?? null,
        datos.nombre,
        datos.documento,
        datos.telefono ?? '',
        datos.activo ?? true,
      ]
    );
    if (resultado.rowCount === 0) throw crearError(404, 'Vendedor no encontrado');
    return resultado.rows[0];
  } catch (error) {
    throw traducirError(error);
  }
};

const actualizarParcial = async (id, datos) => {
  const { set, valores } = construirSet(MAPA, datos, 2);
  if (!set) return obtenerPorId(id);

  try {
    const resultado = await consultar(
      `UPDATE public.vendedores SET ${set} WHERE id = $1 RETURNING ${COLUMNAS}`,
      [id, ...valores]
    );
    if (resultado.rowCount === 0) throw crearError(404, 'Vendedor no encontrado');
    return resultado.rows[0];
  } catch (error) {
    throw traducirError(error);
  }
};

const eliminar = async (id) => {
  try {
    const resultado = await consultar('DELETE FROM public.vendedores WHERE id = $1 RETURNING id', [id]);
    if (resultado.rowCount === 0) throw crearError(404, 'Vendedor no encontrado');
    return { mensaje: 'Vendedor eliminado correctamente' };
  } catch (error) {
    if (error.code === '23503') {
      throw crearError(409, 'No se puede eliminar el vendedor porque tiene ventas asociadas');
    }
    throw error;
  }
};

module.exports = {
  obtenerTodos,
  obtenerPorId,
  obtenerVendedorPorUsuarioId,
  crear,
  actualizar,
  actualizarParcial,
  eliminar,
};