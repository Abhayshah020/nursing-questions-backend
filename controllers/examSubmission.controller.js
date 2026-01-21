const {
    ExamSubmission,
    ExamSubmissionAnswer,
    Question,
    QuestionGroup,
    sequelize,
    Option,
    User,
} = require("../models");

/* -------------------------------------------------------
   CREATE EXAM SUBMISSION (Submit Exam)
--------------------------------------------------------*/
exports.createExamSubmission = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const {
            questionGroupId,
            completedTimeframe,
            answers,
            totalScore,
        } = req.body;

        const userId = req.user.id;

        /* --------------------------------
           Fetch questions with options
        -------------------------------- */
        const questions = await Question.findAll({
            where: { groupId: questionGroupId },
            include: [{ model: Option, as: "options" }],
            transaction,
        });

        let correctCount = Number(totalScore);

        const evaluatedAnswers = answers.map((ans) => {
            const question = questions.find(q => q.id === ans.questionId);
            const correctOption = question.options.find(o => o.isCorrect);

            const isCorrect = String(correctOption.id) === String(ans.selectedOption);

            return {
                questionId: ans.questionId,
                selectedOption: ans.selectedOption,
                correctOptionId: correctOption.id,
                isCorrect,
                question: question,
            };
        });

        const submission = await ExamSubmission.create(
            {
                userId,
                questionGroupId,
                answeredAt: new Date(),
                totalScore,
                completedTimeframe,
            },
            { transaction }
        );

        await ExamSubmissionAnswer.bulkCreate(
            answers.map(a => ({
                examSubmissionId: submission.id,
                questionId: a.questionId,
                selectedOption: a.selectedOption,
            })),
            { transaction }
        );

        await transaction.commit();

        const totalQuestions = questions.length;

        return res.status(201).json({
            success: true,
            data: {
                submissionId: submission.id,
                summary: {
                    totalQuestions,
                    correctCount,
                    incorrectCount: totalQuestions - correctCount,
                    completedTimeframe,
                },
                review: evaluatedAnswers,
            },
        });
    } catch (error) {
        await transaction.rollback();
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to submit exam",
        });
    }
};


/* -------------------------------------------------------
   GET ALL EXAM SUBMISSIONS (with pagination)
--------------------------------------------------------*/
exports.getExamSubmissions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await ExamSubmission.findAndCountAll({
      limit,
      offset,
      order: [["answeredAt", "DESC"]],
      include: [
        {
          model: QuestionGroup,
          attributes: ["id", "title"],
        },
        {
          model: User,
          attributes: ["id", "name", "email"], // add name and email
        },
      ],
    });

    return res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("Get Exam Submissions Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch exam submissions",
    });
  }
};
/* -------------------------------------------------------
   GET SINGLE EXAM SUBMISSION (with answers)
--------------------------------------------------------*/
exports.getExamSubmissionById = async (req, res) => {
  try {
    const { id } = req.params;

    const submission = await ExamSubmission.findByPk(id, {
      include: [
        {
          model: ExamSubmissionAnswer,
          as: "answers",
          include: [
            {
              model: Question,
              attributes: ["id", "question"],
              include: [
                {
                  model: Option,
                  as: "options", // ✅ MUST match the alias in the model
                  attributes: ["id", "text", "isCorrect"],
                },
              ],
            },
          ],
        },
        {
          model: QuestionGroup,
          attributes: ["id", "title"],
        },
        {
          model: User,
          attributes: ["id", "name", "email"],
        },
      ],
    });

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Exam submission not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: submission,
    });
  } catch (error) {
    console.error("Get Exam Submission Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch exam submission",
    });
  }
};



/* -------------------------------------------------------
   UPDATE EXAM SUBMISSION (Rare but supported)
--------------------------------------------------------*/
exports.updateExamSubmission = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { id } = req.params;
        const { totalScore, completedTimeframe } = req.body;

        const submission = await ExamSubmission.findByPk(id);

        if (!submission) {
            return res.status(404).json({
                success: false,
                message: "Exam submission not found",
            });
        }

        await submission.update(
            {
                totalScore,
                completedTimeframe,
            },
            { transaction }
        );

        await transaction.commit();

        return res.status(200).json({
            success: true,
            message: "Exam submission updated successfully",
        });
    } catch (error) {
        await transaction.rollback();
        console.error("Update Exam Submission Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update exam submission",
        });
    }
};

/* -------------------------------------------------------
   DELETE EXAM SUBMISSION (Cascade deletes answers)
--------------------------------------------------------*/
exports.deleteExamSubmission = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { id } = req.params;

        const submission = await ExamSubmission.findByPk(id);

        if (!submission) {
            return res.status(404).json({
                success: false,
                message: "Exam submission not found",
            });
        }

        await ExamSubmissionAnswer.destroy({
            where: { examSubmissionId: id },
            transaction,
        });

        await submission.destroy({ transaction });

        await transaction.commit();

        return res.status(200).json({
            success: true,
            message: "Exam submission deleted successfully",
        });
    } catch (error) {
        await transaction.rollback();
        console.error("Delete Exam Submission Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete exam submission",
        });
    }
};
