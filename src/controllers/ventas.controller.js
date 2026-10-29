const { matchedData } = require('express-validator');
const ventasService = require('../services/ventas.service');
const clientesService = require('../services/clientes.service');
const vendedoresService = require('../services/vendedores.service');

// GET /ventas  (solo administrador)
const listar = async (req, res, next) => {
  try {
    res.json(await ventasService.obtenerTodas());
  } catch (error) {
    next(error);
  }
};

// GET /ventas/:id  (la venta ya fue cargada y autorizada por autorizarAccesoVenta)
const obtener = async (req, res, next) => {
  try {
    res.json(req.venta);
  } catch (error) {
    next(error);
  }
};

// GET /ventas/cliente/:clienteId
const listarPorCliente = async (req, res, next) => {
  try {
    res.json(await ventasService.obtenerPorCliente(req.params.clienteId));
  } catch (error) {
    next(error);
  }
};

// GET /ventas/vendedor/:vendedorId
const listarPorVendedor = async (req, res, next) => {
  try {
    res.json(await ventasService.obtenerPorVendedor(req.params.vendedorId));
  } catch (error) {
    next(error);
  }
};

// GET /ventas/mis-ventas  → la identidad sale del JWT, nunca de la URL
const misVentas = async (req, res, next) => {
  try {
    if (req.usuario.rol === 'cliente') {
      const cliente = await clientesService.obtenerClientePorUsuarioId(req.usuario.id);
      if (!cliente) return res.status(403).json({ mensaje: 'El usuario no tiene un cliente asociado' });
      return res.json(await ventasService.obtenerPorCliente(cliente.id));
    }

    if (req.usuario.rol === 'vendedor') {
      const vendedor = await vendedoresService.obtenerVendedorPorUsuarioId(req.usuario.id);
      if (!vendedor) return res.status(403).json({ mensaje: 'El usuario no tiene un vendedor asociado' });
      return res.json(await ventasService.obtenerPorVendedor(vendedor.id));
    }

    return res.status(403).json({ mensaje: 'No tiene permisos para realizar esta operación' });
  } catch (error) {
    next(error);
  }
};

// POST /ventas
const crear = async (req, res, next) => {
  try {
    const datos = matchedData(req, { locations: ['body'] });

    if (req.usuario.rol === 'vendedor') {
      // El vendedor SOLO puede registrar ventas a su nombre:
      // ignoramos cualquier vendedorId que mande en el body.
      const vendedor = await vendedoresService.obtenerVendedorPorUsuarioId(req.usuario.id);
      if (!vendedor) {
        return res.status(403).json({ mensaje: 'El usuario no tiene un vendedor asociado' });
      }
      datos.vendedorId = vendedor.id;
    } else if (!datos.vendedorId) {
      // El administrador debe indicar explícitamente el vendedor
      return res.status(400).json({ mensaje: 'El administrador debe indicar el vendedorId' });
    }

    const nuevaVenta = await ventasService.crear(datos);
    res.status(201).json(nuevaVenta);
  } catch (error) {
    next(error);
  }
};

// PATCH /ventas/:id/estado
const cambiarEstado = async (req, res, next) => {
  try {
    const { estado } = matchedData(req, { locations: ['body'] });
    res.json(await ventasService.cambiarEstado(req.params.id, estado));
  } catch (error) {
    next(error);
  }
};

// DELETE /ventas/:id
const eliminar = async (req, res, next) => {
  try {
    res.json(await ventasService.eliminar(req.params.id));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listar,
  obtener,
  listarPorCliente,
  listarPorVendedor,
  misVentas,
  crear,
  cambiarEstado,
  eliminar,
};