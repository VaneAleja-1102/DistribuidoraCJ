const { body, param } = require('express-validator');

const usuarioIdOpcional = body('usuarioId')
  .optional({ values: 'null' })
  .isInt({ min: 1 }).withMessage('El usuarioId debe ser un entero positivo')
  .toInt();

// POST y PUT (datos completos)
const validarCliente = [
  usuarioIdOpcional,
  body('nombre')
    .isString().withMessage('El nombre debe ser texto')
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres'),
  body('documento')
    .isString().withMessage('El documento debe ser texto')
    .trim()
    .matches(/^\d{6,15}$/).withMessage('El documento debe tener entre 6 y 15 dígitos'),
  body('email')
    .optional()
    .isEmail().withMessage('El email no tiene un formato válido')
    .normalizeEmail(),
  body('telefono')
    .optional()
    .isString().trim()
    .matches(/^\d{7,15}$/).withMessage('El teléfono debe tener entre 7 y 15 dígitos'),
  body('direccion')
    .optional()
    .isString().trim()
    .isLength({ max: 150 }).withMessage('La dirección no puede superar 150 caracteres'),
];

// PATCH (todo opcional)
const validarClienteParcial = [
  body('usuarioId')
    .optional()
    .isInt({ min: 1 }).withMessage('El usuarioId debe ser un entero positivo')
    .toInt(),
  body('nombre').optional().isString().trim()
    .isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres'),
  body('documento').optional().isString().trim()
    .matches(/^\d{6,15}$/).withMessage('El documento debe tener entre 6 y 15 dígitos'),
  body('email').optional().isEmail().withMessage('El email no tiene un formato válido').normalizeEmail(),
  body('telefono').optional().isString().trim()
    .matches(/^\d{7,15}$/).withMessage('El teléfono debe tener entre 7 y 15 dígitos'),
  body('direccion').optional().isString().trim()
    .isLength({ max: 150 }).withMessage('La dirección no puede superar 150 caracteres'),
];

const validarIdCliente = [
  param('id').isInt({ min: 1 }).withMessage('El id debe ser un entero positivo').toInt(),
];

// Para rutas /ventas/cliente/:clienteId
const validarClienteIdParam = [
  param('clienteId').isInt({ min: 1 }).withMessage('El clienteId debe ser un entero positivo').toInt(),
];

module.exports = {
  validarCliente,
  validarClienteParcial,
  validarIdCliente,
  validarClienteIdParam,
};