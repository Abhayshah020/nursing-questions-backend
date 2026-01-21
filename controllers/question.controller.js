const { Question, Option, sequelize, QuestionGroup } = require("../models");

// Create multiple questions under a group
exports.createMultipleQuestions = async (req, res) => {
    const { groupId, questions } = req.body;

    if (!groupId) {
        return res.status(400).json({ message: "Group ID is required" });
    }

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({ message: "Questions array is required" });
    }

    const t = await sequelize.transaction();

    try {
        const createdQuestions = [];

        for (const q of questions) {
            const { question, description, options } = q;

            if (!question || !options || !Array.isArray(options) || options.length === 0) {
                await t.rollback();
                return res.status(400).json({ message: "Each question must have text and options" });
            }

            const newQuestion = await Question.create(
                { question, description, groupId },
                { transaction: t }
            );

            const optionRecords = options.map(opt => ({
                questionId: newQuestion.id,
                text: opt.text,
                isCorrect: !!opt.isCorrect
            }));

            await Option.bulkCreate(optionRecords, { transaction: t });

            const created = await Question.findByPk(newQuestion.id, { include: { model: Option, as: 'options' }, transaction: t });
            createdQuestions.push(created);
        }

        await t.commit();

        res.status(201).json({
            message: `${createdQuestions.length} questions created successfully`,
            data: createdQuestions
        });

    } catch (error) {
        await t.rollback();
        console.error("Error creating multiple questions:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get all questions (optionally filter by groupId)
exports.getAllQuestions = async (req, res) => {
    const { groupId } = req.query;

    const whereClause = groupId ? { groupId } : {};

    try {
        const questions = await Question.findAll({
            where: whereClause,
            include: { model: Option, as: 'options' }
        });
        res.status(200).json(questions);
    } catch (error) {
        console.error("Error fetching questions:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get single question by id with options
exports.getQuestionById = async (req, res) => {
    const { id } = req.params;
    try {
        const question = await Question.findByPk(id, {
            include: { model: Option, as: 'options' }
        });

        if (!question) return res.status(404).json({ message: "Question not found" });

        res.status(200).json(question);
    } catch (error) {
        console.error("Error fetching question:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Update a question and its options
exports.updateQuestion = async (req, res) => {
    const { id } = req.params;
    const { question, description, options, groupId } = req.body;

    if (!groupId) {
        return res.status(400).json({ message: "Group ID is required" });
    }

    const t = await sequelize.transaction();

    try {
        const existingQuestion = await Question.findByPk(id, { transaction: t });
        if (!existingQuestion) {
            await t.rollback();
            return res.status(404).json({ message: "Question not found" });
        }

        await existingQuestion.update({ question, description, groupId }, { transaction: t });

        if (options && Array.isArray(options)) {
            // Delete existing options
            await Option.destroy({ where: { questionId: id }, transaction: t });

            // Create new options
            const optionRecords = options.map(opt => ({
                questionId: id,
                text: opt.text,
                isCorrect: opt.isCorrect || false
            }));
            await Option.bulkCreate(optionRecords, { transaction: t });
        }

        await t.commit();

        const updatedQuestion = await Question.findByPk(id, { include: { model: Option, as: 'options' } });

        res.status(200).json(updatedQuestion);
    } catch (error) {
        await t.rollback();
        console.error("Error updating question:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Delete a question and its options
exports.deleteQuestion = async (req, res) => {
    const { id } = req.params;
    const t = await sequelize.transaction();

    try {
        const question = await Question.findByPk(id, { transaction: t });
        if (!question) {
            await t.rollback();
            return res.status(404).json({ message: "Question not found" });
        }

        // Delete options first
        await Option.destroy({ where: { questionId: id }, transaction: t });

        // Delete question
        await question.destroy({ transaction: t });

        await t.commit();

        res.status(200).json({ message: "Question deleted successfully" });
    } catch (error) {
        await t.rollback();
        console.error("Error deleting question:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


/**
 * GET random group with questions and options for mock test
 */
exports.getRandomGroup = async (req, res) => {
    try {
        // Count total groups
        const count = await QuestionGroup.count();
        if (count === 0) return res.status(404).json({ message: "No groups found" });

        // Pick random offset
        const randomOffset = Math.floor(Math.random() * count);

        // Fetch one random group
        const group = await QuestionGroup.findOne({
            offset: randomOffset,
            include: [
                {
                    model: Question,
                    as: "questions",
                    include: [{ model: Option, as: "options" }],
                },
            ],
        });

        res.status(200).json(group);
    } catch (error) {
        console.error("Error fetching random group:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};