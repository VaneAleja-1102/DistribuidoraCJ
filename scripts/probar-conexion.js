const { pool, consultar } = require("../src/config/database");

async function probarConexion() {
  try {
    console.log("Conectando con Supabase...");

    const resultado = await consultar(`
      SELECT
        current_database() AS base_datos,
        current_user AS usuario,
        NOW() AS fecha_servidor
    `);
    console.table(resultado.rows);

    const roles = await consultar(`
      SELECT id, nombre, activo
      FROM public.roles
      ORDER BY id
    `);
    console.log("Roles registrados:");
    console.table(roles.rows);

    const productos = await consultar(`
      SELECT p.id, p.nombre, p.stock, c.nombre AS categoria
      FROM public.productos p
      JOIN public.categorias c ON c.id = p.categoria_id
      ORDER BY p.id
    `);
    console.log("Productos registrados:");
    console.table(productos.rows);

    console.log("Conexión PostgreSQL exitosa");
  } catch (error) {
    console.error("Error de conexión PostgreSQL");
    console.error("Código:", error.code);
    console.error("Mensaje:", error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

probarConexion();