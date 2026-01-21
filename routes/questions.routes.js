const router = require('express').Router();
const questionController = require('../controllers/question.controller');
const auth = require('../middlewares/auth.middleware');
const permissionMiddleware = require('../middlewares/permission.middleware');
const { rateLimiter } = require('../middlewares/rateLimiter');
router.use(rateLimiter)

router.use(auth);

router.get("/random-group", questionController.getRandomGroup);

router.use(permissionMiddleware)
router.post("/upload-questions", questionController.createMultipleQuestions);
router.get("/get-questions", questionController.getAllQuestions);
router.get("/get-question/:id", questionController.getQuestionById);
router.put("/update-question/:id", questionController.updateQuestion);
router.delete("/delete-question/:id", questionController.deleteQuestion);

module.exports = router;
