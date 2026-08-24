const express = require("express");
const {
  register,
  login,
  getMe,
  isAdmin,
  verifyEmail,
  resendVerification,
  changePassword,
  deleteMe,
} = require("../controllers/authController");
const { auth } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { body } = require("express-validator");

const router = express.Router();

// @route   POST /api/auth/register
router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  validate,
  register,
);

// @route   POST /api/auth/login
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  login,
);

// @route   GET /api/auth/me
router.get("/me", auth, getMe);

// @route   DELETE /api/auth/me  (erase the caller's own account + personal data)
// authLimiter is already applied to the whole /api/auth mount in server.js.
router.delete("/me", auth, deleteMe);

// @route   GET /api/auth/is-admin
router.get("/is-admin", auth, isAdmin);

// @route   POST /api/auth/verify-email  (the emailed token is the credential)
router.post(
  "/verify-email",
  [body("token").isString().trim().notEmpty().withMessage("Token is required")],
  validate,
  verifyEmail,
);

// @route   POST /api/auth/resend-verification
// Abuse is bounded by authLimiter on the /api/auth mount, and the address is
// fixed to the caller's own account — so this can't be aimed at a stranger.
router.post("/resend-verification", auth, resendVerification);

// @route   PUT /api/auth/change-password
router.put(
  "/change-password",
  auth,
  [
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters"),
  ],
  validate,
  changePassword,
);

module.exports = router;
