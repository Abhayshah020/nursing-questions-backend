const { DataTypes } = require('sequelize');
const sequelize = require("../config/database");
const QuestionGroup = require('./questionGroup.model');

const Question = sequelize.define('Question', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    question: { type: DataTypes.TEXT, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true }, // explanation
    groupId: {
        type: DataTypes.INTEGER,
        references: {
            model: QuestionGroup,
            key: 'id',
        },
        allowNull: false, // every question must belong to a group
    }
}, { tableName: 'questions' });


module.exports = Question;
