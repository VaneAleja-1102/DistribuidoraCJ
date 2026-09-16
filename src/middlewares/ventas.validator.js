const { body, param } = require('express-validator');
const { productos } = require('../data/productos');

const crearVentaValidator = [
  body('detalle')
    .isArray({ min: 1 }).withMessage('La venta debe tener al menos un producto'),
  body('detalle.*.productoId')
    .notEmpty().withMessage('productoId es obligatorio en cada línea')
    .isInt().withMessage('productoId debe ser numérico')
    .custom((valor) => {
      const existe = productos.some((p) => p.id === Number(valor));
      if (!existe) throw new Error(`El producto con id ${valor} no existe`);
      return true;
    }),
  body('detalle.*.cantidad')
    .notEmpty().withMessage('La cantidad es obligatoria en cada línea')
    .isInt({ min: 1 }).withMessage('La cantidad debe ser un número entero mayor a 0'),
];

const idValidator = [
  param('id').isInt().withMessage('El id debe ser numérico'),
];

module.exports = {
  crearVentaValidator,
  idValidator,
};