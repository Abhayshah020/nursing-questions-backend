const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const QuestionGroup = sequelize.define('QuestionGroup', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false, unique: true },
    description: { type: DataTypes.TEXT, allowNull: true }, // optional description of the group
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "users", // table name, NOT model
            key: "id"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    }
}, {
    tableName: 'question_groups',
});

module.exports = QuestionGroup;
