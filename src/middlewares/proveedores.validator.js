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
  param('id').isInt().withMessage('El id debe ser numérico'),
  body('nombre').optional().isString(),
  body('telefono').optional().isString(),
  body('email').optional().isEmail().withMessage('El email no tiene un formato válido'),
];

const idValidator = [
  param('id').isInt().withMessage('El id debe ser numérico'),
];

module.exports = {
  crearProveedorValidator,
  actualizarProveedorValidator,
  idValidator,
};