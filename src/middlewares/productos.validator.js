const { body, param } = require('express-validator');
const { categorias } = require('../data/categorias');
const { proveedores } = require('../data/proveedores');

const crearProductoValidator = [
  body('nombre')
    .notEmpty().withMessage('El nombre es obligatorio')
    .isString().withMessage('El nombre debe ser texto'),
  body('precio')
    .notEmpty().withMessage('El precio es obligatorio')
    .isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo'),
  body('stock')
    .optional()
    .isInt({ min: 0 }).withMessage('El stock debe ser un número entero positivo'),
  body('categoriaId')
    .notEmpty().withMessage('La categoría es obligatoria')
    .isInt().withMessage('categoriaId debe ser numérico')
    .custom((valor) => {
      const existe = categorias.some((c) => c.id === Number(valor));
      if (!existe) throw new Error('La categoría indicada no existe');
      return true;
    }),
  body('proveedorId')
    .notEmpty().withMessage('El proveedor es obligatorio')
    .isInt().withMessage('proveedorId debe ser numérico')
    .custom((valor) => {
      const existe = proveedores.some((p) => p.id === Number(valor));
      if (!existe) throw new Error('El proveedor indicado no existe');
      return true;
    }),
];

const actualizarProductoValidator = [
  param('id').isInt().withMessage('El id debe ser numérico'),
  body('nombre').optional().isString(),
  body('precio').optional().isFloat({ min: 0 }),
  body('stock').optional().isInt({ min: 0 }),
  body('categoriaId')
    .optional()
    .isInt().withMessage('categoriaId debe ser numérico')
    .custom((valor) => {
      const existe = categorias.some((c) => c.id === Number(valor));
      if (!existe) throw new Error('La categoría indicada no existe');
      return true;
    }),
  body('proveedorId')
    .optional()
    .isInt().withMessage('proveedorId debe ser numérico')
    .custom((valor) => {
      const existe = proveedores.some((p) => p.id === Number(valor));
      if (!existe) throw new Error('El proveedor indicado no existe');
      return true;
    }),
];

const idValidator = [
  param('id').isInt().withMessage('El id debe ser numérico'),
];

module.exports = {
  crearProductoValidator,
  actualizarProductoValidator,
  idValidator,
};