const productosService = require('../services/productos.service');

const listar = async (req, res, next) => {
  try {
    const productos = await productosService.obtenerTodos();
    res.json(productos);
  } catch (error) {
    next(error);
  }
};

const obtener = async (req, res, next) => {
  try {
    const producto = await productosService.obtenerPorId(req.params.id);
    res.json(producto);
  } catch (error) {
    next(error);
  }
};

const crear = async (req, res, next) => {
  try {
    const nuevoProducto = await productosService.crear(req.body);
    res.status(201).json(nuevoProducto);
  } catch (error) {
    next(error);
  }
};

const actualizar = async (req, res, next) => {
  try {
    const productoActualizado = await productosService.actualizar(req.params.id, req.body);
    res.json(productoActualizado);
  } catch (error) {
    next(error);
  }
};

const eliminar = async (req, res, next) => {
  try {
    const resultado = await productosService.eliminar(req.params.id);
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