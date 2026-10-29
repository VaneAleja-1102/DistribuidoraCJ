// ========================================
// Utilidades para services con PostgreSQL
// ========================================

// Error HTTP controlado (lo responde errores.middleware)
const crearError = (status, mensaje) => {
  const error = new Error(mensaje);
  error.status = status;
  return error;
};

// ========================================
// Construir un UPDATE solo con los campos permitidos que llegaron.
//   mapa: { propiedadJS: 'columna_sql' }  → allowlist (nunca viene del cliente)
//   datos: objeto validado (matchedData)
// Los VALORES siempre van como parámetros ($1, $2...), nunca concatenados.
// ========================================
const construirSet = (mapa, datos, primerIndice = 1) => {
  const columnas = [];
  const valores = [];

  for (const [propiedad, columna] of Object.entries(mapa)) {
    if (Object.hasOwn(datos, propiedad) && datos[propiedad] !== undefined) {
      valores.push(datos[propiedad]);
      columnas.push(`${columna} = $${primerIndice + valores.length - 1}`);
    }
  }

  return { set: columnas.join(', '), valores };
};

module.exports = { crearError, construirSet };