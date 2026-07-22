const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING, unique: true },
  passwordHash: { type: DataTypes.STRING },
  phone: { type: DataTypes.STRING },
  isAdmin: { type: DataTypes.BOOLEAN, defaultValue: false },
  googleId: { type: DataTypes.STRING },
  cart: { type: DataTypes.JSON, defaultValue: [] },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  isBlocked: { type: DataTypes.BOOLEAN, defaultValue: false },
  address: { type: DataTypes.TEXT },
  photoUrl: { type: DataTypes.STRING }
});

module.exports = User;
