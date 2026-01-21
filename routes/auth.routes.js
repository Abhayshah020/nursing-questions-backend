const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const auth = require('../middlewares/auth.middleware');
const { rateLimiter } = require('../middlewares/rateLimiter');

router.use(rateLimiter)
router.post('/login', authController.login);
router.post("/register", authController.register);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.post("/send-otp", authController.sendEmailOTP);

router.use(auth);
router.post("/logout", authController.logout);
router.post("/verify-otp", authController.verifyEmailOTP);

module.exports = router;
