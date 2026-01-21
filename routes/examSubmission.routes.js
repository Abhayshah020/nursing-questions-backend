// routes/group.routes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware"); // sets req.user
const examSubmissionController = require("../controllers/examSubmission.controller");
const permissionMiddleware = require("../middlewares/permission.middleware");
const { rateLimiter } = require("../middlewares/rateLimiter");
router.use(authMiddleware);
router.use(rateLimiter)

router.post("/", examSubmissionController.createExamSubmission);
router.use(permissionMiddleware)
router.get("/", examSubmissionController.getExamSubmissions);
router.get("/:id", examSubmissionController.getExamSubmissionById);
router.put("/:id", examSubmissionController.updateExamSubmission);
router.delete("/:id", examSubmissionController.deleteExamSubmission);

module.exports = router;
