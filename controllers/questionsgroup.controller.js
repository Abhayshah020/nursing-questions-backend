// controllers/group.controller.js
const {  User, QuestionGroup } = require("../models");

/**
 * CREATE group
 */
exports.createGroup = async (req, res) => {
    try {
        const { title, description } = req.body;

        if (!title) {
            return res.status(400).json({ message: "Question Group title is required" });
        }

        const group = await QuestionGroup.create({
            title,
            description: description || "",
            createdBy: req.user.id
        });

        res.status(201).json({
            message: "Question Group created successfully",
            group
        });
    } catch (error) {
        console.error("Error creating group:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * GET all groups
 */
exports.getAllGroups = async (req, res) => {
    try {
        const groups = await QuestionGroup.findAll({
            include: [
                {
                    model: User,
                    as: "creator",
                    attributes: ["id", "name", "email"] // ✅ FIXED
                }
            ],
            order: [["createdAt", "DESC"]]
        });

        res.status(200).json(groups);
    } catch (error) {
        console.error("Error fetching groups:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


/**
 * GET single group by ID
 */
exports.getGroupById = async (req, res) => {
    try {
        const { id } = req.params;

        const group = await QuestionGroup.findByPk(id, {
            include: [
                {
                    model: User,
                    as: "creator",
                    attributes: ["id", "name", "email"] // ✅ FIXED
                }
            ],
            order: [["createdAt", "DESC"]]
        });

        if (!group) {
            return res.status(404).json({ message: "Question Group not found" });
        }

        res.status(200).json(group);
    } catch (error) {
        console.error("Error fetching group:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * UPDATE group
 */
exports.updateGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description } = req.body;

        const group = await QuestionGroup.findByPk(id);
        if (!group) {
            return res.status(404).json({ message: "Question Group not found" });
        }

        await group.update({
            title: title || group.title,
            description: description !== undefined ? description : group.description
        });

        res.status(200).json({
            message: "Question Group updated successfully",
            group
        });
    } catch (error) {
        console.error("Error updating group:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * DELETE group
 */
exports.deleteGroup = async (req, res) => {
    try {
        const { id } = req.params;

        const group = await QuestionGroup.findByPk(id);
        if (!group) {
            return res.status(404).json({ message: "Question Group not found" });
        }

        await group.destroy();

        res.status(200).json({ message: "Question Group deleted successfully" });
    } catch (error) {
        console.error("Error deleting group:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
