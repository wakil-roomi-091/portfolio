const express = require("express");
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  uploadImages,
} = require("../controllers/projectController");
const { auth, requireAdmin } = require("../middleware/auth");
const { uploadImages: uploadMiddleware } = require("../middleware/upload");

const router = express.Router();

// Public
router.get("/", getProjects);
router.get("/:id", getProject);

// Admin only
router.post("/", auth, requireAdmin, createProject);
router.put("/:id", auth, requireAdmin, updateProject);
router.delete("/:id", auth, requireAdmin, deleteProject);

router.post(
  "/upload",
  auth,
  requireAdmin,
  uploadMiddleware.array("images", 5),
  uploadImages,
);

module.exports = router;
