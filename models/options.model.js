const sequelize = require("../config/database");
const { DataTypes } = require('sequelize');

const Option = sequelize.define('Option', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    questionId: { type: DataTypes.INTEGER, allowNull: false },
    text: { type: DataTypes.STRING, allowNull: false },
    isCorrect: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: 'options' });

module.exports = Option;
