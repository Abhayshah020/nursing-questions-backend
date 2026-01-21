// routes/group.routes.js
const express = require("express");
const router = express.Router();
const groupController = require("../controllers/questionsgroup.controller");
const authMiddleware = require("../middlewares/auth.middleware"); // sets req.user
const permissionMiddleware = require("../middlewares/permission.middleware");
const { rateLimiter } = require("../middlewares/rateLimiter");
router.use(rateLimiter)

router.use(authMiddleware);
router.use(permissionMiddleware)

router.post("/", groupController.createGroup);
router.get("/", groupController.getAllGroups);
router.get("/:id", groupController.getGroupById);
router.put("/:id", groupController.updateGroup);
router.delete("/:id", groupController.deleteGroup);

module.exports = router;
