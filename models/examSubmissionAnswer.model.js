const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ExamSubmissionAnswer = sequelize.define(
    "ExamSubmissionAnswer",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },

        examSubmissionId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        questionId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        selectedOption: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        tableName: "exam_submission_answers",
        timestamps: false, // ❌ no timestamps
    }
);

module.exports = ExamSubmissionAnswer;
