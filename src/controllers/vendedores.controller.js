const { matchedData } = require('express-validator');
const vendedoresService = require('../services/vendedores.service');
const usuariosService = require('../services/usuarios.service');

// ========================================
// Regla de negocio: ¿el usuarioId puede asociarse a ESTE vendedor?
//   - debe existir                      → si no, 400
//   - debe tener rol vendedor            → si no, 409
//   - no puede estar en otro vendedor    → si no, 409 (relación 1:1)
// ========================================
const validarUsuarioVendedor = async (usuarioId, vendedorIdActual = null) => {
  if (!usuarioId) return { valido: true };

  const usuario = await usuariosService.obtenerUsuarioPorId(usuarioId);
  if (!usuario) {
    return { valido: false, status: 400, mensaje: 'El usuario asociado no existe' };
  }

  if (usuario.rol !== 'vendedor') {
    return { valido: false, status: 409, mensaje: 'El usuario asociado no tiene rol vendedor' };
  }

  const vendedorAsociado = await vendedoresService.obtenerVendedorPorUsuarioId(usuarioId);
  if (vendedorAsociado && String(vendedorAsociado.id) !== String(vendedorIdActual)) {
    return { valido: false, status: 409, mensaje: 'El usuario ya está asociado a un vendedor' };
  }

  return { valido: true };
};

const listar = async (req, res, next) => {
  try {
    res.json(await vendedoresService.obtenerTodos());
  } catch (error) {
    next(error);
  }
};

const obtener = async (req, res, next) => {
  try {
    res.json(await vendedoresService.obtenerPorId(req.params.id));
  } catch (error) {
    next(error);
  }
};

const crear = async (req, res, next) => {
  try {
    const datos = matchedData(req, { locations: ['body'] });

    const validacion = await validarUsuarioVendedor(datos.usuarioId);
    if (!validacion.valido) {
      return res.status(validacion.status).json({ mensaje: validacion.mensaje });
    }

    const nuevo = await vendedoresService.crear(datos);
    res.status(201).json(nuevo);
  } catch (error) {
    next(error);
  }
};

const actualizar = async (req, res, next) => {
  try {
    const datos = matchedData(req, { locations: ['body'] });

    const validacion = await validarUsuarioVendedor(datos.usuarioId, req.params.id);
    if (!validacion.valido) {
      return res.status(validacion.status).json({ mensaje: validacion.mensaje });
    }

    res.json(await vendedoresService.actualizar(req.params.id, datos));
  } catch (error) {
    next(error);
  }
};

const actualizarParcial = async (req, res, next) => {
  try {
    const datos = matchedData(req, { locations: ['body'] });

    const validacion = await validarUsuarioVendedor(datos.usuarioId, req.params.id);
    if (!validacion.valido) {
      return res.status(validacion.status).json({ mensaje: validacion.mensaje });
    }

    res.json(await vendedoresService.actualizarParcial(req.params.id, datos));
  } catch (error) {
    next(error);
  }
};

const eliminar = async (req, res, next) => {
  try {
    res.json(await vendedoresService.eliminar(req.params.id));
  } catch (error) {
    next(error);
  }
};

module.exports = { listar, obtener, crear, actualizar, actualizarParcial, eliminar };