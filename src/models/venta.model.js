const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Venta = sequelize.define('Venta', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  fecha: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  total: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
}, { tableName: 'ventas', timestamps: false });

module.exports = Venta;