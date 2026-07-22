const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Order = sequelize.define('Order', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  items: { type: DataTypes.JSON, defaultValue: [] },
  status: { type: DataTypes.STRING, defaultValue: 'Processing' },
  total: { type: DataTypes.FLOAT, defaultValue: 0 },
  paymentStatus: { type: DataTypes.STRING, defaultValue: 'Pending' },
  shippingAddress: { type: DataTypes.TEXT },
  createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
});

module.exports = Order;
