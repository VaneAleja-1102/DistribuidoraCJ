const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DetalleVenta = sequelize.define('DetalleVenta', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  cantidad: { type: DataTypes.INTEGER, allowNull: false },
  precioUnitario: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
}, { tableName: 'detalle_ventas', timestamps: false });

module.exports = DetalleVenta;