const { matchedData } = require('express-validator');
const clientesService = require('../services/clientes.service');
const usuariosService = require('../services/usuarios.service');

// ========================================
// Regla de negocio: ¿el usuarioId puede asociarse a ESTE cliente?
//   - debe existir                      → si no, 400
//   - debe tener rol cliente            → si no, 409
//   - no puede estar en otro cliente    → si no, 409 (relación 1:1)
// ========================================
const validarUsuarioCliente = async (usuarioId, clienteIdActual = null) => {
  if (!usuarioId) return { valido: true };

  const usuario = await usuariosService.obtenerUsuarioPorId(usuarioId);
  if (!usuario) {
    return { valido: false, status: 400, mensaje: 'El usuario asociado no existe' };
  }

  if (usuario.rol !== 'cliente') {
    return { valido: false, status: 409, mensaje: 'El usuario asociado no tiene rol cliente' };
  }

  const clienteAsociado = await clientesService.obtenerClientePorUsuarioId(usuarioId);
  if (clienteAsociado && String(clienteAsociado.id) !== String(clienteIdActual)) {
    return { valido: false, status: 409, mensaje: 'El usuario ya está asociado a un cliente' };
  }

  return { valido: true };
};

const listar = async (req, res, next) => {
  try {
    res.json(await clientesService.obtenerTodos());
  } catch (error) {
    next(error);
  }
};

const obtener = async (req, res, next) => {
  try {
    res.json(await clientesService.obtenerPorId(req.params.id));
  } catch (error) {
    next(error);
  }
};

const crear = async (req, res, next) => {
  try {
    const datos = matchedData(req, { locations: ['body'] });

    const validacion = await validarUsuarioCliente(datos.usuarioId);
    if (!validacion.valido) {
      return res.status(validacion.status).json({ mensaje: validacion.mensaje });
    }

    const nuevo = await clientesService.crear(datos);
    res.status(201).json(nuevo);
  } catch (error) {
    next(error);
  }
};

const actualizar = async (req, res, next) => {
  try {
    const datos = matchedData(req, { locations: ['body'] });

    const validacion = await validarUsuarioCliente(datos.usuarioId, req.params.id);
    if (!validacion.valido) {
      return res.status(validacion.status).json({ mensaje: validacion.mensaje });
    }

    res.json(await clientesService.actualizar(req.params.id, datos));
  } catch (error) {
    next(error);
  }
};

const actualizarParcial = async (req, res, next) => {
  try {
    const datos = matchedData(req, { locations: ['body'] });

    const validacion = await validarUsuarioCliente(datos.usuarioId, req.params.id);
    if (!validacion.valido) {
      return res.status(validacion.status).json({ mensaje: validacion.mensaje });
    }

    res.json(await clientesService.actualizarParcial(req.params.id, datos));
  } catch (error) {
    next(error);
  }
};

const eliminar = async (req, res, next) => {
  try {
    res.json(await clientesService.eliminar(req.params.id));
  } catch (error) {
    next(error);
  }
};

module.exports = { listar, obtener, crear, actualizar, actualizarParcial, eliminar };