const categoriasService = require('../services/categorias.service');

const listar = async (req, res, next) => {
  try {
    const categorias = await categoriasService.obtenerTodas();
    res.json(categorias);
  } catch (error) {
    next(error);
  }
};

const obtener = async (req, res, next) => {
  try {
    const categoria = await categoriasService.obtenerPorId(req.params.id);
    res.json(categoria);
  } catch (error) {
    next(error);
  }
};

const crear = async (req, res, next) => {
  try {
    const nuevaCategoria = await categoriasService.crear(req.body);
    res.status(201).json(nuevaCategoria);
  } catch (error) {
    next(error);
  }
};

const actualizar = async (req, res, next) => {
  try {
    const categoriaActualizada = await categoriasService.actualizar(req.params.id, req.body);
    res.json(categoriaActualizada);
  } catch (error) {
    next(error);
  }
};

const eliminar = async (req, res, next) => {
  try {
    const resultado = await categoriasService.eliminar(req.params.id);
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