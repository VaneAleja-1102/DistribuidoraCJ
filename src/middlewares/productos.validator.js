const { body, param } = require('express-validator');
const { debeExistir } = require('../utils/existe.util');

const crearProductoValidator = [
  body('nombre')
    .notEmpty().withMessage('El nombre es obligatorio')
    .isString().withMessage('El nombre debe ser texto')
    .trim(),
  body('precio')
    .notEmpty().withMessage('El precio es obligatorio')
    .isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo')
    .toFloat(),
  body('stock')
    .optional()
    .isInt({ min: 0 }).withMessage('El stock debe ser un número entero positivo')
    .toInt(),
  body('categoriaId')
    .notEmpty().withMessage('La categoría es obligatoria')
    .isInt({ min: 1 }).withMessage('categoriaId debe ser numérico').bail()
    .toInt()
    .custom(debeExistir('categorias', 'La categoría indicada no existe')),
  body('proveedorId')
    .notEmpty().withMessage('El proveedor es obligatorio')
    .isInt({ min: 1 }).withMessage('proveedorId debe ser numérico').bail()
    .toInt()
    .custom(debeExistir('proveedores', 'El proveedor indicado no existe')),
];

const actualizarProductoValidator = [
  param('id').isInt({ min: 1 }).withMessage('El id debe ser numérico').toInt(),
  body('nombre').optional().isString().trim(),
  body('precio').optional().isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo').toFloat(),
  body('stock').optional().isInt({ min: 0 }).withMessage('El stock debe ser un número entero positivo').toInt(),
  body('categoriaId')
    .optional()
    .isInt({ min: 1 }).withMessage('categoriaId debe ser numérico').bail()
    .toInt()
    .custom(debeExistir('categorias', 'La categoría indicada no existe')),
  body('proveedorId')
    .optional()
    .isInt({ min: 1 }).withMessage('proveedorId debe ser numérico').bail()
    .toInt()
    .custom(debeExistir('proveedores', 'El proveedor indicado no existe')),
];

const idValidator = [
  param('id').isInt({ min: 1 }).withMessage('El id debe ser numérico').toInt(),
];

module.exports = {
  crearProductoValidator,
  actualizarProductoValidator,
  idValidator,
};