const { body, param } = require('express-validator');

const validarVendedor = [
  body('usuarioId')
    .optional({ values: 'null' })
    .isInt({ min: 1 }).withMessage('El usuarioId debe ser un entero positivo')
    .toInt(),
  body('nombre')
    .isString().withMessage('El nombre debe ser texto')
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres'),
  body('documento')
    .isString().withMessage('El documento debe ser texto')
    .trim()
    .matches(/^\d{6,15}$/).withMessage('El documento debe tener entre 6 y 15 dígitos'),
  body('telefono')
    .optional()
    .isString().trim()
    .matches(/^\d{7,15}$/).withMessage('El teléfono debe tener entre 7 y 15 dígitos'),
  body('activo')
    .optional()
    .isBoolean().withMessage('activo debe ser booleano')
    .toBoolean(),
];

const validarVendedorParcial = [
  body('usuarioId')
    .optional()
    .isInt({ min: 1 }).withMessage('El usuarioId debe ser un entero positivo')
    .toInt(),
  body('nombre').optional().isString().trim()
    .isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres'),
  body('documento').optional().isString().trim()
    .matches(/^\d{6,15}$/).withMessage('El documento debe tener entre 6 y 15 dígitos'),
  body('telefono').optional().isString().trim()
    .matches(/^\d{7,15}$/).withMessage('El teléfono debe tener entre 7 y 15 dígitos'),
  body('activo').optional().isBoolean().withMessage('activo debe ser booleano').toBoolean(),
];

const validarIdVendedor = [
  param('id').isInt({ min: 1 }).withMessage('El id debe ser un entero positivo').toInt(),
];

// Para rutas /ventas/vendedor/:vendedorId
const validarVendedorIdParam = [
  param('vendedorId').isInt({ min: 1 }).withMessage('El vendedorId debe ser un entero positivo').toInt(),
];

module.exports = {
  validarVendedor,
  validarVendedorParcial,
  validarIdVendedor,
  validarVendedorIdParam,
};