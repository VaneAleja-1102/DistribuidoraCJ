const sequelize = require('../config/database');
const Categoria = require('./categoria.model');
const Proveedor = require('./proveedor.model');
const Producto = require('./producto.model');
const Venta = require('./venta.model');
const DetalleVenta = require('./detalleVenta.model');

// Categoria - Producto
Categoria.hasMany(Producto, { foreignKey: 'categoriaId' });
Producto.belongsTo(Categoria, { foreignKey: 'categoriaId' });

// Proveedor - Producto
Proveedor.hasMany(Producto, { foreignKey: 'proveedorId' });
Producto.belongsTo(Proveedor, { foreignKey: 'proveedorId' });

// Venta - DetalleVenta
Venta.hasMany(DetalleVenta, { foreignKey: 'ventaId' });
DetalleVenta.belongsTo(Venta, { foreignKey: 'ventaId' });

// Producto - DetalleVenta
Producto.hasMany(DetalleVenta, { foreignKey: 'productoId' });
DetalleVenta.belongsTo(Producto, { foreignKey: 'productoId' });

module.exports = {
  sequelize, Categoria, Proveedor, Producto, Venta, DetalleVenta,
};