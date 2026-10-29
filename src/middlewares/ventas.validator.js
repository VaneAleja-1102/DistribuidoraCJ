const { body, param } = require('express-validator');
const { debeExistir } = require('../utils/existe.util');

const crearVentaValidator = [
  body('clienteId')
    .notEmpty().withMessage('El clienteId es obligatorio')
    .isInt({ min: 1 }).withMessage('clienteId debe ser un entero positivo').bail()
    .toInt()
    .custom(debeExistir('clientes', 'El cliente indicado no existe')),
  // Solo lo usa el administrador; si quien crea es vendedor, el servidor lo ignora
  body('vendedorId')
    .optional()
    .isInt({ min: 1 }).withMessage('vendedorId debe ser un entero positivo').bail()
    .toInt()
    .custom(debeExistir('vendedores', 'El vendedor indicado no existe')),
  body('detalle')
    .isArray({ min: 1 }).withMessage('La venta debe tener al menos un producto'),
  body('detalle.*.productoId')
    .notEmpty().withMessage('productoId es obligatorio en cada línea')
    .isInt({ min: 1 }).withMessage('productoId debe ser numérico').bail()
    .toInt()
    .custom(debeExistir('productos', 'Uno de los productos indicados no existe')),
  body('detalle.*.cantidad')
    .notEmpty().withMessage('La cantidad es obligatoria en cada línea')
    .isInt({ min: 1 }).withMessage('La cantidad debe ser un número entero mayor a 0')
    .toInt(),
];

const idValidator = [
  param('id').isInt({ min: 1 }).withMessage('El id debe ser un entero positivo').toInt(),
];

const estadoValidator = [
  body('estado')
    .isIn(['registrada', 'pagada', 'entregada', 'anulada'])
    .withMessage('El estado debe ser registrada, pagada, entregada o anulada'),
];

module.exports = {
  crearVentaValidator,
  idValidator,
  estadoValidator,
};