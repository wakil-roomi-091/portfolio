const express = require("express");
const {
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill,
} = require("../controllers/skillController");
const { auth, requireAdmin } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { body } = require("express-validator");

const router = express.Router();

// Public routes
router.get("/", getSkills);

// Admin routes
router.post(
  "/",
  auth,
  requireAdmin,
  [body("name").trim().notEmpty().withMessage("Skill name is required")],
  validate,
  createSkill,
);
router.put("/:id", auth, requireAdmin, updateSkill);
router.delete("/:id", auth, requireAdmin, deleteSkill);

module.exports = router;
