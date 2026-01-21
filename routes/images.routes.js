const express = require("express");
const path = require("path");
const { rateLimiter } = require('../middlewares/rateLimiter');
const router = express.Router();
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middlewares/auth.middleware");

router.use(rateLimiter);

router.get("/signed/:token", authMiddleware, (req, res) => {
    try {
        const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
        if (decoded.userId !== req.user.id) {
            return res.sendStatus(401);
        }
        const filePath = path.join(__dirname, "..", decoded.imagePath);
        res.sendFile(filePath);
    } catch (err) {
        console.log(err)
        return res.sendStatus(401);
    }
});


module.exports = router;
