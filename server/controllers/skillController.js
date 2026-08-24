const mongoose = require("mongoose");
const Skill = require("../models/Skill");
const { sendServerError } = require("../utils/secrets");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// Escape regex metacharacters so a skill name can't inject a pattern.
const escapeRegex = (str = "") => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// @desc    Get all skills
// @route   GET /api/skills
// @access  Public
const getSkills = async (req, res) => {
  try {
    const skills = await Skill.find({ isActive: true }).sort({
      category: 1,
      name: 1,
    });
    res.json(skills);
  } catch (error) {
    sendServerError(res, error, "getSkills");
  }
};

// @desc    Create skill
// @route   POST /api/skills
// @access  Private (Admin)
const createSkill = async (req, res) => {
  try {
    const { name, category } = req.body;

    // Check if skill exists
    const existing = await Skill.findOne({
      name: { $regex: new RegExp(`^${escapeRegex(name)}$`, "i") },
    });
    if (existing) {
      return res.status(400).json({ message: "Skill already exists" });
    }

    const skill = new Skill({
      name: name.trim(),
      category: category || "other",
    });
    await skill.save();
    res.status(201).json(skill);
  } catch (error) {
    // Schema validation messages are ours to show; anything else is internal.
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    sendServerError(res, error, "createSkill");
  }
};

// @desc    Update skill
// @route   PUT /api/skills/:id
// @access  Private (Admin)
const updateSkill = async (req, res) => {
  try {
    const { name, category } = req.body;

    if (!isValidId(req.params.id)) {
      return res.status(404).json({ message: "Skill not found" });
    }

    const skill = await Skill.findById(req.params.id);
    if (!skill) {
      return res.status(404).json({ message: "Skill not found" });
    }

    // Check if new name conflicts with another skill
    if (name && name !== skill.name) {
      const existing = await Skill.findOne({
        name: { $regex: new RegExp(`^${escapeRegex(name)}$`, "i") },
        _id: { $ne: req.params.id },
      });
      if (existing) {
        return res.status(400).json({ message: "Skill already exists" });
      }
      skill.name = name.trim();
    }

    if (category) {
      skill.category = category;
    }

    await skill.save();
    res.json(skill);
  } catch (error) {
    sendServerError(res, error, "updateSkill");
  }
};

// @desc    Delete skill
// @route   DELETE /api/skills/:id
// @access  Private (Admin)
const deleteSkill = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(404).json({ message: "Skill not found" });
    }

    const skill = await Skill.findById(req.params.id);
    if (!skill) {
      return res.status(404).json({ message: "Skill not found" });
    }

    // Soft delete
    skill.isActive = false;
    await skill.save();

    res.json({ message: "Skill deleted successfully" });
  } catch (error) {
    sendServerError(res, error, "deleteSkill");
  }
};

module.exports = {
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill,
};
