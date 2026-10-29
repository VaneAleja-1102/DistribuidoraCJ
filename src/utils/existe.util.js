const { consultar } = require('../config/database');

// Solo tablas de esta lista (el nombre de tabla NUNCA viene del cliente)
const TABLAS_PERMITIDAS = ['categorias', 'proveedores', 'productos', 'clientes', 'vendedores'];

// ¿Existe un registro con ese id en la tabla?
const existeRegistro = async (tabla, id) => {
  if (!TABLAS_PERMITIDAS.includes(tabla)) throw new Error(`Tabla no permitida: ${tabla}`);
  const resultado = await consultar(`SELECT 1 FROM public.${tabla} WHERE id = $1`, [id]);
  return resultado.rowCount > 0;
};

// Validador reutilizable para express-validator
const debeExistir = (tabla, mensaje) => async (valor) => {
  if (!(await existeRegistro(tabla, valor))) throw new Error(mensaje);
  return true;
};

module.exports = { existeRegistro, debeExistir };