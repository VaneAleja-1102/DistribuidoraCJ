const { consultar, pool } = require("../config/database");
const { generarPasswordHash, verificarPassword } = require("../utils/password.util");

// ========================================
// Columnas compatibles con la API
// (el rol se obtiene con JOIN a public.roles)
// ========================================
const columnasUsuario = `
  u.id,
  u.nombre,
  u.email,
  u.password_hash AS "passwordHash",
  r.nombre AS rol,
  u.activo
`;

// ========================================
// Obtener usuario por email
// ========================================
const obtenerUsuarioPorEmail = async (email) => {
  const resultado = await consultar(
    `SELECT ${columnasUsuario}
     FROM public.usuarios u
     INNER JOIN public.roles r ON r.id = u.rol_id
     WHERE LOWER(u.email) = LOWER($1)
     LIMIT 1`,
    [email]
  );
  return resultado.rows[0] ?? null;
};

// ========================================
// Obtener usuario por ID
// ========================================
const obtenerUsuarioPorId = async (id) => {
  const resultado = await consultar(
    `SELECT ${columnasUsuario}
     FROM public.usuarios u
     INNER JOIN public.roles r ON r.id = u.rol_id
     WHERE u.id = $1`,
    [id]
  );
  return resultado.rows[0] ?? null;
};

// ========================================
// Inserción controlada de usuario
// El rol se busca por NOMBRE en public.roles (nunca un rol_id del cliente)
// ========================================
const insertarUsuario = async ({ nombre, email, password, rol }) => {
  const passwordHash = await generarPasswordHash(password);

  const resultado = await consultar(
    `WITH insertado AS (
       INSERT INTO public.usuarios (nombre, email, password_hash, rol_id, activo)
       SELECT $1, LOWER($2), $3, r.id, TRUE
       FROM public.roles r
       WHERE r.nombre = $4 AND r.activo = TRUE
       RETURNING *
     )
     SELECT i.id, i.nombre, i.email, i.password_hash AS "passwordHash",
            r.nombre AS rol, i.activo
     FROM insertado i
     INNER JOIN public.roles r ON r.id = i.rol_id`,
    [nombre, email, passwordHash, rol]
  );

  if (resultado.rows.length === 0) {
    const error = new Error("El rol solicitado no existe o está inactivo");
    error.status = 400;
    throw error;
  }

  return resultado.rows[0];
};

// ========================================
// Registro público: SIEMPRE rol cliente (el body no decide el rol)
// ========================================
const crearUsuario = async (datos) => {
  return insertarUsuario({
    nombre: datos.nombre,
    email: datos.email,
    password: datos.password,
    rol: "cliente",
  });
};

// ========================================
// Creación administrativa: solo vendedor o administrador
// ========================================
const crearUsuarioAdministrativo = async (datos) => {
  const rolesPermitidos = ["vendedor", "administrador"];

  if (!rolesPermitidos.includes(datos.rol)) {
    const error = new Error("Rol no permitido para esta operación");
    error.status = 400;
    throw error;
  }

  return insertarUsuario({
    nombre: datos.nombre,
    email: datos.email,
    password: datos.password,
    rol: datos.rol,
  });
};

// ========================================
// Verificar credenciales
// ========================================
const verificarCredenciales = async (email, password) => {
  const usuario = await obtenerUsuarioPorEmail(email);
  if (!usuario || !usuario.passwordHash) return null;

  const passwordValida = await verificarPassword(password, usuario.passwordHash);
  if (!passwordValida) return null;

  return usuario;
};

// ========================================
// Crear administrador inicial (BLOQUE 7.5.1 — bootstrap)
// Se ejecuta SOLO desde:  npm run seed:admin  (src/scripts/crearAdmin.js)
//
// Reglas:
//   - Si ya existe CUALQUIER administrador (incluso inactivo) → no inserta ni modifica nada
//   - Si el correo pertenece a otro rol → rechaza: NO eleva privilegios
//   - El rol "administrador" debe existir y estar activo
//   - Transacción + bloqueo asesor: dos ejecuciones simultáneas no crean dos admins
//   - No reinicia contraseñas ni activa cuentas existentes
// ========================================
const CLAVE_BLOQUEO_BOOTSTRAP = [7505, 1];

const errorBootstrap = (mensaje) => {
  const error = new Error(mensaje);
  error.code = "BOOTSTRAP";
  return error;
};

const crearAdministradorInicial = async ({ nombre, email, password }) => {
  const cliente = await pool.connect();

  try {
    await cliente.query("BEGIN");

    // Serializa ejecuciones simultáneas de ESTE bootstrap
    await cliente.query("SELECT pg_advisory_xact_lock($1, $2)", CLAVE_BLOQUEO_BOOTSTRAP);

    // 1. ¿Ya existe algún administrador, activo o no?
    const administradores = await cliente.query(
      `SELECT u.id
       FROM public.usuarios u
       INNER JOIN public.roles r ON r.id = u.rol_id
       WHERE r.nombre = 'administrador'
       LIMIT 1`
    );

    if (administradores.rowCount > 0) {
      await cliente.query("COMMIT");
      return { creado: false };
    }

    // 2. ¿El correo ya pertenece a otra cuenta? → no se eleva
    const existente = await cliente.query(
      `SELECT r.nombre AS rol
       FROM public.usuarios u
       INNER JOIN public.roles r ON r.id = u.rol_id
       WHERE LOWER(u.email) = LOWER($1)`,
      [email]
    );

    if (existente.rowCount > 0) {
      throw errorBootstrap(
        `El correo ya pertenece a una cuenta con rol ${existente.rows[0].rol}; no se elevan privilegios`
      );
    }

    // 3. El rol administrador debe existir y estar activo
    const rol = await cliente.query(
      "SELECT id FROM public.roles WHERE nombre = 'administrador' AND activo = TRUE"
    );

    if (rol.rowCount === 0) {
      throw errorBootstrap("El rol administrador no existe o está inactivo");
    }

    // 4. Crear el primer administrador (contraseña con hash bcrypt)
    const passwordHash = await generarPasswordHash(password);

    const creado = await cliente.query(
      `INSERT INTO public.usuarios (nombre, email, password_hash, rol_id, activo)
       VALUES ($1, LOWER($2), $3, $4, TRUE)
       RETURNING id`,
      [nombre, email, passwordHash, rol.rows[0].id]
    );

    await cliente.query("COMMIT");
    return { creado: true, id: creado.rows[0].id };
  } catch (error) {
    await cliente.query("ROLLBACK");
    throw error;
  } finally {
    cliente.release();
  }
};

module.exports = {
  obtenerUsuarioPorEmail,
  obtenerUsuarioPorId,
  crearUsuario,
  crearUsuarioAdministrativo,
  verificarCredenciales,
  crearAdministradorInicial,
};