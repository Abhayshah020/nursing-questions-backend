const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ExamSubmission = sequelize.define(
    "ExamSubmission",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },

        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        questionGroupId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        answeredAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },

        totalScore: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },

        completedTimeframe: {
            type: DataTypes.STRING, // e.g. "1h 24m 45s"
            allowNull: false,
        },
    },
    {
        tableName: "exam_submissions",
        timestamps: false, // ❌ no createdAt / updatedAt
    }
);

module.exports = ExamSubmission;
