const { consultar } = require('../config/database');
const { crearError, construirSet } = require('../utils/sql.util');

const COLUMNAS = `
  id,
  usuario_id AS "usuarioId",
  nombre,
  documento,
  email,
  telefono,
  direccion
`;
const MAPA = {
  usuarioId: 'usuario_id',
  nombre: 'nombre',
  documento: 'documento',
  email: 'email',
  telefono: 'telefono',
  direccion: 'direccion',
};

// Traduce violaciones de UNIQUE / FK a mensajes de negocio
const traducirError = (error) => {
  if (error.code === '23505') {
    if (error.constraint === 'clientes_usuario_id_key') {
      return crearError(409, 'El usuario ya está asociado a un cliente');
    }
    return crearError(409, 'Ya existe un cliente con ese documento');
  }
  if (error.code === '23503') return crearError(400, 'El usuario asociado no existe');
  return error;
};

const obtenerTodos = async () => {
  const resultado = await consultar(`SELECT ${COLUMNAS} FROM public.clientes ORDER BY id`);
  return resultado.rows;
};

const obtenerPorId = async (id) => {
  const resultado = await consultar(`SELECT ${COLUMNAS} FROM public.clientes WHERE id = $1`, [id]);
  if (resultado.rowCount === 0) throw crearError(404, 'Cliente no encontrado');
  return resultado.rows[0];
};

// ========================================
// Obtener cliente por usuario (asociación usuario ↔ cliente)
// ========================================
const obtenerClientePorUsuarioId = async (usuarioId) => {
  const resultado = await consultar(
    `SELECT ${COLUMNAS} FROM public.clientes WHERE usuario_id = $1`,
    [usuarioId]
  );
  return resultado.rows[0] ?? null;
};

const crear = async (datos) => {
  try {
    const resultado = await consultar(
      `INSERT INTO public.clientes (usuario_id, nombre, documento, email, telefono, direccion)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING ${COLUMNAS}`,
      [
        datos.usuarioId ?? null,
        datos.nombre,
        datos.documento,
        datos.email ?? '',
        datos.telefono ?? '',
        datos.direccion ?? '',
      ]
    );
    return resultado.rows[0];
  } catch (error) {
    throw traducirError(error);
  }
};

// PUT: reemplaza los datos. Si no se envía usuarioId, se CONSERVA la asociación actual.
const actualizar = async (id, datos) => {
  try {
    const resultado = await consultar(
      `UPDATE public.clientes SET
         usuario_id = CASE WHEN $2::boolean THEN $3::bigint ELSE usuario_id END,
         nombre = $4, documento = $5, email = $6, telefono = $7, direccion = $8
       WHERE id = $1
       RETURNING ${COLUMNAS}`,
      [
        id,
        Object.hasOwn(datos, 'usuarioId'),
        datos.usuarioId ?? null,
        datos.nombre,
        datos.documento,
        datos.email ?? '',
        datos.telefono ?? '',
        datos.direccion ?? '',
      ]
    );
    if (resultado.rowCount === 0) throw crearError(404, 'Cliente no encontrado');
    return resultado.rows[0];
  } catch (error) {
    throw traducirError(error);
  }
};

// PATCH: solo los campos que llegaron
const actualizarParcial = async (id, datos) => {
  const { set, valores } = construirSet(MAPA, datos, 2);
  if (!set) return obtenerPorId(id);

  try {
    const resultado = await consultar(
      `UPDATE public.clientes SET ${set} WHERE id = $1 RETURNING ${COLUMNAS}`,
      [id, ...valores]
    );
    if (resultado.rowCount === 0) throw crearError(404, 'Cliente no encontrado');
    return resultado.rows[0];
  } catch (error) {
    throw traducirError(error);
  }
};

const eliminar = async (id) => {
  try {
    const resultado = await consultar('DELETE FROM public.clientes WHERE id = $1 RETURNING id', [id]);
    if (resultado.rowCount === 0) throw crearError(404, 'Cliente no encontrado');
    return { mensaje: 'Cliente eliminado correctamente' };
  } catch (error) {
    // Integridad referencial: la FK ventas.cliente_id lo impide
    if (error.code === '23503') {
      throw crearError(409, 'No se puede eliminar el cliente porque tiene ventas asociadas');
    }
    throw error;
  }
};

module.exports = {
  obtenerTodos,
  obtenerPorId,
  obtenerClientePorUsuarioId,
  crear,
  actualizar,
  actualizarParcial,
  eliminar,
};