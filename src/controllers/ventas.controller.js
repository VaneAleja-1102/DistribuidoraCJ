const ventasService = require('../services/ventas.service');

const listar = async (req, res, next) => {
  try {
    const ventas = await ventasService.obtenerTodas();
    res.json(ventas);
  } catch (error) {
    next(error);
  }
};

const obtener = async (req, res, next) => {
  try {
    const venta = await ventasService.obtenerPorId(req.params.id);
    res.json(venta);
  } catch (error) {
    next(error);
  }
};

const crear = async (req, res, next) => {
  try {
    const nuevaVenta = await ventasService.crear(req.body);
    res.status(201).json(nuevaVenta);
  } catch (error) {
    next(error);
  }
};

const eliminar = async (req, res, next) => {
  try {
    const resultado = await ventasService.eliminar(req.params.id);
    res.json(resultado);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listar,
  obtener,
  crear,
  eliminar,
};