const { consultar, transaccion } = require("../config/database");
const { crearError } = require("../utils/sql.util");

// ========================================
// Máquina de estados de una venta
// ========================================
const TRANSICIONES = {
  registrada: ["pagada", "anulada"],
  pagada: ["entregada", "anulada"],
  entregada: [],
  anulada: [],
};
const ESTADOS = Object.keys(TRANSICIONES);

// ========================================
// SELECT de una venta con su detalle (JOIN a venta_detalle como arreglo JSON)
// ========================================
const SELECT_VENTA = `
  SELECT
    v.id,
    v.cliente_id  AS "clienteId",
    v.vendedor_id AS "vendedorId",
    v.fecha,
    v.estado,
    v.total::float8 AS total,
    COALESCE(
      (SELECT json_agg(
                json_build_object(
                  'productoId',     d.producto_id,
                  'nombre',         d.nombre_producto,
                  'cantidad',       d.cantidad,
                  'precioUnitario', d.precio_unitario::float8,
                  'subtotal',       d.subtotal::float8
                ) ORDER BY d.id)
       FROM public.venta_detalle d
       WHERE d.venta_id = v.id),
      '[]'::json
    ) AS detalle
  FROM public.ventas v
`;

const obtenerTodas = async () => {
  const resultado = await consultar(`${SELECT_VENTA} ORDER BY v.id`);
  return resultado.rows;
};

// Búsqueda sin excepción (la usa el middleware de propiedad)
const buscarPorId = async (id) => {
  const resultado = await consultar(`${SELECT_VENTA} WHERE v.id = $1`, [id]);
  return resultado.rows[0] ?? null;
};

const obtenerPorId = async (id) => {
  const venta = await buscarPorId(id);
  if (!venta) throw crearError(404, "Venta no encontrada");
  return venta;
};

const obtenerPorCliente = async (clienteId) => {
  const resultado = await consultar(
    `${SELECT_VENTA} WHERE v.cliente_id = $1 ORDER BY v.id`,
    [clienteId],
  );
  return resultado.rows;
};

const obtenerPorVendedor = async (vendedorId) => {
  const resultado = await consultar(
    `${SELECT_VENTA} WHERE v.vendedor_id = $1 ORDER BY v.id`,
    [vendedorId],
  );
  return resultado.rows;
};

// ========================================
// Crear venta — TRANSACCIÓN
//   1. Descontar stock (solo si alcanza) de cada producto
//   2. Insertar la venta
//   3. Insertar cada línea del detalle
//   Si cualquier paso falla → ROLLBACK: ni stock descontado ni venta a medias
// datos = { detalle, clienteId, vendedorId } (validados / decididos por el servidor)
// ========================================
const crear = async (datos) => {
  const { detalle, clienteId, vendedorId } = datos;

  const ventaId = await transaccion(async (cliente) => {
    // Regla de negocio: un vendedor inactivo no puede registrar ventas (P28)
    const vendedor = await cliente.query(
      "SELECT activo FROM public.vendedores WHERE id = $1",
      [vendedorId],
    );
    if (vendedor.rowCount === 0)
      throw crearError(400, "El vendedor indicado no existe");
    if (!vendedor.rows[0].activo)
      throw crearError(
        409,
        "El vendedor está inactivo y no puede registrar ventas",
      );

    const lineas = [];
    let total = 0;

    for (const linea of detalle) {
      // UPDATE condicional: es atómico, evita vender stock que ya no existe
      const actualizado = await cliente.query(
        `UPDATE public.productos
         SET stock = stock - $2
         WHERE id = $1 AND stock >= $2
         RETURNING id, nombre, precio::float8 AS precio`,
        [linea.productoId, linea.cantidad],
      );

      if (actualizado.rowCount === 0) {
        const producto = await cliente.query(
          "SELECT nombre, stock FROM public.productos WHERE id = $1",
          [linea.productoId],
        );
        if (producto.rowCount === 0) {
          throw crearError(
            400,
            `El producto con id ${linea.productoId} no existe`,
          );
        }
        const { nombre, stock } = producto.rows[0];
        throw crearError(
          400,
          `Stock insuficiente para "${nombre}". Disponible: ${stock}, solicitado: ${linea.cantidad}`,
        );
      }

      const producto = actualizado.rows[0];
      const subtotal = Math.round(producto.precio * linea.cantidad * 100) / 100;
      total += subtotal;
      lineas.push({ producto, cantidad: linea.cantidad, subtotal });
    }

    const venta = await cliente.query(
      `INSERT INTO public.ventas (cliente_id, vendedor_id, total)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [clienteId, vendedorId, total],
    );
    const id = venta.rows[0].id;

    for (const { producto, cantidad, subtotal } of lineas) {
      await cliente.query(
        `INSERT INTO public.venta_detalle
           (venta_id, producto_id, nombre_producto, cantidad, precio_unitario, subtotal)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [id, producto.id, producto.nombre, cantidad, producto.precio, subtotal],
      );
    }

    return id;
  }).catch((error) => {
    if (error.code === "23503")
      throw crearError(400, "El cliente o el vendedor indicado no existe");
    throw error;
  });

  return obtenerPorId(ventaId);
};

// ========================================
// Cambiar estado — TRANSACCIÓN con bloqueo de la fila (FOR UPDATE)
// Ser administrador NO permite saltarse las transiciones válidas
// ========================================
const cambiarEstado = async (id, nuevoEstado) => {
  await transaccion(async (cliente) => {
    const actual = await cliente.query(
      "SELECT estado FROM public.ventas WHERE id = $1 FOR UPDATE",
      [id],
    );
    if (actual.rowCount === 0) throw crearError(404, "Venta no encontrada");

    const estadoActual = actual.rows[0].estado;
    if (!(TRANSICIONES[estadoActual] || []).includes(nuevoEstado)) {
      throw crearError(
        409,
        `Transición no permitida: ${estadoActual} → ${nuevoEstado}`,
      );
    }

    // Si se anula, devolvemos el stock vendido
    if (nuevoEstado === "anulada") {
      await cliente.query(
        `UPDATE public.productos p
         SET stock = p.stock + d.cantidad_total
         FROM (
           SELECT producto_id, SUM(cantidad) AS cantidad_total
           FROM public.venta_detalle
           WHERE venta_id = $1
           GROUP BY producto_id
         ) d
         WHERE p.id = d.producto_id`,
        [id],
      );
    }

    await cliente.query("UPDATE public.ventas SET estado = $2 WHERE id = $1", [
      id,
      nuevoEstado,
    ]);
  });

  return obtenerPorId(id);
};

// El detalle se borra solo (ON DELETE CASCADE en venta_detalle)
const eliminar = async (id) => {
  const resultado = await consultar(
    "DELETE FROM public.ventas WHERE id = $1 RETURNING id",
    [id],
  );
  if (resultado.rowCount === 0) throw crearError(404, "Venta no encontrada");
  return { mensaje: "Venta eliminada correctamente" };
};

module.exports = {
  ESTADOS,
  obtenerTodas,
  buscarPorId,
  obtenerPorId,
  obtenerPorCliente,
  obtenerPorVendedor,
  crear,
  cambiarEstado,
  eliminar,
};
