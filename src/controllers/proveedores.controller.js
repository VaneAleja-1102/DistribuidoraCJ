const proveedoresService = require('../services/proveedores.service');

const listar = async (req, res, next) => {
  try {
    const proveedores = await proveedoresService.obtenerTodos();
    res.json(proveedores);
  } catch (error) {
    next(error);
  }
};

const obtener = async (req, res, next) => {
  try {
    const proveedor = await proveedoresService.obtenerPorId(req.params.id);
    res.json(proveedor);
  } catch (error) {
    next(error);
  }
};

const crear = async (req, res, next) => {
  try {
    const nuevoProveedor = await proveedoresService.crear(req.body);
    res.status(201).json(nuevoProveedor);
  } catch (error) {
    next(error);
  }
};

const actualizar = async (req, res, next) => {
  try {
    const proveedorActualizado = await proveedoresService.actualizar(req.params.id, req.body);
    res.json(proveedorActualizado);
  } catch (error) {
    next(error);
  }
};

const eliminar = async (req, res, next) => {
  try {
    const resultado = await proveedoresService.eliminar(req.params.id);
    res.json(resultado);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listar,
  obtener,
  crear,
  actualizar,
  eliminar,
};