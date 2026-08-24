const express = require("express");
const {
  getProfile,
  updateProfile,
  uploadProfileImage,
  uploadCV,
} = require("../controllers/profileController");
const { auth, requireAdmin } = require("../middleware/auth");
const {
  uploadProfileImage: uploadProfileImageMiddleware,
  uploadCV: uploadCVMiddleware,
} = require("../middleware/upload");

const router = express.Router();

// Public
router.get("/", getProfile);

// Admin only
router.put("/", auth, requireAdmin, updateProfile);
router.post(
  "/upload",
  auth,
  requireAdmin,
  uploadProfileImageMiddleware.single("profileImage"),
  uploadProfileImage,
);
router.post(
  "/upload-cv",
  auth,
  requireAdmin,
  uploadCVMiddleware.single("cv"),
  uploadCV,
);

module.exports = router;
