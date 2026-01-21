const sequelize = require("../config/database");

const User = require("./user.model");
const QuestionGroup = require("./questionGroup.model");
const Question = require("./questions.model");
const Option = require("./options.model");

const ExamSubmission = require("./examSubmission.model");
const ExamSubmissionAnswer = require("./examSubmissionAnswer.model");

/* ---------- Question & Options ---------- */
Question.hasMany(Option, { foreignKey: "questionId", as: "options" });
Option.belongsTo(Question, { foreignKey: "questionId" });

/* ---------- Question Group ---------- */
QuestionGroup.hasMany(Question, {
    foreignKey: "groupId",
    as: "questions",
    onDelete: "CASCADE",
});
Question.belongsTo(QuestionGroup, { foreignKey: "groupId" });

User.hasMany(QuestionGroup, { foreignKey: "createdBy" });
QuestionGroup.belongsTo(User, { foreignKey: "createdBy", as: "creator" });

/* ---------- Exam Submission ---------- */
User.hasMany(ExamSubmission, { foreignKey: "userId" });
ExamSubmission.belongsTo(User, { foreignKey: "userId" });

QuestionGroup.hasMany(ExamSubmission, { foreignKey: "questionGroupId" });
ExamSubmission.belongsTo(QuestionGroup, { foreignKey: "questionGroupId" });

/* ---------- Exam Submission Answers ---------- */
ExamSubmission.hasMany(ExamSubmissionAnswer, {
    foreignKey: "examSubmissionId",
    as: "answers",
    onDelete: "CASCADE",
});
ExamSubmissionAnswer.belongsTo(ExamSubmission, {
    foreignKey: "examSubmissionId",
});

Question.hasMany(ExamSubmissionAnswer, { foreignKey: "questionId" });
ExamSubmissionAnswer.belongsTo(Question, { foreignKey: "questionId" });

module.exports = {
    sequelize,
    User,
    QuestionGroup,
    Question,
    Option,
    ExamSubmission,
    ExamSubmissionAnswer,
};
