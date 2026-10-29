// ==========================================================
// BLOQUE 7.5.1 — Bootstrap del primer administrador
//
//   npm run seed:admin                          → usa .env
//   npm run seed:admin -- --env .env.pruebas    → base de pruebas aislada (BA08 / BA09)
//
// NO se ejecuta con npm run dev ni con npm start.
// ==========================================================
const path = require("node:path");

const indiceEnv = process.argv.indexOf("--env");
const archivoEnv = indiceEnv !== -1 ? process.argv[indiceEnv + 1] : ".env";
require("dotenv").config({ path: path.resolve(process.cwd(), archivoEnv), quiet: true });

const { cerrarPool } = require("../config/database");
const usuariosService = require("../services/usuarios.service");

// ========================================
// Validar configuración ANTES de tocar la base
// ========================================
const validarConfiguracion = () => {
  const nombre = process.env.ADMIN_NOMBRE?.trim();
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD;

  if (!nombre || !email || !password) {
    throw new Error("Faltan ADMIN_NOMBRE, ADMIN_EMAIL o ADMIN_PASSWORD en la configuración");
  }

  if (nombre.length < 3) {
    throw new Error("ADMIN_NOMBRE debe tener al menos 3 caracteres");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("ADMIN_EMAIL no tiene un formato de correo válido");
  }

  if (password.length < 12) {
    throw new Error("ADMIN_PASSWORD debe tener al menos 12 caracteres");
  }

  return { nombre, email, password };
};

// ========================================
// Programa principal
// ========================================
const main = async () => {
  console.log("Iniciando bootstrap administrativo...");

  const datos = validarConfiguracion();
  const resultado = await usuariosService.crearAdministradorInicial(datos);

  if (resultado.creado) {
    console.log("Administrador inicial creado correctamente.");
    console.log(`ID del administrador: ${resultado.id}`);
  } else {
    console.log("Ya existe una cuenta administradora.");
    console.log("No se realizaron modificaciones.");
  }

  console.log("Bootstrap finalizado correctamente.");
};

main()
  .catch((error) => {
    // Nunca se imprime la contraseña ni el hash
    console.error(`Bootstrap no completado: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await cerrarPool();
  });