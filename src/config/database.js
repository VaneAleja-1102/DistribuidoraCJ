const { Pool } = require("pg");
const fs = require("node:fs");
const path = require("node:path");

// Solo cargamos .env si nadie lo cargó antes
// (src/scripts/crearAdmin.js puede cargar otro archivo, como .env.pruebas)
if (!process.env.DATABASE_URL) {
  require("dotenv").config({ quiet: true });
}

if (!process.env.DATABASE_URL) {
  throw new Error("Falta DATABASE_URL en el archivo .env");
}

// Certificado descargado desde Supabase (Database → Settings → SSL configuration)
const rutaCertificado = path.resolve(__dirname, "../../certs/prod-ca-2021.crt");

if (!fs.existsSync(rutaCertificado)) {
  throw new Error(`No se encontró el certificado SSL en: ${rutaCertificado}`);
}

const certificado = fs.readFileSync(rutaCertificado, "utf8");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    ca: certificado,
    rejectUnauthorized: true, // verifica la identidad del servidor: NO cambiar a false
  },
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on("error", (error) => {
  console.error("Error en conexión PostgreSQL inactiva:", error.message);
});

// Consulta simple con parámetros ($1, $2, ...)
const consultar = (sql, parametros = []) => pool.query(sql, parametros);

// ========================================
// Transacción: BEGIN → trabajo → COMMIT (o ROLLBACK si algo falla)
// ========================================
const transaccion = async (trabajo) => {
  const cliente = await pool.connect();
  try {
    await cliente.query("BEGIN");
    const resultado = await trabajo(cliente);
    await cliente.query("COMMIT");
    return resultado;
  } catch (error) {
    await cliente.query("ROLLBACK");
    throw error;
  } finally {
    cliente.release();
  }
};

// ========================================
// Cerrar el pool (lo usan los scripts que terminan, como crearAdmin.js)
// ========================================
const cerrarPool = async () => {
  await pool.end();
};

module.exports = { pool, consultar, transaccion, cerrarPool };