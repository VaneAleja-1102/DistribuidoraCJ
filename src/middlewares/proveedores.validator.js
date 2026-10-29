const { body, param } = require('express-validator');

const crearProveedorValidator = [
  body('nombre')
    .notEmpty().withMessage('El nombre es obligatorio')
    .isString().withMessage('El nombre debe ser texto'),
  body('telefono')
    .optional()
    .isString().withMessage('El teléfono debe ser texto'),
  body('email')
    .optional()
    .isEmail().withMessage('El email no tiene un formato válido'),
];

const actualizarProveedorValidator = [
  param('id').isInt({ min: 1 }).withMessage('El id debe ser numérico').toInt(),
  body('nombre').optional().isString(),
  body('telefono').optional().isString(),
  body('email').optional().isEmail().withMessage('El email no tiene un formato válido'),
];

const idValidator = [
  param('id').isInt({ min: 1 }).withMessage('El id debe ser numérico').toInt(),
];

module.exports = {
  crearProveedorValidator,
  actualizarProveedorValidator,
  idValidator,
};