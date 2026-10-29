const clientesService = require('../services/clientes.service');
const vendedoresService = require('../services/vendedores.service');
const ventasService = require('../services/ventas.service');

const prohibido = (res, mensaje = 'No tiene permisos para acceder a este recurso') =>
  res.status(403).json({ mensaje });

// Los BIGINT de PostgreSQL llegan como texto: comparamos como texto
const mismoId = (a, b) => a != null && b != null && String(a) === String(b);

// ========================================
// Ventas de un CLIENTE (/ventas/cliente/:clienteId)
// ========================================
const autorizarClientePropio = async (req, res, next) => {
  try {
    if (!req.usuario) return res.status(401).json({ mensaje: 'Usuario no autenticado' });

    if (req.usuario.rol === 'administrador') return next();
    if (req.usuario.rol !== 'cliente') return prohibido(res);

    // La identidad sale del JWT verificado, no de la URL
    const cliente = await clientesService.obtenerClientePorUsuarioId(req.usuario.id);
    if (!cliente) return prohibido(res, 'El usuario no tiene un cliente asociado');

    if (!mismoId(cliente.id, req.params.clienteId)) return prohibido(res);

    return next();
  } catch (error) {
    return next(error);
  }
};

// ========================================
// Ventas de un VENDEDOR (/ventas/vendedor/:vendedorId)
// ========================================
const autorizarVendedorPropio = async (req, res, next) => {
  try {
    if (!req.usuario) return res.status(401).json({ mensaje: 'Usuario no autenticado' });

    if (req.usuario.rol === 'administrador') return next();
    if (req.usuario.rol !== 'vendedor') return prohibido(res);

    const vendedor = await vendedoresService.obtenerVendedorPorUsuarioId(req.usuario.id);
    if (!vendedor) return prohibido(res, 'El usuario no tiene un vendedor asociado');

    if (!mismoId(vendedor.id, req.params.vendedorId)) return prohibido(res);

    return next();
  } catch (error) {
    return next(error);
  }
};

// ========================================
// UNA venta concreta (/ventas/:id)
// Evita el bypass por ruta alternativa
// ========================================
const autorizarAccesoVenta = async (req, res, next) => {
  try {
    if (!req.usuario) return res.status(401).json({ mensaje: 'Usuario no autenticado' });

    const venta = await ventasService.buscarPorId(req.params.id);
    if (!venta) return res.status(404).json({ mensaje: 'Venta no encontrada' });

    if (req.usuario.rol === 'administrador') {
      req.venta = venta;
      return next();
    }

    if (req.usuario.rol === 'cliente') {
      const cliente = await clientesService.obtenerClientePorUsuarioId(req.usuario.id);
      if (!cliente) return prohibido(res, 'El usuario no tiene un cliente asociado');
      if (!mismoId(venta.clienteId, cliente.id)) return prohibido(res);
      req.venta = venta;
      return next();
    }

    if (req.usuario.rol === 'vendedor') {
      const vendedor = await vendedoresService.obtenerVendedorPorUsuarioId(req.usuario.id);
      if (!vendedor) return prohibido(res, 'El usuario no tiene un vendedor asociado');
      if (!mismoId(venta.vendedorId, vendedor.id)) return prohibido(res);
      req.venta = venta;
      return next();
    }

    return prohibido(res);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  autorizarClientePropio,
  autorizarVendedorPropio,
  autorizarAccesoVenta,
};