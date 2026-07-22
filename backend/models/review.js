const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Review = sequelize.define('Review', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  itemId: { type: DataTypes.INTEGER, allowNull: false },
  userName: { type: DataTypes.STRING, allowNull: false },
  rating: { type: DataTypes.INTEGER, defaultValue: 5 },
  comment: { type: DataTypes.TEXT },
  status: { type: DataTypes.STRING, defaultValue: 'Pending' },
  imageUrl: { type: DataTypes.STRING }
});

module.exports = Review;
