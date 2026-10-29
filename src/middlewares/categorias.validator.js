const { body, param } = require('express-validator');

const crearCategoriaValidator = [
  body('nombre')
    .notEmpty().withMessage('El nombre es obligatorio')
    .isString().withMessage('El nombre debe ser texto'),
  body('descripcion')
    .optional()
    .isString().withMessage('La descripción debe ser texto'),
];

const actualizarCategoriaValidator = [
  param('id').isInt({ min: 1 }).withMessage('El id debe ser numérico').toInt(),
  body('nombre').optional().isString(),
  body('descripcion').optional().isString(),
];

const idValidator = [
  param('id').isInt({ min: 1 }).withMessage('El id debe ser numérico').toInt(),
];

module.exports = {
  crearCategoriaValidator,
  actualizarCategoriaValidator,
  idValidator,
};