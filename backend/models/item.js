const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Item = sequelize.define('Item', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  price: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  imageUrl: { type: DataTypes.STRING },
  stock: { type: DataTypes.INTEGER, defaultValue: 0 }
});

module.exports = Item;
