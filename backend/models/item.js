const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Item = sequelize.define('Item', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  category: { type: DataTypes.STRING, allowNull: false, defaultValue: 'General' },
  price: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  discountPrice: { type: DataTypes.FLOAT, allowNull: true },
  imageUrl: { type: DataTypes.STRING },
  stock: { type: DataTypes.INTEGER, defaultValue: 0 },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  sku: { type: DataTypes.STRING },
  weight: { type: DataTypes.STRING },
  brand: { type: DataTypes.STRING },
  tags: { type: DataTypes.JSON, defaultValue: [] }
});

module.exports = Item;
