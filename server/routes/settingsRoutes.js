const express = require("express");
const {
  getPublicSettings,
  getSettings,
  updateSettings,
} = require("../controllers/settingsController");
const { auth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// @route   GET /api/settings  (public — safe subset for the public site)
router.get("/", getPublicSettings);

// Admin only
router.get("/all", auth, requireAdmin, getSettings);
router.put("/", auth, requireAdmin, updateSettings);

module.exports = router;
