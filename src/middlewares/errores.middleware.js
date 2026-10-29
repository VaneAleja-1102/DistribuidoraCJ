// ========================================
// Traducción de errores de PostgreSQL (SQLSTATE) a respuestas HTTP
// Nunca devolvemos el detalle interno de SQL al cliente
// ========================================
const ERRORES_POSTGRES = {
  '23505': { status: 409, mensaje: 'El registro ya existe (valor duplicado)' },
  '23503': { status: 409, mensaje: 'La operación viola una relación con otro registro' },
  '23502': { status: 400, mensaje: 'Falta un campo obligatorio' },
  '23514': { status: 400, mensaje: 'Un valor no cumple las reglas de la base de datos' },
  '22P02': { status: 400, mensaje: 'Formato de dato inválido' },
  '22003': { status: 400, mensaje: 'Valor numérico fuera de rango' },
};

const manejarErrores = (err, req, res, next) => {
  const errorPostgres = ERRORES_POSTGRES[err.code];
  const status = err.status || errorPostgres?.status || 500;

  // Solo registramos la traza de errores inesperados (5xx)
  if (status >= 500) console.error(err.stack);

  let mensaje;
  if (status >= 500) mensaje = 'Error interno del servidor';
  else if (err.status) mensaje = err.message;
  else mensaje = errorPostgres.mensaje;

  res.status(status).json({ mensaje });
};

module.exports = manejarErrores;